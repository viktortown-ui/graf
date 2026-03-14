# GRAF Master Spec and Execution Roadmap (Authoritative Reset)

## SECTION 1 — THE CORRECT PRODUCT FOUNDATION

### What GRAF actually is
GRAF is a **graph-first human operating system**: a local-first, stateful life map where actions mutate real structures (nodes/edges), and those structural changes update risk, readiness, and route feasibility.

### What GRAF is not
- Not a dashboard with cards and summaries.
- Not a static “Graph” tab next to unrelated screens.
- Not a task list with visual garnish.
- Not prediction theater with fake certainty.
- Not a UI that explains life in text instead of showing structure.

### Why previous attempts failed
- First ring used abstract pseudo-domains instead of real life domains users recognize instantly.
- Graph stage was mixed with panel/dashboard logic, so structure became secondary.
- Edges looked decorative because they lacked default world-model semantics.
- Interaction focus was fragmented (screen switching, detached controls, explanatory text overload).
- System meaning was under-specified (pressure/leverage/confidence/readiness not encoded visually).

### What must be fixed first before more coding
1. Lock v1 ontology: one center + one first ring of real human domains.
2. Implement native relation matrix as default world model (not user-created from zero).
3. Rebuild graph stage around spatial interaction first; tools attach to selected structure.
4. Define visual semantics as hard product contract (no decorative rendering).
5. Ship only a strict v1 slice with 1–2 deep inner universes and deterministic local persistence.

---

## SECTION 2 — FIRST-RING HUMAN DOMAIN MODEL

### v1 first-ring domain set (RU-first)
Center node: **Я / Моя система**

First ring (7 domains):
1. **Здоровье и энергия**
2. **Работа и доход**
3. **Финансы и обязательства**
4. **Отношения и семья**
5. **Среда и быт**
6. **Фокус и развитие**
7. **Цели и смысл**

### Domain definitions

#### 1) Здоровье и энергия
- Why first ring: foundational capacity domain; user immediately understands it.
- Pressure: fatigue, sleep debt, chronic symptoms, burnout load.
- Leverage: sleep/rhythm stability, activity, recovery, treatment adherence.
- Strongly affects: Работа и доход, Отношения и семья, Фокус и развитие.
- Deeper/meta concepts inside: resilience, recovery index, overload risk.

#### 2) Работа и доход
- Why first ring: primary production and stability channel for most users.
- Pressure: workload volatility, role conflict, deadline accumulation.
- Leverage: role clarity, focused execution blocks, pipeline quality.
- Strongly affects: Финансы и обязательства, Здоровье и энергия, Среда и быт.
- Deeper/meta concepts inside: execution quality, capacity utilization, income reliability.

#### 3) Финансы и обязательства
- Why first ring: core stress amplifier/stabilizer with direct life constraints.
- Pressure: cashflow gaps, debt pressure, mandatory payments.
- Leverage: reserve buffer, expense control, debt restructuring.
- Strongly affects: Среда и быт, Здоровье и энергия, Цели и смысл.
- Deeper/meta concepts inside: financial runway, fragility index, obligation map.

#### 4) Отношения и семья
- Why first ring: major determinant of emotional load and support quality.
- Pressure: unresolved conflicts, care burden, boundary violations.
- Leverage: trust repair, boundary setting, support activation.
- Strongly affects: Здоровье и энергия, Фокус и развитие, Цели и смысл.
- Deeper/meta concepts inside: social support strength, conflict heat, relational reliability.

#### 5) Среда и быт
- Why first ring: environment and routines shape execution reality daily.
- Pressure: chaos, commute/time leakage, household friction.
- Leverage: environment simplification, routine automation, friction removal.
- Strongly affects: Здоровье и энергия, Работа и доход, Фокус и развитие.
- Deeper/meta concepts inside: friction map, rhythm stability, environment quality.

#### 6) Фокус и развитие
- Why first ring: governs learning loops and ability to adapt.
- Pressure: attention fragmentation, skill obsolescence, learning drift.
- Leverage: deliberate practice, attention protection, feedback cycles.
- Strongly affects: Работа и доход, Цели и смысл, Финансы и обязательства.
- Deeper/meta concepts inside: mastery gradient, cognitive load, adaptation speed.

#### 7) Цели и смысл
- Why first ring: strategic orientation and priority coherence driver.
- Pressure: value conflict, direction ambiguity, motivational collapse.
- Leverage: objective clarity, commitment hierarchy, narrative coherence.
- Strongly affects: Фокус и развитие, Работа и доход, Отношения и семья.
- Deeper/meta concepts inside: direction signal, priority alignment, readiness gates.

Rule: abstract terms (e.g., stability/mastery/execution/direction) remain **inside domains or cross-domain derived signals**, never first-ring domains.

---

## SECTION 3 — NATIVE RELATION MATRIX

### Relation taxonomy (v1)
- **усиливает** (amplifies)
- **ослабляет** (drains/reduces)
- **стабилизирует** (stabilizes)
- **дестабилизирует** (destabilizes)
- **включает** (enables)
- **задерживает** (delays)
- **маскирует** (masks)
- **зависит от** (depends on)

### Default relation contract
Each edge stores:
- source, target, type, directionality
- `defaultStrength` (0–1)
- `defaultConfidence` (0–1)
- `userModifier` (-1..+1)
- `evidenceState` (none / weak / verified / conflicting)
- activation mode (always-on / toggleable / conditional)
- correction permissions (strength/confidence/type/mute/notes)

### Relation families (v1 baseline)

1. **Здоровье и энергия → Работа и доход**
- Type: включает + стабилизирует
- Direction: directed
- Strength: 0.82
- Confidence: 0.80
- Mode: always-on
- User correction: adjust strength/confidence, add evidence, temporary mute
- Visual: thick cool-positive line; pulse when deteriorating energy threatens work

2. **Работа и доход → Финансы и обязательства**
- Type: усиливает (positive or negative depending on state)
- Direction: directed
- Strength: 0.88
- Confidence: 0.87
- Mode: always-on
- User correction: strength/confidence/type polarity marker
- Visual: high-thickness trunk edge; brightness reflects income reliability

3. **Финансы и обязательства → Здоровье и энергия**
- Type: дестабилизирует (under debt stress) / стабилизирует (with buffer)
- Direction: directed
- Strength: 0.78
- Confidence: 0.74
- Mode: conditional
- User correction: condition thresholds + confidence override with evidence
- Visual: dual-tone edge (stress vs stability states)

4. **Отношения и семья → Здоровье и энергия**
- Type: стабилизирует / дестабилизирует
- Direction: directed
- Strength: 0.72
- Confidence: 0.69
- Mode: conditional
- User correction: state polarity tuning, confidence notes
- Visual: medium edge; color shifts by conflict/support signal

5. **Среда и быт → Фокус и развитие**
- Type: включает + задерживает
- Direction: directed
- Strength: 0.70
- Confidence: 0.76
- Mode: always-on
- User correction: strength + friction tags
- Visual: segmented line showing friction points

6. **Фокус и развитие → Работа и доход**
- Type: усиливает
- Direction: directed
- Strength: 0.75
- Confidence: 0.73
- Mode: always-on
- User correction: strength/confidence + horizon (short/long effect)
- Visual: progressive gradient edge (delayed payoff)

7. **Цели и смысл → Фокус и развитие**
- Type: включает + стабилизирует
- Direction: directed
- Strength: 0.68
- Confidence: 0.66
- Mode: toggleable (user may suspend a goal stream)
- User correction: toggle, strength, priority context
- Visual: intent-colored edge; dims when goal clarity low

8. **Работа и доход → Здоровье и энергия**
- Type: ослабляет / дестабилизирует (overload path)
- Direction: directed
- Strength: 0.71
- Confidence: 0.72
- Mode: conditional
- User correction: workload threshold tuning + evidence logs
- Visual: warning hue appears with overload state

9. **Финансы и обязательства → Среда и быт**
- Type: включает / ограничивает
- Direction: directed
- Strength: 0.69
- Confidence: 0.77
- Mode: always-on
- User correction: strength + fixed-cost profile notes
- Visual: constraint band around target node when pressure high

10. **Цели и смысл → Работа и доход**
- Type: направляет (modeled as включает + delays)
- Direction: directed
- Strength: 0.62
- Confidence: 0.61
- Mode: conditional
- User correction: horizon tuning + confidence update
- Visual: dashed strategic edge, low immediate brightness

---

## SECTION 4 — VISUAL SEMANTICS OF THE GRAPH

Visual encoding must represent system state, never decoration.

- **Node size**: current systemic impact (influence × active pressure).
- **Node color**: domain identity hue (fixed palette, RU labels always visible).
- **Glow / pulse**: urgency delta (rapid change, deteriorating trend, or imminent threshold).
- **Edge thickness**: effective strength (`defaultStrength + userModifier`, clamped).
- **Edge style**:
  - solid: verified active influence,
  - dashed: delayed/strategic influence,
  - segmented: friction/latency chain,
  - double-line: bidirectional coupling.
- **Edge brightness**: confidence/evidence quality.
- **Cluster density**: number and intensity of active internal factors in selected local world.
- **Motion / drift**: low-amplitude deterministic micro-movement from state changes (not random physics).
- **Blur / dimming**: non-focused zones de-emphasized during selection/focus mode.
- **Lock states**: pin icon + hard outline means spatial lock (node/cluster position fixed).
- **Readiness states**:
  - ready: clear ring,
  - partial: broken ring,
  - blocked: crossed ring.
- **Stale state**: desaturated with clock marker (no evidence refresh).
- **Blind state**: striped overlay (high impact, low confidence).
- **Conflict state**: split-color contour (evidence contradiction).

---

## SECTION 5 — SPATIAL GRAPH STAGE

### Scene structure
- **Center**: fixed anchor `Я / Моя система`.
- **First ring**: 7 major domains in stable radial layout with constrained drift.
- **Second ring (v1-lite)**: only appears on focus for selected domain internals; hidden otherwise.

### Stage behavior
- Background drag: pan viewport.
- Wheel/pinch: zoom (bounded, deterministic zoom levels).
- Node drag: allowed for first-ring nodes within radial band; optional pin to lock.
- Cluster drag: allowed inside focused local world only.
- Edge select: opens relation world attached near midpoint of that edge.
- Scene rotation: user-controlled optional rotate gesture (off by default desktop, on in touch mode).
- Orbit behavior: subtle deterministic orbit relaxation after node move to preserve readability.

### Readability controls
- No free chaotic force simulation.
- Movement only from: user drag, focus transition, threshold-triggered emphasis.
- Automatic layout correction respects pinned nodes and minimal edge crossings.

---

## SECTION 6 — INNER UNIVERSE MODEL

### 1) Domain selection → local world
- Visible: selected domain center + its internal factors + strongest incoming/outgoing cross-domain edges.
- Editable: factor states, local priorities, domain-specific modifiers.
- Signals: pressure pockets, leverage candidates, evidence freshness.
- Tools: quick action insertion, state calibration, dependency check.
- Effect on main graph: recompute domain pressure/leverage and affected edge effective weights.
- Attachment: rendered as an anchored expansion shell physically connected to selected node.

### 2) Edge selection → relation world
- Visible: source/target snapshots, causal chain assumptions, recent evidence.
- Editable: strength, confidence, activation mode, mute, condition thresholds.
- Signals: contradiction, stale evidence, overfitting warning.
- Tools: relation tuner, evidence log, conditional rule editor.
- Effect on main graph: immediate edge visual/state update and route recalculation.
- Attachment: compact relation capsule attached to edge midpoint with tether.

### 3) Cluster selection → local cluster world
- Visible: grouped factors (e.g., sleep-rhythm-stress cluster inside Health).
- Editable: cluster-level correction and internal edge priorities.
- Signals: cluster bottleneck score, propagation lag.
- Tools: batch adjustments, cluster reset, evidence drill-down.
- Effect on main graph: updates only through parent domain aggregation contract.
- Attachment: inline magnified lens over the selected cluster region.

---

## SECTION 7 — V1 BUILD SCOPE

### Absolutely in v1
- Correct first-ring ontology with RU-first labels.
- Native relation matrix with editable modifiers and evidence state.
- Graph stage with pan/zoom/select/edge-select/node-drag/pin/focus.
- Visual semantics contract implemented for key states (pressure, leverage, confidence, stale/conflict).
- Local-first persistence (Dexie) for domain state, relation tuning, evidence logs.
- Two deeper inner universes: **Здоровье и энергия**, **Финансы и обязательства**.
- First honest route/probability layer: confidence-bounded, deterministic, no fake certainty.

### Must wait
- Full all-domain deep universes.
- Advanced simulation engine and scenario branching trees.
- Social/collaboration layer.
- Cloud sync and cross-device merge.
- AI-generated autonomous restructuring.

### Must exist immediately (interactions)
- Pan/zoom.
- Node select/focus.
- Edge select.
- Node drag + pin.
- Relation tune (strength/confidence/mute).

### Advanced interactions to defer
- Multi-node lasso operations.
- Temporal replay animation.
- Automatic structural refactoring suggestions.

---

## SECTION 8 — IMPLEMENTATION ROADMAP

### Epic 1: Graph Foundation Correction
- Goal: remove dashboard bias; establish graph-native stage shell.
- Scope: Start/Graph composition, selection model, attached tool surfaces.
- Deliverables: center+ring scene scaffold, unified graph interaction controller.
- Acceptance: no detached side-admin dependency; graph remains primary.
- Must not break: HashRouter, desktop gate, existing mode navigation.

### Epic 2: First-Ring Ontology Correction
- Goal: replace abstract top-level nodes with v1 human domains.
- Scope: model constants, labels, seed data, RU copy.
- Deliverables: new domain set, migration for previous IDs mapping.
- Acceptance: all first-ring nodes are human life domains; center remains stable.
- Must not break: persisted selections and legacy references (mapped by migration).

### Epic 3: Native Relation Matrix Implementation
- Goal: encode default world-model relations with editable overlays.
- Scope: relation schema, seed matrix, UI binding.
- Deliverables: typed relation table + deterministic effective-weight calculator.
- Acceptance: each relation has defaults, confidence, mode, and user modifier.
- Must not break: deterministic calculations and existing graph render performance.

### Epic 4: Graph Stage Rebuild
- Goal: make spatial stage readable, interactive, and stateful.
- Scope: layout engine, focus transitions, semantic visuals.
- Deliverables: pan/zoom/focus/drag/pin + semantic edge/node rendering.
- Acceptance: focus never loses context; non-focus areas de-emphasize correctly.
- Must not break: accessibility labels, keyboard navigation baseline.

### Epic 5: Inner Universes (2 domains + edge world)
- Goal: add actionable depth where it matters most in v1.
- Scope: Health and Finance local worlds + relation capsule.
- Deliverables: factor nodes, local tools, aggregation back to main graph.
- Acceptance: local edits visibly change main graph pressure/leverage and route hints.
- Must not break: global graph continuity and persistence consistency.

### Epic 6: Local-First Persistence + Migration Discipline
- Goal: persist all v1 graph semantics safely.
- Scope: Dexie schema version bump, migration map, integrity checks.
- Deliverables: migration scripts, fallback defaults, corruption guards.
- Acceptance: upgrade preserves usable user state; deterministic restore on load.
- Must not break: existing Dexie records, startup path, offline usage.

### Epic 7: Relation Tuning Controls
- Goal: let users refine native model without breaking ontology.
- Scope: edge capsule controls, evidence logging UX, conflict markers.
- Deliverables: adjust strength/confidence/type mode + mute/activate controls.
- Acceptance: corrections immediately affect visuals and route scores.
- Must not break: relation defaults (always recoverable reset).

### Epic 8: First Honest Route/Probability Layer
- Goal: provide practical next-action logic with uncertainty honesty.
- Scope: deterministic scorer, confidence bounds, no black-box claims.
- Deliverables: top route candidates tied to explicit state conditions.
- Acceptance: every route recommendation shows why + confidence limits.
- Must not break: local-first constraints, explainability, deterministic replay.

---

## SECTION 9 — ENGINEERING CONSTRAINTS

1. RU-only visible UI in v1 (labels, controls, hints, states).
2. Deterministic logic for layout seeds, scoring, relation propagation where applicable.
3. Local-first data ownership; no mandatory network dependency for core graph operations.
4. Dexie migration discipline: explicit versions, tested migration map, no silent destructive rewrites.
5. No massive unrelated shell refactor while graph foundation is being corrected.
6. No fake route intelligence (every recommendation traceable to local state and rules).
7. No silent data collection, no hidden telemetry.
8. Accessibility baseline cannot regress (contrast, readability, keyboard focus, aria labels).
9. No feature theater: every shipped element must mutate or clarify graph state.

---

## SECTION 10 — WHAT MUST BE CUT

- Abstract pseudo-domains as first ring.
- Giant right-side admin panel controlling a “fake graph.”
- Text-heavy instructional overlays replacing structural visuals.
- Decorative edges without semantics.
- Fake AI certainty or confidence inflation.
- Hairball graph density without focus scaffolding.
- Over-polished cosmic visuals with low interaction value.
- Too many domains before strong first ring is stable.
- Full simulation stack before relation matrix and persistence are correct.
- Any implementation that breaks HashRouter/desktop gate/local-first discipline.

---

## SECTION 11 — DELIVERABLE FORMAT

### A) One-sentence definition of the corrected GRAF system
GRAF is a local-first graph operating system where a person navigates real life domains, tunes native causal relations, and executes confidence-bounded actions that visibly reshape future risk and leverage.

### B) One-paragraph vision summary
The corrected GRAF experience starts from a stable center (`Я / Моя система`) and a clear first ring of human life domains, not abstractions. The graph itself is the interface: users focus domains, inspect directional relations, tune strengths/confidence with evidence, and open local inner worlds where concrete corrections are made. Every interaction writes back into one living structure, so pressure, leverage, readiness, and route feasibility update in place. The product remains local-first, deterministic where needed, RU-first in visible UI, and honest about uncertainty.

### C) Final proposed v1 first-ring domain set
- Здоровье и энергия
- Работа и доход
- Финансы и обязательства
- Отношения и семья
- Среда и быт
- Фокус и развитие
- Цели и смысл

### D) Native relation matrix summary
A predefined directional matrix connects first-ring domains with typed influences (`усиливает`, `ослабляет`, `стабилизирует`, `дестабилизирует`, `включает`, `задерживает`, `маскирует`, `зависит от`). Each relation ships with default strength/confidence and activation mode, while users can tune modifiers, add evidence, mute, and correct conditions without rebuilding ontology from scratch.

### E) Epic roadmap in order
1. Graph foundation correction
2. First-ring ontology correction
3. Native relation matrix implementation
4. Graph stage rebuild
5. Inner universes (Health + Finance + edge world)
6. Local-first persistence + migration discipline
7. Relation tuning controls
8. First honest route/probability layer

### F) Do not let the project become this again
- A dashboard with a graph decoration.
- An abstract ontology disconnected from lived domains.
- A panel-heavy CRUD tool.
- A visual toy with no state consequences.
- A pseudo-intelligent recommender with opaque logic.
- A complexity explosion before v1 structure is stable.

### G) Final recommendation: what the very next PR should be
**Next PR should implement Epic 2 first (first-ring ontology correction) plus migration mapping**, because all stage, relation, and interaction work depends on the domain model being correct and stable.
