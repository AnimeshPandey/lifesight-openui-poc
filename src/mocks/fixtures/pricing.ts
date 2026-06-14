/**
 * OpenUI Lang fixture for pricing scenarios.
 * Query: "Review the Q1 price change for Hydra-Boost" / pricing & elasticity & margin
 * Proves OpenUI generalizes beyond media reallocation to revenue/pricing decisions.
 * Components exercised: LsInfoPanel, LsKpiRow, LsComparison, LsChart,
 *                       LsConfidenceBadge, LsSuggestionChips
 */
export const PRICING_FIXTURE = `root = LsStack("vertical", "md", [header, kpis, scenarios, demandCurve, insight, badge, chips])
header = LsInfoPanel("info", "NovaBrand Hydra-Boost serum is priced at $32.00. A proposed +6.25% list increase to $34.00 was modeled against estimated own-price elasticity of −1.4 (category benchmark −1.6). At this elasticity the increase is margin-accretive despite a modest volume decline.", "Q1 Price Change Review — Hydra-Boost Serum")
kpis = LsKpiRow([{label: "Current Price", value: "$32.00"}, {label: "Proposed Price", value: "$34.00", delta: 0.0625}, {label: "Price Elasticity", value: "−1.4"}, {label: "Est. Volume Change", value: "−8.4%", delta: -0.084, positive_direction: false}, {label: "Gross Margin Impact", value: "+$1.18M", delta: 0.094}, {label: "Contribution Margin", value: "61% → 64%", delta: 0.03}])
scenarios = LsComparison(["Scenario", "Price", "Units (Q1)", "Revenue", "Gross Margin"], [["Hold (baseline)", "$32.00", "412K", "$13.18M", "$8.04M"], ["+3.1% ($33.00)", "$33.00", "395K", "$13.04M", "$8.31M"], ["+6.25% ($34.00) — proposed", "$34.00", "377K", "$12.82M", "$9.22M"], ["+9.4% ($35.00)", "$35.00", "354K", "$12.39M", "$9.05M"]])
demandCurve = LsChart("line", [{name: "$30", value: 448, value2: 8.1}, {name: "$31", value: 430, value2: 8.0}, {name: "$32", value: 412, value2: 8.0}, {name: "$33", value: 395, value2: 8.3}, {name: "$34", value: 377, value2: 9.2}, {name: "$35", value: 354, value2: 9.0}, {name: "$36", value: 326, value2: 8.4}], "Demand curve: Q1 units (000s) and gross margin ($M) vs price", "Gross margin ($M)")
insight = LsInfoPanel("tip", "Gross margin peaks at the $34.00 price point. Beyond $34 the volume decline (elasticity steepens above $35) outweighs the per-unit margin gain. Recommend $34.00 — captures 92% of the theoretical margin optimum while limiting share risk versus competitor Dewy Co. at $33.50.", "Recommendation — Set list price to $34.00")
badge = LsConfidenceBadge("medium", "Elasticity estimate — medium confidence", "Elasticity −1.4 from 14 months of POS + 2 prior price tests · ±0.3 std error · No A/B test run at $34 yet")
chips = LsSuggestionChips(["Run a price A/B test before rollout", "Model competitor price response", "Show elasticity by customer segment", "Estimate impact on subscription LTV"])`
