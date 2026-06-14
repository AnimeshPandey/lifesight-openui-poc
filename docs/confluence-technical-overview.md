# Lifesight OpenUI POC — Technical Overview

> **Status:** Design-aligned with Lifesight 4.0 · Last updated: 2026-06-15
> **Owner:** Animesh Pandey (animesh@lifesight.io)
> **Repo:** `lifesight-openui-poc` (monorepo root → `/Users/animeshpandey/Desktop/Codebases/lifesight-openui-poc`)

---

## Table of Contents

1. [What Is This POC?](#1-what-is-this-poc)
2. [Problem Statement](#2-problem-statement)
3. [Architecture Overview](#3-architecture-overview)
4. [OpenUI Lang — The Format](#4-openui-lang--the-format)
5. [Component Library — All 21 Components](#5-component-library--all-21-components)
6. [The Cockpit Feature](#6-the-cockpit-feature)
7. [Three-Tier Alert Rendering](#7-three-tier-alert-rendering)
8. [Agent → UI Contract (SSE Pipeline)](#8-agent--ui-contract-sse-pipeline)
9. [Component Mapping: 3.0 → OpenUI → 4.0](#9-component-mapping-30--openui--40)
10. [MIA Panel Integration](#10-mia-panel-integration)
11. [Testing Strategy](#11-testing-strategy)
12. [Production Integration Checklist](#12-production-integration-checklist)
13. [Backend Integration Guide](#13-backend-integration-guide)
14. [Quick Start](#14-quick-start)
15. [Glossary](#15-glossary)

---

## 1. What Is This POC?

The Lifesight OpenUI POC is a **standalone React application** that proves out the full agent → structured UI pipeline for Lifesight 4.0. It demonstrates how a backend LLM agent (Sentinel, Media, Data) can stream structured UI components — called **OpenUI Lang** — directly to the browser and render them without any bespoke frontend code per response.

The POC runs inside a shell visually indistinguishable from `ls4x-main` (collapsible icon-rail sidebar, `h-12` header, docked MIA copilot panel, same token system). It contains **10 routes**, **21 components**, **94 tests**, and compiles cleanly against `@openuidev/react-lang@0.2.6`.

**Key proof points:**

- A backend agent writes a string like `LsKpiRow([{label: "ROAS", value: "3.2x"}])` and it renders correctly in the browser — no React code change needed for new content layouts.
- OpenUI Lang streams over SSE in arbitrary byte chunks. The renderer builds the UI progressively as chunks arrive.
- The Cockpit page mounts 6 live agent widgets (Alignment, Goals, Media, Data, Onboarding, Spend) and streams a generative alert detail panel when a spend row is clicked — all within the 4.0 chrome.

---

## 2. Problem Statement

### 3.0 Limitations

| Gap | 3.0 Situation |
|---|---|
| `table` widget | `JsonRenderBlock` returns `null` for `WidgetTypeEnum.Table` — never rendered |
| `comparison` widget | Same — stubbed, never rendered |
| `chart` widget | Only Vega-Lite supported; requires a full Vega spec (complex for LLMs) |
| Decision-first components | `LsActionInaction`, `LsScenarioMatrix`, `LsConfidenceBadge` don't exist |
| Streaming | Full-block parse required — no progressive rendering as tokens arrive |
| Cockpit | Single card stub — no multi-agent widget stack, no generative detail panels |

### 4.0 Goal

Replace bespoke per-widget React code with a **grammar-driven renderer**. The agent outputs a structured program string; the renderer interprets it. Adding a new response type = adding a new component to the library, not a new React page.

---

## 3. Architecture Overview

```
main.tsx
  QueryClientProvider → ThemeProvider → TooltipProvider → MiaProvider
    └── App (TanStack Router)
          rootRoute.component = AppShell
          ┌─────────────────────────────────────────────────────────────┐
          │  SidebarProvider                                             │
          │  ┌──────────┐  ┌─────────────────────────────────────────┐  │
          │  │AppSidebar│  │ SidebarInset                            │  │
          │  │ icon rail│  │  header: WorkspaceSwitcher · Theme ·    │  │
          │  │ grouped  │  │          MiaTrigger · Notifications     │  │
          │  │ nav IA   │  │  ┌──────────────────────┐ ┌─────────┐  │  │
          │  │          │  │  │  <main> <Outlet />   │ │MiaPanel │  │  │
          │  │          │  │  │   feature page       │ │ 420 px  │  │  │
          │  │          │  │  │   PageHeader + body  │ │ docked  │  │  │
          │  └──────────┘  │  └──────────────────────┘ └─────────┘  │  │
          │                └─────────────────────────────────────────┘  │
          └─────────────────────────────────────────────────────────────┘
```

### Rendering Pipeline

```
Agent (Sentinel / Media / Data)
  │
  │  OpenUI Lang string (streamed in SSE TEXT_MESSAGE_CONTENT deltas)
  ▼
useOpenUIStream   ←──── createFakeSSEStream (POC)
  │                     fetch() POST SSE (production)
  │  accumulated response string + isStreaming flag
  ▼
<Renderer response={...} library={library} isStreaming={true} onAction={fn}>
  │
  │  Parses component calls, resolves against library, mounts React
  ▼
LsStack → [ LsKpiRow, LsInfoPanel, LsStepPlan, LsActionInaction, ... ]
  │
  │  onAction(ActionEvent) — chip click, CTA click
  ▼
openui-actions.ts → navigate() | openPanel() | toast()
```

### Key Files

| Area | File |
|---|---|
| Router + providers | `src/main.tsx`, `src/App.tsx` |
| App shell | `src/layout/AppShell.tsx` |
| OpenUI component library | `src/openui/library.ts` |
| Component implementations | `src/openui/components/{layout,data,insight,decision,agent,extras}.tsx` |
| Streaming controller | `src/hooks/useOpenUIStream.ts` |
| Mock SSE | `src/mocks/sseStream.ts` |
| MIA provider | `src/providers/mia-provider.tsx` |
| Action handler | `src/lib/openui-actions.ts` |
| Cockpit page | `src/features/cockpit/CockpitPage.tsx` |

---

## 4. OpenUI Lang — The Format

OpenUI Lang is a line-oriented DSL that `@openuidev/react-lang` parses into React component trees. Every agent response is a valid OpenUI Lang string.

### Grammar Rules

1. **Always root in `LsStack`** — the first assignment must be `root = LsStack(...)`.
2. **Positional arguments only** — `@openuidev/react-lang@0.2.6` uses positional argument syntax. Named-arg syntax (e.g. `variant: "warning"`) appears in LLM system prompt examples but is silently rejected by the renderer.
3. **Children are variable references** — children are listed in the root `LsStack` array by variable name, then defined on subsequent lines with `  name = Component(...)`.
4. **JSON-compatible values** — strings with double quotes, arrays with `[...]`, objects with `{...}`.

### Canonical Example

```
root = LsStack("vertical", "md", [severity, alert, kpis, badge, action, steps, cta, chips])
  severity = LsSeverityBadge("high", "Budget Pace — High Severity")
  alert = LsInfoPanel("warning", "Paid Social is pacing 23% below plan for week 2 of Q4.", "Budget Pace Alert — Paid Social")
  kpis = LsKpiRow([{label: "Actual Spend (WTD)", value: "$184K", delta: -0.23, positive_direction: false}, {label: "Plan (WTD)", value: "$240K"}, {label: "Pace Gap", value: "$56K"}, {label: "Revenue at Risk", value: "$714K", delta: -0.23, positive_direction: false}])
  badge = LsConfidenceBadge("high", "Sentinel: high confidence", "Budget Pace Guardrail — threshold 15% below plan for 3+ days")
  action = LsActionInaction("Recover Paid Social Pace", "Increase daily budget by $8K/day to recover pace.", [{label: "Revenue at risk", value: "$714K"}], "Take No Action", "Leaving $56K unspent forgoes an estimated $714K incremental revenue.", [{label: "Opportunity cost", value: "$714K"}])
  steps = LsStepPlan("Recommended response steps", ["Review Paid Social campaign delivery", "Confirm budget caps are not throttling", "Increase daily budget by $8K/day"])
  cta = LsCtaButton("Create Decision — Recover Paid Social Pace", "/decisions/media-reallocation-001", "primary")
  chips = LsSuggestionChips(["Show historical pace patterns", "What caused the delivery drop?", "Simulate recovery budget options"])
```

### Streaming Behaviour

The renderer receives arbitrary byte chunks and renders what it can parse at each tick. When `isStreaming={true}`, incomplete component calls are held and rendered as they complete. This gives a progressive build effect (visible in the POC with Demo speed → Slow).

### LLM System Prompt

The full system prompt is exported as `SYSTEM_PROMPT` from `src/openui/library.ts`. It includes:
- MIA preamble ("decision-first, confidence-visible, human-governed, trace-everything")
- All 21 component signatures with descriptions (~800–1,200 tokens)
- 6 component group notes
- 3 few-shot examples in named-arg format (which the LLM writes; the renderer parses positional)
- **Total: ~1,700–2,100 tokens**

To regenerate the prompt: `import { SYSTEM_PROMPT } from "@/openui/library"; console.warn(SYSTEM_PROMPT)`.

---

## 5. Component Library — All 21 Components

### Group 1: Layout

| Component | Signature | Purpose |
|---|---|---|
| `LsStack` | `(direction, gap, children[])` | Root container. Every response must be wrapped in `LsStack`. |
| `LsCard` | `(title?, children[])` | Groups related content with an optional card heading. |
| `LsTabs` | `(defaultTab, tabs[])` | 2+ distinct views (Recommendation / Simulation / Evidence). |

### Group 2: Data

| Component | Signature | Purpose |
|---|---|---|
| `LsKpiRow` | `(items[])` | 1–6 metric tiles with optional delta, spark array. Always show at top. |
| `LsDataTable` | `(headers[], rows[][], caption?)` | Tabular breakdown. Always include a caption with data source and model version. |
| `LsComparison` | `(headers[], rows[][])` | Exactly 3 columns: Metric \| Option A \| Option B. |
| `LsChart` | `(type, data[], title?, xKey?, yKey?, options?)` | `"bar"` for categorical, `"line"` for time-series. Wraps Recharts. |

### Group 3: Insight

| Component | Signature | Purpose |
|---|---|---|
| `LsInfoPanel` | `(variant, content, title?)` | `"tip"` for insights, `"warning"` for risks, `"success"` for confirmations, `"error"` for blockers. |
| `LsStepPlan` | `(title, items[])` | Sequential workflow or remediation steps. |
| `LsMermaidDiagram` | `(code, caption?)` | Causal DAGs, flowcharts, decision trees. |

### Group 4: Decision (4.0 patterns — new)

| Component | Signature | Purpose |
|---|---|---|
| `LsActionInaction` | `(actionLabel, actionSummary, actionKpis[], inactionLabel, inactionSummary, inactionKpis[])` | Executive decision framing. Always the first block in a recommendation. |
| `LsScenarioMatrix` | `(scenarios[])` | Side-by-side scenario comparison with budget delta and ROI forecast. |
| `LsConfidenceBadge` | `(level, label, detail?)` | Pairs with every model output. `"high"` / `"medium"` / `"low"`. |
| `LsReadinessChecklist` | `(title, items[])` | Template activation and setup wizard gates. Each item has `label`, `status` (`"pass"/"warning"/"fail"`), `detail`. |
| `LsApprovalPanel` | `(title, summary, items[], onApprove, onReject)` | HITL governance checkpoint. Never auto-executes. |

### Group 5: Agent

| Component | Signature | Purpose |
|---|---|---|
| `LsSuggestionChips` | `(chips[])` | 3–4 follow-up question chips. Always the **last** element of every agent response. |
| `LsCtaButton` | `(label, href, variant?)` | Human-governed navigation. Never auto-executes. Drives to `/decisions/:id`. |

### Group 6: Visual (Cockpit/alert surfaces)

| Component | Signature | Purpose |
|---|---|---|
| `LsStatHero` | `(label, value, delta?, subtitle?)` | Single headline metric for hero/above-the-fold placement. |
| `LsSeverityBadge` | `(level, label)` | Alert severity indicator. `"critical"/"high"/"medium"/"low"/"info"`. |
| `LsConfidenceGauge` | `(score, label, detail?)` | Richer alternative to `LsConfidenceBadge` for hero positions. |
| `LsMetadataChip` | `(key, value)` | Inline key/value metadata (model version, date range, source). |

---

## 6. The Cockpit Feature

The `/cockpit` route is the most complex feature in the POC. It mirrors the structure of `ls4x-main`'s production Cockpit page with a two-layer architecture.

### Two Layers

**Layer 1 — Ambient Agent Widgets** (static React, no LLM at query time)

These render on mount from `useCockpitData()` (a TanStack Query hook that returns `COCKPIT_MOCK_DATA` with a 200ms delay, mimicking `GET /api/v1/cockpit`):

| Widget | File | Data shape |
|---|---|---|
| **Live Plan Hero** | `cockpit-live-plan-hero.tsx` | `LiveMarketingPlan` — plan name, budget, days elapsed/total |
| **Alignment** | `cockpit-alignment-widget.tsx` | 6 activity rows with goal alignment badges |
| **Goals** | `cockpit-goals-widget.tsx` | 4 KPI cards: Actual Spend, Revenue, Pacing Rate, Goal Probability |
| **Media Performance** | `cockpit-media-widget.tsx` | Per-platform tabs (Meta, Google, TikTok, Snapchat) with signal counts |
| **Data Health** | `cockpit-data-section.tsx` | `DataAnomalyAlert[]`, `ConnectorWarning[]` |
| **Onboarding** | `cockpit-onboarding-widget.tsx` | 4-step gated tracker with progress segments |
| **Spend Pacing** | `cockpit-spend-section.tsx` | `SpendRecommendation[]` — channel/tactic tabs with pacing indicators |

**Layer 2 — Generative Detail Panel** (OpenUI Lang streamed on row click)

When a user clicks a spend row, the Cockpit streams an OpenUI Lang string into `<CockpitAlertDetail>` → `<OpenUIDemoRenderer>` → `<Renderer>`. See [Three-Tier Alert Rendering](#7-three-tier-alert-rendering) below.

### Cockpit Infrastructure

| File | Purpose |
|---|---|
| `cockpit-agent-jump-bar.tsx` | Sticky pill navigation — scrolls to each agent widget section |
| `cockpit-widget-header.tsx` | Agent pill (Bot icon + agent name), meta text, Insights link, Ask→MIA button |
| `cockpit-alert-detail.tsx` | Streaming OpenUI panel with Tier B/Tier C badge, Replay control |
| `src/api/useCockpitData.ts` | TanStack Query hook with 200ms mock |
| `src/mocks/cockpit/cockpit-data.ts` | TypeScript types + `COCKPIT_MOCK_DATA` |

### Data Types

```typescript
interface SpendRecommendation {
  id: string
  channel: string       // "Paid Social" | "TikTok" | "Paid Search" | "Display" | "Affiliate"
  tactic?: string       // e.g. "Branded Keywords" | "Video Ads"
  level: "channel" | "tactic"
  status: "on_pace" | "under_pacing" | "over_pacing"
  pacing_rate: number   // 0.77 = 77% of plan
  planned_spend: number
  actual_spend: number
  recommendation: string
}

interface CockpitMockData {
  liveMarketingPlan: LiveMarketingPlan | null
  spendRecommendations: SpendRecommendation[]
  experimentAlerts: ExperimentAlert[]
  dataAnomalyAlerts: DataAnomalyAlert[]
  connectorWarnings: ConnectorWarning[]
  agentLive: { alignment: boolean; goals: boolean; media: boolean; data: boolean; model: boolean; onboarding: boolean }
}
```

### Widget Selection Flow

```
User sees spend pacing table (CockpitSpendSection)
  └── clicks "Paid Social" row (status: under_pacing)
        ├── selectAlert("rec-paid-social")
        ├── look up ALERT_FIXTURE_MAP["rec-paid-social"] → COCKPIT_FIXTURE   ← Tier B
        │     OR buildCockpitAlertFix(rec)                                    ← Tier C
        ├── stream.replay(fixture)
        │     → createFakeSSEStream → readSSEStream → setResponse(accumulated)
        ├── scroll to #cockpit-alert-detail
        └── <CockpitAlertDetail> → <OpenUIDemoRenderer> → <Renderer>
              → LsStatHero, LsKpiRow, LsStepPlan, LsActionInaction, LsCtaButton
              → user clicks LsCtaButton → onAction → navigate("/decisions/...")
```

---

## 7. Three-Tier Alert Rendering

The Cockpit (and by extension, the production Sentinel integration) uses three rendering tiers to balance quality, latency, and LLM cost.

### Tier A — Structured JSON (Ambient Widgets)

Rendered as React components directly from `CockpitMockData`. **No LLM involved.** The spend table, experiment alerts, and connector warnings are all Tier A. In production: `GET /api/v1/cockpit` returns structured JSON.

### Tier B — Pre-built OpenUI Lang Fixture (Streamed)

For high-priority alerts with curated content, a pre-built OpenUI Lang string is stored as a fixture and streamed through `createFakeSSEStream`. The fixture is authored once and contains richer context than a generic generator can produce.

| Alert ID | Fixture | Content |
|---|---|---|
| `rec-paid-social` | `COCKPIT_BUDGET_PACE_FIXTURE` | `LsStatHero` + `LsKpiRow` + sparklines + `LsChart` (daily pace) + `LsActionInaction` |
| `sentinel-spend-anomaly` | `COCKPIT_SPEND_ANOMALY_FIXTURE` | Google Ads overspend — 2.1σ above rolling avg |
| `media-fatigue` | `COCKPIT_MEDIA_FIXTURE` | Meta creative fatigue — `LsChart` CTR decay + `LsActionInaction` |
| `data-connector` | `COCKPIT_DATA_FIXTURE` | Meta reporting gap + `LsReadinessChecklist` connector health |

In production: Tier B fixtures are generated by the Sentinel/Media/Data agent at alert creation time, stored in the alert record, and streamed on demand — the POC shortcut (`createFakeSSEStream`) is replaced with `fetch() POST /api/v1/agents/sentinel/run` SSE.

### Tier C — Deterministic Builder (No LLM)

`buildCockpitAlertFix(rec: SpendRecommendation): string` generates a valid OpenUI Lang string from a `SpendRecommendation` object at runtime. No LLM call. Used as a fallback for alert IDs not in the fixture map.

```typescript
// Produces a full LsStack with LsSeverityBadge, LsInfoPanel, LsKpiRow,
// LsConfidenceBadge, LsActionInaction, LsStepPlan, LsCtaButton, LsSuggestionChips
const fixture = buildCockpitAlertFix(rec)
await stream.replay(fixture)
```

The Tier C badge appears in `CockpitAlertDetail` as "Generated from live data" (vs "Streamed fixture" for Tier B).

**Why Tier C matters for production:** Not every alert warrants an LLM call. Budget pace alerts for on-pace channels, routine connector warnings, and rule-based signals can all be handled by deterministic builders — lower latency, lower cost, auditable output.

---

## 8. Agent → UI Contract (SSE Pipeline)

### SSE Wire Format

```
data: {"type":"TEXT_MESSAGE_CONTENT","delta":"root = LsStack(\"vertical\", \"md\", ["}
data: {"type":"TEXT_MESSAGE_CONTENT","delta":"severity, alert, kpis, badge, steps, cta, chips])\n"}
data: {"type":"TEXT_MESSAGE_CONTENT","delta":"  severity = LsSeverityBadge(\"high\"..."}
...
data: {"type":"RUN_FINISHED"}
```

The frontend accumulates every `delta` into a single string and passes it to `<Renderer response={accumulated} isStreaming={true}>`. Chunking is arbitrary — the renderer handles partial parses.

### Sentinel Agent → OpenUI Component Mapping

| Agent output field | OpenUI component |
|---|---|
| `alert.title` | `LsInfoPanel` title (3rd arg) |
| `alert.body` | `LsInfoPanel` content (2nd arg) |
| `alert.severity` | `LsInfoPanel` variant + `LsSeverityBadge` |
| `metrics[]` | `LsKpiRow` items array |
| `pacing.sparklines` | `LsKpiRow` spark arrays (6-point trend per tile) |
| `pace_chart_data[]` | `LsChart("line", ...)` |
| `confidence` | `LsConfidenceBadge` level |
| `recommended_steps[]` | `LsStepPlan` items |
| `action_summary` + `inaction_summary` | `LsActionInaction` |
| `suggested_follow_ups[]` | `LsSuggestionChips` — always last |
| `decision_deep_link` | `LsCtaButton` href |

### Media Agent → OpenUI Component Mapping

| Agent output field | OpenUI component |
|---|---|
| `fatigue.score` | `LsSeverityBadge` + `LsInfoPanel` |
| `fatigue.ctr_decay[]` | `LsChart("line", ...)` daily CTR vs baseline |
| `fatigue.recommended_action` | `LsActionInaction` |
| `creative.name` / `impressions` | `LsKpiRow` items |
| `confidence` | `LsConfidenceBadge` |

### Data Agent → OpenUI Component Mapping

| Agent output field | OpenUI component |
|---|---|
| `connector_health[]` | `LsReadinessChecklist` |
| `anomaly.message` | `LsInfoPanel("warning", ...)` |
| `anomaly.metrics` | `LsKpiRow` |
| `resolution_steps[]` | `LsStepPlan` |

### POC Hook Points

| Layer | POC implementation | Production replacement |
|---|---|---|
| SSE source | `createFakeSSEStream(fixture, chunkMs, chunkSize)` | `fetch("POST /api/v1/agents/sentinel/run")` SSE reader |
| Stream controller | `useOpenUIStream` | Same — no change |
| Cockpit data | `useCockpitData()` (200ms mock) | `GET /api/v1/cockpit` via same hook |
| Agent live state | Hardcoded `agentLive: { alignment: true, ... }` | `readAgentLiveState()` + localStorage events |
| MIA draft | `openPanel({ source, module })` (context only) | `openWithDraft(prompt)` (pre-fills input) |

---

## 9. Component Mapping: 3.0 → OpenUI → 4.0

### Full Migration Table

| OpenUI Component | 3.0 Widget | 3.0 Status | 4.0 `widget_type` | Notes |
|---|---|---|---|---|
| `LsStack` | — | N/A (layout) | N/A | Root container |
| `LsCard` | — | N/A (layout) | N/A | Use in place of manual `div` grouping |
| `LsTabs` | — | N/A (layout) | N/A | Tab UI for Decision Room |
| `LsKpiRow` | `KpiGroup` | ✅ Implemented | `kpi_block` | 3.0 version is Redux-bound; OpenUI is stateless |
| `LsDataTable` | `SmartTable` | ✅ Implemented (table view only) | `data_table` | SmartTable has chart toggle; use `LsChart` separately |
| `LsComparison` | `ComparisonView` | ⚠️ Stubbed (`null` return) | N/A | **OpenUI closes this gap** — first working comparison |
| `LsChart` | `VegaLiteChart` | ✅ Implemented (Vega-Lite only) | `chart` | VegaLite requires full spec; `LsChart` wraps Recharts (simpler for LLMs) |
| `LsInfoPanel` | `InfoPanel` | ✅ Implemented | N/A (text-only in 4.0) | OpenUI adds `title` field and more variants |
| `LsStepPlan` | `StepPlan` | ✅ Implemented | N/A | Direct equivalent — OpenUI version is stateless |
| `LsMermaidDiagram` | `MermaidDiagram` | ✅ Implemented | N/A | 3.0 uses `import('mermaid')` dynamically |
| `LsActionInaction` | — | ❌ Not present | N/A | **New 4.0 pattern** — first implementation |
| `LsScenarioMatrix` | — | ❌ Not present | N/A | **New 4.0 pattern** — simulation tab |
| `LsConfidenceBadge` | — | ❌ Not present | `confidence_gauge` (custom) | 4.0 has `ConfidenceGauge`; OpenUI badge is the inline text version |
| `LsReadinessChecklist` | — | ❌ Not present | Partial (template setup UI) | **New 4.0 pattern** — data-driven from `useTemplateReadiness` |
| `LsApprovalPanel` | — | ❌ Not present | HITL checkpoint (not implemented) | **New 4.0 pattern** — T2 governance; fires `onAction` |
| `LsSuggestionChips` | — | ❌ Not present | N/A | New pattern — drives follow-up queries |
| `LsCtaButton` | — | ❌ Not present | N/A | Human-governed deep links (MDIP principle 3) |

### Gaps Closed by OpenUI

| Gap | 3.0 Situation | OpenUI Fix |
|---|---|---|
| `table` widget broken | `JsonRenderBlock` returns `null` | `LsDataTable` implemented and exercised in every fixture |
| `comparison` widget broken | `JsonRenderBlock` returns `null` | `LsComparison` implemented |
| `chart` widget LLM-hostile | Vega-Lite spec is too complex | `LsChart` wraps Recharts — simple `{name, value}` array |
| Decision-first components missing | Not present in 3.0 | `LsActionInaction`, `LsScenarioMatrix`, `LsConfidenceBadge` production-ready |
| Streaming widget rendering | Full-block parse required | `<Renderer isStreaming>` renders progressively |

### Migration Priority Order (3.0 → OpenUI)

1. **`table`** — highest frequency widget, currently broken. Drop-in `LsDataTable`.
2. **`chart`** — Vega-Lite spec is complex for LLMs. `LsChart` is simpler to prompt.
3. **`comparison`** — currently stubbed. `LsComparison` is a direct replacement.
4. **`kpi`** — `KpiGroup` works but is Redux-coupled. `LsKpiRow` is lighter.
5. **`info` / `steps`** — lowest urgency, current implementations work.

---

## 10. MIA Panel Integration

MIA is a **docked 420px right-rail panel**, global across all pages.

- **Open/close:** `Alt+C` anywhere, or the ✨ `MiaTrigger` in the header.
- **Module switcher:** Models · Experiments · MMM · Campaigns. The same query streams a **different OpenUI fixture per module** — the core 4.0 MIA behaviour.
- **From Cockpit:** each widget's "Ask" button calls `openPanel({ source: "Cockpit", module: "Media Performance" })` to pre-set context.

### MIA in Production vs POC

| Feature | POC | Production (`ls4x`) |
|---|---|---|
| Panel open/close | `useMia()` → `openPanel({ source, module })` | `useMiaContext("cockpit")` registers cockpit entities |
| Pre-fill input | Context only (no draft text) | `openWithDraft(prompt)` — pre-fills the MIA input field |
| Response stream | `readSSEStream` → `<Renderer>` | Same pipeline |
| Module content | 4 hardcoded fixtures per module | Live agent response per query |

**Safe no-op default:** `MiaProvider` has a default context value so `useMia()` never throws when called outside the provider (keeps unit tests green without needing to mock the provider).

---

## 11. Testing Strategy

### Coverage: 94 Tests / 12 Suites

| Suite | File | What it covers |
|---|---|---|
| CockpitPage smoke | `cockpit.test.tsx` | Heading, tabs, agent jump bar pills |
| Cockpit spend section | `cockpit.test.tsx` | Paid Social row, 77% pacing, Display row |
| Cockpit alert detail | `cockpit.test.tsx` | Replay button, detail section on click |
| `buildCockpitAlertFix` | `cockpit.test.tsx` | LsStack, channel name, LsCtaButton, LsActionInaction, over_pacing case |
| OpenUI fixtures | `cockpit.test.tsx` | All 4 fixtures non-empty with correct sentinel component |
| New routes smoke | `new-routes.test.tsx` | GeoExperiment, MmmDag, Attribution, Cockpit headings |
| OpenUI library | `openui-library.test.ts` | 21 components, 6 groups, group names, system prompt content |
| Component showcase | `showcase.test.tsx` | All 21 component names render in the coverage checklist |
| Decisions | `decisions-route.test.tsx` | Decision Room page, HITL toggle |
| Shell / layout | Various | AppShell, PageHeader, MIA panel |

### Key Testing Patterns

**Full provider stack required:** All tests use `renderWithProviders` from `src/tests/test-utils.tsx` which wires up `RouterProvider` (TanStack Router via `createMemoryHistory`) + `QueryClientProvider` + `MiaProvider` + `TooltipProvider`. Components that call `useNavigate` or use `Link` throw without the `RouterProvider`.

**SSE stream mock:** All tests that render pages with streaming effects mock `@/mocks/sseStream`:

```typescript
vi.mock("@/mocks/sseStream", () => ({
  createFakeSSEStream: () => ({
    getReader: () => ({
      read: vi.fn().mockResolvedValueOnce({ done: true, value: undefined }),
      releaseLock: vi.fn(),
    }),
  }),
  readSSEStream: vi.fn().mockResolvedValue(undefined),
}))
```

This makes SSE streams resolve instantly so `waitFor` / `findBy*` queries don't time out.

**Async queries for data-loaded content:** Cockpit data loads after a 200ms mock delay. Use `findByText` (with extended timeout for slow CI: `{ timeout: 5000 }`) rather than `getByText` for spend table content.

---

## 12. Production Integration Checklist

The following must be completed before the OpenUI pipeline goes live in `ls4x-main` / `lifesight-platform-ui`.

### Agent

- [ ] Backend agent system prompt includes `SYSTEM_PROMPT` from `src/openui/library.ts`
- [ ] Sentinel `alert_generation` skill emits OpenUI Lang chunks (not plain markdown)
- [ ] Media Agent streams `COCKPIT_MEDIA_FIXTURE`-style layout (fatigue score, CTR decay chart, action/inaction)
- [ ] Data Agent streams `COCKPIT_DATA_FIXTURE`-style layout (connector readiness checklist)
- [ ] All agent outputs use **positional** OpenUI Lang syntax (not named-arg)

### Transport

- [ ] SSE stream uses `{"type":"TEXT_MESSAGE_CONTENT","delta":"..."}` + `{"type":"RUN_FINISHED"}` format
- [ ] `createFakeSSEStream` replaced with `fetch("POST /api/v1/agents/sentinel/run")` SSE reader in `useOpenUIStream`
- [ ] Cockpit REST payload stays **structured JSON** (`SpendRecommendation[]`, `ExperimentAlert[]`) — only the expanded alert detail is generative

### UI

- [ ] `useCockpitData()` points to `GET /api/v1/cockpit` (not mock)
- [ ] `LsCtaButton` href values are validated deep-links into `/decisions/:id`
- [ ] Widget headers show real agent live-state (from `readAgentLiveState()`, not hardcoded `true`)
- [ ] MIA "Ask" buttons use `openWithDraft(prompt)` (not just `openPanel({ source, module })`)
- [ ] Artifacts tab in Cockpit wired to `useArtifacts()` (currently disabled stub)

### Governance

- [ ] `LsApprovalPanel` `onApprove` / `onReject` callbacks are wired to the HITL approval API (not just toast)
- [ ] `LsCtaButton` never auto-navigates — always requires human click

---

## 13. Backend Integration Guide

> **Context:** The Lifesight backend is `lifesight-adk-agents` — a Python multi-agent system using **Google ADK 1.25.0** on **Vertex AI Agent Engine**, with **Gemini 2.5 Flash** (default) / **Gemini 2.5 Pro** (heavy reasoning). Each integration step below maps a POC stub to the production replacement, with exact code.

---

### 13.1 Backend Architecture Recap

```
lifesight-adk-agents/
├── lifesight_mia_agent/          ← Root orchestrator (Mia) — Gemini 2.5 Pro
│   ├── agent.py                  ← LlmAgent definitions + sub-agent routing
│   └── platform_tools.py         ← Lifesight platform REST API wrappers
├── lifesight_ads_insight_data_agent/  ← BigQuery data agent
├── lifesight_kb_rag_agent/            ← Vertex AI Vector Search RAG
└── shared/                            ← Glossary, escalation, orchestration patterns
```

The agents that need to emit OpenUI Lang are:
| Agent | Skill | Cockpit surface |
|---|---|---|
| **Sentinel Agent** (sub-agent of Mia) | `alert_generation` | Alert detail panel (budget pace, spend anomaly) |
| **Media Agent** (sub-agent of Mia) | `creative_fatigue` | Media fatigue detail panel |
| **Data Agent** (`lifesight_ads_insight_data_agent`) | `connector_health` | Data widget detail |
| **Mia root** (`lifesight_mia_agent`) | All MIA queries | MIA panel right rail |

---

### 13.2 Step 1 — Inject the OpenUI System Prompt

The full LLM prompt is exported from `src/openui/library.ts` as `SYSTEM_PROMPT`. The backend must include this verbatim in the agent's `instruction` so the model knows the component signatures.

**Generate the prompt** (run once; commit the output):

```bash
cd lifesight-openui-poc
node -e "
  import('./src/openui/library.ts').then(m => {
    require('fs').writeFileSync('openui-system-prompt.txt', m.SYSTEM_PROMPT)
    console.log('Written', m.SYSTEM_PROMPT.length, 'chars')
  })
"
# OR: add console.warn(SYSTEM_PROMPT) temporarily in library.ts and run npm run dev
```

**Inject into the ADK agent** (`lifesight_mia_agent/agent.py`):

```python
# lifesight_mia_agent/agent.py
from pathlib import Path

# Load the generated prompt — commit openui-system-prompt.txt alongside agent.py
_OPENUI_PROMPT = Path(__file__).parent / "openui-system-prompt.txt"
OPENUI_SYSTEM_PROMPT = _OPENUI_PROMPT.read_text() if _OPENUI_PROMPT.exists() else ""

sentinel_agent = LlmAgent(
    name="Sentinel",
    model=Gemini("gemini-2.5-flash"),
    instruction=f"""
{OPENUI_SYSTEM_PROMPT}

You are Sentinel, Lifesight's real-time budget pace monitor.
Your job is to analyse spend pacing and emit a structured UI response.

CRITICAL: You MUST use positional OpenUI Lang syntax — never named arguments.
CORRECT:   LsInfoPanel("warning", "content here", "title here")
INCORRECT: LsInfoPanel(variant: "warning", content: "content here")

Every response MUST:
1. Start with: root = LsStack("vertical", "md", [...children])
2. End with: chips = LsSuggestionChips([...])
3. Include LsActionInaction as the decision framing block
4. Include LsCtaButton pointing to /decisions/:id — never auto-navigate
""",
    tools=[...],
)
```

**Token budget note:** `SYSTEM_PROMPT` is ~1,700–2,100 tokens. With Gemini 2.5 Flash's 1M context window this is negligible, but use `library.prompt({ examples: [] })` to save ~600 tokens if needed for context-constrained sub-agents.

---

### 13.3 Step 2 — Agent Output Requirements

Every agent response that streams to a Cockpit alert detail or MIA panel MUST satisfy:

| Rule | Correct | Incorrect |
|---|---|---|
| Root component | `root = LsStack("vertical", "md", [...])` | Any other root, or no root assignment |
| Argument style | Positional: `LsInfoPanel("warning", "body", "title")` | Named: `LsInfoPanel(variant: "warning")` |
| Arrays | JSON: `[{label: "ROAS", value: "3.2x"}]` | Python lists: `[{'label': 'ROAS'}]` |
| Last element | Always `LsSuggestionChips([...])` | Missing or in the middle |
| CTA href | Validated path: `"/decisions/media-reallocation-001"` | Absolute URL, empty string |
| Numbers | Unquoted: `delta: -0.23` | Quoted: `delta: "-0.23"` |
| Decision block | `LsActionInaction(...)` before `LsStepPlan` | Absent or after CTA |

**Minimal valid Sentinel response:**

```
root = LsStack("vertical", "md", [alert, kpis, badge, action, cta, chips])
  alert = LsInfoPanel("warning", "Paid Social pacing 23% below plan. $56K at risk.", "Budget Pace Alert")
  kpis = LsKpiRow([{label: "Actual Spend", value: "$184K", delta: -0.23, positive_direction: false}, {label: "Plan", value: "$240K"}, {label: "Gap", value: "$56K"}])
  badge = LsConfidenceBadge("high", "Sentinel: high confidence", "Budget Pace Guardrail — 3+ days below threshold")
  action = LsActionInaction("Recover Pace", "Increase daily budget by $8K/day.", [{label: "Revenue at risk", value: "$714K"}], "Do Nothing", "Forgo $714K incremental revenue.", [{label: "Opportunity cost", value: "$714K"}])
  cta = LsCtaButton("Create Decision", "/decisions/media-reallocation-001", "primary")
  chips = LsSuggestionChips(["Show historical pace", "Simulate recovery", "View Paid Social attribution"])
```

---

### 13.4 Step 3 — Wire the SSE Endpoint (Backend)

The frontend expects a `POST` endpoint that streams `AgentStreamEvent` JSON lines. The exact event contract is defined in `src/mocks/sseStream.ts`:

```
data: {"type":"TEXT_MESSAGE_CONTENT","delta":"root = LsStack(..."}
data: {"type":"TEXT_MESSAGE_CONTENT","delta":"  alert = LsInfoPanel(..."}
...
data: {"type":"RUN_FINISHED"}
```

**FastAPI implementation** (Cloud Run or Vertex AI Agent Engine):

```python
# lifesight_mia_agent/openui_sse_router.py
import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from google.adk.runners import Runner
from google.genai import types

router = APIRouter()

class AlertRunRequest(BaseModel):
    alert_id: str
    channel: str
    pacing_rate: float
    planned_spend: float
    actual_spend: float
    status: str  # "under_pacing" | "over_pacing" | "on_pace"
    workspace_id: str

@router.post("/api/v1/agents/sentinel/run")
async def run_sentinel_alert(req: AlertRunRequest):
    """Streams OpenUI Lang for a Cockpit spend alert."""
    
    prompt = f"""
Generate a budget pace alert for {req.channel}.
Channel: {req.channel}
Status: {req.status}
Pacing rate: {req.pacing_rate:.0%} of plan
Actual spend WTD: ${req.actual_spend:,.0f}
Planned spend WTD: ${req.planned_spend:,.0f}
Gap: ${abs(req.planned_spend - req.actual_spend):,.0f}

Emit the alert as a complete OpenUI Lang response.
"""

    async def generate():
        try:
            async for event in runner.run_async(
                user_id="cockpit",
                session_id=req.alert_id,
                new_message=types.Content(
                    role="user",
                    parts=[types.Part(text=prompt)]
                ),
            ):
                # Forward TEXT_MESSAGE_CONTENT events as SSE
                if (event.content and event.content.parts):
                    for part in event.content.parts:
                        if part.text:
                            payload = json.dumps({
                                "type": "TEXT_MESSAGE_CONTENT",
                                "delta": part.text,
                            })
                            yield f"data: {payload}\n\n"
            
            yield 'data: {"type":"RUN_FINISHED"}\n\n'
        except Exception as e:
            yield f'data: {{"type":"ERROR","message":{json.dumps(str(e))}}}\n\n'

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Required for nginx/GCP load balancers
        },
    )
```

**Additional endpoints needed:**

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/agents/sentinel/run` | POST | Sentinel alert detail — streams OpenUI Lang |
| `/api/v1/agents/media/run` | POST | Media fatigue detail — streams OpenUI Lang |
| `/api/v1/agents/data/run` | POST | Data connector health — streams OpenUI Lang |
| `/api/v1/agents/mia/run` | POST | MIA panel queries — streams OpenUI Lang |
| `/api/v1/cockpit` | GET | Structured Cockpit data (Tier A — no streaming) |

---

### 13.5 Step 4 — Update the Frontend (Swap the Mock)

Two changes in the frontend replace the fake SSE with real backend calls.

**Change A — `src/hooks/useOpenUIStream.ts`**

Add a `loadFromBackend()` method alongside the existing `loadStream()`. Keep `loadStream()` / `replay()` for the demo/test path.

```typescript
// Add to useOpenUIStream.ts
const loadFromBackend = useCallback(
  async (endpoint: string, body: Record<string, unknown>) => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    if (!streamingRef.current) { streamingRef.current = true; beginStream() }
    setResponse(null); setProgress(0); setStreamKey(k => k + 1); setIsStreaming(true)

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getSessionToken()}` },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    if (!res.ok) throw new Error(`Agent SSE error: ${res.status}`)

    // readSSEStream is already implemented — works with real streams too
    await readSSEStream(res.body!, (acc) => {
      if (ctrl.signal.aborted) return
      setResponse(acc)
      setProgress(Math.min(99, Math.round((acc.length / 2000) * 100))) // estimate
    })
    if (!ctrl.signal.aborted) { setProgress(100); finishStreaming() }
  },
  [beginStream, finishStreaming]
)

return { response, isStreaming, progress, streamKey, loadInstant, loadStream, replay, abort, loadFromBackend }
```

**Change B — `src/features/cockpit/CockpitPage.tsx`**

Replace the `selectAlert` Tier B/C fixture path with a backend call:

```typescript
// CockpitPage.tsx — production selectAlert
const selectAlert = useCallback(async (id: string) => {
  setSelectedAlertId(id)
  const rec = data?.spendRecommendations.find(r => r.id === id)
  if (!rec) return

  // Production: always call the backend
  await stream.loadFromBackend("/api/v1/agents/sentinel/run", {
    alert_id: id,
    channel: rec.channel,
    pacing_rate: rec.pacing_rate,
    planned_spend: rec.planned_spend,
    actual_spend: rec.actual_spend,
    status: rec.status,
    workspace_id: "nova-brand", // from session context
  })
  
  setTimeout(() => {
    document.getElementById("cockpit-alert-detail")
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, 100)
}, [data, stream])
```

---

### 13.6 Step 5 — Cockpit REST API (`GET /api/v1/cockpit`)

Replace `useCockpitData()` mock with a real API call. The response shape is defined in `src/mocks/cockpit/cockpit-data.ts` — the backend must return this exact structure.

**Frontend hook update** (`src/api/useCockpitData.ts`):

```typescript
// Replace the mock implementation:
export function useCockpitData() {
  return useQuery<CockpitMockData>({
    queryKey: ["cockpit", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/cockpit?workspace_id=${workspaceId}`, {
        headers: { Authorization: `Bearer ${getSessionToken()}` },
      })
      if (!res.ok) throw new Error(`Cockpit API error: ${res.status}`)
      return res.json()
    },
    staleTime: 60_000,
  })
}
```

**Required backend response shape:**

```python
# Python Pydantic model — mirrors src/mocks/cockpit/cockpit-data.ts
from pydantic import BaseModel
from typing import Literal, Optional

class SpendRecommendation(BaseModel):
    id: str
    channel: str
    tactic: Optional[str] = None
    level: Literal["channel", "tactic"]
    status: Literal["on_pace", "under_pacing", "over_pacing"]
    pacing_rate: float           # 0.77 = 77% of plan
    planned_spend: float
    actual_spend: float
    recommendation: str

class AgentLiveState(BaseModel):
    alignment: bool
    goals: bool
    media: bool
    data: bool
    model: bool
    onboarding: bool

class CockpitResponse(BaseModel):
    updated_at: str
    live_marketing_plan: Optional[dict] = None
    spend_recommendations: list[SpendRecommendation]
    experiment_alerts: list[dict]
    data_anomaly_alerts: list[dict]
    connector_warnings: list[dict]
    agent_live: AgentLiveState

@router.get("/api/v1/cockpit")
async def get_cockpit(workspace_id: str) -> CockpitResponse:
    # Fetch from Lifesight platform API using platform_tools.py pattern
    spend_data = await get_spend_recommendations(workspace_id)
    ...
    return CockpitResponse(...)
```

---

### 13.7 Step 6 — MIA Agent Wiring

The MIA panel in `/cockpit` opens with `openPanel({ source: "Cockpit", module: "Media Performance" })`. In production, this must trigger a backend query through the `lifesight_mia_agent` root agent with cockpit context.

**Frontend** (`src/providers/mia-provider.tsx`):

```typescript
// Replace the local fixture lookup:
async function openWithDraft(prompt: string, context: MiaContext) {
  openPanel({ source: context.source, module: context.module })
  await stream.loadFromBackend("/api/v1/agents/mia/run", {
    prompt,
    module: context.module,
    source: context.source,
    workspace_id: workspaceId,
  })
}
```

**Module → sub-agent routing** in `lifesight_mia_agent/agent.py`:

```python
# The module from the frontend maps to routing instructions:
MODULE_ROUTING = {
    "Models":      "Route to Model_Insight_Agent for MMM and attribution queries.",
    "Experiments": "Route to Model_Insight_Agent with geo-experiment focus.",
    "MMM":         "Route to Lifesight_Default_Budget_Optimiser.",
    "Campaigns":   "Route to Model_Insight_Agent for campaign-level analysis.",
    "Media Performance": "Analyse creative fatigue and platform signals. Emit LsChart CTR decay.",
}
# Inject MODULE_ROUTING[module] into the root agent's dynamic instruction.
```

---

### 13.8 Step 7 — Self-Correction Loop

When the renderer receives an invalid OpenUI Lang response (unknown component, bad positional arg count, type mismatch), it calls the `onError` callback. Wire this to send a correction request back to the agent:

**Frontend:**

```typescript
// CockpitAlertDetail.tsx / MiaPanel.tsx
<Renderer
  response={stream.response ?? ""}
  library={library}
  isStreaming={stream.isStreaming}
  onAction={onAction}
  onError={async (errors) => {
    if (errors.length === 0 || !stream.isStreaming) return
    // Send parse errors back to the agent for self-correction
    const errorSummary = errors.map(e => e.message).join("\n")
    await stream.loadFromBackend("/api/v1/agents/sentinel/correct", {
      previous_output: stream.response,
      parse_errors: errorSummary,
    })
  }}
/>
```

**Backend correction endpoint:**

```python
@router.post("/api/v1/agents/sentinel/correct")
async def correct_sentinel_output(req: CorrectionRequest):
    """Re-runs the agent with parse errors prepended so it can self-correct."""
    correction_prompt = f"""
Your previous response contained OpenUI Lang parse errors:
{req.parse_errors}

Previous output (partial):
{req.previous_output[:500]}

Please regenerate the complete response, fixing all syntax errors.
Remember: positional args only, root must be LsStack, end with LsSuggestionChips.
"""
    # Same SSE streaming as /run
    ...
```

---

### 13.9 Step 8 — Authentication and CORS

**Auth:** All agent SSE endpoints require a valid Bearer token. Use the same session token the frontend already sends to `lifesight-platform-ui` API calls.

```typescript
// src/lib/api-client.ts (shared utility)
export function getAuthHeaders(): HeadersInit {
  const token = sessionStorage.getItem("ls_session_token")
  return {
    "Authorization": `Bearer ${token}`,
    "X-Workspace-Id": getWorkspaceId(),
    "Content-Type": "application/json",
  }
}
```

**CORS** (FastAPI, for local dev against `localhost:5173`):

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://app.lifesight.io"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Workspace-Id"],
)
```

**GCP load balancer / nginx SSE note:** Set `X-Accel-Buffering: no` and ensure the load balancer timeout exceeds the maximum expected stream duration (~30s for a full alert response).

---

### 13.10 Step 9 — Environment Variables

| Variable | Where | Value |
|---|---|---|
| `VITE_AGENT_BASE_URL` | Frontend `.env.production` | `https://api.lifesight.io` |
| `VITE_COCKPIT_API_URL` | Frontend `.env.production` | `https://api.lifesight.io/api/v1/cockpit` |
| `LIFESIGHT_PLATFORM_BASE_URL` | ADK agent (Cloud Run / Vertex AI) | Lifesight platform API URL |
| `GOOGLE_CLOUD_PROJECT` | ADK agent | GCP project ID |
| `GOOGLE_GENAI_USE_VERTEXAI` | ADK agent | `true` for Vertex AI |
| `GEMINI_MODEL` | ADK agent | `gemini-2.5-flash` (default) |

Local dev (frontend): create `lifesight-openui-poc/.env.local`:
```
VITE_AGENT_BASE_URL=http://localhost:8080
```

---

### 13.11 End-to-End Validation Procedure

Run these in order after wiring up the backend.

**1. Validate system prompt is received by the agent**

```bash
# In lifesight-adk-agents:
adk web
# Open http://localhost:8000 → send: "What components can you render?"
# Expected: agent lists LsStack, LsKpiRow, LsInfoPanel... (from system prompt)
```

**2. Validate OpenUI Lang output syntax**

```bash
# Send a test alert request to the SSE endpoint:
curl -N -X POST http://localhost:8080/api/v1/agents/sentinel/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"alert_id":"test","channel":"Paid Social","pacing_rate":0.77,"planned_spend":240000,"actual_spend":184000,"status":"under_pacing","workspace_id":"nova-brand"}'

# Expected output lines:
# data: {"type":"TEXT_MESSAGE_CONTENT","delta":"root = LsStack(\"vertical\"..."}
# data: {"type":"TEXT_MESSAGE_CONTENT","delta":"  alert = LsInfoPanel(\"warning\"..."}
# ...
# data: {"type":"RUN_FINISHED"}
```

**3. Validate positional syntax** — pipe to the renderer test:

```bash
# Extract deltas and concatenate
RESPONSE=$(curl -s ... | grep TEXT_MESSAGE_CONTENT | python3 -c "
import sys, json
acc = ''
for line in sys.stdin:
    if line.startswith('data: '):
        e = json.loads(line[6:])
        if e.get('type') == 'TEXT_MESSAGE_CONTENT':
            acc += e['delta']
print(acc)
")

# Check: first line must match ^root = LsStack\(
echo "$RESPONSE" | head -1 | grep -P "^root = LsStack\("

# Check: last non-empty line must contain LsSuggestionChips
echo "$RESPONSE" | grep -v '^$' | tail -1 | grep LsSuggestionChips
```

**4. Validate in the browser**

1. Start the frontend against the local backend: `VITE_AGENT_BASE_URL=http://localhost:8080 npm run dev`
2. Navigate to `/cockpit`
3. Click "Paid Social" row
4. Expected: alert detail panel streams in with `LsStatHero` → `LsKpiRow` → `LsActionInaction` → `LsCtaButton`
5. No red "components could not be rendered" banner should appear
6. Check browser Network tab → the SSE connection to `/api/v1/agents/sentinel/run` should show `EventStream` with `TEXT_MESSAGE_CONTENT` frames

**5. Validate the Cockpit REST API**

```bash
curl http://localhost:8080/api/v1/cockpit?workspace_id=nova-brand \
  -H "Authorization: Bearer test-token" | python3 -m json.tool

# Expected keys: updated_at, spend_recommendations, experiment_alerts,
#                data_anomaly_alerts, connector_warnings, agent_live
```

---

### 13.12 Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Blank Renderer, no error banner | Agent using named-arg syntax | Check agent output for `variant:` / `level:` — must be positional |
| Red "could not be rendered" banner | Unknown component name or missing required arg | Check browser console for `OpenUIError` — component name must exactly match `src/openui/library.ts` |
| Stream never reaches `RUN_FINISHED` | Nginx/GCP LB timeout | Add `X-Accel-Buffering: no` header; increase backend timeout to 120s |
| CORS error on SSE connection | Missing CORS middleware | Add `CORSMiddleware` with `allow_origins` including the frontend URL |
| `LsCtaButton` click does nothing | `href` not matching router pattern | Check `createOpenUIActionHandler` in `src/lib/openui-actions.ts` — paths must start with `/decisions/`, `/agent`, `/template/`, etc. |
| 401 on agent SSE endpoint | Missing or expired session token | Verify `getSessionToken()` returns a valid token; check token refresh |
| `LsChart` renders as empty box | `data` array has wrong key names | `LsChart` expects `{name: string, value: number}` — not `{x, y}` or `{label, count}` |
| Self-correction loop fires repeatedly | Agent ignores correction prompt | Add `max_corrections: 1` guard; log errors to Sentry; fall back to Tier C builder |

---

## 14. Quick Start

### Running the POC

```bash
cd lifesight-openui-poc
npm install
npm run dev          # → http://localhost:5173
```

### Verification commands

```bash
npm run typecheck    # tsc --noEmit — zero errors
npm run lint         # tsc + eslint src — clean
npm test             # 94 tests, 12 suites — all pass
npm run build        # tsc -b + vite build — clean
```

### Demo — What to Click

| Route | What to do | What you see |
|---|---|---|
| `/cockpit` | Click "Paid Social" row | Alert Detail streams — StatHero, KPIs, action/inaction card, CTA |
| `/cockpit` | Click "Media Performance → View fatigue alert detail →" | CTR decay chart + creative rotation recommendation |
| `/cockpit` | Click any agent pill (Alignment / Goals / Media…) | Page smooth-scrolls to that widget section |
| `/cockpit` | Click "Replay alert stream" | Selected alert re-streams from scratch |
| `/showcase` | Click "Stream all" | All 21 components assemble progressively |
| `/decisions/media-reallocation-001` | Toggle Fixture ⇄ Stream | 3-tab Decision Packet rebuilds progressively (~2s) |
| `/hitl/media-reallocation-001` | Click "Approve" | Toast → confirmation card transition |
| MIA panel | `Alt+C`, switch module | Different OpenUI layout per module |

### Adding a New Component

1. Implement the React component in `src/openui/components/{group}.tsx`
2. Register it in `src/openui/library.ts` — add to the `components` array and the appropriate `componentGroups` entry
3. Add a fixture entry in `src/mocks/fixtures/showcase.ts`
4. Update count assertions in `src/tests/openui-library.test.ts` and `src/tests/showcase.test.tsx`
5. Document the component in the LLM system prompt by running `console.warn(SYSTEM_PROMPT)` and verifying the new component appears with the correct positional signature

---

## 15. Glossary

| Term | Definition |
|---|---|
| **OpenUI Lang** | The line-oriented DSL that agents write and `@openuidev/react-lang` parses into React component trees. Grammar: `name = Component(arg1, arg2, ...)`. |
| **Positional syntax** | The grammar variant `@openuidev/react-lang@0.2.6` actually parses — arguments are passed by position, not by name. Named-arg syntax (`variant: "warning"`) is used in LLM examples but silently rejected by the renderer. |
| **Renderer** | `<Renderer response={string} library={library} isStreaming={bool} onAction={fn}>` — the core `@openuidev/react-lang` component that parses OpenUI Lang and mounts React components. |
| **library** | The `createLibrary({...})` instance defined in `src/openui/library.ts`. Maps component names to React implementations and provides the LLM system prompt. |
| **useOpenUIStream** | The shared streaming controller (`src/hooks/useOpenUIStream.ts`). Exposes `replay(fixture)`, `response`, `isStreaming`, `progress`, `abort`. |
| **createFakeSSEStream** | POC utility that wraps a fixture string in a `ReadableStream` that emits it in chunks over time. Replaces a real SSE connection in the POC. |
| **Tier A** | Structured JSON rendered as static React components — no LLM at query time. |
| **Tier B** | Pre-built OpenUI Lang fixture streamed via fake SSE (POC) or real SSE (production). Authored once; high-quality curated content. |
| **Tier C** | Deterministic OpenUI Lang built at runtime by `buildCockpitAlertFix()` from a `SpendRecommendation` object — no LLM, no pre-authored fixture. |
| **MIA** | Marketing Intelligence Assistant — Lifesight's AI copilot. Docked 420px right-rail panel, global via `Alt+C`. |
| **HITL** | Human-in-the-loop — `LsApprovalPanel` checkpoint in T2 governance flows. Never auto-executes. |
| **Sentinel Agent** | The backend agent that monitors budget pacing, spend anomalies, and creative performance. Fires `alert_generation` skill; output maps to Cockpit alert detail fixtures. |
| **MDIP** | Marketing Decision Intelligence Platform — the 4.0 product umbrella. Principle 3: human-governed actions (LsCtaButton navigates; never auto-fires). |
| **LsStack** | The mandatory root component of every OpenUI Lang response. Equivalent to a top-level `<div>` with direction and gap props. |
| **onAction** | The callback fired by `<Renderer>` when a user interacts with `LsSuggestionChips` or `LsCtaButton`. In the POC, handled by `createOpenUIActionHandler` in `src/lib/openui-actions.ts`. |
