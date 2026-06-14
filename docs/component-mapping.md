# Component Mapping: OpenUI ↔ 3.0 Widgets ↔ 4.0 WidgetPlacement

This table is the migration bridge. Each row shows the correspondence between:
- The POC's OpenUI component (canonical going forward)
- The 3.0 production widget (to be deprecated)
- The 4.0 `widget_type` in `WidgetPlacement.config`

---

## Mapping Table

| OpenUI Component | 3.0 Widget | 3.0 File | 3.0 Status | 4.0 `widget_type` | 4.0 Notes |
|---|---|---|---|---|---|
| `LsStack` | — | — | N/A (layout) | N/A | Root container — no 3.0/4.0 equivalent |
| `LsCard` | — | — | N/A (layout) | N/A | Wraps content blocks — use in place of manual `div` grouping |
| `LsTabs` | — | — | N/A (layout) | N/A | Tab UI used in Decision Room |
| `LsKpiRow` | `KpiGroup` | `MarkdownWidgets/KpiGroup/` | ✅ Implemented | `kpi_block` | 3.0 KpiGroup is Redux-bound. OpenUI version is stateless |
| `LsDataTable` | `SmartTable` | `MarkdownWidgets/SmartTable/` | ✅ Implemented (table view only) | `data_table` | SmartTable has chart toggle — OpenUI uses separate `LsChart` |
| `LsComparison` | `ComparisonView` | `MarkdownWidgets/ComparisonView/` | ⚠️ Stubbed (`null` return) | N/A (not in 4.0) | **OpenUI closes this gap** — first working comparison widget |
| `LsChart` | `VegaLiteChart` | `MarkdownWidgets/VegaLiteChart/` | ✅ Implemented (Vega-Lite) | `chart` | VegaLiteChart requires full Vega spec. OpenUI wraps Recharts — simpler LLM prompt |
| `LsInfoPanel` | `InfoPanel` | `MarkdownWidgets/InfoPanel/` | ✅ Implemented | N/A (text-only in 4.0) | OpenUI adds `title` field and more variants |
| `LsStepPlan` | `StepPlan` | `MarkdownWidgets/StepPlan/` | ✅ Implemented | N/A | Direct equivalent — OpenUI version is stateless |
| `LsMermaidDiagram` | `MermaidDiagram` | `MarkdownWidgets/MermaidDiagram/` | ✅ Implemented (heuristic) | N/A | 3.0 version uses dynamic `import('mermaid')`. POC renders code block (rendering mermaid is a stretch goal) |
| `LsActionInaction` | — | — | ❌ Not present | N/A (UX_SPEC §3, not implemented) | **New 4.0 pattern** — first implementation |
| `LsScenarioMatrix` | — | — | ❌ Not present | N/A (Simulation tab, not OpenUI-driven) | **New 4.0 pattern** |
| `LsConfidenceBadge` | — | — | ❌ Not present | `confidence_gauge` (custom component) | 4.0 has `ConfidenceGauge` — OpenUI badge is the inline text version |
| `LsReadinessChecklist` | — | — | ❌ Not present | Partially in template setup UI (non-generative) | **New 4.0 pattern** — score ring + per-blocker status, data-driven from `useTemplateReadiness` |
| `LsApprovalPanel` | — | — | ❌ Not present | HITL checkpoint (AGENT_FRAMEWORK_SPEC, not implemented) | **New 4.0 pattern** — T2 governance checkpoint; fires `onAction(humanFriendlyMessage)` |
| `LsSuggestionChips` | — | — | ❌ Not present | N/A | New pattern — drives follow-up queries |
| `LsCtaButton` | — | — | ❌ Not present | N/A (links in markdown today) | Human-governed deep links — MDIP principle 3 |

---

## Gaps Closed by OpenUI

| Gap | 3.0 Situation | OpenUI Fix |
|---|---|---|
| `table` widget stubbed | `JsonRenderBlock` returns `null` for `WidgetTypeEnum.Table` | `LsDataTable` implemented and exercised in every fixture |
| `comparison` widget stubbed | `JsonRenderBlock` returns `null` for `WidgetTypeEnum.Comparison` | `LsComparison` implemented |
| `chart` widget partial | Only Vega-Lite supported (complex spec) | `LsChart` wraps Recharts — simple `{name, value}` array |
| Decision-first components | Not present in 3.0 | `LsActionInaction`, `LsScenarioMatrix`, `LsConfidenceBadge` are production-ready |
| Streaming widget rendering | Full-block parse required (no progressive render) | `<Renderer isStreaming>` renders components as they stream in |

---

## Cockpit Alert → OpenUI Component Mapping

The following table maps Sentinel / Media agent output fields to the OpenUI components used in `COCKPIT_FIXTURE` and related fixtures.

| Agent field | OpenUI component | Notes |
|---|---|---|
| `alert.title` | `LsInfoPanel` title (3rd arg) | Widget card heading |
| `alert.body` | `LsInfoPanel` content (2nd arg) | Explanation paragraph |
| `alert.severity` | `LsInfoPanel` variant + `LsSeverityBadge` | `"warning"` / `"error"` / `"info"` |
| `metrics[]` | `LsKpiRow` items array | Pace gap, revenue at risk, actual vs plan |
| `pacing.sparklines` | `LsKpiRow` spark arrays | 6-point trend per KPI tile |
| `pace_chart_data[]` | `LsChart("line", ...)` | Daily spend vs plan |
| `confidence` | `LsConfidenceBadge` | `"high"` / `"medium"` / `"low"` |
| `recommended_steps[]` | `LsStepPlan` items | Sequential remediation |
| `action_summary` + `inaction_summary` | `LsActionInaction` | Executive decision framing |
| `suggested_follow_ups[]` | `LsSuggestionChips` | Always last element |
| `decision_deep_link` | `LsCtaButton` href | Human-governed |
| `fatigue.ctr_decay[]` | `LsChart("line", ...)` | CTR over time (Media Agent) |
| `connector_health[]` | `LsReadinessChecklist` | Data Agent connector status |

See [`docs/cockpit-agent-ui-contract.md`](cockpit-agent-ui-contract.md) for the full pipeline, SSE contract, and example payloads.

---

## Migration Priority Order (3.0 → OpenUI)

1. **`table`** — highest frequency widget, currently broken. Drop-in `LsDataTable`.
2. **`chart`** — VegaLite spec is complex for LLMs. `LsChart` is simpler to prompt.
3. **`comparison`** — currently stubbed. `LsComparison` is a direct replacement.
4. **`kpi`** — `KpiGroup` works but is Redux-coupled. `LsKpiRow` is lighter.
5. **`info` / `steps`** — lowest urgency, current implementations work.
