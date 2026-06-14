/**
 * OpenUI Lang fixture for /mia route.
 * Scenario: "Which channels drive incremental impact?" — context: Models page, NovaBrand Q4 2025
 * Components exercised: LsInfoPanel, LsKpiRow, LsChart, LsCtaButton, LsSuggestionChips
 */
export const MIA_FIXTURE = `root = LsStack("vertical", "md", [context, kpis, chart, badge, cta, chips])
context = LsInfoPanel("info", "Analysing incremental channel impact based on MMM v2.3 results. 18-month training window, last run 2025-12-10.", "Context: Models · NovaBrand · Q4 2025")
kpis = LsKpiRow([{label: "Top Incremental Channel", value: "Paid Social", delta: 0.31}, {label: "Paid Social iROAS", value: "2.1x", delta: 0.21}, {label: "Search iROAS", value: "1.8x", delta: 0.05}, {label: "Display iROAS", value: "0.4x", delta: -0.18, positive_direction: false}])
chart = LsChart("bar", [{name: "Paid Social", value: 2.1}, {name: "Search", value: 1.8}, {name: "Affiliate", value: 1.6}, {name: "Email", value: 1.2}, {name: "Display", value: 0.4}], "Incremental ROI by channel (Q4 2025)")
badge = LsConfidenceBadge("high", "MMM v2.3 — high confidence", "R² 0.94 · MAPE 8.2% · Training: Jan 2024–Dec 2025")
cta = LsCtaButton("Create Media Reallocation Decision", "/decisions/media-reallocation-001", "primary")
chips = LsSuggestionChips(["Show Paid Social time-series", "What drives Display underperformance?", "Compare NovaBrand to Q3", "Run attribution deep-dive"])`
