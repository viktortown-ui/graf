import Dexie, { type Table } from 'dexie';
import type { HistoryRecord, PersistedProjectState, SnapshotRecord } from './schema';

export type PersistedEntity<T> = {
  id: string;
  value: T;
  updatedAt: string;
};

class GrafDatabase extends Dexie {
  profile!: Table<PersistedEntity<Record<string, unknown>>, string>;
  graph!: Table<PersistedEntity<PersistedProjectState>, string>;
  domains!: Table<PersistedEntity<Record<string, unknown>>, string>;
  nodes!: Table<PersistedEntity<Record<string, unknown>>, string>;
  edges!: Table<PersistedEntity<Record<string, unknown>>, string>;
  toolsState!: Table<PersistedEntity<Record<string, unknown>>, string>;
  substationState!: Table<PersistedEntity<Record<string, unknown>>, string>;
  settings!: Table<PersistedEntity<Record<string, unknown>>, string>;
  snapshots!: Table<SnapshotRecord, string>;
  history!: Table<HistoryRecord, number>;

  constructor() {
    super('graf-local-first');
    this.version(1).stores({
      profile: '&id, updatedAt',
      graph: '&id, updatedAt',
      domains: '&id, updatedAt',
      nodes: '&id, updatedAt',
      edges: '&id, updatedAt',
      toolsState: '&id, updatedAt',
      substationState: '&id, updatedAt',
      settings: '&id, updatedAt',
      snapshots: '&id, createdAt',
      history: '++id, eventType, createdAt',
    });
  }
}

export const grafDb = new GrafDatabase();

export const PRIMARY_PROJECT_ID = 'primary';
export const DEFAULT_SNAPSHOT_LIMIT = 20;
