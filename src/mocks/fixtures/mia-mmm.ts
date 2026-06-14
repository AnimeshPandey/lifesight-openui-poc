/**
 * MIA fixture — context: MMM (Models) page
 * Query: "Which channels drive incremental impact?" — deeper model focus
 */
export const MIA_MMM_FIXTURE = `root = LsStack("vertical", "md", [context, kpis, satChart, satNote, satTable, retrain, chips])
context = LsInfoPanel("info", "You're on the MMM page. I'm showing model performance, saturation analysis, and retrain recommendations for the current media mix model.", "Context: MMM Models · NovaBrand · Q4 2025")
kpis = LsKpiRow([{label: "Model Version", value: "v2.3"}, {label: "Model R²", value: "0.94"}, {label: "MAPE", value: "8.2%"}, {label: "Last Retrain", value: "Dec 10, 2025"}, {label: "Retrain Due", value: "Mar 2026"}, {label: "Holdout Validated", value: "1 / 4 channels"}])
satChart = LsChart("bar", [{name: "Display", value: 94}, {name: "Search", value: 61}, {name: "Affiliate", value: 52}, {name: "Paid Social", value: 43}], "Channel saturation % at current spend levels")
satNote = LsInfoPanel("warning", "Display is at 94% saturation — you are past the steepest part of the response curve. Each additional $1 spent generates only $0.40 incremental revenue. This is the primary driver of the reallocation recommendation.", "Display Near-Fully Saturated")
satTable = LsDataTable(["Channel", "Current Spend", "Saturation %", "iROAS", "Optimal Spend"], [["Display", "$300K/mo", "94%", "0.4x", "$80K/mo"], ["Search", "$800K/mo", "61%", "1.8x", "$900K/mo"], ["Affiliate", "$150K/mo", "52%", "1.6x", "$160K/mo"], ["Paid Social", "$1.2M/mo", "43%", "2.1x", "$1.6M/mo"]], "Optimal spend = spend at 70% saturation (knee of curve). MMM v2.3.")
retrain = LsStepPlan("Model health — no retrain needed until March 2026", ["Current model trained Jan 2024 – Dec 2025 (24 months, 104 weeks)", "Holdout R² of 0.91 indicates model generalises well to unseen data", "Next retrain recommended when Q1 2026 data is available (Mar 2026)", "Early retrain trigger: if MAPE exceeds 12% on 4-week rolling basis"])
chips = LsSuggestionChips(["Show full causal DAG", "How was the saturation curve estimated?", "What would retraining change?", "View geo holdout validation"])`
