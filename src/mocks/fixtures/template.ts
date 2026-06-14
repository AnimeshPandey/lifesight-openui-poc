/**
 * OpenUI Lang fixture for /template/:id route.
 * Scenario: Media Reallocation template activation wizard — 72% ready
 * Proves: LsReadinessChecklist, LsTabs (Setup / Preview), LsStepPlan,
 *         LsInfoPanel, LsCtaButton (disabled until ready), LsSuggestionChips
 *
 * The fixture is built dynamically from useTemplateReadiness data in TemplateWizardPage.tsx.
 * This export is used as a fallback when the hook hasn't resolved.
 */
export function buildTemplateFix(score: number, blockers: Array<{label: string; status: "connected"|"missing"|"low_quality"; detail: string}>) {
  const blockerStr = blockers
    .map(b => `{label: "${b.label}", status: "${b.status}", detail: "${b.detail}"}`)
    .join(", ")

  return `root = LsStack("vertical", "md", [header, checklist, tabs, chips])
header = LsInfoPanel("info", "This template detects when your media mix deviates from the MMM-optimised allocation and generates a reallocation decision with scenario simulations. It requires MMM model results, media spend data, and attribution model access.", "Template: Media Reallocation")
checklist = LsReadinessChecklist(${score}, [${blockerStr}], 100, "Media Reallocation")
tabs = LsTabs([{label: "Setup", children: [LsStepPlan("Steps to reach 100% readiness", ["Connect Conversion Events — you need at least 90 days of historical conversion data (currently < 30 days)", "Increase conversion event history or lower the threshold in template settings", "Once data quality passes, the template will automatically activate and begin monitoring"]), LsInfoPanel("tip", "You can activate at 72% readiness with limited simulation accuracy. The reallocation recommendation will still be generated but confidence will be capped at 'medium'.")]}, {label: "Preview", children: [LsInfoPanel("info", "When the template activates, it monitors your media allocation weekly. When deviation > 15% from MMM-optimised, it generates a decision packet with Action/Inaction framing, scenario matrix, and a pre-drafted approval memo.", "What you'll get when active"), LsKpiRow([{label: "Decision Frequency", value: "Weekly"}, {label: "Lead Time", value: "72h before window"}, {label: "Scenarios Generated", value: "3 per decision"}, {label: "Governance Tier", value: "T2 (CMO)"}])]}], "Setup")
chips = LsSuggestionChips(["What data sources do I need to connect?", "Can I preview a sample decision?", "Lower the quality threshold to activate now", "Show other available templates"])`
}

// Static fallback
export const TEMPLATE_FIXTURE = buildTemplateFix(72, [
  { label: "Media spend data", status: "connected", detail: "Last sync: 2h ago" },
  { label: "Attribution model", status: "connected", detail: "MMM v2.3 active" },
  { label: "Conversion events", status: "low_quality", detail: "< 30 days history" },
])
