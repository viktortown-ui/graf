# GRAF

Premium graph-first, single-screen command application.

## Product intent

GRAF is designed as an immersive desktop command surface where every workflow happens inside one continuous scene.
The product avoids dashboard cards, page stacks, and admin-table patterns in favor of:

- one dominant scene viewport
- one compact mode rail with exactly 4 modes: **Start / World / Graph / Oracle**
- one contextual overlay layer that changes with mode intent

## Architecture overview

```txt
src/
  app/
    App.tsx
    shell/
      AppShell.tsx          # root composition: left rail + scene stage + overlay layer
      LeftRail.tsx          # 4-mode rail navigation
      OverlayLayer.tsx      # contextual right-side overlay placeholder
      SceneViewport.tsx     # immersive central scene surface
    state/
      useModeState.ts       # mode switching state

  features/
    start/StartMode.tsx     # Start mode placeholder copy
    world/WorldMode.tsx     # World mode placeholder copy
    graph/GraphMode.tsx     # Graph mode placeholder copy
    oracle/OracleMode.tsx   # Oracle mode placeholder copy

  entities/
    system/modes.ts         # mode definitions and shared types

  engine/
    sceneSignals.ts         # per-mode visual signal metadata

  shared/
    lib/cn.ts               # className utility
    ui/ModeGlyph.tsx        # rail mode glyph primitive
    theme/
      global.css            # dark sci-fi tokens + shell styling
      tokens.ts             # token object for future TS-driven theming

  main.tsx
```

## Theme baseline

Base theme tokens are defined in `src/shared/theme/global.css` and `src/shared/theme/tokens.ts`:

- colors: deep black-blue backgrounds, cool text contrast, cyan/violet glow accents
- borders: soft neon edge lines for surfaces and overlays
- spacing: scene-first spacing scale with dense rail and expansive center
- typography: clean body font + sci-fi display font stack

## Modes

The shell currently supports four clean placeholders:

- `StartMode`
- `WorldMode`
- `GraphMode`
- `OracleMode`

Mode switching is local and immediate through the left rail.

## Run and build

```bash
npm install
npm run dev
npm run build
npm run lint
```
