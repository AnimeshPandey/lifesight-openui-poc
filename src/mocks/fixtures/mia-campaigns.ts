/**
 * MIA fixture — context: Campaigns page
 * Query: "Which channels drive incremental impact?" — operational campaign focus
 */
export const MIA_CAMPAIGNS_FIXTURE = `root = LsStack("vertical", "md", [context, alert, kpis, pacing, chart, cta, chips])
context = LsInfoPanel("info", "You're on the Campaigns page. I'm summarising budget pacing and performance across active campaigns, flagging issues that need your attention today.", "Context: Campaigns · NovaBrand · Q4 2025")
alert = LsInfoPanel("warning", "Paid Social Q4 Peak campaign is pacing 23% below plan (week 2 of 8). Display Brand Awareness is over-pacing by 18% — risk of budget exhaustion by week 5 of 8.", "⚠️ 2 Campaigns Require Attention")
kpis = LsKpiRow([{label: "Active Campaigns", value: "6"}, {label: "Pacing On-Track", value: "4 / 6"}, {label: "Revenue vs Plan", value: "+2.1%", delta: 0.021}, {label: "Budget Remaining", value: "$1.84M"}, {label: "Budget Utilisation", value: "58%"}, {label: "Days Remaining", value: "23"}])
pacing = LsDataTable(["Campaign", "Channel", "Budget", "Paced %", "Status"], [["Q4 Peak — Prospecting", "Paid Social", "$480K", "31%", "⚠️ Under (-23%)"], ["Brand Awareness", "Display", "$120K", "64%", "⚠️ Over (+18%)"], ["Remarketing Q4", "Paid Social", "$240K", "52%", "✅ On track"], ["Brand Search Q4", "Search", "$320K", "49%", "✅ On track"], ["Non-brand Search", "Search", "$480K", "51%", "✅ On track"], ["Partner Content", "Affiliate", "$200K", "48%", "✅ On track"]], "Budget utilisation vs planned pacing as of Dec 7, 2025.")
chart = LsChart("line", [{name: "Oct W1", value: 100, value2: 100}, {name: "Oct W2", value: 97, value2: 100}, {name: "Oct W3", value: 94, value2: 100}, {name: "Nov W1", value: 90, value2: 100}, {name: "Nov W2", value: 87, value2: 100}, {name: "Nov W3", value: 83, value2: 100}, {name: "Dec W1", value: 77, value2: 100}, {name: "Dec W2", value: 73, value2: 100}], "Actual pacing", "Plan")
cta = LsCtaButton("View Cockpit — Paid Social Pace Alert", "/cockpit", "primary")
chips = LsSuggestionChips(["How do I fix the Paid Social under-pace?", "Can Display budget move to Paid Social?", "Show Q4 revenue forecast vs plan", "Create a reallocation decision"])`
