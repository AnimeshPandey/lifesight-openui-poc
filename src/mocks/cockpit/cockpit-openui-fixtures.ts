/**
 * OpenUI Lang fixture map for /cockpit route.
 * Four fixtures covering different Sentinel alert and agent widget detail panels.
 * All use the canonical POSITIONAL syntax validated by @openuidev/react-lang.
 *
 * Alert key → fixture:
 *   sentinel-budget-pace      → COCKPIT_FIXTURE (re-exported from fixtures/cockpit.ts)
 *   sentinel-spend-anomaly    → COCKPIT_SPEND_ANOMALY_FIXTURE
 *   media-fatigue             → COCKPIT_MEDIA_FIXTURE
 *   data-connector            → COCKPIT_DATA_FIXTURE
 */

import { COCKPIT_FIXTURE } from "@/mocks/fixtures/cockpit"
export { COCKPIT_FIXTURE as COCKPIT_BUDGET_PACE_FIXTURE } from "@/mocks/fixtures/cockpit"

export const COCKPIT_SPEND_ANOMALY_FIXTURE = `root = LsStack("vertical", "md", [severity, alert, kpis, badge, action, steps, cta, chips])
  severity = LsSeverityBadge("warning", "Spend Anomaly — Warning")
  alert = LsInfoPanel("warning", "Google Ads yesterday spend exceeded the daily budget by 18% ($47.2K vs $40K planned). Anomaly detected across Branded Search and PMax campaigns — 312K impressions with declining CPM efficiency.", "Spend Anomaly — Google Ads")
  kpis = LsKpiRow([{label: "Yesterday Spend", value: "$47.2K", delta: 0.18, positive_direction: false}, {label: "Daily Budget", value: "$40K"}, {label: "Day-over-Day", value: "+18%", delta: 0.18, positive_direction: false}, {label: "Impressions", value: "312K", delta: 0.22}])
  badge = LsConfidenceBadge("medium", "Sentinel: medium confidence", "Detected via anomaly detection — 2.1σ above 7-day rolling average. Single-day event; confidence increases if anomaly persists.")
  action = LsActionInaction("Investigate and Monitor", "Check Google Ads Manager for unauthorised budget changes. If 1-day anomaly, monitor for recurrence. If structural, pause affected ad sets.", [{label: "Overspend avoided (if paused)", value: "$420K/mo"}, {label: "Anomaly resolution window", value: "24–48 hrs"}], "Ignore Alert", "Risk of uncontrolled budget burn. If anomaly persists for 7 days, monthly overspend could reach $420K against a $1.2M search budget.", [{label: "Monthly overspend at risk", value: "$420K"}, {label: "Share of search budget", value: "35%"}])
  steps = LsStepPlan("Investigation steps", ["Check Google Ads Manager campaign delivery logs for unauthorised budget changes", "Confirm budget caps have not been raised by automated bid strategies (Target CPA / Target ROAS)", "Review PMax campaign asset performance — delivery spike often follows broad audience expansion", "Monitor for 48 hours — if anomaly repeats, pause affected campaigns and escalate to paid search team"])
  cta = LsCtaButton("View Google Ads — Campaign Delivery", "/attribution?channel=Paid+Search", "primary")
  chips = LsSuggestionChips(["Show 7-day Google Ads spend trend", "Compare to branded search budget cap", "What is the expected ROAS impact?", "Create investigation decision"])`

export const COCKPIT_MEDIA_FIXTURE = `root = LsStack("vertical", "md", [severity, alert, kpis, fatiguechart, badge, action, steps, cta, chips])
  severity = LsSeverityBadge("critical", "Creative Fatigue — Critical")
  alert = LsInfoPanel("warning", "Meta Paid Social creative Summer_Hero_v3.mp4 has reached severe fatigue: 2.4M impressions, CTR dropped 57% from baseline (0.9% vs 2.1%). Frequency cap reached in core 25–34 demographic. Immediate creative rotation recommended.", "Creative Fatigue Alert — Meta Paid Social")
  kpis = LsKpiRow([{label: "Fatigue Score", value: "82/100", delta: -0.57, positive_direction: false}, {label: "Current CTR", value: "0.9%", delta: -0.57, positive_direction: false}, {label: "Baseline CTR", value: "2.1%"}, {label: "Impressions", value: "2.4M", delta: 0.31}])
  fatiguechart = LsChart("line", [{name: "Day 1", value: 2.1}, {name: "Day 3", value: 1.9}, {name: "Day 5", value: 1.6}, {name: "Day 7", value: 1.3}, {name: "Day 9", value: 1.1}, {name: "Day 11", value: 0.9}], "CTR decay — Summer_Hero_v3.mp4 (%, last 11 days)", "CTR Baseline", null, {referenceLines: [{value: 2.1, label: "Baseline"}]})
  badge = LsConfidenceBadge("high", "Media Agent: high confidence", "CTR decay pattern matches historical fatigue model (r² 0.91). Creative has served 2.4M impressions against an audience of ~3.1M — 77% reach achieved.")
  action = LsActionInaction("Rotate Creative Now", "Pause Summer_Hero_v3.mp4 and activate 2 pre-approved backup creatives. Expected CTR recovery to 1.6–2.0% within 3 days.", [{label: "Expected CTR recovery", value: "1.6–2.0% (+78%)"}, {label: "Revenue impact (3-day)", value: "+$42K"}, {label: "Time to recover", value: "3 days"}], "Keep Current Creative", "Continued delivery on fatigued creative will further depress CTR and increase CPM, costing an estimated $28K in incremental revenue over the next 7 days.", [{label: "Revenue at risk (7-day)", value: "$28K"}, {label: "CPM inflation risk", value: "+15–20%"}])
  steps = LsStepPlan("Creative rotation steps", ["Pause Summer_Hero_v3.mp4 in Meta Ads Manager — apply to all active ad sets in Paid Social Prospecting campaign", "Activate backup creatives Brand_Awareness_Static_05.jpg and UGC_Testimonial_v1.mp4 (pre-approved, in library)", "Monitor CTR and frequency for new creatives over 48 hours — target CTR ≥ 1.6%", "Brief creative team on new asset requirements for Q4 Week 3"])
  cta = LsCtaButton("Create Decision — Creative Rotation", "/decisions/media-reallocation-001", "primary")
  chips = LsSuggestionChips(["Show all fatigued creatives across platforms", "Which backup creatives are available?", "What is the budget impact of pausing this creative?", "Set up automated fatigue alerts"])`

export const COCKPIT_DATA_FIXTURE = `root = LsStack("vertical", "md", [severity, alert, kpis, badge, steps, checklist, cta, chips])
  severity = LsSeverityBadge("low", "Data Anomaly — Low Severity")
  alert = LsInfoPanel("info", "Meta Ads Manager reporting had a 6-hour gap (02:00–08:00 UTC today). Yesterday spend data may be incomplete by an estimated $18K. All other connectors are healthy. No action required unless gap persists.", "Data Anomaly — Meta Reporting Gap")
  kpis = LsKpiRow([{label: "Gap Duration", value: "6 hrs"}, {label: "Estimated Missing Spend", value: "~$18K"}, {label: "Connectors Healthy", value: "7 of 8"}, {label: "Shopify Delay", value: "3 hrs"}])
  badge = LsConfidenceBadge("high", "Data Agent: high confidence", "Gap detected via pipeline heartbeat monitor. Meta API returned 200 OK but empty payload — consistent with planned maintenance window. Data typically back-fills within 2 hours of gap close.")
  steps = LsStepPlan("Data health steps", ["Verify Meta Ads Manager gap has closed — check Data > Connectors for re-sync confirmation", "Review yesterday Paid Social spend once data back-fills (expected by 09:00 UTC)", "Confirm Shopify webhook delay resolved — late-night revenue attribution may need correction", "No model re-run required unless spend discrepancy exceeds $50K after back-fill"])
  checklist = LsReadinessChecklist("Connector health", [{label: "Meta Ads Manager", status: "warning", detail: "6-hour gap — back-filling"}, {label: "Google Ads", status: "pass", detail: "Synced 5 min ago"}, {label: "TikTok Ads", status: "pass", detail: "Synced 12 min ago"}, {label: "Shopify", status: "warning", detail: "3-hour delay — order webhook lag"}, {label: "BigQuery", status: "pass", detail: "Synced 2 hrs ago"}])
  cta = LsCtaButton("View Data Connectors", "/data/integrations", "secondary")
  chips = LsSuggestionChips(["Has this Meta gap happened before?", "What is the impact on yesterday attribution?", "When will Shopify webhook catch up?", "Set up connector health alerts"])`

export const COCKPIT_FIXTURE_MAP: Record<string, string> = {
  "sentinel-budget-pace":   COCKPIT_FIXTURE,
  "sentinel-spend-anomaly": COCKPIT_SPEND_ANOMALY_FIXTURE,
  "media-fatigue":          COCKPIT_MEDIA_FIXTURE,
  "data-connector":         COCKPIT_DATA_FIXTURE,
}
