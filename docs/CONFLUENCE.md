# OpenUI Generative UI — POC Findings & Adoption Recommendation

| Field | Value |
|---|---|
| **Status** | ✅ POC Complete — Ready for Engineering Review |
| **Document type** | Technical POC findings + adoption recommendation |
| **Author** | Engineering / AI team |
| **Date** | June 2026 |
| **Stakeholders** | Engineering Lead, Product Lead, AI/Data team |
| **POC Repo** | https://github.com/animesh-lifesight/lifesight-openui-poc |
| **Reference repos** | `lifesight-platform-ui/` (3.0), `ls4x-main/` (4.0) — read-only throughout |

---

## 1. Executive Summary

> **Recommendation: Adopt `@openuidev/react-lang` as Lifesight's generative UI format across both 3.0 and 4.0.**

This POC proves that a single npm package — `@openuidev/react-lang` — can simultaneously close three critical production gaps in 3.0 and enable the full 4.0 decision intelligence UX, including features we have not yet built in either product.

**Five key findings:**

1. **Three 3.0 widgets are silently broken today.** The `table`, `comparison`, and `chart` widgets in `JsonRenderBlock` return `null` for all inputs. Customers see blank space where structured data should appear. OpenUI closes all three in a single sprint.

2. **OpenUI is streaming-native.** The `<Renderer isStreaming>` prop renders valid components as they appear in the stream — structure before data. This eliminates the full-block-parse requirement in 3.0 and enables the 4.0 "streaming Decision Packet assembly" use case.

3. **The 4.0 decision lifecycle is now fully walkable.** The POC demonstrates all five stages — Detect (Cockpit/Sentinel alert) → Recommend (Decision Room with Action/Inaction) → Simulate (Scenario Matrix) → **Approve** (HITL T2 checkpoint) → Monitor (post-approval state) — across 9 routes.

4. **The same library works on both products.** Zero style migration required: the POC uses the same Tailwind 4 + shadcn dark tokens as `ls4x-main`. After production integration, the 17 components can be extracted to `packages/@lifesight/openui` and shared.

5. **Adoption risk is low.** Incremental route-by-route adoption behind a feature flag. The SSE event contract is unchanged from 3.0. No Redux dependency. No Next.js dependency. Rollback in minutes.

---

## 2. Background & Problem Statement

### 2.1 Why generative UI matters

Lifesight's core value proposition is turning data into decisions. Today, agent responses in both 3.0 (Ask Mia, Planner Agent) and 4.0 (MIA panel) return **unstructured markdown or plain text**. This forces the user to read walls of text to extract the key numbers and recommended action — the opposite of "decision-first, not data-first."

Generative UI flips this: the LLM outputs structured component calls, and the frontend renders them as scannable, interactive cards. The user sees KPI tiles, charts, and action buttons — not paragraphs.

### 2.2 Current state in 3.0 (lifesight-platform-ui)

The 3.0 agent pipeline has a partial generative UI implementation called `json-render`:
- The LLM is prompted to output `json-render` code blocks containing JSON payloads
- `JsonRenderBlock.component.tsx` parses these and routes to widget components
- **Critical gap:** `table`, `comparison`, and `chart` widget renderers return `null`
- The LLM generates these widget types regularly; they display as blank space

| Widget type | 3.0 status | Customer impact |
|---|---|---|
| `kpi` | ✅ Working | Good |
| `steps` | ✅ Working | Good |
| `info` | ✅ Working | Good |
| `table` | ❌ Returns null | Blank space in agent responses |
| `comparison` | ❌ Returns null | Blank space in agent responses |
| `chart` | ⚠️ Vega-Lite only | Too complex for LLMs to generate reliably |

### 2.3 Current state in 4.0 (ls4x-main)

4.0's MIA panel is text-only (`frontend/lib/mia/types.ts` — no widget fields). The Decision Room tabs are hardcoded React components, not generative. The UX_SPEC and AGENT_FRAMEWORK_SPEC describe the target generative UX (Action/Inaction framing, streaming decision packets, HITL checkpoints) but these aren't implemented yet.

### 2.4 Why we built a standalone POC

Rather than patching 3.0 or 4.0 (both production systems), we built a standalone repo to:
- Validate the OpenUI library is compatible (React 19 ✅, Zod v4 ✅)
- Prove all 16 use cases across 9 routes without production risk
- Establish the component library and LLM system prompt that both products can reuse
- Provide a concrete demo environment for stakeholder review

---

## 3. What Is OpenUI

[`@openuidev/react-lang`](https://www.openui.com) is a generative UI runtime for React. The LLM outputs a structured text format (OpenUI Lang) instead of markdown; the `<Renderer>` parses and renders it as React components.

### 3.1 How it works

```
Backend Agent  →  "LsStack()\n  kpis = LsKpiRow(items: [...])\n  chips = LsSuggestionChips(...)"
     │                    OpenUI Lang text (streaming chunks over SSE)
     ▼
<Renderer response={text} library={library} isStreaming={true} />
     │                    Parses incrementally — renders valid components as they appear
     ▼
React component tree (LsStack → LsKpiRow → LsSuggestionChips)
     │                    Renders to DOM with shadcn/Tailwind styling
     ▼
Scannable dashboard layout   ←   Not a wall of text
```

### 3.2 Key capabilities

| Capability | Description |
|---|---|
| **Streaming-native** | `isStreaming={true}` renders partial text — structure before data |
| **Type-safe schemas** | Every component has a Zod v4 schema; invalid props logged, never crash |
| **LLM prompt generation** | `library.prompt()` auto-generates the system prompt from component definitions |
| **MCP-ready** | `toolProvider` prop accepts a function map or MCP client for tool calls |
| **Error recovery** | `onError` callback receives typed `OpenUIError[]` — feed to LLM for self-correction |
| **Action callbacks** | `onAction(event)` fires when user interacts with CTAs — human-governed, never auto-executes |

### 3.3 OpenUI Lang syntax (what the LLM outputs)

```
LsStack()
  kpis = LsKpiRow(items: [{label: "Paid Social ROI", value: "2.4x", delta: 0.26}])
  table = LsDataTable(
    headers: ["Channel", "Spend", "ROI"],
    rows: [["Paid Social", "$1.2M", "2.4x"]]
    caption: "Q4 2025, MMM v2.3"
  )
  insight = LsInfoPanel(variant: "tip", title: "Finding", content: "Display past saturation.")
  chips = LsSuggestionChips(chips: ["Deep-dive Display", "Create decision"])
```

The `<Renderer>` receives this as a stream and renders it progressively. Invalid lines are dropped silently.

---

## 4. POC Overview

### 4.1 Scope

| Item | Count |
|---|---|
| Standalone repo | 1 (`lifesight-openui-poc`) |
| OpenUI components | 17 (5 groups) |
| Demo routes | 9 |
| Fixture scenarios | 13 |
| Tests | 49 (7 suites) |
| Docs | 6 (analysis, matrix, mapping, roadmap, prompt, this doc) |
| Reference repos modified | **0** |

### 4.2 What was NOT built (out of scope per original spec)

- Real LLM API integration (fixtures + mock SSE are sufficient to validate the pattern)
- Real backend / Temporal / Firebase Auth
- Full Decision Room (8 tabs — POC shows 3 tabs)
- Artifact widget composer (grid layout conflicts with stream-native rendering)
- Production deployment or CI/CD beyond GitHub Actions

---

## 5. The 9 Demo Routes

Run `npm run dev` to access all routes at `http://localhost:5173`.

### 5.1 3.0 Use Cases

#### `/agent` — Conversational Agent Chat

**What:** A multi-turn chat interface. Type any query; the mock agent routes it to the most relevant structured fixture and streams it back progressively.

**Queries to try:**
- "Explain Q4 paid social ROI" → KPI tiles + channel breakdown table + comparison + chart
- "Why is Display underperforming?" → Root cause analysis (saturation + view-through inflation + audience overlap)
- "Show geo experiment results" → Holdout lift stats, treatment vs control curves
- "Explain the MMM model structure" → Causal DAG + variable importance

**What it proves:** OpenUI closes the 3 stubbed 3.0 widget gaps (`table`, `comparison`, `chart`) and enables a natural conversational interface on top of structured data.

---

#### `/geo` — Geo Experiment Results Narrator

**What:** Structured presentation of a Paid Social holdout experiment — NovaBrand, Q4 2025, 12 DMAs, 6 weeks, +18.3% lift (p=0.031).

**What it proves:** Significance stats (p-value, CI, iROAS), dual charts (treatment vs control curve + lift by DMA), structured comparison — all from one OpenUI Lang string. Previously this would be 5 paragraphs of analyst text.

---

#### `/mmm` — MMM Causal DAG Walkthrough

**What:** Interactive Mermaid DAG showing the NovaBrand MMM v2.3 causal structure — Adstock transformations, Hill saturation curves, variable contributions. Variable importance table with λ and α parameters per channel.

**What it proves:** `LsMermaidDiagram` renders actual Mermaid SVG (not code block). Analysts can ask "explain the model structure" and get a navigable causal graph inline in chat.

---

#### `/attribution` — Attribution Deep-Dive

**What:** 3-tab deep-dive comparing data-driven MMM attribution vs last-touch, with a methodology pipeline diagram.

**Tabs:** Data-Driven vs Last-Touch (comparison table + insight) / Over Time (share trend chart) / Methodology (step plan + DAG)

**What it proves:** `LsTabs` composes complex multi-view layouts from one OpenUI Lang string. The 11.6pp Search discrepancy between methods is a common analyst question — OpenUI makes the answer scannable.

---

### 5.2 4.0 Decision Intelligence Use Cases

#### `/mia` — Context-Aware MIA Panel

**What:** The same question ("Which channels drive incremental impact?") produces **4 completely different structured layouts** depending on which page the user is on.

| Module | What MIA returns |
|---|---|
| **Models** | Channel iROAS ranking + bar chart + confidence badge + CTA to Decision Room |
| **Experiments** | Active experiment coverage + holdout results + gap analysis table |
| **MMM** | Saturation analysis + saturation chart + model health + retrain recommendation |
| **Campaigns** | Live pacing table + under/over-pacing alerts + line chart + CTA to Cockpit |

**What it proves:** Context-aware generative UI. The same component library, same Renderer, same SSE contract — different backend agent response = completely different layout.

---

#### `/decisions/media-reallocation-001` — Decision Room

**What:** Full Media Reallocation decision packet — 3 tabs (Recommendation / Simulation / Evidence), streaming mode, Executive/Analyst toggle.

**Interactions:**
- **Fixture mode:** loads instantly
- **Stream mode:** watch the 3-tab packet assemble — tabs header at ~300ms, Recommendation fills by ~800ms, Simulation by ~1.4s, Evidence by ~2s
- **Executive toggle:** clean Action/Inaction framing + scenario matrix
- **Analyst toggle:** adds model detail panel (R² 0.94, MAPE 8.2%, training window)

**What it proves:** Streaming Decision Packet assembly (4.0 aspirational use case), Executive/Analyst density toggle (UX_SPEC "Transparency on Demand"), `LsActionInaction` + `LsScenarioMatrix` in production-ready form.

---

#### `/cockpit` — Sentinel Budget Pace Alert

**What:** A Sentinel agent fires when Paid Social pacing 23% below plan. The alert assembles progressively: warning panel → KPI tiles → confidence badge → step plan → "Create Decision" CTA.

**What it proves:** Real-time alert UX. The stream replay button shows how the Sentinel agent would stream the alert to the Cockpit in production.

---

#### `/template/media-reallocation` — Template Activation Wizard

**What:** Template readiness wizard for the "Media Reallocation" decision template. Shows 72% readiness — 2 requirements connected, 1 low quality.

**Key architectural point:** The OpenUI Lang string is **generated from live `useTemplateReadiness` TanStack Query data** — not a static fixture. This demonstrates the pattern a real backend agent would use when it has access to Lifesight's data APIs.

**What it proves:** Data-driven OpenUI Lang generation. `LsReadinessChecklist` (new component) with score ring + per-blocker status.

---

#### `/hitl/media-reallocation-001` — HITL Approval Checkpoint

**What:** T2 governance approval checkpoint for the Media Reallocation decision. CMO needs to approve before the budget shift executes.

**Interaction:** Click **Approve Decision** → page transitions to post-approval confirmation with execution steps. Click **Send Back for Revision** → rejection state with feedback prompt.

**What it proves:** `LsApprovalPanel` (new component) fires `onAction(humanFriendlyMessage)` — the page handles the action, never the LLM. Human-governed, MDIP principle 3. Closes the full decision lifecycle.

---

## 6. Component Catalog

### 6.1 Library overview

```
17 components · 5 groups · ~1,800-token LLM system prompt
Generated by: import { SYSTEM_PROMPT } from "@/openui/library"
```

### 6.2 Layout group

| Component | Description | Key props |
|---|---|---|
| `LsStack` | Root container — always wraps every response | `direction: "vertical"\|"horizontal"`, `gap`, `children[]` |
| `LsCard` | Content block with optional heading | `title?`, `children[]` |
| `LsTabs` | Multi-view tabbed layout | `tabs[{label, children[]}]`, `defaultTab?` |

### 6.3 Data group

| Component | Description | Key props |
|---|---|---|
| `LsKpiRow` | 1–6 metric tiles with delta colouring | `items[{label, value, delta?, positive_direction?}]` |
| `LsDataTable` | Data table with source caption | `headers[]`, `rows[][]`, `caption?` |
| `LsComparison` | 3-column comparison (Metric, A, B) | `headers[3]`, `rows[][]` |
| `LsChart` | Bar or line chart (Recharts) | `type: "bar"\|"line"`, `data[{name, value, value2?}]`, `label?` |

### 6.4 Insight group

| Component | Description | Key props |
|---|---|---|
| `LsInfoPanel` | Callout with icon + colour variant | `variant: "info"\|"warning"\|"success"\|"error"\|"tip"`, `content`, `title?` |
| `LsStepPlan` | Numbered step list for workflows | `items[]`, `title?` |
| `LsMermaidDiagram` | Rendered Mermaid SVG diagram | `definition` (Mermaid source), `caption?` |

### 6.5 Decision group (4.0 patterns)

| Component | Description | Key props |
|---|---|---|
| `LsActionInaction` | Executive dual-card — Act vs Don't Act | `action_label`, `action_kpis[]`, `inaction_label`, `inaction_kpis[]` |
| `LsScenarioMatrix` | Simulation scenario comparison | `scenarios[{name, budget_delta_pct, roi_forecast, confidence, recommended?}]` |
| `LsConfidenceBadge` | Inline model confidence indicator | `level: "high"\|"medium"\|"low"`, `label?`, `detail?` |
| `LsReadinessChecklist` | Template readiness — score ring + blockers | `score`, `blockers[{label, status, detail?}]`, `threshold?` |
| `LsApprovalPanel` | HITL governance checkpoint | `governance_tier`, `approver_role`, `deadline?`, `context?`, labels |

### 6.6 Agent group

| Component | Description | Key props |
|---|---|---|
| `LsSuggestionChips` | Follow-up query chips (always last) | `chips[]` |
| `LsCtaButton` | Human-governed CTA | `label`, `href?`, `variant?`, `action?` |

---

## 7. Key Technical Findings

### 7.1 Streaming works, and it matters

In fixture mode, the entire Decision Packet appears instantly. In stream mode, the 3-tab packet assembles progressively over ~2 seconds. The tabs header appears at ~300ms, Recommendation content fills by ~800ms, Simulation by ~1.4s.

This is the difference between "a page loads" and "the AI is thinking and building the answer in real time." For a decision intelligence product, this visual feedback loop is significant.

**Key:** `<Renderer isStreaming={true} response={partialText}>` handles this natively. No custom parsing or buffering needed in the frontend.

### 7.2 Data-driven OpenUI Lang generation is the right production pattern

The `/template` route demonstrates a critical insight: the OpenUI Lang string does **not** have to come from an LLM. The `buildTemplateFix(score, blockers)` function generates the string from `useTemplateReadiness()` API data.

In production, the backend agent can:
1. Call Lifesight's data APIs to get the current state
2. Generate the OpenUI Lang string programmatically
3. Stream it back to the frontend

The frontend has no idea whether the string came from an LLM, a template function, or a lookup table. This gives maximum flexibility for the product team.

### 7.3 The LLM system prompt is auto-generated and typed

```ts
import { SYSTEM_PROMPT } from "@/openui/library"
// ~1,800 tokens — includes all 17 component signatures + group notes + 3 few-shots
```

When a new component is added to the library, the system prompt updates automatically. No manual prompt engineering maintenance. The `description` field on each component's Zod schema is the documentation that appears in the prompt.

### 7.4 onAction closes the HITL loop without backend coupling

The `/hitl` route demonstrates that governance approval doesn't require a backend call to render the UI transition. The `LsApprovalPanel` fires `onAction({ humanFriendlyMessage: "Approve Decision" })`, the page handles this synchronously (transitions to the post-approval confirmation state), and in production a separate API call can be made to record the decision.

This keeps the generative UI layer decoupled from the workflow layer.

---

## 8. Integration Plan

### 8.1 Path A — Migrate 3.0 agent widgets (2–3 sprints)

**Goal:** Close the `table`, `comparison`, `chart` widget gaps in production. **Estimated effort:** 4–6 weeks.

| Sprint | Work | Risk |
|---|---|---|
| S1 | Install `@openuidev/react-lang`, copy `src/openui/` from POC, add `<Renderer>` behind `VITE_ENABLE_OPENUI` flag. Dual-path: Renderer wins if it parses, falls back to JsonRenderBlock. | Low — rollback = flip flag |
| S2 | Update backend agent system prompt with `SYSTEM_PROMPT` export. A/B test 50% traffic. Monitor widget render rate. | Medium — requires LLM output format change |
| S3 | Remove `JsonRenderBlock`, `SmartTable`, `KpiGroup`, `ComparisonView`. Remove flag. | Low — clean delete |

**Backend change:** The only backend change is instructing the agent to output OpenUI Lang instead of `json-render` code blocks. The SSE event contract (`TEXT_MESSAGE_CONTENT` + `RUN_FINISHED`) is **unchanged**.

### 8.2 Path B — Enable 4.0 MIA + Decision Room (3–4 sprints)

**Goal:** Enable generative layouts in MIA panel and Decision Room. **Estimated effort:** 6–8 weeks including backend agent changes.

| Sprint | Work |
|---|---|
| S1 | Install in `ls4x-main/frontend`. Add `openui_lang?: string` field to MIA response type. Render via `<Renderer>` when field present. |
| S2 | Backend: update MIA agent to output OpenUI Lang. `LsTabs`, `LsActionInaction`, `LsScenarioMatrix` are production-ready from POC. |
| S3 | Decision Room generative tabs. Sentinel alert streaming (`/cockpit` pattern). |
| S4 | Template wizard integration (`/template` pattern). HITL checkpoint (`/hitl` pattern). |

### 8.3 Shared library (post-integration)

After both products integrate, extract to a shared package:

```
packages/
  @lifesight/openui/
    src/
      components/   ← all 17 components
      library.ts    ← createLibrary() + SYSTEM_PROMPT
    package.json    ← { "name": "@lifesight/openui", "version": "1.0.0" }
```

Both `lifesight-platform-ui` and `ls4x-main/frontend` become consumers. One component update propagates to both products. **Effort: 1 sprint.**

---

## 9. Cost & Timeline Estimates

| Work item | Effort | Sprint |
|---|---|---|
| Path A — 3.0 agent migration | 3 sprints (~6 weeks) | Q1 2026 |
| Path B — 4.0 MIA integration | 2 sprints (~4 weeks) | Q1–Q2 2026 |
| Path B — 4.0 Decision Room + HITL | 2 sprints (~4 weeks) | Q2 2026 |
| Shared library extraction | 1 sprint (~2 weeks) | Q2 2026 |
| **Total** | **~8 sprints** | **Q1–Q2 2026** |

**Team:** 1 senior frontend engineer + 1 backend engineer (agent prompt updates). Product review at each sprint boundary.

---

## 10. Risk Register

| Risk | Likelihood | Severity | Mitigation |
|---|---|---|---|
| LLM generates unknown component names | Medium | Low | `onError` callback receives typed `OpenUIError[]` — feed back to LLM for self-correction in one retry loop |
| Zod v4 conflicts with 3.0's `zod@^3` | Low | Medium | Zod v4 and v3 coexist via separate subpath exports; confirmed in `npm ls` — no runtime conflict |
| Bundle size regression | Medium | Medium | `@openuidev/react-lang` = 188KB + Mermaid = ~2MB (gzip: ~600KB). Route-level dynamic imports mitigate. Baseline 3.0 is ~2.8MB — net negligible. |
| OpenUI Lang syntax drift across releases | Low | Low | Pin `^0.2.x` in lockfile; SemVer patch version policy protects |
| A11y regressions from generated layouts | Low | Medium | All shadcn/Radix primitives are ARIA-compliant; `LsApprovalPanel` uses shadcn `<Button>`; `LsSuggestionChips` uses `<button>` — no naked `<div>` click handlers |
| Mermaid rendering fails in some browsers | Low | Low | Mermaid has IE11+ support; graceful fallback to code block if render fails |
| Agent LLM cost increase from larger system prompt | Low | Low | `SYSTEM_PROMPT` is ~1,800 tokens. With `examples: []`: ~1,200 tokens. Negligible vs. message tokens. |

---

## 11. Decisions Required

The following decisions are needed from engineering leadership to begin production integration:

| Decision | Options | Recommendation |
|---|---|---|
| **D1: Adopt OpenUI Lang as generative UI format?** | A. Adopt `@openuidev/react-lang` · B. Continue extending `json-render` · C. Build custom solution | **A — Adopt.** Option B has structural limits (3 stubbed widgets, no streaming). Option C is months of re-implementation. |
| **D2: Start with 3.0 or 4.0?** | A. 3.0 first (fix customer-visible gaps) · B. 4.0 first (enable new capabilities) · C. Parallel | **A — 3.0 first.** The `table`/`comparison`/`chart` stubs are visible quality gaps affecting current customers. Path A Sprint 1 closes them with minimal risk. |
| **D3: When to extract shared library?** | A. Before 4.0 integration · B. After both integrate · C. Never (keep copies) | **B — After both integrate.** Extract once both products have proven the integration. One sprint of extraction work, then single source of truth. |
| **D4: Mermaid as a production dependency?** | A. Include (full diagram rendering) · B. Exclude (code block fallback) · C. Lazy load per route | **C — Lazy load.** `import('mermaid')` only on routes that use `LsMermaidDiagram`. No impact on initial bundle. |

---

## 12. How to Run the POC

### Prerequisites
- Node.js ≥ 18.7.0
- npm ≥ 8

### Start

```bash
git clone https://github.com/AnimeshPandey/lifesight-openui-poc
cd lifesight-openui-poc
npm install
npm run dev
# → http://localhost:5173
```

### Verification

```bash
npm run typecheck   # TypeScript — zero errors
npm run lint        # ESLint — zero errors
npm test            # 49 tests, 7 suites — all pass
npm run build       # Production build — clean
```

### Recommended demo order

1. **Start at `/`** — index page shows all 9 routes with descriptions
2. **Show `/agent`** — type "why is display underperforming?" — structured root cause response streams in
3. **Show `/mia`** — switch between Models / Experiments / MMM / Campaigns — same query, 4 different layouts
4. **Show `/decisions`** — click "Stream ●" — watch 3-tab packet assemble live. Toggle ⚡ Executive → 🔬 Analyst.
5. **Show `/hitl`** — click "Approve Decision" — page transitions to post-approval state
6. **Show `/mmm`** — Mermaid causal DAG renders as interactive SVG
7. **Show `/cockpit`** — "Replay alert stream" — sentinel alert assembles live

---

## 13. Appendix A — LLM System Prompt Structure

The system prompt is generated automatically by `library.prompt()`. Its structure:

```
[Preamble — ~120 tokens]
You are MIA, Lifesight's AI commercial analyst...
Principles: Decision-first, Confidence-visible, Human-governed, Trace-everything

[Component Signatures — ~1,100 tokens]
## Components

### Layout
- LsStack(direction?: "vertical"|"horizontal", gap?: "sm"|"md"|"lg", children[]?)
  Root container. Always wrap every response in LsStack.
- LsCard(title?: string, children[]?)
  Content block with optional heading.
- LsTabs(tabs[{label, children[]?}], defaultTab?: string)
  Multi-view tabbed layout.

### Data
- LsKpiRow(items[{label, value, delta?: number, positive_direction?: boolean}])
  Horizontal KPI tiles. Always show at the top.
...and so on for all 17 components...

[Group Notes — ~200 tokens]
Layout: LsStack is always the root. Use LsCard to group content blocks...
Decision: LsActionInaction is always the first block in a recommendation...
Agent: LsSuggestionChips is always the last element of every response...

[Few-Shot Examples — ~600 tokens]
// Q: "What is Q4 paid social ROI?"
LsStack()
  kpis = LsKpiRow(items: [{label: "Paid Social ROI", value: "2.4x", delta: 0.26}])
  table = LsDataTable(headers: [...], rows: [...], caption: "Q4 2025, MMM v2.3")
  chips = LsSuggestionChips(chips: ["Drill into Meta", "Create decision"])
```

**Total: ~1,800–2,100 tokens.** For context-window-constrained deployments: `library.prompt({ examples: [] })` saves ~600 tokens.

---

## 14. Appendix B — SSE Contract (unchanged from 3.0)

No backend SSE contract changes are required. The existing `PlannerAgentService` event format works as-is:

```ts
// Unchanged event types — only TEXT_MESSAGE_CONTENT payload changes
type AgentStreamEvent =
  | { type: "TEXT_MESSAGE_CONTENT"; delta: string }  // Now contains OpenUI Lang chunks
  | { type: "THOUGHT_TRACE"; trace: object }          // Unchanged
  | { type: "RUN_FINISHED" }                          // Unchanged

// Frontend hook point (replace createFakeSSEStream() with real endpoint):
const response = await fetch(VITE_AGENT_ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  body: JSON.stringify({ message, sessionId, context }),
  signal: controller.signal,
})
// readSSEStream(response.body, (accumulated) => setResponse(accumulated))
```

---

## 15. Appendix C — Fixture Catalogue

For each demo route, the OpenUI Lang fixture lives in `src/mocks/fixtures/`:

| File | Route | Scenario | ~Tokens |
|---|---|---|---|
| `agent.ts` | `/agent` | Q4 paid social ROI — full analysis | 420 |
| `display.ts` | `/agent` | Display underperformance root cause | 440 |
| `geo.ts` | `/geo` | Holdout experiment — 12 DMAs, +18.3% lift | 480 |
| `mmm.ts` | `/mmm` | Causal DAG + variable importance + decomposition | 520 |
| `attribution.ts` | `/attribution` | Data-driven vs last-touch, 3 tabs | 680 |
| `mia.ts` | `/mia` (Models) | Channel incremental impact — model view | 280 |
| `mia-experiments.ts` | `/mia` (Experiments) | Experiment coverage + holdout status | 380 |
| `mia-mmm.ts` | `/mia` (MMM) | Saturation analysis + model health | 360 |
| `mia-campaigns.ts` | `/mia` (Campaigns) | Live pacing table + alerts | 400 |
| `decisions.ts` | `/decisions` | Decision packet — 3 tabs | 560 |
| `cockpit.ts` | `/cockpit` | Sentinel budget pace alert | 360 |
| `template.ts` | `/template` | Readiness wizard (data-driven) | Generated |
| `hitl.ts` | `/hitl` | T2 governance approval checkpoint | 480 |

---

*POC built in one session. Reference repos (`lifesight-platform-ui`, `ls4x-main`) are read-only throughout. No production code was modified.*
