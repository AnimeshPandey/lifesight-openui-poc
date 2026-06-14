/**
 * OpenUI Lang fixture for /cockpit route.
 * Scenario: Sentinel budget pace alert — Paid Social pacing 23% below plan
 * Components exercised: LsStatHero, LsSeverityBadge, LsInfoPanel, LsKpiRow, LsChart,
 *                       LsConfidenceBadge, LsStepPlan, LsCtaButton, LsSuggestionChips
 */
export const COCKPIT_FIXTURE = `root = LsStack("vertical", "md", [hero, severity, alert, kpis, paceChart, badge, steps, cta, chips])
  hero = LsStatHero("Revenue at Risk", "$714K", -0.23, "if pace continues")
  severity = LsSeverityBadge("high", "Budget Pace — High Severity")
  alert = LsInfoPanel("warning", "Paid Social is pacing 23% below plan for week 2 of Q4. At current rate, $340K will go unspent by end-of-week, forgoing an estimated $714K incremental revenue.", "Budget Pace Alert — Paid Social")
  kpis = LsKpiRow([{label: "Actual Spend (WTD)", value: "$184K", delta: -0.23, positive_direction: false, spark: [240, 232, 218, 205, 196, 184]}, {label: "Plan (WTD)", value: "$240K", spark: [240, 240, 240, 240, 240, 240]}, {label: "Pace Gap", value: "$56K", spark: [0, 8, 22, 35, 44, 56]}, {label: "Revenue at Risk", value: "$714K", delta: -0.23, positive_direction: false, spark: [0, 120, 280, 440, 600, 714]}])
  paceChart = LsChart("line", [{name: "Mon", value: 38, value2: 40}, {name: "Tue", value: 35, value2: 40}, {name: "Wed", value: 31, value2: 40}, {name: "Thu", value: 29, value2: 40}, {name: "Fri", value: 27, value2: 40}, {name: "Sat", value: 24, value2: 40}], "Daily spend vs plan — Paid Social (WTD, $K/day)", "Plan", null, {referenceLines: [{value: 240, label: "Plan"}], unit: "$K"})
  badge = LsConfidenceBadge("high", "Sentinel: high confidence", "Detected by Budget Pace Guardrail template — threshold: 15% below plan for 3+ consecutive days")
  steps = LsStepPlan("Recommended response steps", ["Review Paid Social campaign delivery in Meta Ads Manager — check for ad set delivery issues", "Confirm budget caps are not throttling delivery at the campaign level", "Increase daily budget by $8K/day across top-performing ad sets to recover pace by end of week", "Create a decision in Lifesight to track approval, implementation, and post-action monitoring"])
  cta = LsCtaButton("Create Decision — Recover Paid Social Pace", "/decisions/media-reallocation-001", "primary")
  chips = LsSuggestionChips(["Show historical pace patterns", "What caused the delivery drop?", "Simulate recovery budget options", "View Paid Social channel dashboard"])`
