# GRAF

GRAF is a **graph-first, single-screen command surface** where one living system is explored through four mode projections:

1. **Start**
2. **World**
3. **Graph**
4. **Oracle**

No dashboard cards, page stacks, or admin-panel layouts are used. The product keeps one immersive scene with a compact rail and contextual overlay.

## V1 foundation scope

This repository now provides a deployable V1 foundation with:

- Vite + React + strict TypeScript shell
- A single-screen scene architecture (`LeftRail` + `SceneViewport` + `OverlayLayer`)
- Four wired modes sharing scene intent
- Typed graph domain model and deterministic influence propagation
- Interactive world and graph scenes with shared selection bridge
- GitHub Pages deployment workflow

## Stack

- React 19
- TypeScript 5 (strict)
- Vite 7
- ESLint 9
- GitHub Actions (Pages deploy)

## Local development

```bash
npm install
npm run dev
```

## Build and quality checks

```bash
npm run build
npm run lint
npm run preview
```

## Deployment (GitHub Pages)

This repo is configured for Pages with `base: '/graf/'` in Vite.

Deployment workflow:

- File: `.github/workflows/deploy.yml`
- Trigger: push to `main` and `workflow_dispatch`
- Steps: install → build → upload `dist` → deploy Pages

After pushing to `main`, GitHub Actions deploys the latest `dist` to Pages.

## Folder structure

```txt
src/
  app/
    shell/
      AppShell.tsx
      LeftRail.tsx
      SceneViewport.tsx
      OverlayLayer.tsx
    state/
      useModeState.ts
      useSceneState.ts
  engine/
    sceneSignals.ts
  entities/
    system/modes.ts
  features/
    start/StartMode.tsx
    world/
      WorldMode.tsx
      worldPlanets.ts
    graph/
      model.ts
      engine.ts
      GraphMode.tsx
    oracle/OracleMode.tsx
  shared/
    theme/
      global.css
      tokens.ts
```

## What is implemented now

- **Single-screen shell** with left rail, central scene, and optional overlay
- **4 mode routing** through shared mode state
- **Scene linkage** through shared selection state:
  - world planet selection can map to graph node focus
  - graph node selection can map back to world anchor where mapped
- **Graph domain model** with typed nodes and edges:
  - Node fields: id, type, name, state, inertia, sensitivity, tags (+ view metadata)
  - Edge fields: source, target, type, weight, confidence, optional lag (+ label/id)
- **Influence engine**:
  - deterministic propagation pass
  - neighborhood extraction
  - influence summary metrics
- **Immersive visual baseline** dark sci-fi styling without dashboard widgets

## Deferred for next iteration

- Oracle simulation timeline and intervention editor
- External persistence / backend integration
- Scenario snapshots and replay
- Accessibility pass for keyboard-first scene navigation
- Automated unit tests for graph engine invariants

## Product direction guardrails

- Stay graph-first and scene-first
- Keep one living surface
- Keep mode transitions as projections of the same system
- Avoid introducing dashboard/card-grid/admin-panel UI patterns


## User guide (RU)

- Полная пошаговая инструкция для новичков: `USER_GUIDE_RU.md`
