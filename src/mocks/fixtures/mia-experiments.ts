/**
 * MIA fixture — context: Experiments page
 * Query: "Which channels drive incremental impact?" (same query, different context = different answer)
 */
export const MIA_EXPERIMENTS_FIXTURE = `root = LsStack("vertical", "md", [context, kpis, completedNote, gaps, chart, badge, cta, chips])
context = LsInfoPanel("info", "You're on the Experiments page. I'm surfacing geo holdout results and experiment design recommendations relevant to your current media allocation questions.", "Context: Experiments · NovaBrand · Q4 2025")
kpis = LsKpiRow([{label: "Active Experiments", value: "2"}, {label: "Completed Q4", value: "1"}, {label: "Highest Lift Found", value: "+18.3%", delta: 0.183}, {label: "Experiments Needed", value: "3 more"}])
completedNote = LsInfoPanel("success", "6-week holdout completed Nov 30 with +18.3% incremental lift (p=0.031). This validates MMM v2.3's Paid Social iROAS estimate of 2.1x. Recommendation: use this as evidence for Q4 reallocation decision.", "Paid Social Holdout Complete")
gaps = LsDataTable(["Channel", "Experiment Status", "iROAS Confidence", "Recommended Action"], [["Paid Social", "✅ Holdout complete", "High (p=0.031)", "Use in decisions — validated"], ["Display", "⚠️ No experiment", "Low (MMM only)", "Design geo holdout Q1 — priority given low iROAS"], ["Search (SEM)", "🔄 Running (WK3/6)", "Pending", "Results due Dec 21"], ["Affiliate", "❌ Not started", "Medium (MMM only)", "Low priority — stable iROAS history"]], "Experiment coverage by channel — Q4 2025")
chart = LsChart("bar", [{name: "Paid Social", value: 2.1, value2: 2.1}, {name: "Search", value: 1.8}, {name: "Affiliate", value: 1.6}, {name: "Display", value: 0.4}], "MMM estimate", "Holdout validated")
badge = LsConfidenceBadge("medium", "Attribution: medium confidence overall", "1 of 4 channels validated by experiment — 3 rely on MMM only")
cta = LsCtaButton("View Geo Experiment Results", "/geo", "primary")
chips = LsSuggestionChips(["Design a Display holdout experiment", "When do Search results come in?", "How do I prioritise experiments?", "Show MMM model structure"])`
