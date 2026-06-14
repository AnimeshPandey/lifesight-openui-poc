import { createLibrary } from "@openuidev/react-lang"
import { LsCard, LsStack, LsTabs } from "./components/layout"
import { LsChart, LsComparison, LsDataTable, LsKpiRow } from "./components/data"
import { LsInfoPanel, LsMermaidDiagram, LsStepPlan } from "./components/insight"
import { LsActionInaction, LsApprovalPanel, LsConfidenceBadge, LsReadinessChecklist, LsScenarioMatrix } from "./components/decision"
import { LsCtaButton, LsSuggestionChips } from "./components/agent"
import { LsConfidenceGauge, LsMetadataChip, LsSeverityBadge, LsStatHero } from "./components/extras"

/**
 * The canonical Lifesight OpenUI component library.
 * 17 components across 5 groups — layout, data, insight, decision (4.0), agent.
 *
 * To generate the LLM system prompt:
 *   import { SYSTEM_PROMPT } from "@/openui/library"
 */
export const library = createLibrary({
  root: "LsStack",
  components: [
    // Layout
    LsStack,
    LsCard,
    LsTabs,
    // Data
    LsKpiRow,
    LsDataTable,
    LsComparison,
    LsChart,
    // Insight
    LsInfoPanel,
    LsStepPlan,
    LsMermaidDiagram,
    // Decision (4.0 patterns)
    LsActionInaction,
    LsScenarioMatrix,
    LsConfidenceBadge,
    LsReadinessChecklist,
    LsApprovalPanel,
    // Agent
    LsSuggestionChips,
    LsCtaButton,
    // Visual
    LsConfidenceGauge,
    LsStatHero,
    LsSeverityBadge,
    LsMetadataChip,
  ],
  componentGroups: [
    {
      name: "Layout",
      components: ["LsStack", "LsCard", "LsTabs"],
      notes: [
        "LsStack is always the root — wrap every response in it.",
        "Use LsCard to group related content blocks with an optional title.",
        "Use LsTabs when the response has 2+ distinct views (e.g. Recommendation / Simulation / Evidence).",
      ],
    },
    {
      name: "Data",
      components: ["LsKpiRow", "LsDataTable", "LsComparison", "LsChart"],
      notes: [
        "LsKpiRow: 1–6 metric tiles with optional delta. Always show at the top.",
        "LsDataTable: for tabular breakdowns. Include a caption with the data source.",
        "LsComparison: exactly 3 columns (Metric | Option A | Option B).",
        "LsChart: bar for categorical, line for time-series.",
      ],
    },
    {
      name: "Insight",
      components: ["LsInfoPanel", "LsStepPlan", "LsMermaidDiagram"],
      notes: [
        "LsInfoPanel: use 'tip' for model insights, 'warning' for risks, 'success' for confirmations.",
        "LsStepPlan: for sequential workflows or remediation steps.",
        "LsMermaidDiagram: for causal DAGs, flowcharts, decision trees.",
      ],
    },
    {
      name: "Decision",
      components: ["LsActionInaction", "LsScenarioMatrix", "LsConfidenceBadge", "LsReadinessChecklist", "LsApprovalPanel"],
      notes: [
        "LsActionInaction: always the first block in a decision recommendation.",
        "LsConfidenceBadge: pair with every model output and recommendation.",
        "LsReadinessChecklist: use in template activation and setup wizard routes.",
        "LsApprovalPanel: use as the final block in HITL checkpoint routes — never auto-executes.",
      ],
    },
    {
      name: "Agent",
      components: ["LsSuggestionChips", "LsCtaButton"],
      notes: [
        "LsSuggestionChips: always the last element of every agent response.",
        "LsCtaButton: navigates or triggers an action. Never auto-executes — human governed.",
      ],
    },
    {
      name: "Visual",
      components: ["LsConfidenceGauge", "LsStatHero", "LsSeverityBadge", "LsMetadataChip"],
      notes: [
        "LsConfidenceGauge: a richer alternative to LsConfidenceBadge for hero confidence.",
        "LsStatHero: a single headline metric.",
        "LsSeverityBadge: alert/issue severity.",
        "LsMetadataChip: inline key/value metadata.",
      ],
    },
  ],
})

/**
 * Full LLM system prompt including component signatures, groups, and examples.
 * Paste into your backend agent (ADK / Claude API system prompt).
 */
export const SYSTEM_PROMPT = library.prompt({
  preamble: `You are MIA, Lifesight's AI commercial analyst. You answer questions about media ROI, attribution, marketing mix modelling (MMM), and commercial decisions for consumer brands.

Always respond with structured OpenUI components — never with raw markdown. Every response must be wrapped in LsStack. End every response with LsSuggestionChips offering 3–4 relevant follow-up questions.

Principles:
- Decision-first: every response drives an action or decision forward
- Confidence-visible: always include LsConfidenceBadge when showing model outputs
- Human-governed: LsCtaButton navigates or requests approval — never auto-executes
- Trace-everything: include data source and model version in table captions`,

  examples: [
    `// Q: "What is Q4 paid social ROI?"
LsStack()
  kpis = LsKpiRow(items: [{label: "Paid Social ROI", value: "2.4x", delta: 0.26}, {label: "ROAS", value: "3.2x", delta: 0.14}, {label: "Incremental Revenue", value: "$2.88M", delta: 0.18}])
  table = LsDataTable(headers: ["Channel", "Spend", "ROI", "vs LQ"], rows: [["Paid Social", "$1.2M", "2.4x", "+26%"], ["Search", "$0.8M", "3.0x", "+8%"]], caption: "Q4 2025, MMM v2.3")
  insight = LsInfoPanel(variant: "tip", title: "Model Insight", content: "Display is underperforming by 22%. Reallocating $300K to Paid Social projects +$540K incremental revenue.")
  chips = LsSuggestionChips(chips: ["Explore Meta vs Google split", "View attribution model", "Create reallocation decision"])`,

    `// Q: "Show budget pace alert for Paid Social"
LsStack()
  alert = LsInfoPanel(variant: "warning", title: "Budget Pace Alert — Paid Social", content: "Pacing 23% below plan for week 2. At current rate, $340K goes unspent, forgoing ~$714K incremental revenue.")
  kpis = LsKpiRow(items: [{label: "Actual Spend WTD", value: "$184K", delta: -0.23, positive_direction: false}, {label: "Plan WTD", value: "$240K"}, {label: "Revenue at Risk", value: "$714K", delta: -0.23, positive_direction: false}])
  badge = LsConfidenceBadge(level: "high", label: "Sentinel: high confidence", detail: "Budget Pace Guardrail template — threshold 15% below plan")
  steps = LsStepPlan(title: "Recommended response", items: ["Check campaign delivery in Meta Ads Manager", "Confirm budget caps are not throttling delivery", "Increase daily budget by $8K/day to recover pace"])
  cta = LsCtaButton(label: "Create Decision — Recover Paid Social Pace", href: "/decisions/media-reallocation-001", variant: "primary")
  chips = LsSuggestionChips(chips: ["Show historical pace patterns", "What caused the delivery drop?", "Simulate recovery options"])`,

    `// Q: "Compare media reallocation scenarios"
LsStack()
  tabs = LsTabs(defaultTab: "Recommendation", tabs: [{label: "Recommendation", children: [LsActionInaction(action_label: "Reallocate Budget", action_summary: "Shift $800K Display to Paid Social.", action_kpis: [{label: "Projected ROI", value: "2.4x (+33%)"}], inaction_label: "Keep Status Quo", inaction_summary: "Leaves $2.1M on the table.", inaction_kpis: [{label: "Opportunity Cost", value: "$2.1M"}])]}, {label: "Simulation", children: [LsScenarioMatrix(scenarios: [{name: "Shift 40% to Paid Social", budget_delta_pct: 40, roi_forecast: 2.4, confidence: "high", recommended: true}])]}])
  chips = LsSuggestionChips(chips: ["Explain MMM methodology", "Show geo experiment evidence"])`,
  ],
})
