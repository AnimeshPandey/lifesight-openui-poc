/**
 * OpenUI Lang fixture for conversational agent.
 * Query: "What drove Display underperformance?" / "Why is Display so bad?"
 * Proves: LsKpiRow, LsChart (bar + line), LsComparison, LsInfoPanel, LsStepPlan, LsCtaButton
 */
export const DISPLAY_FIXTURE = `root = LsStack("vertical", "md", [summary, kpis, causes, satCurve, compare, fix, cta, chips])
summary = LsInfoPanel("warning", "Display iROAS of 0.4x (vs. 1.8x blended average) is driven by three compounding factors: saturation at current spend levels, view-through inflation in GA4 reporting, and audience overlap with Paid Social.", "Display Underperformance — 3 Root Causes Identified")
kpis = LsKpiRow([{label: "Display iROAS", value: "0.4x", delta: -0.22, positive_direction: false}, {label: "vs Blended iROAS", value: "−1.4x", delta: -0.78, positive_direction: false}, {label: "Saturation %", value: "94%", delta: -0.06, positive_direction: false}, {label: "Audience Overlap", value: "68%", delta: -0.12, positive_direction: false}])
causes = LsChart("bar", [{name: "Saturation", value: 45}, {name: "View-through inflation", value: 31}, {name: "Audience overlap", value: 24}], "Estimated revenue impact of each root cause (relative index)")
satCurve = LsChart("line", [{name: "$0", value: 0}, {name: "$50K", value: 38}, {name: "$100K", value: 62}, {name: "$150K", value: 76}, {name: "$200K", value: 84}, {name: "$250K", value: 88}, {name: "$300K", value: 90}, {name: "$350K", value: 91}], "Display revenue response curve — spend vs incremental revenue (indexed)", "Incremental revenue index")
compare = LsComparison(["Root Cause", "Evidence", "Impact"], [["Saturation", "94% of saturation curve reached at $300K/month", "High — main driver"], ["View-through inflation", "GA4 credits 7-day view-throughs; MMM strips these", "Medium — inflates reported ROAS by ~2.4x"], ["Audience overlap", "68% of Display impressions also saw Paid Social ads", "Medium — double-counting reach"]])
fix = LsStepPlan("Recommended remediation", ["Reduce Display budget from $300K to $100K/month (operate on the steep part of the response curve)", "Shift freed $200K to Paid Social (still has headroom — saturation at 43%)", "Switch Display from view-through to impression-deduplicated attribution in GA4", "Suppress Display targeting for users with 3+ Paid Social impressions in last 14 days to reduce overlap"])
cta = LsCtaButton("Create Media Reallocation Decision", "/decisions/media-reallocation-001", "primary")
chips = LsSuggestionChips(["Show Paid Social saturation headroom", "How much budget should move?", "Will this affect reach metrics?", "Model the impact on Q1 revenue"])`
