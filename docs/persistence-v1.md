# GRAF Persistence Foundation v1

## What is persisted now
- Primary project state is stored in **IndexedDB** (Dexie database `graf-local-first`) under the `graph` store.
- Structured stores are initialized for: `profile`, `graph`, `domains`, `nodes`, `edges`, `toolsState`, `substationState`, `settings`, `snapshots`, `history`.
- Current persisted payload includes:
  - active app mode
  - scene state (selection, graph/world camera, launch context, data spine, chain context)
  - Start graph state (`focusedDomainId`, `selectedEdgeId`, `activatedToolId`, pinned domain IDs, draggable node positions)
  - settings state
  - unlock-related local state (`devLabEnabled`)

## What is not yet persisted
- Full per-node/per-edge mutation history for the main influence graph.
- Rich tool runtime state (placeholder `toolsState` is present, currently empty by default).
- Substation execution details (placeholder `substationState` is present, currently empty by default).
- Cross-device/cloud sync and conflict resolution.
- Encryption-at-rest and encrypted export.

## Autosave behavior
- Autosave runs with debounce (`700ms`) after meaningful in-app state changes.
- Autosave writes to IndexedDB through a single persistence service (`savePersistedProject`).
- On next open, last valid saved project is restored automatically.

## Snapshots
- Manual snapshot creation is exposed in Settings.
- Each snapshot stores full project state + metadata (`id`, `label`, `createdAt`, schema version).
- Snapshot retention cap is applied (default max 20 newest snapshots).
- Snapshot restore loads the selected snapshot and persists it back as current state.

## Export / Import
- Export creates a project package JSON with:
  - package `kind`
  - package version (`projectSchemaVersion`)
  - export timestamp
  - explicit encryption metadata (`enabled: false`, `note: "unencrypted-v1"`)
  - payload (project state)
- Import validates:
  - valid JSON
  - package shape
  - supported package/project schema versions
- Invalid imports fail gracefully with explicit errors.

## Security & safety limitations (v1)
- Export is **not encrypted**.
- No arbitrary filesystem writes are performed silently.
- Persistence is local browser storage only (IndexedDB + minimal localStorage usage for tiny preference flags).
- No sync claims are made.

## Recommended next persistence PR
1. Add typed graph mutation log + forward-compatible migration handlers.
2. Persist real `toolsState` and `substationState` adapters per subsystem.
3. Add project integrity checksum and optional signed package metadata.
4. Add encrypted export/import option (user-provided passphrase, explicit UX).
5. Add “clear project data” flow that also wipes IndexedDB stores safely.
