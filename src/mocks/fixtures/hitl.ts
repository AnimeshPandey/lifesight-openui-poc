/**
 * OpenUI Lang fixture for /hitl/:id route.
 * Scenario: T2 governance approval checkpoint — Media Reallocation decision
 * Proves: LsCard, LsActionInaction (condensed), LsConfidenceBadge,
 *         LsInfoPanel, LsApprovalPanel, LsStepPlan, LsSuggestionChips
 */
export const HITL_FIXTURE = `root = LsStack("vertical", "md", [summary, framing, confidence, govNote, approval, postApproval, chips])
summary = LsCard("Decision Summary — Media Reallocation Q4", [LsKpiRow([{label: "Decision Type", value: "Media Reallocation"}, {label: "Requested By", value: "Analytics Team"}, {label: "Impact Estimate", value: "+$2.1M"}, {label: "Governance Tier", value: "T2 — CMO"}, {label: "Decision Window", value: "Nov 15 – Dec 31"}, {label: "Confidence", value: "High"}])])
framing = LsActionInaction("Approve: Reallocate $800K Display → Paid Social", "Shift budget to higher-iROAS channel before Q4 peak. Model-validated with geo holdout evidence.", [{label: "Projected ROI", value: "2.4x (+33%)"}, {label: "Incremental Revenue", value: "+$2.1M"}, {label: "Risk", value: "Low — reversible within 48h"}], "Reject: Keep current allocation", "Maintaining status quo foregoes estimated $2.1M in Q4 incremental revenue.", [{label: "Opportunity Cost", value: "$2.1M"}, {label: "Display Waste", value: "$300K/month"}, {label: "Blended ROI Locked", value: "1.8x"}])
confidence = LsConfidenceBadge("high", "High confidence — dual evidence", "MMM v2.3 R²=0.94 + Geo holdout validation (p=0.031, 6-week, 12 DMAs)")
govNote = LsInfoPanel("info", "This reallocation exceeds $500K threshold, triggering T2 policy review. Your approval authorises the media agency to implement the budget shift. The decision will be monitored weekly against the forecast trajectory. You can reverse within 48h if KPIs deviate.", "T2 Governance — CMO Approval Required")
approval = LsApprovalPanel("T2", "CMO", "Nov 14, 2025 17:00 GMT", "Budget window opens Nov 15. Approval needed before deadline to action in time for peak season.", "Approve — Proceed with Reallocation", "Send Back — Request More Evidence")
postApproval = LsStepPlan("After approval, the following happens automatically", ["Decision status changes to 'Approved' and media agency receives brief", "Budget shift executes in Meta Ads Manager within 24h", "Monitoring agent activates — weekly ROI vs forecast check", "If actual ROI deviates >20% from forecast, a new HITL checkpoint is triggered"])
chips = LsSuggestionChips(["View full evidence package", "See scenario simulation matrix", "What happens if ROI misses forecast?", "Who else has reviewed this?"])`
