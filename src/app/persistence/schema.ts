import type { AppSettings } from '../state/settingsModel';
import type { SceneStateSnapshot } from '../state/useSceneState';
import type { AppMode } from '../../entities/system/modes';

export const PERSISTENCE_SCHEMA_VERSION = 1;
export const PROJECT_PACKAGE_VERSION = 1;

export type PersistedProjectState = {
  schemaVersion: number;
  lastSavedAt: string;
  activeMode: AppMode;
  scene: SceneStateSnapshot;
  settings: AppSettings;
  unlock: {
    devLabEnabled: boolean;
  };
  toolsState: Record<string, unknown>;
  substationState: Record<string, unknown>;
};

export type SnapshotRecord = {
  id: string;
  createdAt: string;
  label: string;
  schemaVersion: number;
  project: PersistedProjectState;
};

export type HistoryRecord = {
  id?: number;
  eventType: 'autosave' | 'manual-snapshot' | 'import' | 'restore-snapshot';
  createdAt: string;
  detail: string;
};

export type ProjectExportPackage = {
  kind: 'graf-project';
  projectSchemaVersion: number;
  exportedAt: string;
  encryption: {
    enabled: false;
    note: 'unencrypted-v1';
  };
  payload: PersistedProjectState;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export const isValidProjectExportPackage = (value: unknown): value is ProjectExportPackage => {
  if (!isRecord(value)) return false;
  if (value.kind !== 'graf-project') return false;
  if (typeof value.projectSchemaVersion !== 'number') return false;
  if (!isRecord(value.encryption) || value.encryption.enabled !== false) return false;
  if (!isRecord(value.payload)) return false;
  return typeof value.payload.schemaVersion === 'number';
};
