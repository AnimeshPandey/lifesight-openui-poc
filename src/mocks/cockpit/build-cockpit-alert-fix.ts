import type { SpendRecommendation } from "@/mocks/cockpit/cockpit-data"

/**
 * Generates OpenUI Lang deterministically from a SpendRecommendation object —
 * no LLM required. This is the Tier C production pattern: when alert content
 * is fully deterministic, the backend builds OpenUI Lang from structured data
 * rather than streaming from an LLM.
 *
 * POC usage: powers the "Generated from live data" demo path when a spend row
 * is clicked and no pre-built fixture is mapped to its alert key.
 */
export function buildCockpitAlertFix(rec: SpendRecommendation): string {
  const pctPace = Math.round(rec.pacing_rate * 100)
  const gap = rec.planned_spend - rec.actual_spend
  const revenueAtRisk = Math.round(gap * (rec.status === "under_pacing" ? 12.75 : -6))
  const channel = rec.channel
  const tacticLabel = rec.tactic ? ` · ${rec.tactic}` : ""

  const variant = rec.status === "under_pacing" ? "warning" : rec.status === "over_pacing" ? "error" : "success"
  const severityLevel = rec.status === "on_pace" ? "low" : rec.status === "under_pacing" ? "high" : "medium"
  const severityLabel =
    rec.status === "under_pacing"
      ? `Under-Pacing Alert — ${channel}`
      : rec.status === "over_pacing"
        ? `Over-Pacing Alert — ${channel}`
        : `On Pace — ${channel}`

  const alertTitle = `Budget Pace — ${channel}${tacticLabel}`
  const alertContent =
    rec.status === "under_pacing"
      ? `${channel}${tacticLabel} is pacing ${pctPace}% of plan WTD. At current rate, $${fmtK(gap)} will go unspent, forgoing an estimated $${fmtK(revenueAtRisk)} incremental revenue.`
      : rec.status === "over_pacing"
        ? `${channel}${tacticLabel} is over-pacing at ${pctPace}%. Daily spend is $${fmtK(Math.abs(gap))} above plan — reallocation or budget cap adjustment recommended.`
        : `${channel}${tacticLabel} is on pace at ${pctPace}% of plan. No action required.`

  const actionLabel =
    rec.status === "under_pacing" ? `Recover ${channel} Pace` : `Reallocate ${channel} Excess`
  const actionSummary =
    rec.status === "under_pacing"
      ? `Increase daily budget for ${channel} to close the $${fmtK(gap)} WTD gap before end of week.`
      : `Shift $${fmtK(Math.abs(gap))} excess from ${channel} to under-pacing channels (e.g. Paid Social).`

  const inactionSummary =
    rec.status === "under_pacing"
      ? `Leaving $${fmtK(gap)} unspent forgoes an estimated $${fmtK(revenueAtRisk)} incremental revenue this week.`
      : `Over-spending risks budget blowout. Monitor for CPA degradation as audience saturation increases.`

  return `root = LsStack("vertical", "md", [severity, alert, kpis, badge, action, steps, cta, chips])
  severity = LsSeverityBadge("${severityLevel}", "${severityLabel}")
  alert = LsInfoPanel("${variant}", "${alertContent}", "${alertTitle}")
  kpis = LsKpiRow([{label: "Actual Spend (WTD)", value: "$${fmtK(rec.actual_spend)}", delta: ${(rec.pacing_rate - 1).toFixed(2)}, positive_direction: false}, {label: "Plan (WTD)", value: "$${fmtK(rec.planned_spend)}"}, {label: "Pace Gap", value: "$${fmtK(Math.abs(gap))}", positive_direction: false}, {label: "Pacing Rate", value: "${pctPace}%"}])
  badge = LsConfidenceBadge("high", "Sentinel: high confidence (generated from live data)", "Tier C: deterministic output built by buildCockpitAlertFix() from structured SpendRecommendation — no LLM required.")
  action = LsActionInaction("${actionLabel}", "${actionSummary}", [{label: "Gap", value: "$${fmtK(gap)}"}, {label: "Revenue at risk", value: "$${fmtK(revenueAtRisk)}"}], "Take No Action", "${inactionSummary}", [{label: "Missed revenue", value: "$${fmtK(revenueAtRisk)}"}])
  steps = LsStepPlan("Recommended steps", ["Review ${channel} campaign delivery in the platform's Ads Manager", "Check for budget caps, delivery restrictions, or audience saturation", "Adjust daily budget or creative rotation to ${rec.status === "under_pacing" ? "accelerate" : "reduce"} delivery", "Create a decision in Lifesight to track approval and post-action monitoring"])
  cta = LsCtaButton("Create Decision — ${alertTitle}", "/decisions/media-reallocation-001", "primary")
  chips = LsSuggestionChips(["Show ${channel} historical pace", "What caused this pace ${rec.status === "under_pacing" ? "gap" : "spike"}?", "Simulate recovery options", "View ${channel} attribution dashboard"])`
}

function fmtK(v: number): string {
  const abs = Math.abs(v)
  if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(abs / 1_000).toFixed(0)}K`
  return abs.toFixed(0)
}
