/**
 * OpenUI Lang fixture for /geo route.
 * Scenario: Paid Social geo holdout experiment — NovaBrand Q4 2025
 * Proves: LsKpiRow (significance stats), LsChart ×2 (response curve + lift by region),
 *         LsComparison, LsInfoPanel (success), LsConfidenceBadge
 */
export const GEO_FIXTURE = `root = LsStack("vertical", "md", [header, kpis, gauge, badge, curve, regionChart, compare, note, chips])
header = LsInfoPanel("success", "6-week Paid Social geo holdout across 12 DMAs (6 treatment, 6 control) completed Nov 30, 2025. Incremental lift is statistically significant at p < 0.05.", "Experiment Complete — Results Significant")
kpis = LsKpiRow([{label: "Incremental Lift", value: "+18.3%", delta: 0.183, spark: [100, 108, 114, 119, 123, 121, 118]}, {label: "p-value", value: "0.031"}, {label: "95% CI", value: "12.1% – 24.5%"}, {label: "iROAS", value: "2.1x", delta: 0.21}, {label: "Treatment DMAs", value: "6 / 12"}, {label: "Experiment Duration", value: "6 weeks"}])
gauge = LsConfidenceGauge(87, "Statistical power", "12 matched DMAs · synthetic control")
badge = LsConfidenceBadge("high", "Geo holdout — high confidence", "12 matched DMAs · Synthetic control method · Power 0.87")
curve = LsChart("line", [{name: "W0", value: 100, value2: 100}, {name: "W1", value: 108, value2: 101}, {name: "W2", value: 114, value2: 100}, {name: "W3", value: 119, value2: 102}, {name: "W4", value: 123, value2: 101}, {name: "W5", value: 121, value2: 100}, {name: "W6", value: 118, value2: 99}], "Weekly revenue: treatment vs control (indexed to week 0)", "Control (index)", null, {area: true, referenceLines: [{value: 100, label: "Baseline"}]})
regionChart = LsChart("bar", [{name: "Boston", value: 24.1}, {name: "Chicago", value: 21.8}, {name: "Dallas", value: 19.2}, {name: "Seattle", value: 17.6}, {name: "Denver", value: 15.3}, {name: "Portland", value: 11.9}], "Incremental lift % by DMA — treatment regions")
compare = LsComparison(["Metric", "Treatment", "Control"], [["Avg Weekly Revenue", "$1.24M", "$1.05M"], ["Conversion Rate", "3.8%", "3.2%"], ["New Customer Share", "42%", "38%"], ["CAC", "$39", "$46"]])
note = LsInfoPanel("tip", "Geo holdout confirms MMM v2.3 iROAS estimate of 2.1x (MMM estimated 2.1x, holdout measured 2.1x — near-perfect calibration). This validates the MMM for budget reallocation decisions with high confidence.", "Model Implication")
chips = LsSuggestionChips(["Apply lift estimate to Q1 planning", "Show causal DAG for this model", "Run attribution deep-dive", "Create reallocation decision based on this evidence"])`
