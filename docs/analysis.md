# Comparative Analysis: 3.0 json-render vs 4.0 WidgetPlacement vs OpenUI

> Informed by reading `lifesight-platform-ui/src/components/AgentChatWindow/MarkdownWidgets/` (3.0)
> and `ls4x-main/frontend/lib/api/artifacts.ts`, `docs/specs/UX_SPEC.md` (4.0).

---

## Audit Matrix

| Dimension | 3.0 json-render + heuristics | 4.0 WidgetPlacement | OpenUI (`@openuidev/react-lang`) |
|---|---|---|---|
| **Token efficiency** | ❌ High — LLM must emit full JSON blobs inside markdown code fences. `table` and `chart` are stubbed so LLM wastes tokens on unsupported payloads | ⚠️ Medium — `WidgetPlacement` is a grid config object, not LLM-native. LLM cannot generate it directly; backend must translate | ✅ Low — OpenUI Lang is a purpose-built minimal syntax. Component calls are 30–60% fewer tokens than equivalent JSON blobs |
| **Streaming UX** | ⚠️ Broken for structured widgets — heuristic detection (`detectVegaLiteSpec`) requires the full code block before parsing. Shows raw markdown until stream ends | ❌ Not streaming-native — `WidgetPlacement` is a static grid snapshot, not designed for progressive rendering | ✅ First-class — `<Renderer isStreaming>` renders valid components as they appear in the stream. Layout structure renders before data fills in |
| **Type safety** | ❌ Runtime-only — `JsonRenderPayload` types exist but `JSON.parse()` on the LLM output is unvalidated at runtime. `table`/`chart`/`comparison` bodies are `any` in `JsonRenderBlock` | ⚠️ Partial — `WidgetPlacement.config` is `Record<string, unknown>`. Widget-specific schemas exist per `widget_type` but aren't enforced end-to-end | ✅ Full — Zod schemas on every component's `props`. The `Renderer` validates and coerces at parse time. Invalid props are logged to `onError`, not silently rendered |
| **Component reuse across 3.0/4.0** | ❌ Zero — 3.0 widgets (`SmartTable`, `KpiGroup`, `ComparisonView`, `VegaLiteChart`) are deeply tied to Redux + SCSS Modules. 4.0 doesn't use any of them | ❌ Zero — 4.0 `WidgetPlacement` renderer uses Next.js `dynamic()` imports + Next.js-specific state. Not portable to 3.0 | ✅ Full — `createLibrary()` produces a portable schema. The same 15 components can be imported into both production codebases once migrated |
| **Tool/MCP integration** | ❌ Not supported | ❌ Not supported | ✅ Built-in — `toolProvider` prop accepts a function map or MCP client (`McpClientLike`). Components can call `Query()` / `Mutation()` directly in OpenUI Lang |
| **Migration path to production** | N/A (origin) | N/A (greenfield) | ✅ Incremental — drop `<Renderer>` alongside existing `<JsonRenderBlock>`. Route specific widget types to OpenUI first (e.g. `table`, `chart`). Deprecate heuristic pipeline over 2–3 sprints |
| **Testability** | ⚠️ Hard — heuristic detection is stateful, tied to `isStreaming` context prop. Flash-of-unstyled-content (FOUC) bugs require `useState` lazy init guards | ⚠️ Hard — grid layout requires visual regression testing | ✅ Easy — `library.components` is a plain object. Component schemas are unit-testable with Zod. `createFakeSSEStream` + `readSSEStream` test streaming without a real backend |
| **LLM prompt surface** | ❌ Implicit — LLM must infer JSON schema from few-shots only | ❌ Implicit — LLM is never told about WidgetPlacement | ✅ Explicit — `library.prompt()` generates a typed system prompt with signatures, groups, and examples. The LLM knows exactly what components exist and what props they accept |

---

## Key Findings

### Why 3.0 json-render has gaps
- `table`, `chart`, and `comparison` widgets are **stubbed** in `JsonRenderBlock.component.tsx` — their JSON payloads are parsed but the renderers return `null`. The LLM generates them but they never display.
- Detection is heuristic: `isJsonRenderLanguage()` checks the markdown code fence language tag. Any variation in LLM output (e.g., `json` instead of `json-render`) silently falls through to raw `<code>`.
- Redux dependency means widget state can't be tested in isolation.

### Why 4.0 WidgetPlacement isn't streaming-native
- `WidgetPlacement` is a grid-position + config object produced by the backend, not the LLM. It requires a separate "assemble artifact" step after the LLM response.
- The MIA panel in 4.0 is currently text-only (`frontend/lib/mia/types.ts` — no widget fields). OpenUI is the mechanism to change this.

### Why OpenUI wins for this use case
- The POC proves **structure-before-data** streaming: KPI tile shells appear at ~800ms into stream, data fills in by ~2s — far better UX than waiting for the full JSON blob.
- `library.prompt()` closes the LLM alignment gap. Every component name, signature, and group note is injected into the system prompt automatically. No manual few-shot maintenance.
- MCP integration (`toolProvider`) means future agents can call Lifesight data tools (`getChannelMetrics`, `runScenario`) directly from OpenUI Lang without a separate backend translation layer.

---

## Architecture Decision: Standalone POC vs Patching Production

A standalone POC was chosen over patching 3.0/4.0 for three reasons:
1. **Risk isolation** — 3.0 is production traffic. A bad Zod import or Tailwind 4 conflict should never reach customers.
2. **Stack freedom** — The POC demonstrates the *target* stack (React 19, Vite 6, TanStack Router, Zustand) which 4.0 is directionally aligned with but 3.0 is not (React 18, CRA/Vite 5, Redux).
3. **Clean comparison** — Running all three rendering approaches (json-render, WidgetPlacement, OpenUI) side-by-side in the same session would require complex feature flags. Separate repo makes the comparison clean.

---

## Production Backend Contract

In production, the backend agent (ADK / Claude API) would output OpenUI Lang chunks over an SSE connection. The event shape is:

```ts
// Already used in 3.0 PlannerAgentService — no change needed
type AgentStreamEvent =
  | { type: "TEXT_MESSAGE_CONTENT"; delta: string }  // OpenUI Lang chunk
  | { type: "THOUGHT_TRACE"; trace: string }          // unchanged
  | { type: "RUN_FINISHED" }                          // unchanged
```

The only backend change: replace markdown/JSON output with OpenUI Lang output. The frontend `<Renderer isStreaming>` handles the rest.

---

## Risks and Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| LLM drift (generates unknown component names) | Medium | `onError` callback receives `OpenUIError[]` with unknown component names — feed back to LLM for self-correction |
| Zod v4 `zod/v4` subpath compatibility in bundler | Low | Confirmed: `zod@^4` exports `zod/v4` subpath. All component schemas compile without issues |
| Bundle size (`@openuidev/react-lang` + Recharts) | Medium | Recharts is already in many frontend stacks. `react-lang` is 188KB unpacked — acceptable for analytics SaaS. Split-chunk on route boundary if needed |
| Accessibility of generated layouts | Medium | All shadcn/Radix primitives are ARIA-compliant. `LsSuggestionChips` uses `<button>`. `LsCtaButton` wraps shadcn `<Button>`. No naked `<div>` click handlers |
| OpenUI Lang syntax changes in future releases | Low | Pin `@openuidev/react-lang@^0.2.x` with lockfile. Breaking changes follow semver major |
