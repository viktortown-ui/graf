# GRAF (V1 foundation)

Graph-first, single-screen decision engine.

## Current increment

This first increment establishes:

- a deterministic local state engine
- one immersive screen with four modes (`Start`, `World`, `Graph`, `Oracle`)
- a persistent graph model with nodes, directed influences, and goal vectors
- a what-if forecast strip and a single next-best action panel

## Proposed structure

```txt
src/
  app/
    App.tsx                 # scene shell (left rail + main canvas + action panel)
  components/
    LeftRail.tsx            # mode switching
    SceneCanvas.tsx         # cosmic projection + graph/oracle overlays
    ModePanel.tsx           # next best action + controls
  domain/
    types.ts                # strict domain model types
    seed.ts                 # deterministic seed graph
  model/
    engine.ts               # tick/update, forecast simulation, action derivation
  state/
    useGrafState.ts         # local-first orchestration + persistence
  styles/
    app.css                 # scene and component styling
  index.css                # global styles
  main.tsx                 # app bootstrap
```

## Commands

```bash
npm install
npm run dev
npm run build
```
