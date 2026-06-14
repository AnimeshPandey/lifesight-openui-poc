/**
 * OpenUI Lang fixture for /agent route.
 * Scenario: "Explain Q4 paid social ROI"
 * Components exercised: LsKpiRow, LsDataTable, LsComparison, LsInfoPanel, LsSuggestionChips
 */
export const AGENT_FIXTURE = `root = LsStack("vertical", "md", [kpis, breakdown, compare, chart, insight, chips])
kpis = LsKpiRow([{label: "Paid Social ROI", value: "2.4x", delta: 0.26, positive_direction: true}, {label: "Paid Social ROAS", value: "3.2x", delta: 0.14}, {label: "Incremental Revenue", value: "$2.88M", delta: 0.18}, {label: "Blended CAC", value: "$42", delta: -0.08, positive_direction: false}])
breakdown = LsDataTable(["Channel", "Spend ($K)", "Rev ($K)", "ROI", "vs LQ"], [["Paid Social", "1,200", "2,880", "2.4x", "+26%"], ["Paid Search", "800", "2,400", "3.0x", "+8%"], ["Display", "300", "270", "0.9x", "-22%"], ["Affiliate", "150", "480", "3.2x", "+5%"]], "Q4 2025 (Oct–Dec). Source: MMM v2.3, R² 0.94")
compare = LsComparison(["Metric", "Q4 2025", "Q3 2025"], [["Blended ROI", "2.4x", "1.9x"], ["Paid Social ROAS", "3.2x", "2.7x"], ["Display ROAS", "0.9x", "1.1x"], ["Total Spend", "$2.45M", "$2.2M"]])
chart = LsChart("bar", [{name: "Paid Social", value: 2.4}, {name: "Search", value: 3.0}, {name: "Affiliate", value: 3.2}, {name: "Display", value: 0.9}], "Channel ROI — Q4 2025")
insight = LsInfoPanel("tip", "Display is underperforming attribution-adjusted benchmarks by 22%. Reallocating $300K from Display to Paid Social projects +$540K incremental revenue in Q1 with high model confidence.", "MMM Model Insight")
chips = LsSuggestionChips(["Explore Meta vs Google split", "View attribution model confidence", "Create media reallocation decision", "Compare to category benchmarks"])`
