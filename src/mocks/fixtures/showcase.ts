/**
 * Component Showcase fixtures — minimal, canonical OpenUI Lang exercising every
 * Ls* component. Each SECTION is a standalone program (root = LsStack(...)) used
 * for instant per-component rendering; SHOWCASE_FIXTURE nests all of them in one
 * stack for the "Stream all" demo.
 *
 * Grammar reminder: positional args, `root` entry point, children referenced or
 * inline. See README "OpenUI Lang syntax".
 */

export interface ShowcaseSection {
  name: string
  description: string
  fixture: string
}

export const SHOWCASE_SECTIONS: ShowcaseSection[] = [
  {
    name: "LsStack",
    description: "Root layout container — stacks children vertically or horizontally.",
    fixture: `root = LsStack("horizontal", "md", [a, b])
a = LsKpiRow([{label: "Left", value: "1"}])
b = LsKpiRow([{label: "Right", value: "2"}])`,
  },
  {
    name: "LsCard",
    description: "Surfaced content block with an optional title.",
    fixture: `root = LsStack("vertical", "md", [c])
c = LsCard("Quarterly Summary", [body])
body = LsInfoPanel("tip", "Cards group related content under a heading.")`,
  },
  {
    name: "LsTabs",
    description: "Tabbed container for multi-view content.",
    fixture: `root = LsStack("vertical", "md", [t])
t = LsTabs([{label: "Overview", children: [ov]}, {label: "Detail", children: [dt]}], "Overview")
ov = LsInfoPanel("info", "The Overview tab content.")
dt = LsInfoPanel("success", "The Detail tab content.")`,
  },
  {
    name: "LsKpiRow",
    description: "Row of KPI tiles with optional delta colouring.",
    fixture: `root = LsStack("vertical", "md", [k])
k = LsKpiRow([{label: "Revenue", value: "$2.4M", delta: 0.12}, {label: "ROAS", value: "3.1x", delta: 0.08}, {label: "CAC", value: "$42", delta: -0.05, positive_direction: false}])`,
  },
  {
    name: "LsDataTable",
    description: "Tabular data with header row and caption.",
    fixture: `root = LsStack("vertical", "md", [t])
t = LsDataTable(["Channel", "Spend", "ROI"], [["Paid Social", "$1.2M", "2.4x"], ["Search", "$800K", "3.1x"], ["Display", "$300K", "0.9x"]], "Q4 2025 · MMM v2.3")`,
  },
  {
    name: "LsComparison",
    description: "Three-column comparison table (Metric | A | B).",
    fixture: `root = LsStack("vertical", "md", [c])
c = LsComparison(["Metric", "Treatment", "Control"], [["Avg Revenue", "$1.24M", "$1.05M"], ["Conversion Rate", "3.8%", "3.2%"], ["CAC", "$39", "$46"]])`,
  },
  {
    name: "LsChart",
    description: "Bar or line chart (single or dual series).",
    fixture: `root = LsStack("vertical", "md", [bar, line])
bar = LsChart("bar", [{name: "Jan", value: 120}, {name: "Feb", value: 150}, {name: "Mar", value: 135}], "Monthly spend ($K)")
line = LsChart("line", [{name: "W1", value: 100, value2: 90}, {name: "W2", value: 115, value2: 95}, {name: "W3", value: 130, value2: 98}], "Treatment vs control", "Control")`,
  },
  {
    name: "LsInfoPanel",
    description: "Callout panel — info / warning / success / error / tip variants.",
    fixture: `root = LsStack("vertical", "md", [w, t])
w = LsInfoPanel("warning", "Paid Social is pacing 18% ahead of plan.", "Budget Alert")
t = LsInfoPanel("tip", "Reallocate to higher-iROAS channels before Q4 peak.", "Recommendation")`,
  },
  {
    name: "LsStepPlan",
    description: "Numbered step list for workflows and remediation.",
    fixture: `root = LsStack("vertical", "md", [s])
s = LsStepPlan("Remediation steps", ["Review campaign delivery in Meta Ads Manager", "Shift $300K from Display to Paid Social", "Monitor ROI vs forecast for 48h"])`,
  },
  {
    name: "LsMermaidDiagram",
    description: "Mermaid diagram (causal DAG, flowchart) rendered to SVG.",
    fixture: `root = LsStack("vertical", "md", [d])
d = LsMermaidDiagram("graph TD\\n  S[Spend] -->|Adstock| A[Adstock]\\n  A -->|Saturation| R[Revenue]", "Simple causal chain")`,
  },
  {
    name: "LsActionInaction",
    description: "Executive dual-card — Act vs Don't Act framing.",
    fixture: `root = LsStack("vertical", "md", [a])
a = LsActionInaction("Reallocate $800K to Paid Social", "Shift budget to the higher-iROAS channel before the Q4 peak.", [{label: "Projected ROI", value: "2.4x"}, {label: "Incremental Revenue", value: "+$2.1M"}], "Keep current allocation", "Leaves $2.1M of incremental revenue on the table.", [{label: "Opportunity Cost", value: "$2.1M"}, {label: "Display Waste", value: "$300K/mo"}])`,
  },
  {
    name: "LsScenarioMatrix",
    description: "Simulation scenarios with budget delta, ROI, and confidence.",
    fixture: `root = LsStack("vertical", "md", [m])
m = LsScenarioMatrix([{name: "Conservative", budget_delta_pct: 10, roi_forecast: 2.0, confidence: "high"}, {name: "Balanced", budget_delta_pct: 25, roi_forecast: 2.4, confidence: "high", recommended: true}, {name: "Aggressive", budget_delta_pct: 40, roi_forecast: 2.6, confidence: "medium"}])`,
  },
  {
    name: "LsConfidenceBadge",
    description: "Inline model-confidence pill (high / medium / low).",
    fixture: `root = LsStack("horizontal", "sm", [h, m, l])
h = LsConfidenceBadge("high", "High confidence")
m = LsConfidenceBadge("medium", "Medium confidence")
l = LsConfidenceBadge("low", "Low confidence")`,
  },
  {
    name: "LsReadinessChecklist",
    description: "Template activation readiness — score ring + per-requirement status.",
    fixture: `root = LsStack("vertical", "md", [r])
r = LsReadinessChecklist(72, [{label: "Media spend data", status: "connected", detail: "Last sync 2h ago"}, {label: "Attribution model", status: "connected", detail: "MMM v2.3 active"}, {label: "Conversion events", status: "low_quality", detail: "< 30 days history"}], 100, "Media Reallocation")`,
  },
  {
    name: "LsApprovalPanel",
    description: "HITL governance checkpoint — tier badge + Approve/Reject.",
    fixture: `root = LsStack("vertical", "md", [p])
p = LsApprovalPanel("T2", "CMO", "Nov 14, 2025 17:00 GMT", "Approve the $800K Display to Paid Social reallocation.", "Approve — Proceed", "Send Back")`,
  },
  {
    name: "LsSuggestionChips",
    description: "Clickable follow-up query chips (always last in a response).",
    fixture: `root = LsStack("vertical", "md", [c])
c = LsSuggestionChips(["Explain the MMM methodology", "Show scenario comparison", "Create a reallocation decision"])`,
  },
  {
    name: "LsCtaButton",
    description: "Human-governed CTA — navigates or triggers an action.",
    fixture: `root = LsStack("vertical", "md", [b])
b = LsCtaButton("Open Decision Room", "/decisions/media-reallocation-001", "primary")`,
  },
  {
    name: "LsConfidenceGauge",
    description: "Score ring (0–100) for statistical power or model confidence.",
    fixture: `root = LsStack("vertical", "md", [g])
g = LsConfidenceGauge(87, "Statistical power", "12 matched DMAs · synthetic control")`,
  },
  {
    name: "LsStatHero",
    description: "Big headline metric with delta and sublabel.",
    fixture: `root = LsStack("vertical", "md", [h])
h = LsStatHero("Revenue at Risk", "$714K", -0.23, "if pace continues")`,
  },
  {
    name: "LsSeverityBadge",
    description: "Severity pill — critical / high / medium / low / info.",
    fixture: `root = LsStack("horizontal", "sm", [c, h, m, l, i])
c = LsSeverityBadge("critical", "Critical")
h = LsSeverityBadge("high", "High")
m = LsSeverityBadge("medium", "Medium")
l = LsSeverityBadge("low", "Low")
i = LsSeverityBadge("info", "Info")`,
  },
  {
    name: "LsMetadataChip",
    description: "Inline key/value metadata chip.",
    fixture: `root = LsStack("horizontal", "sm", [a, b, c])
a = LsMetadataChip("Trained", "Jan–Dec 2025")
b = LsMetadataChip("Method", "Bayesian MMM")
c = LsMetadataChip("Paid Social iROAS", "2.1x")`,
  },
]

/** Names in registry order — used to render the coverage checklist. */
export const SHOWCASE_COMPONENT_NAMES = SHOWCASE_SECTIONS.map((s) => s.name)

/**
 * One combined program nesting every component in a titled card, for the
 * "Stream all" demo. Inline nesting keeps it a single self-contained program.
 */
export const SHOWCASE_FIXTURE = `root = LsStack("vertical", "lg", [intro, heroCard, severityCard, gaugeCard, metaCard, kpiCard, tableCard, chartCard, actionCard, scenarioCard, confCard, infoCard, stepCard, dagCard, readyCard, approveCard, tabsCard, chipsCard, ctaCard])
intro = LsInfoPanel("info", "Every Ls* component below is rendered from a single streamed OpenUI Lang program — the same path a live agent response takes.", "OpenUI Component Showcase")
heroCard = LsCard("LsStatHero", [LsStatHero("Revenue at Risk", "$714K", -0.23, "if pace continues")])
severityCard = LsCard("LsSeverityBadge", [LsSeverityBadge("high", "Budget Pace — High Severity"), LsSeverityBadge("critical", "Data Outage — Critical"), LsSeverityBadge("info", "Model Retrained — Info")])
gaugeCard = LsCard("LsConfidenceGauge", [LsConfidenceGauge(87, "Statistical power", "12 matched DMAs · synthetic control")])
metaCard = LsCard("LsMetadataChip", [LsMetadataChip("Trained", "Jan–Dec 2025"), LsMetadataChip("Method", "Bayesian MMM"), LsMetadataChip("Paid Social iROAS", "2.1x")])
kpiCard = LsCard("LsKpiRow", [LsKpiRow([{label: "Revenue", value: "$2.4M", delta: 0.12}, {label: "ROAS", value: "3.1x", delta: 0.08}, {label: "CAC", value: "$42", delta: -0.05, positive_direction: false}, {label: "Incremental", value: "+$2.1M", delta: 0.31}])])
tableCard = LsCard("LsDataTable + LsComparison", [LsDataTable(["Channel", "Spend", "ROI"], [["Paid Social", "$1.2M", "2.4x"], ["Search", "$800K", "3.1x"], ["Display", "$300K", "0.9x"]], "Q4 2025 · MMM v2.3"), LsComparison(["Metric", "Treatment", "Control"], [["Avg Revenue", "$1.24M", "$1.05M"], ["Conversion Rate", "3.8%", "3.2%"]])])
chartCard = LsCard("LsChart", [LsChart("bar", [{name: "Jan", value: 120}, {name: "Feb", value: 150}, {name: "Mar", value: 135}], "Monthly spend ($K)"), LsChart("line", [{name: "W1", value: 100, value2: 90}, {name: "W2", value: 115, value2: 95}, {name: "W3", value: 130, value2: 98}], "Treatment vs control", "Control")])
actionCard = LsCard("LsActionInaction", [LsActionInaction("Reallocate $800K to Paid Social", "Shift budget to the higher-iROAS channel before the Q4 peak.", [{label: "Projected ROI", value: "2.4x"}, {label: "Incremental Revenue", value: "+$2.1M"}], "Keep current allocation", "Leaves $2.1M of incremental revenue on the table.", [{label: "Opportunity Cost", value: "$2.1M"}])])
scenarioCard = LsCard("LsScenarioMatrix", [LsScenarioMatrix([{name: "Conservative", budget_delta_pct: 10, roi_forecast: 2.0, confidence: "high"}, {name: "Balanced", budget_delta_pct: 25, roi_forecast: 2.4, confidence: "high", recommended: true}, {name: "Aggressive", budget_delta_pct: 40, roi_forecast: 2.6, confidence: "medium"}])])
confCard = LsCard("LsConfidenceBadge", [LsConfidenceBadge("high", "High confidence", "12 matched DMAs · Power 0.87")])
infoCard = LsCard("LsInfoPanel", [LsInfoPanel("warning", "Paid Social is pacing 18% ahead of plan.", "Budget Alert"), LsInfoPanel("tip", "Reallocate to higher-iROAS channels.", "Recommendation")])
stepCard = LsCard("LsStepPlan", [LsStepPlan("Remediation steps", ["Review campaign delivery", "Shift $300K from Display to Paid Social", "Monitor ROI vs forecast for 48h"])])
dagCard = LsCard("LsMermaidDiagram", [LsMermaidDiagram("graph TD\\n  S[Spend] -->|Adstock| A[Adstock]\\n  A -->|Saturation| R[Revenue]", "Simple causal chain")])
readyCard = LsCard("LsReadinessChecklist", [LsReadinessChecklist(72, [{label: "Media spend data", status: "connected", detail: "2h ago"}, {label: "Attribution model", status: "connected", detail: "MMM v2.3"}, {label: "Conversion events", status: "low_quality", detail: "< 30 days"}], 100, "Media Reallocation")])
approveCard = LsCard("LsApprovalPanel", [LsApprovalPanel("T2", "CMO", "Nov 14, 2025", "Approve the $800K reallocation.", "Approve — Proceed", "Send Back")])
tabsCard = LsCard("LsTabs", [LsTabs([{label: "Overview", children: [tabA]}, {label: "Detail", children: [tabB]}], "Overview")])
tabA = LsInfoPanel("info", "The Overview tab content.")
tabB = LsInfoPanel("success", "The Detail tab content.")
chipsCard = LsCard("LsSuggestionChips", [LsSuggestionChips(["Explain the MMM methodology", "Show scenario comparison", "Create a reallocation decision"])])
ctaCard = LsCard("LsCtaButton", [LsCtaButton("Open Decision Room", "/decisions/media-reallocation-001", "primary")])`
