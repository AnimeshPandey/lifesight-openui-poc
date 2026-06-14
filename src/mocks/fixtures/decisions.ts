/**
 * OpenUI Lang fixture for /decisions/:id route.
 * Scenario: Media Reallocation decision packet — media-reallocation-001
 * Components exercised: LsTabs, LsActionInaction, LsConfidenceBadge,
 *                       LsScenarioMatrix, LsChart, LsDataTable, LsInfoPanel, LsSuggestionChips
 *
 * Executive mode renders this fixture as-is.
 * Analyst mode appends DECISIONS_ANALYST_SUFFIX below.
 */
export const DECISIONS_FIXTURE = `root = LsStack("vertical", "md", [tabs, chips])
  tabs = LsTabs([{label: "Recommendation", children: [LsActionInaction("Reallocate $800K Display → Paid Social", "Shift budget from underperforming Display (iROAS 0.4x) to Paid Social (iROAS 2.1x, geo-validated) before Nov 15 to capture Q4 peak season uplift.", [{label: "Projected Blended ROI", value: "2.4x (+33%)"}, {label: "Incremental Revenue", value: "+$2.1M"}, {label: "Payback Period", value: "< 4 weeks"}], "Keep current allocation", "Maintaining current media mix leaves $2.1M incremental revenue on the table in Q4.", [{label: "Opportunity Cost", value: "$2.1M"}, {label: "Display Budget Waste", value: "$300K/month"}, {label: "Blended ROI (unchanged)", value: "1.8x"}]), LsConfidenceGauge(84, "Recommendation confidence", "Geo-validated MMM"), LsConfidenceBadge("high", "High confidence", "Paid Social iROAS 2.1x — geo holdout (measured 2.1x) confirms MMM v2.3 estimate · R² 0.94, MAPE 8.2%")]}, {label: "Simulation", children: [LsScenarioMatrix([{name: "Shift 20% Display → Paid Social", budget_delta_pct: 20, roi_forecast: 2.2, confidence: "high"}, {name: "Shift 40% Display → Paid Social", budget_delta_pct: 40, roi_forecast: 2.4, confidence: "high", recommended: true}, {name: "Shift 60% Display → Paid Social", budget_delta_pct: 60, roi_forecast: 2.1, confidence: "medium"}]), LsChart("line", [{name: "0%", value: 1.8}, {name: "10%", value: 2.0}, {name: "20%", value: 2.2}, {name: "40%", value: 2.4}, {name: "60%", value: 2.1}, {name: "80%", value: 1.7}], "ROI forecast by reallocation %")]}, {label: "Evidence", children: [LsDataTable(["Channel", "Q4 Spend", "iROAS", "Attribution Share"], [["Paid Social", "$1.2M", "2.1x", "38%"], ["Search", "$0.8M", "1.8x", "28%"], ["Display", "$0.3M", "0.4x", "8%"], ["Affiliate", "$0.15M", "1.6x", "12%"]], "Data-driven MMM v2.3 · Display attribution adjusted for view-through inflation (–0.3x correction)"), LsInfoPanel("info", "Attribution uses data-driven MMM v2.3. View-through inflation adjustment of –0.3x applied to Display based on geo holdout experiment results (Dec 2024).")]}], "Recommendation")
  chips = LsSuggestionChips(["Explain MMM methodology", "Show geo experiment evidence", "Draft approval memo", "Compare to category benchmarks"])`

/**
 * Analyst-mode suffix — appended to DECISIONS_FIXTURE when mode === "analyst".
 * Adds model detail panel with training stats and validation metrics.
 */
export const DECISIONS_ANALYST_SUFFIX = `
  analystNote = LsInfoPanel("info", "MMM v2.3 · Training window: Jan 2024–Dec 2025 (24 months) · Cross-validation MAPE 8.2% · R² 0.94 · Holdout R² 0.91 · Feature importance: Paid Social 38%, Search 28%, Display 8%, Affiliate 12%, Seasonality 14% · Last run: 2025-12-10T14:32Z", "Analyst View — Model Details")
  root = LsStack("vertical", "md", [tabs, chips, analystNote])`
