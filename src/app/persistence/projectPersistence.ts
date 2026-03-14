import { grafDb, PRIMARY_PROJECT_ID, DEFAULT_SNAPSHOT_LIMIT } from './db';
import {
  PERSISTENCE_SCHEMA_VERSION,
  PROJECT_PACKAGE_VERSION,
  type PersistedProjectState,
  type ProjectExportPackage,
  type SnapshotRecord,
  isValidProjectExportPackage,
} from './schema';

const nowIso = () => new Date().toISOString();

export const loadPersistedProject = async () => {
  const doc = await grafDb.graph.get(PRIMARY_PROJECT_ID);
  if (!doc) return null;
  if (doc.value.schemaVersion > PERSISTENCE_SCHEMA_VERSION) {
    throw new Error(`Unsupported project schema version: ${doc.value.schemaVersion}`);
  }
  return doc.value;
};

export const savePersistedProject = async (state: PersistedProjectState, reason: 'autosave' | 'import' | 'restore-snapshot') => {
  const timestamp = nowIso();
  const payload: PersistedProjectState = {
    ...state,
    schemaVersion: PERSISTENCE_SCHEMA_VERSION,
    lastSavedAt: timestamp,
  };

  await grafDb.transaction('rw', [grafDb.graph, grafDb.settings, grafDb.toolsState, grafDb.substationState, grafDb.history], async () => {
    await grafDb.graph.put({ id: PRIMARY_PROJECT_ID, value: payload, updatedAt: timestamp });
    await grafDb.settings.put({ id: PRIMARY_PROJECT_ID, value: payload.settings as Record<string, unknown>, updatedAt: timestamp });
    await grafDb.toolsState.put({ id: PRIMARY_PROJECT_ID, value: payload.toolsState, updatedAt: timestamp });
    await grafDb.substationState.put({ id: PRIMARY_PROJECT_ID, value: payload.substationState, updatedAt: timestamp });
    await grafDb.history.add({ eventType: reason, createdAt: timestamp, detail: `Saved project (${reason})` });
  });
};

export const createManualSnapshot = async (project: PersistedProjectState, label?: string) => {
  const snapshot: SnapshotRecord = {
    id: crypto.randomUUID(),
    createdAt: nowIso(),
    label: label?.trim() || `Snapshot ${new Date().toLocaleString()}`,
    schemaVersion: PERSISTENCE_SCHEMA_VERSION,
    project,
  };

  await grafDb.transaction('rw', [grafDb.snapshots, grafDb.history], async () => {
    await grafDb.snapshots.put(snapshot);
    await grafDb.history.add({ eventType: 'manual-snapshot', createdAt: snapshot.createdAt, detail: `Created snapshot ${snapshot.id}` });
  });

  const total = await grafDb.snapshots.count();
  if (total > DEFAULT_SNAPSHOT_LIMIT) {
    const overflow = total - DEFAULT_SNAPSHOT_LIMIT;
    const stale = await grafDb.snapshots.orderBy('createdAt').limit(overflow).toArray();
    if (stale.length > 0) {
      await grafDb.snapshots.bulkDelete(stale.map((entry) => entry.id));
    }
  }

  return snapshot;
};

export const listSnapshots = async () => grafDb.snapshots.orderBy('createdAt').reverse().toArray();

export const restoreSnapshotById = async (snapshotId: string) => {
  const snapshot = await grafDb.snapshots.get(snapshotId);
  if (!snapshot) throw new Error('Snapshot not found');
  if (snapshot.schemaVersion > PERSISTENCE_SCHEMA_VERSION) {
    throw new Error(`Unsupported snapshot schema version: ${snapshot.schemaVersion}`);
  }
  await savePersistedProject(snapshot.project, 'restore-snapshot');
  return snapshot.project;
};

export const toProjectExportPackage = (state: PersistedProjectState): ProjectExportPackage => ({
  kind: 'graf-project',
  projectSchemaVersion: PROJECT_PACKAGE_VERSION,
  exportedAt: nowIso(),
  encryption: {
    enabled: false,
    note: 'unencrypted-v1',
  },
  payload: {
    ...state,
    schemaVersion: PERSISTENCE_SCHEMA_VERSION,
  },
});

export const parseImportedPackage = (raw: string) => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Import failed: invalid JSON');
  }

  if (!isValidProjectExportPackage(parsed)) {
    throw new Error('Import failed: invalid project package shape');
  }

  if (parsed.projectSchemaVersion > PROJECT_PACKAGE_VERSION) {
    throw new Error(`Import failed: unsupported package schema version ${parsed.projectSchemaVersion}`);
  }

  if (parsed.payload.schemaVersion > PERSISTENCE_SCHEMA_VERSION) {
    throw new Error(`Import failed: unsupported project schema version ${parsed.payload.schemaVersion}`);
  }

  return parsed.payload;
};
