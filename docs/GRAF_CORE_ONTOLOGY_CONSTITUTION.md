# GRAF CORE Ontology Constitution

## SECTION 1 — PRODUCT ONTOLOGY THESIS

GRAF CORE is a **graph-native operating system for human decisions under uncertainty**: a live causal workspace where users map states, test interventions, and execute routes. It is not a dashboard and not a static model.

Ontology matters because every product behavior (what appears, what unlocks, what is suggested, what is trusted) depends on strict meaning. If entities are vague, the system cannot reason; if the system cannot reason, recommendations become decoration.

Most graph products fail because they:
- confuse **visual nodes** with **operational entities**,
- store links without relationship semantics,
- never separate signal confidence from storytelling,
- expose everything at once, creating cognitive noise,
- bolt tools outside the graph, breaking causality.

For GRAF to function as a real operating system, these must be true:
1. Every visible object has a machine-actionable type and state.
2. Every edge encodes directional influence + confidence, not just adjacency.
3. Unlocks are evidence-gated, never arbitrary.
4. Tools mutate graph state directly and immediately.
5. Route generation is constrained by leverage, pressure, risk, and confidence.
6. “Best next move” is always tied to explicit graph conditions.

## SECTION 2 — PRIMARY ENTITIES

### Central Node
- **What it is:** The user-selected primary control target for the current operating cycle.
- **Why it exists:** Prevents first-session diffusion and gives immediate strategic focus.
- **What it does:** Anchors Start mode, prioritizes local graph expansion, biases route scoring.
- **How it differs:** Not the whole identity, not a domain; it is a temporary strategic center.

### Major Domain
- **What it is:** A top-level functional system (e.g., Energy Regulation, Cognitive Output).
- **Why it exists:** Provides stable decomposition of life-system complexity.
- **What it does:** Organizes subdomains, shared constraints, and domain-level maturity.
- **How it differs:** Broader than subdomain; unlike support signals, it owns interventions.

### Subdomain
- **What it is:** A bounded subsystem inside a major domain (e.g., Sleep Timing inside Energy Regulation).
- **Why it exists:** Makes causal structure manageable and testable.
- **What it does:** Hosts operational nodes and local mechanisms.
- **How it differs:** Narrower than domain, broader than node.

### Node
- **What it is:** Smallest stateful operable unit with measurable status and actionable interventions.
- **Why it exists:** Enables precise observation and change.
- **What it does:** Stores value, trend, uncertainty, recent actions, and local forecasts.
- **How it differs:** Unlike tools, nodes are state targets; unlike actions, nodes persist.

### Edge
- **What it is:** Typed directional relationship between two nodes or aggregates.
- **Why it exists:** Encodes causality/influence pathways.
- **What it does:** Transmits effect potential used by route and risk engines.
- **How it differs:** Unlike route segments, edges are structural; routes are selected traversals.

### Contour
- **What it is:** A semantic boundary around a coherent operating scope (node neighborhood, subdomain, or cross-domain scenario).
- **Why it exists:** Lets the user switch analysis scales without losing context.
- **What it does:** Defines what signals, tools, and routes are in current focus.
- **How it differs:** Not a hierarchy level by itself; it is a focus boundary.

### Cluster
- **What it is:** Dense, highly interdependent node group detected or configured.
- **Why it exists:** Reveals where local feedback loops dominate behavior.
- **What it does:** Supports cluster-level diagnostics and intervention batching.
- **How it differs:** A cluster is structural density; a contour is user/system focus frame.

### Route
- **What it is:** Ordered action path across nodes/edges to reach a target state.
- **Why it exists:** Converts graph understanding into executable sequence.
- **What it does:** Bundles steps, dependencies, expected effect window, and confidence range.
- **How it differs:** Unlike advice, route is state-conditional and graph-constrained.

### Leverage
- **What it is:** Estimated impact-per-effort ratio of acting on a node/edge.
- **Why it exists:** Directs limited user energy to highest-value changes.
- **What it does:** Re-ranks candidate actions and route branches.
- **How it differs:** Not impact alone; includes effort and propagation.

### Pressure Point
- **What it is:** High-strain node/edge where unresolved instability propagates quickly.
- **Why it exists:** Early warning for compounding downside.
- **What it does:** Elevates urgency and can override routine optimization.
- **How it differs:** Pressure is acute instability; risk zone is probabilistic threat region.

### Risk Zone
- **What it is:** Region in graph state-space with elevated probability of undesirable outcomes.
- **Why it exists:** Supports prevention over reaction.
- **What it does:** Triggers protective routes and stricter confidence display.
- **How it differs:** A zone spans multiple elements; pressure point may be single element.

### Confidence Signal
- **What it is:** Reliability metric for any estimate (state, edge, route, forecast).
- **Why it exists:** Prevents fake certainty.
- **What it does:** Conditions visibility, language, and unlock eligibility.
- **How it differs:** Confidence is epistemic quality, not user performance.

### Maturity Signal
- **What it is:** Capability index of how operationally developed a node/domain is.
- **Why it exists:** Governs progression and depth access.
- **What it does:** Tracks evidence breadth, stability, repeatability, and intervention literacy.
- **How it differs:** Maturity is readiness to operate deeper, not current health score.

### Tool
- **What it is:** Graph-embedded operation for capture, interpretation, simulation, or execution.
- **Why it exists:** Makes graph actionable in-place.
- **What it does:** Reads/writes graph entities and logs evidence.
- **How it differs:** Tool is mechanism; action is user commitment executed through it.

### Action
- **What it is:** Time-bound user commitment tied to one or more nodes.
- **Why it exists:** Converts analysis into behavior change.
- **What it does:** Creates expected effects, check-ins, and outcome feedback.
- **How it differs:** Unlike tool sessions, actions persist into real-world schedule.

### Unlock
- **What it is:** Rules-based reveal of entities, tools, or depth layers.
- **Why it exists:** Controls complexity and rewards proof.
- **What it does:** Expands accessible graph power when criteria are met.
- **How it differs:** Unlock is structural permission, not cosmetic badge.

### Layer
- **What it is:** Depth tier of analysis/operation (Surface → Pattern → Mechanism → Strategy → Orchestration).
- **Why it exists:** Stages cognitive and analytical complexity.
- **What it does:** Determines available metrics, tools, and route sophistication.
- **How it differs:** Layers are maturity-gated depth, not separate apps.

### State
- **What it is:** Current measured/estimated condition of an entity.
- **Why it exists:** Provides baseline for change detection.
- **What it does:** Feeds risk, leverage, and routing logic.
- **How it differs:** State is snapshot; trend is movement across snapshots.

### Forecast Surface
- **What it is:** Scenario manifold showing projected trajectories under candidate actions.
- **Why it exists:** Enables pre-action comparison.
- **What it does:** Displays plausible outcome bands, not single-point predictions.
- **How it differs:** Forecast surface is multi-path projection; route is one chosen path.

## SECTION 3 — GRAPH HIERARCHY

1. **Top level:** User Workspace Graph (single unified operating graph).
2. **Starting center:** One chosen **central node** (not a static hub). The system may suggest candidates, but user confirms.
3. **Major domains:** Stable first-order partitions of the workspace graph.
4. **Subdomains:** Nested inside major domains; contain tightly related operational nodes.
5. **Nodes:** Live inside subdomains, may have cross-domain edges.
6. **Edges:** Can link node↔node, node↔subdomain aggregate, and domain↔domain aggregate where evidence exists.
7. **Tools placement:**
   - Node tools on node cards/halos.
   - Edge tools on relationship inspector.
   - Contour/domain tools on contour header.
   - Whole-graph tools on command rail.
8. **Local graphs:** Each domain renders a local subgraph view that is a scoped projection of the same global graph (not a separate database).
9. **Scale control:** Progressive reveal + contour scoping + density thresholds + relevance ranking prevent chaos.

## SECTION 4 — DOMAIN ARCHITECTURE

A **major domain** must meet all criteria:
- persistent over time,
- causally central (many meaningful edges),
- independently actionable,
- measurable with recurring signals,
- materially affects outcomes users care about.

A **subdomain** must:
- represent one coherent mechanism,
- have at least 3 operable nodes,
- support at least one local intervention loop.

A **support signal** is not a domain when it is:
- derivative (computed from others),
- too narrow for standalone intervention,
- mainly used as calibration metadata.

### v1 domain count
- **6 major domains total in model.**
- **4 active at launch**, 2 visible as “later” silhouettes (prevents false completeness while preserving map legitimacy).

### Domain interaction rules
- Domains are non-isolated; cross-domain edges are first-class.
- Route engine may traverse domains only when dependency confidence exceeds threshold.
- Domain maturity can gate cross-domain strategy tools.

### Depth parity
- Domains need consistent **architecture**, not equal content volume.
- Some domains can be shallower in v1, but must expose same layer grammar.

### Imbalance handling
- If one domain outpaces others, route engine applies diminishing returns and surfaces dependency deficits (“progress blocked by upstream instability”).

## SECTION 5 — EDGE ARCHITECTURE

### Relationship taxonomy (v1)
1. **Enables** (positive prerequisite effect)
2. **Amplifies** (increases magnitude of another effect)
3. **Stabilizes** (reduces variance / improves resilience)
4. **Drains** (resource depletion effect)
5. **Destabilizes** (increases variance / fragility)
6. **Blocks** (hard constraint)
7. **Delays** (time-shifted effect)
8. **Masks** (hides true state signal)
9. **Depends-on** (structural prerequisite)
10. **Compensates** (temporary counteraction)

### Edge properties
- **Directed:** yes, always; bidirectional requires two edges.
- **Strength/weight:** required (coarse in v1: low/med/high + optional numeric backend).
- **Confidence:** required and separate from strength.
- **Latency:** optional in v1 for Delays.

### Edge provenance
- user-defined hypothesis,
- system-suggested inference,
- verified (evidence threshold met).

### Uncertain edge handling
- Dashed rendering + confidence badge + “hypothesis” label.
- Uncertain edges can inform exploration, but cannot drive high-stakes route recommendations alone.

### Preventing dangerous false edges
- Verification gates before strategic automation.
- Contradiction detection (new evidence weakens/removes edge).
- Audit log of who/what created edge and why.
- High-impact routes require minimum verified-edge ratio.

## SECTION 6 — DEPTH AND MATURITY MODEL

### Definitions
- **Shallow:** Minimal recent data, low mechanism clarity, mostly descriptive.
- **Deep:** Multi-signal, time-tested, mechanism-linked, intervention-sensitive.
- **Mature:** Reliably operable with repeatable outcomes and robust confidence.
- **Pseudo-depth:** Many metrics/visuals without validated causal links.
- **Unlock-ready:** Meets criteria for next layer/tools.
- **Forecast-ready:** Has sufficient validated structure to project scenarios responsibly.
- **Structurally weak:** Sparse critical edges, high uncertainty, unstable state variance.

### How depth grows
A node/domain gains depth through:
1. repeated observations,
2. action-outcome cycles,
3. cross-signal corroboration,
4. edge verification,
5. stability under changing context.

### Forecast-ready minimum evidence (v1)
- at least 3 meaningful nodes with stable baselines,
- at least 4 relevant edges, 60%+ verified,
- at least 2 completed intervention cycles,
- confidence above domain threshold for 14-day horizon.

### Force-opening deeper levels
- User may preview deeper layers, but execution tools remain locked until evidence gates are met.

### False confidence protection
- Confidence decay when data stales.
- Explicit uncertainty language (“plausible”, “tentative”, “validated”).
- Wide bands for low-confidence forecasts.
- No single-score certainty claims.

## SECTION 7 — TOOL EMBEDDING MODEL

### Tool placement by graph object
- **Node-level tools:** capture, check-in, micro-diagnostics, intervention planner.
- **Edge-level tools:** relationship test, dependency probe, contradiction resolver.
- **Contour/domain tools:** cluster analysis, domain stress scan, local route optimizer.
- **Whole-graph tools:** global route comparer, risk horizon map, resource allocator.

### Open/close behavior
- Tools open from direct graph interaction (tap/click on node, edge, contour).
- Tools appear as anchored panels or radial overlays.
- Closing a tool returns to same graph locus with updated states highlighted.

### Output integration
- Every tool run writes: updated state, evidence event, confidence deltas, and potential unlock progress.
- Graph visibly reflects outputs immediately (state color/pulse, edge badges, route rank shifts).

## SECTION 8 — START MODE LOGIC

### First 30 seconds
User sees a live graph field with 5–7 candidate starting nodes pulled from active domains, each with plain-language outcome framing (“Improve X to reduce Y and unlock Z”).

### First central choice
System computes a suggested starting node from ultra-light prior signals (self-rated urgency + recent friction + stated objective). User explicitly confirms or overrides.

### Immediately after choice
- Selected node centers.
- First-ring nodes appear with typed edges.
- One pressure point and one leverage point are highlighted if confidence allows.

### First inputs collected
- 3–5 high-yield inputs:
  1. current state estimate,
  2. perceived obstacle,
  3. available effort budget,
  4. near-term objective.

### First graph reaction
- Node state initializes.
- Edge confidences update from priors.
- Preliminary risk zone shading appears.

### First unlock
- Unlock: Pattern layer for central node (if minimum input completeness met).

### First route
- System proposes one **best next move route fragment** (1 immediate action + 1 follow-up checkpoint) with confidence band and expected effect window.

## SECTION 9 — ROUTE AND DECISION MODEL

A **route** is the highest-value feasible sequence of actions across graph structure for a chosen objective and time horizon.

“**Best next move**” means: the single action step with maximal expected near-term value under current constraints, not generic advice.

Difference from advice:
- advice: context-light, reusable text,
- route step: graph-state-conditional, dependency-aware, time-bounded.

### Route quality criteria
1. expected impact,
2. execution cost/effort,
3. dependency feasibility,
4. risk reduction,
5. confidence robustness,
6. reversibility if wrong.

### Pressure/leverage integration
- Pressure points increase urgency weighting.
- Leverage points increase impact weighting.
- When both conflict, system shows tradeoff options (stabilize now vs optimize now).

### Probability and confidence display
- Use bounded ranges and verbal confidence tiers.
- Never show fake precision (e.g., 73.482%).
- Separate outcome probability from model confidence.

### From understanding to action
Graph explanation panel must end in executable commits: schedule, trigger, and check-in event attached to nodes, then route auto-recalculates after each check-in.

## SECTION 10 — RULES OF OPENING AND PROGRESSION

### Opens automatically
- Surface layer of active domains,
- central node first-ring neighbors,
- basic node tools.

### Opens after data input
- Pattern views,
- edge hypothesis suggestions,
- first route comparer.

### Opens after repeated use
- mechanism diagnostics,
- contradiction detection,
- longer horizon route planning.

### Opens after cross-domain evidence
- orchestration layer previews,
- cross-domain optimization routes,
- higher-order forecast surface.

### Must remain hidden until earned
- high-stakes automation,
- deep simulation controls,
- global optimization shortcuts.

### Avoid overload and infantilization
- progressive disclosure by evidence,
- always show “why locked / how to unlock,”
- avoid patronizing gamification language.

### Progression feel
- Capability unlocks must map to real new power (new intervention class, longer forecast horizon, stronger route control), not arbitrary leveling.

## SECTION 11 — V1 ONTOLOGY CUT

### Must exist in v1
- central node,
- major domain + subdomain,
- node + directed typed edge,
- confidence signal,
- maturity signal (coarse),
- route,
- pressure/leverage markers,
- unlock rules,
- layers (at least Surface/Pattern/Mechanism),
- graph-embedded tools.

### Should wait
- full autonomous orchestration,
- complex multi-agent simulations,
- advanced compensatory-loop libraries,
- long-horizon macro forecasting beyond evidence capacity.

### Relationship types enough for v1
Use 6 core types only: Enables, Stabilizes, Drains, Destabilizes, Blocks, Depends-on. Add others later when evidence handling matures.

### Maturity/depth enough for v1
- 3-layer depth (Surface, Pattern, Mechanism),
- binary-to-tertiary maturity bands (Emerging / Operational / Reliable),
- forecast horizon capped to short windows.

### Explicit fake complexity cuts
- no pseudo-scientific personality archetypes,
- no single “life score,”
- no decorative 3D graph effects,
- no precision claims unsupported by evidence,
- no unlock trees disconnected from causal capability.

## SECTION 12 — OUTPUT FORMAT

### A) One-sentence definition of GRAF CORE ontology
GRAF CORE ontology is a typed, evidence-gated causal operating model where users improve outcomes by acting on stateful nodes, validated edges, and confidence-bounded routes.

### B) One-paragraph summary of how the graph actually works
The user starts by selecting a central node, then the system expands a local causal neighborhood with typed directional edges, confidence signals, and immediate tools embedded directly on graph objects. Inputs and completed actions update node states, edge confidence, and risk/leverage markers in real time; unlock rules reveal deeper layers only when evidence quality supports them. Route logic continuously converts current graph conditions into best-next-move steps and short scenario forecasts, while Data Substation remains a separate truth/calibration layer validating whether the operational graph is becoming more reliable over time.

### C) Glossary of the 20 most important terms
1. Ontology — strict meaning system for all graph entities.
2. Central Node — current strategic anchor.
3. Major Domain — top-level functional system.
4. Subdomain — bounded mechanism slice inside a domain.
5. Node — smallest operable state unit.
6. Edge — typed directional influence relation.
7. Contour — active analysis boundary.
8. Cluster — dense interdependent node group.
9. Route — ordered action path to target state.
10. Leverage Point — high impact-per-effort target.
11. Pressure Point — acute propagating instability.
12. Risk Zone — high-probability downside region.
13. Confidence Signal — reliability indicator.
14. Maturity Signal — operational readiness indicator.
15. Layer — depth tier of capability.
16. Unlock — evidence-based permission expansion.
17. Tool — embedded graph operation.
18. Action — time-bound user commitment.
19. Forecast Surface — scenario trajectory manifold.
20. Best Next Move — highest-value immediate step.

### D) How this graph becomes real instead of decorative
- Every visual element maps to an executable entity type.
- Every recommendation cites structural causes (nodes/edges/constraints).
- Every confidence claim is computed and visible.
- Every unlock has explicit evidence criteria.
- Every tool writes state back into the graph.
- Every route can be audited against outcomes.
- Every forecast is bounded and recalibrated.

### E) Ontology mistakes that will destroy the product
- Treating nodes as labels instead of stateful objects.
- Using untyped or undirected edges.
- Mixing confidence with marketing certainty.
- Unlocking by time spent instead of evidence quality.
- Separating tools into external pages.
- Showing all complexity upfront.
- Equating gamification with superficial badges.
- Optimizing visuals before relationship semantics.
- Allowing high-stakes routes from unverified edge structures.
- Shipping without a strict v1 ontology cut.
