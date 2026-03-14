import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AppMode } from '../../entities/system/modes';
import type { useSceneState } from '../state/useSceneState';
import type { useSettingsState } from '../state/useSettingsState';
import { readDevLabEnabled, setDevLabEnabled } from '../../entities/system/devLabAccess';
import { PERSISTENCE_SCHEMA_VERSION, type PersistedProjectState } from './schema';
import {
  createManualSnapshot,
  listSnapshots,
  loadPersistedProject,
  parseImportedPackage,
  restoreSnapshotById,
  savePersistedProject,
  toProjectExportPackage,
} from './projectPersistence';

type PersistenceControllerParams = {
  sceneState: ReturnType<typeof useSceneState>;
  settingsState: ReturnType<typeof useSettingsState>;
  activeMode: AppMode;
  setActiveMode: (mode: AppMode) => void;
  devLabEnabled: boolean;
  setDevLabState: (enabled: boolean) => void;
};

const AUTOSAVE_DELAY_MS = 700;

export const usePersistenceController = ({
  sceneState,
  settingsState,
  activeMode,
  setActiveMode,
  devLabEnabled,
  setDevLabState,
}: PersistenceControllerParams) => {
  const [isReady, setIsReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState('loading...');
  const [lastError, setLastError] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<Array<{ id: string; label: string; createdAt: string }>>([]);
  const skipAutosave = useRef(true);

  const composeProject = useCallback(
    (): PersistedProjectState => ({
      schemaVersion: PERSISTENCE_SCHEMA_VERSION,
      lastSavedAt: new Date().toISOString(),
      activeMode,
      scene: sceneState.createSnapshot(),
      settings: settingsState.getSnapshot(),
      unlock: {
        devLabEnabled,
      },
      toolsState: {},
      substationState: {},
    }),
    [activeMode, devLabEnabled, sceneState, settingsState],
  );

  const reloadSnapshots = useCallback(async () => {
    const records = await listSnapshots();
    setSnapshots(records.map(({ id, label, createdAt }) => ({ id, label, createdAt })));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const project = await loadPersistedProject();
        if (project && !cancelled) {
          sceneState.hydrateFromSnapshot(project.scene);
          settingsState.replaceSettings(project.settings);
          setActiveMode(project.activeMode);
          setDevLabEnabled(project.unlock.devLabEnabled);
          setDevLabState(project.unlock.devLabEnabled);
          setSaveStatus(`restored ${new Date(project.lastSavedAt).toLocaleString()}`);
        } else if (!cancelled) {
          setSaveStatus('ready');
        }
        await reloadSnapshots();
      } catch (error) {
        if (!cancelled) {
          setLastError(error instanceof Error ? error.message : 'Failed to initialize persistence');
          setSaveStatus('error');
        }
      } finally {
        if (!cancelled) {
          skipAutosave.current = false;
          setIsReady(true);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [reloadSnapshots, sceneState, setActiveMode, setDevLabState, settingsState]);

  useEffect(() => {
    if (!isReady || skipAutosave.current) return;

    setSaveStatus('saving...');
    const timer = window.setTimeout(async () => {
      try {
        const project = composeProject();
        await savePersistedProject(project, 'autosave');
        setSaveStatus(`saved ${new Date().toLocaleTimeString()}`);
        setLastError(null);
      } catch (error) {
        setSaveStatus('save failed');
        setLastError(error instanceof Error ? error.message : 'Autosave failed');
      }
    }, AUTOSAVE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [composeProject, isReady]);

  const persistenceActions = useMemo(
    () => ({
      saveStatus,
      lastError,
      snapshots,
      exportProject: () => JSON.stringify(toProjectExportPackage(composeProject()), null, 2),
      importProject: async (raw: string) => {
        const imported = parseImportedPackage(raw);
        sceneState.hydrateFromSnapshot(imported.scene);
        settingsState.replaceSettings(imported.settings);
        setActiveMode(imported.activeMode);
        setDevLabEnabled(imported.unlock.devLabEnabled);
        setDevLabState(imported.unlock.devLabEnabled);
        await savePersistedProject(imported, 'import');
        await reloadSnapshots();
        setSaveStatus(`imported ${new Date().toLocaleTimeString()}`);
      },
      createSnapshot: async (label?: string) => {
        const snapshot = await createManualSnapshot(composeProject(), label);
        await reloadSnapshots();
        setSaveStatus(`snapshot ${new Date(snapshot.createdAt).toLocaleTimeString()}`);
      },
      restoreSnapshot: async (snapshotId: string) => {
        const restored = await restoreSnapshotById(snapshotId);
        sceneState.hydrateFromSnapshot(restored.scene);
        settingsState.replaceSettings(restored.settings);
        setActiveMode(restored.activeMode);
        setDevLabEnabled(restored.unlock.devLabEnabled);
        setDevLabState(restored.unlock.devLabEnabled);
        setSaveStatus(`snapshot restored ${new Date().toLocaleTimeString()}`);
      },
    }),
    [composeProject, lastError, reloadSnapshots, saveStatus, sceneState, setActiveMode, setDevLabState, settingsState, snapshots],
  );

  return persistenceActions;
};

export const readDefaultDevLabEnabled = () => readDevLabEnabled();
