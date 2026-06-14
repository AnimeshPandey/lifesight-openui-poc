# Lifesight OpenUI POC

> **Status:** Design-aligned with **Lifesight 4.0** (`ls4x-main`) — _2026-06-15_.
> The POC now wears the production 4.0 app shell (collapsible icon-rail sidebar,
> h-12 header, docked MIA panel) instead of a flat dev top-nav. All 9 routes
> live, **72 tests / 11 suites passing**, `typecheck` + `lint` + `build` clean.
> Zero edits to `ls4x-main/` or `lifesight-platform-ui/`.
>
> **TL;DR:** `@openuidev/react-lang` powers generative UI across the 3.0 and 4.0
> decision-intelligence surfaces, now rendered inside a shell visually
> indistinguishable from `ls4x-main` at a glance — same tokens, same sidebar IA,
> same MIA copilot, same compact density.

> ✅ **Generative content renders end-to-end.** All 9 routes + the MIA panel's 4
> modules stream and render OpenUI Lang fixtures (KPI tiles, tables, charts,
> Mermaid causal DAGs, action/inaction decision cards). Fixtures use the
> canonical **positional** OpenUI Lang grammar that `@openuidev/react-lang@0.2.6`
> expects — see [OpenUI Lang syntax](#openui-lang-syntax-the-format-the-renderer-parses).

---

## 1. Quick Start

```bash
cd lifesight-openui-poc
npm install
npm run dev          # → http://localhost:5173
```

Verify:

```bash
npm run typecheck    # tsc --noEmit — zero errors
npm run lint         # tsc + eslint src — clean
npm test             # 72 tests, 11 suites — all pass
npm run build        # tsc -b + vite build — clean
```

---

## 2. What's New — 4.0 Design Alignment

This pass re-skinned the POC to match `ls4x-main`'s production shell. Functionality
(9 routes, 17 OpenUI components, fixtures, mock SSE, TanStack Query/Zustand) is
preserved; the chrome around it is new.

| Area | Before (dev demo) | After (4.0-aligned) |
|---|---|---|
| **App shell** | Flat sticky top-nav with text links | Collapsible **icon-rail `AppSidebar`** (grouped IA) + `h-12` header + `SidebarInset`, adapted from `ls4x` `app/(app)/layout.tsx` |
| **MIA** | Orphan `/mia` page | **Docked 420px right-rail panel** (gradient header, context chips, module switcher), global via **Alt+C** or the header ✨. `/mia` is now a launcher/fallback |
| **Header** | none | WorkspaceSwitcher (`NovaBrand`), ThemeToggle (`d` hotkey), MiaTrigger, NotificationCenter (stubs) |
| **Landing** | Emoji tile grid | Compact **Lucide product grid** driven by the nav IA + MIA callout |
| **Tokens** | Minimal dark token subset | Full `ls4x` token system — `--sidebar-*`, tag tokens, text hierarchy, `--surface-dark`, `--row-highlight`, `.light` theme, utility classes |
| **shadcn style** | `default` / `slate` | **`radix-mira` / `neutral`** (matches `ls4x`) |
| **Components** | Flat dark cards | 4.0 density — `--surface-dark` KPI tiles, recommendation-card dual panels, tag-token badges, compact tables/tabs |

---

## 3. Demo Routes — All 10

`/mia` is no longer in the primary nav — **MIA is a global docked panel** (Alt+C).
"Default mode" = whether the route streams progressively on first paint or loads
instantly. "Interactive" = which OpenUI actions do something visible.

| Route | Shell context | Default mode | Interactive | Key components |
|---|---|---|---|---|
| [`/`](http://localhost:5173/) | _(landing)_ | — | Open MIA | — |
| [`/showcase`](http://localhost:5173/showcase) | **OpenUI** | instant gallery + **Stream all** | chips, CTA | All 17 |
| [`/cockpit`](http://localhost:5173/cockpit) | **Cockpit** | **stream** on mount | Agent jump bar scroll, spend row click→stream, Media fatigue→stream, Replay, Ask→MIA, CTA→decisions | LsInfoPanel, LsKpiRow, LsStepPlan, LsActionInaction, LsCtaButton, LsSeverityBadge |
| [`/decisions/…`](http://localhost:5173/decisions/media-reallocation-001) | **Action › Deploy** | **stream** (default) | Fixture/Stream + Exec/Analyst toggles, chips→HITL | LsActionInaction, LsScenarioMatrix, LsConfidenceBadge, LsChart |
| [`/geo`](http://localhost:5173/geo) | **Intelligence** | **stream** on mount | Replay, chips→MIA | LsKpiRow, LsChart ×2, LsComparison, LsConfidenceBadge |
| [`/mmm`](http://localhost:5173/mmm) | **Intelligence** | **stream** on mount | Replay, chips→MIA | LsMermaidDiagram, LsKpiRow, LsDataTable, LsChart |
| [`/attribution`](http://localhost:5173/attribution) | **Intelligence** | **stream** on mount | Replay, tabs | LsTabs, LsDataTable, LsComparison, LsChart |
| [`/agent`](http://localhost:5173/agent) | **Agent** | stream per turn | chips→second chat turn, fixture badge | LsKpiRow, LsDataTable, LsComparison, LsChart, LsSuggestionChips |
| [`/template/…`](http://localhost:5173/template/media-reallocation) | **Templates** | **stream** (data-driven) | Regenerate from API, Activate→toast+navigate | LsReadinessChecklist, LsTabs, LsStepPlan |
| [`/hitl/…`](http://localhost:5173/hitl/media-reallocation-001) | **Templates** | **stream** on mount | Approve/Reject→toast + confirmation card | LsApprovalPanel, LsActionInaction, LsConfidenceBadge |

---

## 3a. Interactive demo guide

The fastest senior-review path. Everything streams through the shared
`useOpenUIStream` controller; toggle **Demo speed → Slow** in the header to make
the progressive build obvious.

| Route | What to click | What you should see |
|---|---|---|
| `/showcase` | **Stream all** | All 17 components assemble top-to-bottom in one streamed program |
| `/cockpit` | **Click "Paid Social" row** | Alert Detail streams below — LsStatHero, KPIs, action/inaction card, CTA |
| `/cockpit` | **Click "Media Performance" → "View fatigue alert detail →"** | Media fatigue fixture streams with CTR decay chart |
| `/cockpit` | **Replay alert stream** | Selected alert re-streams from scratch |
| `/cockpit` | **Agent jump pill** (Alignment / Goals / Media…) | Page smooth-scrolls to that widget section |
| `/cockpit` | the CTA / a chip | Toast + navigate to the decision room / opens MIA |
| `/decisions/…` | **Fixture ⇄ Stream** toggle | 3-tab Decision Packet rebuilds progressively (~2s) vs instant |
| `/agent` | a suggestion chip | Toast "Follow-up: …" then a second chat turn streams a new fixture |
| `/template/…` | **Regenerate from API** | Re-fetches readiness data and re-streams the generated layout |
| `/hitl/…` | **Approve** | Immediate toast → page transitions to the confirmation card |
| MIA panel | Alt+C, switch Models → MMM | Panel streams a different structured layout per module |

### Troubleshooting

- **Blank Renderer** → check for the inline red "components could not be rendered"
  banner (unknown-component). Verify the fixture uses the canonical positional
  OpenUI Lang grammar.
- **Replay seems instant** → switch **Demo speed → Slow** in the header (chunkMs
  200 / chunkSize 16).
- **Chart looks empty** → Recharts needs a sized container; `LsChart` defaults to
  220px height.
- **A button "does nothing"** → it routes through `src/lib/openui-actions.ts`;
  check the toast (sonner) — chips toast a follow-up, CTAs navigate.

---

## 3b. Cockpit — Agent → UI Contract

The Cockpit page has two layers:

- **Static widgets** (Alignment, Goals, Media, Data, Onboarding) — React components driven by `useCockpitData()` mock
- **Generative detail panels** — selected alert streams OpenUI Lang into `<Renderer>` via `useOpenUIStream`

**Click flow:**
1. Select a spend row → `selectAlert(id)` looks up `ALERT_FIXTURE_MAP[id]` (Tier B: pre-built fixture) or calls `buildCockpitAlertFix(rec)` (Tier C: generated from data)
2. `stream.replay(fixture)` → `createFakeSSEStream` → `readSSEStream` → `setResponse(accumulated)`
3. `<CockpitAlertDetail>` → `<OpenUIDemoRenderer>` → `<Renderer response={...} library={library}>`

**Fixtures in use:**

| Alert key | Fixture | Components exercised |
|---|---|---|
| `rec-paid-social` | `COCKPIT_FIXTURE` | LsStatHero, LsKpiRow, LsChart, LsConfidenceBadge, LsStepPlan, LsCtaButton |
| `rec-tiktok`, `rec-display` | `COCKPIT_SPEND_ANOMALY_FIXTURE` | LsInfoPanel, LsKpiRow, LsActionInaction, LsStepPlan |
| `media-fatigue` | `COCKPIT_MEDIA_FIXTURE` | LsInfoPanel, LsChart, LsActionInaction, LsConfidenceBadge |
| `data-connector` | `COCKPIT_DATA_FIXTURE` | LsInfoPanel, LsKpiRow, LsReadinessChecklist, LsStepPlan |
| unmapped rows | `buildCockpitAlertFix(rec)` | LsSeverityBadge, LsInfoPanel, LsKpiRow, LsActionInaction |

**Full agent→UI pipeline:** [`docs/cockpit-agent-ui-contract.md`](docs/cockpit-agent-ui-contract.md)

---

## 4. MIA Panel

The MIA copilot is a **docked 420px right rail**, available on every page:

- **Open/close:** `Alt+C` anywhere, or the ✨ `MiaTrigger` in the header. `/cockpit`'s
  "Ask" buttons open it with cockpit context.
- **Gradient header** (`--primary` → `--primary-cta-dark`) with the query, an entity
  chip (`NovaBrand`), a date-range chip, and a source chip.
- **Module switcher** — `Models · Experiments · MMM · Campaigns`. The same question
  ("Which channels drive incremental impact?") streams a **different fixture per
  module**, the core 4.0 MIA behaviour. Driven by `useContextStore`.
- **Footer** — stubbed ask bar + a Replay control that re-streams the active module.

`MiaProvider` (`src/providers/mia-provider.tsx`) owns only open-state + invocation
context (no backend, no chat lifecycle — unlike ls4x's full provider). Its context
has a **safe no-op default** so `useMia()` never throws when a component renders
outside the provider (keeps the direct-render unit tests green).

---

## 5. Architecture

```
  main.tsx
    QueryClientProvider → ThemeProvider(dark, d-hotkey) → TooltipProvider → MiaProvider
      └── App (TanStack Router)
            rootRoute.component = AppShell   ── src/layout/AppShell.tsx
            ┌───────────────────────────────────────────────────────────┐
            │  SidebarProvider(defaultOpen=false)                        │
            │  ┌──────────┐  ┌──────────────────────────────────────┐   │
            │  │AppSidebar│  │ SidebarInset                         │   │
            │  │ icon rail│  │  header: WorkspaceSwitcher · Theme ·  │   │
            │  │ grouped  │  │          MiaTrigger · Notifications   │   │
            │  │ nav IA   │  │  ┌────────────────────┐ ┌─────────┐  │   │
            │  │          │  │  │ <main> <Outlet/>   │ │ MiaPanel│  │   │
            │  │          │  │  │  feature page      │ │ 420px   │  │   │
            │  │          │  │  │  PageHeader + body │ │ docked  │  │   │
            │  └──────────┘  │  └────────────────────┘ └─────────┘  │   │
            │                └──────────────────────────────────────┘   │
            └───────────────────────────────────────────────────────────┘

  Feature page body / MiaPanel body:
    fixture (or buildTemplateFix(queryData))
      → createFakeSSEStream → readSSEStream → setResponse(accumulated)
      → <Renderer response library isStreaming onAction onError />
      → @openuidev/react-lang@0.2.6 parses OpenUI Lang → React tree
      → src/openui library (17 components, radix-mira / dark tokens)
```

### Key files added/changed in the re-skin

| File | Role |
|---|---|
| `src/index.css` | Full ls4x token system (replaces missing `shadcn/tailwind.css` with an inlined `@layer base`) |
| `src/layout/AppShell.tsx` | The 4.0 shell — sidebar + header + docked MIA rail + `<Outlet/>` |
| `src/components/app-sidebar.tsx` | TanStack-ified icon-rail sidebar (no session/role/localStorage) |
| `src/lib/navigation.ts` | POC nav IA subset |
| `src/components/page-header.tsx` | Shared page header (breadcrumb/icon/subtitle/badge/actions) |
| `src/providers/mia-provider.tsx` | Simplified MIA open-state provider + Alt+C |
| `src/components/mia-panel.tsx` | Docked panel + `MiaTrigger` (module-switcher streaming lives here now) |
| `src/components/{workspace-switcher,notification-center,back-navigation,theme-provider,theme-toggle}.tsx` | Header/shell stubs + theming |
| `src/components/ui/*` | shadcn primitives sourced from ls4x (radix-mira), scoped `@radix-ui/*` imports |

---

## 6. Design Alignment — ls4x Reference Mapping

Every shell decision traces to a read-only `ls4x-main/frontend` source:

| ls4x reference (read-only) | Used for |
|---|---|
| `app/globals.css` | Design tokens → `src/index.css` |
| `app/(app)/layout.tsx` | App shell → `src/layout/AppShell.tsx` |
| `components/app-sidebar.tsx` + `components/ui/sidebar.tsx` | Sidebar → `src/components/app-sidebar.tsx` |
| `lib/navigation.ts` | Nav IA pattern → `src/lib/navigation.ts` |
| `components/mia-panel.tsx` + `providers/mia-provider.tsx` | Docked MIA (simplified) |
| `components/cockpit/recommendation-card.tsx` | `LsActionInaction` dual panel |
| `components/ui/kpi-block.tsx` | `LsKpiRow` tiles |
| `components/theme-provider.tsx` + `theme-toggle.tsx` | Theming + `d` hotkey |

### Vite/TanStack adaptations of Next.js patterns

- `next/link` → TanStack `<Link to params>`; `usePathname()` → `useRouterState`.
- `"use client"` directives stripped (Vite has none).
- ls4x's `radix-ui` umbrella imports rewritten to scoped `@radix-ui/react-*`
  (the POC's installed convention).
- `@import "shadcn/tailwind.css"` is **not shipped** by the installed `shadcn`
  package, so its critical base layer is replicated inline in `src/index.css`'s
  `@layer base`.
- `next-themes` runs client-side; `enableSystem={false}` so the canvas reliably
  boots to the near-black 4.0 palette.

---

## 7. Stubbed vs Real

| Capability | State |
|---|---|
| App shell, sidebar, header, docked MIA panel | ✅ Real, ls4x-aligned |
| Theme toggle (`d` hotkey), MIA Alt+C | ✅ Real |
| Routing (9 routes), TanStack Query mock hooks, Zustand stores | ✅ Real |
| Mock SSE streaming (`createFakeSSEStream`/`readSSEStream`) | ✅ Real |
| OpenUI library (17 components, Zod schemas, `library.prompt()`) | ✅ Real (schemas validated by tests) |
| Generative content rendering (all routes + MIA panel) | ✅ Real — fixtures render via the Renderer |
| Mermaid causal DAGs (`/mmm`, `/attribution`) | ✅ Real — rendered to SVG (stream-safe) |
| **Workspace switcher** | 🟡 Stub — hardcoded `NovaBrand` |
| **Notification center** | 🟡 Stub — 2 static notifications |
| **Back navigation** | 🟡 Stub — appears on detail routes, uses router history |
| Backend / auth / Firebase / WebSocket | ⛔ Out of scope |

---

## 8. OpenUI Component Library — 17 Components

```
src/openui/
├── library.ts           createLibrary() — 17 components, 5 groups; library.prompt() → SYSTEM_PROMPT
└── components/
    ├── layout.tsx        LsStack, LsCard, LsTabs
    ├── data.tsx          LsKpiRow, LsDataTable, LsComparison, LsChart
    ├── insight.tsx       LsInfoPanel, LsStepPlan, LsMermaidDiagram
    ├── decision.tsx      LsActionInaction, LsScenarioMatrix, LsConfidenceBadge, LsReadinessChecklist, LsApprovalPanel
    └── agent.tsx         LsSuggestionChips, LsCtaButton
```

4.0 styling applied (schemas/names unchanged):

| Component | 4.0 polish |
|---|---|
| `LsKpiRow` | `--surface-dark` tiles, `.section-label`, `text-lg` tabular-nums |
| `LsDataTable`, `LsComparison`, `LsScenarioMatrix` | `text-xs`, uppercase headers, `border-border`, row hover `--row-highlight`, tabular-nums |
| `LsActionInaction` | recommendation-card dual panel — emerald/red tints, `text-[10px]` "If we act" / "If we don't" eyebrows |
| `LsCard` | `ring-1 ring-foreground/10`, compact header |
| `LsTabs` | `TabsList h-8`, `TabsTrigger text-xs h-7` |
| `LsConfidenceBadge` | tag CSS tokens (`.tag-high`/`.tag-medium`/`.tag-low`) |
| `LsInfoPanel` | ls4x alert-card density |
| `LsCtaButton` | TanStack `useNavigate` (inner component), not `window.location.href` |

### OpenUI Lang syntax (the format the Renderer parses)

`@openuidev/react-lang@0.2.6` uses a **positional** grammar. The fixtures follow
the exact rules emitted by `library.prompt()`:

```
root = LsStack("vertical", "md", [kpis, insight, chips])
kpis = LsKpiRow([{label: "Paid Social ROI", value: "2.4x", delta: 0.26}])
insight = LsInfoPanel("tip", "Display is past saturation.", "Finding")
chips = LsSuggestionChips(["Deep-dive Display", "Create reallocation decision"])
```

Rules (authoritative — from the generated system prompt):
- The entry point **must** be named `root` and be `root = LsStack(...)`.
- **Component-call arguments are POSITIONAL** (in schema-field order). Named
  `key: value` argument syntax is NOT supported and silently breaks — write
  `LsInfoPanel("tip", "body", "Finding")`, not `LsInfoPanel(variant: "tip", …)`.
- Object literals **inside** arrays keep their `{key: value}` form — they're data
  (e.g. KPI items), not component-call args.
- Every variable except `root` must be referenced from a parent's children/items
  array, or it is silently dropped.
- Streaming-friendly order: `root = LsStack(...)` first, then children, then leaf data.

---

## 9. State, Mock Agent, Fixtures

### Zustand stores
```ts
useChatStore     // messages[], isStreaming, activeSession
useContextStore  // { module, entity, dateRange } — drives the MIA module switcher
useUiModeStore   // "executive" | "analyst" — /decisions density toggle
```

### TanStack Query mock hooks
```ts
useDecisionPacket(id)     // title, status, owner, kpis[], scenarios[]
useTemplateReadiness(id)  // score, blockers[] → drives generated template fixture
```

### Mock agent + fake SSE
`src/mocks/mockAgent.ts` maps query regexes → fixtures (9 patterns + catch-all).
`src/mocks/sseStream.ts` implements the same `TEXT_MESSAGE_CONTENT` SSE contract as
3.0's `PlannerAgentService` — swap `createFakeSSEStream` for a real `fetch` body to
go live.

13 fixtures in `src/mocks/fixtures/` (agent, mia ×4, geo, mmm, attribution, display,
decisions, cockpit, template, hitl).

---

## 10. Tests

```
src/tests/
├── setup.ts                  jest-dom + scrollIntoView/matchMedia/ResizeObserver polyfills
├── shell.test.tsx            AppSidebar nav IA + MiaProvider→Trigger→Panel toggle  (NEW)
├── openui-library.test.ts    library: 17 components, 5 groups, prompt content
├── component-behaviour.test.tsx  component schemas + descriptions
├── sseStream.test.ts         SSE reassembly + progressive deltas
├── mock-agent.test.ts        query routing patterns
├── agent-route.test.tsx      agent page heading, chat input, chips
├── decisions-route.test.tsx  Exec/Analyst toggle state
└── new-routes.test.tsx       geo/mmm/attribution/cockpit smoke tests
```

**72 tests, 11 suites, all passing.** Tests render feature pages directly (only a
`QueryClientProvider`), so they assert page chrome/headings and shell behaviour;
end-to-end fixture rendering is verified in the running app (`npm run dev`).

---

## Reference Repos (read-only — zero edits)

| Repo | Path | Informed |
|---|---|---|
| Lifesight 4.0 (design) | `../ls4x-main/` | Shell, tokens, sidebar, MIA, recommendation-card, kpi-block |
| Lifesight 3.0 (production) | `../lifesight-platform-ui/` | SSE contract, widget gaps |

---

## Production Integration (pointers)

See [`docs/integration-roadmap.md`](docs/integration-roadmap.md). In brief —
**Path A (3.0):** install `@openuidev/react-lang` + `zod@^4`, copy `src/openui/`,
drop `<Renderer>` behind a flag, feed `SYSTEM_PROMPT` to the backend agent.
**Path B (4.0):** add `openui_lang: string` to MIA/DecisionPacket responses and
render via `<Renderer>`. **Shared:** extract `src/openui/` to
`packages/@lifesight/openui`.

---

## Success Criteria

**Design alignment**
- [x] Shell visually matches ls4x at a glance — icon-rail sidebar, h-12 header, near-black canvas, teal primary, compact density
- [x] No emoji dev nav — Lucide icons throughout
- [x] MIA is a global docked panel (Alt+C / header ✨), not an orphan page
- [x] Full ls4x token parity (`--sidebar-*`, tags, text hierarchy, `.light`) + radix-mira/neutral
- [x] OpenUI component names/Zod schemas unchanged; styling-only polish

**Functionality / quality**
- [x] All 9 routes load; fixture + stream modes and toggles work
- [x] `npm run typecheck`, `lint`, `test` (72), `build` all pass
- [x] Zero edits to `ls4x-main/` or `lifesight-platform-ui/`
- [x] Generative content renders across all 9 routes + the MIA panel (fixtures
      migrated to canonical positional OpenUI Lang; Mermaid DAGs render stream-safe)

---

*Standalone POC — reference repos are read-only throughout. React 19 + Vite 6 +
TanStack + `@openuidev/react-lang@0.2.6`, shadcn/ui radix-mira (dark-first).*
