# Use-Case Matrix — OpenUI Generative UI Candidates

**Scoring:** Impact (1–5) × how much value OpenUI unlocks vs. status quo. Feasibility (1–5) × how quickly it can be built.

**Built in this POC:** ✅ = fully built and demo-able. ⚡ = partially covered by another route.

---

## From 3.0 (lifesight-platform-ui)

| # | Use Case | Impact | Feasibility | Score | Status | Route | Notes |
|---|---|:---:|:---:|:---:|:---:|---|---|
| 1 | **Agent structured responses** — KPI + table + comparison + chart, finishing stubbed `json-render` gaps | 5 | 5 | 25 | ✅ Built | `/agent` | Most impactful: `table`, `comparison`, `chart` are `null` in production today. Fixed. |
| 2 | **MMM in-context budget scenario explainer** — charts, KPIs, scenario curves | 5 | 4 | 20 | ✅ Built | `/mia` (Models) | MIA: Models context. Full MMM saturation analysis + model stats. |
| 3 | **Attribution breakdown explainer** — data-driven vs last-touch deep-dive | 4 | 5 | 20 | ✅ Built | `/attribution` | 3-tab tabbed layout: comparison table + time-series chart + methodology DAG. |
| 4 | **Geo experiment results narrator** — lift curves, significance KPIs, DMA breakdown | 4 | 4 | 16 | ✅ Built | `/geo` | Holdout stats (p-value, CI), treatment vs control curves, lift by DMA. |
| 5 | **MMM causal DAG walkthrough** — Mermaid DAG, variable importance, adstock/saturation | 3 | 4 | 12 | ✅ Built | `/mmm` | Actual Mermaid SVG rendered (not code block). Adstock λ, saturation α, decomposition chart. |
| 6 | **Visit measurement setup copilot** — multi-step wizard | 4 | 3 | 12 | ⚡ Partial | `/template` | `LsStepPlan` demonstrates the pattern. Full wizard would need form interactions. |
| 7 | **Suggestion cards → deep links** | 3 | 5 | 15 | ✅ Built | All routes | `LsSuggestionChips` + `LsCtaButton` on every fixture. |
| 8 | Unified widget registry | 3 | 3 | 9 | ✅ N/A | `library.ts` | `createLibrary()` IS the registry. 17 components. Ship on production migration. |

---

## From 4.0 (ls4x-main)

| # | Use Case | Impact | Feasibility | Score | Status | Route | Notes |
|---|---|:---:|:---:|:---:|:---:|---|---|
| 1 | **MIA inline analytical widgets** — replace text-only MIA responses | 5 | 5 | 25 | ✅ Built | `/mia` | 4 module contexts: Models / Experiments / MMM / Campaigns — same question, different layout each time. |
| 2 | **Action vs Inaction dual-card** — Executive decision-first framing (UX_SPEC §3) | 5 | 5 | 25 | ✅ Built | `/decisions`, `/hitl` | `LsActionInaction` — first implementation of this 4.0 UX spec pattern. |
| 3 | **Scenario comparison matrix** — Simulation tab | 4 | 5 | 20 | ✅ Built | `/decisions` | `LsScenarioMatrix` + ROI curve chart in Simulation tab. |
| 4 | **Sentinel alert → decision draft cards** | 5 | 5 | 25 | ✅ Built | `/cockpit` | `LsInfoPanel` (warning) + `LsConfidenceBadge` + `LsStepPlan` + `LsCtaButton`. |
| 5 | **Streaming Decision Packet assembly** — mock progressive load | 5 | 3 | 15 | ✅ Built | `/decisions?stream` | Tabs header appears at ~300ms, Recommendation at ~800ms, full packet by ~2s. |
| 6 | **Template activation gap-fill wizard** | 4 | 3 | 12 | ✅ Built | `/template/:id` | `LsReadinessChecklist` (new component) + live `useTemplateReadiness` TanStack Query data → fixture generation. |
| 7 | **HITL checkpoint panel** — T2 governance approval | 4 | 3 | 12 | ✅ Built | `/hitl/:id` | `LsApprovalPanel` (new component) — fires `onAction`, page transitions to post-approval state. |
| 8 | Artifact widget composer | 3 | 2 | 6 | Deferred | N/A | Grid layout conflicts with OpenUI's stream-native flow. Low priority — `LsTabs` covers the tab layer. |

---

## Coverage Summary

| Phase | Routes Built | Use Cases Covered | Score |
|---|---|---|---|
| Phase 1 (original 4) | `/agent`, `/mia`, `/decisions`, `/cockpit` | 8 use cases | ✅ |
| Phase 2 (extension) | `/geo`, `/mmm`, `/attribution`, `/template`, `/hitl` + stream on `/decisions` | +8 use cases | ✅ |
| **Total** | **9 routes** | **15 of 16 use cases** | **94%** |

**Only deferred:** Artifact widget composer (#8 from 4.0) — grid-based layout fundamentally conflicts with stream-native rendering. Recommended approach: use `LsTabs` as the outer container instead.

---

## New Components Justified by Phase 2

| Component | Use Case Unlocked | Route |
|---|---|---|
| `LsReadinessChecklist` | Template activation wizard (#6) — score ring + per-blocker status | `/template` |
| `LsApprovalPanel` | HITL checkpoint (#7) — T2 governance with Approve/Reject + action callback | `/hitl` |
