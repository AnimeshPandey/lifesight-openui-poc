# Production Integration Roadmap

Two integration paths: migrating 3.0 agent widgets, and enabling 4.0 MIA/Decision Room generative layouts.

---

## Path A — 3.0 Agent Widget Migration

**Goal:** Replace the `json-render` heuristic pipeline in `lifesight-platform-ui` with OpenUI, closing the stubbed `table`, `chart`, and `comparison` widget gaps.

**Estimated effort:** 2–3 sprints (4–6 weeks)

### Phase A1: Install + parallel rendering (Sprint 1)
- `npm install @openuidev/react-lang zod@^4` in `lifesight-platform-ui`
- Copy `src/openui/` from this POC into `lifesight-platform-ui/src/openui/`
- Add `<Renderer>` alongside existing `<JsonRenderBlock>` behind a feature flag (`VITE_ENABLE_OPENUI`)
- Both renderers receive the same SSE `delta` stream — `Renderer` wins if it parses successfully, falls back to `JsonRenderBlock`
- **Risk:** Zod v4 peer dep. Verify no conflict with existing `zod@^3` usage in `lifesight-platform-ui`

### Phase A2: Deprecate stubbed widgets (Sprint 2)
- Remove `null` returns from `JsonRenderBlock` for `table`, `chart`, `comparison`
- Route these widget types to OpenUI `LsDataTable`, `LsChart`, `LsComparison`
- Update backend agent system prompt with `library.prompt()` output (from `SYSTEM_PROMPT` export)
- A/B test: 50% traffic to OpenUI renderer, 50% to json-render
- Acceptance: no increase in LLM parse error rate, widget render rate improves from ~60% to >95%

### Phase A3: Full cutover (Sprint 3)
- Remove `JsonRenderBlock`, `SmartTable`, `KpiGroup`, `ComparisonView`, `VegaLiteChart` heuristic pipeline
- `<Renderer>` is the only code path for agent responses
- Remove `VITE_ENABLE_OPENUI` flag
- Decompose SCSS Modules from deprecated components (no side effects on shared styles)

### Backend contract (no changes required)
```ts
// 3.0 PlannerAgentService SSE events — unchanged
type AgentStreamEvent =
  | { type: "TEXT_MESSAGE_CONTENT"; delta: string }  // now contains OpenUI Lang chunks
  | { type: "THOUGHT_TRACE"; trace: ... }            // unchanged
  | { type: "RUN_FINISHED" }                         // unchanged
```

The only backend change: instruct the agent (ADK / Claude API) to output OpenUI Lang instead of `json-render` code blocks. The `SYSTEM_PROMPT` export from `library.ts` is the updated system prompt.

---

## Path B — 4.0 MIA Panel + Decision Room

**Goal:** Replace text-only MIA responses and static Decision Room tabs with OpenUI generative layouts in `ls4x-main`.

**Estimated effort:** 3–4 sprints (6–8 weeks, includes backend agent changes)

### Phase B1: MIA inline widgets (Sprint 1–2)
- Install `@openuidev/react-lang` in `ls4x-main/frontend`
- Copy `src/openui/` from POC (already uses Tailwind 4 + shadcn dark — zero style migration needed)
- Replace `frontend/lib/mia/types.ts` text-only response with `{ content: string; openui?: string }`
- When `openui` field is present, render via `<Renderer>` instead of `<ReactMarkdown>`
- Backend: update MIA agent system prompt with `library.prompt()`

### Phase B2: Decision Room generative tabs (Sprint 2–3)
- Replace hardcoded Recommendation/Simulation/Evidence tab content with `<Renderer>` per tab
- Backend Decision agent outputs `openui_lang` field alongside `DecisionPacket`
- `LsTabs`, `LsActionInaction`, `LsScenarioMatrix` are already production-ready from this POC

### Phase B3: Cockpit sentinel alerts (Sprint 3–4)
- Sentinel agent (Temporal workflow) outputs OpenUI Lang for alert cards
- Replace current text alert cards with `<Renderer isStreaming>` to show progressive alert assembly
- `LsInfoPanel` (warning variant) + `LsConfidenceBadge` + `LsCtaButton` is the exact pattern

### Shared library (cross-project)
Once both 3.0 and 4.0 integrate OpenUI, extract the component library as a shared internal package:

```
packages/
  lifesight-openui/
    src/
      components/   ← all 15 components
      library.ts    ← createLibrary() + SYSTEM_PROMPT
    package.json    ← { "name": "@lifesight/openui" }
```

Both `lifesight-platform-ui` and `ls4x-main/frontend` depend on `@lifesight/openui`. Component updates propagate to both products automatically.

---

## Hook Points for Real LLM Integration

```ts
// Today (POC): static fixture
setResponse(AGENT_FIXTURE)

// Production: POST SSE to agent backend
const response = await fetch("/api/agent/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  body: JSON.stringify({ message, sessionId, context }),
  signal: controller.signal,
})
const reader = response.body!.getReader()
// ... readSSEStream(reader, onDelta) — identical to POC mock
```

The `readSSEStream` utility in `src/mocks/sseStream.ts` can be used as-is for the real backend connection — only the stream source changes.

---

## Decision: When to Ship to Production

Recommended gate before production deployment:
1. ✅ `library.prompt()` output reviewed by LLM engineering team — confirm token budget
2. ✅ A/B test on 5% of AskMia traffic — measure widget render rate and LLM error rate
3. ✅ Accessibility audit of all 15 components (WCAG 2.2 AA)
4. ✅ Bundle size regression check — `@openuidev/react-lang` + Recharts must not increase main bundle by >10%
5. ✅ Rollback plan: `VITE_ENABLE_OPENUI=0` feature flag reverts to json-render in minutes
