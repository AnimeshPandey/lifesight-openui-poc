/**
 * OpenUI Lang fixture for inventory / service-level guardrails.
 * Query: "Check inventory cover for the launch SKUs" / inventory & stockout & fill rate
 * Proves OpenUI generalizes beyond media reallocation to supply/operations guardrails.
 * Components exercised: LsInfoPanel (warning), LsKpiRow, LsDataTable,
 *                       LsStepPlan, LsSuggestionChips
 */
export const INVENTORY_FIXTURE = `root = LsStack("vertical", "md", [alert, kpis, skuTable, plan, chips])
alert = LsInfoPanel("warning", "Two launch SKUs are projected to stock out before the next inbound PO arrives (ETA 18 days). At current sell-through the Hydra-Boost Serum has 9 days of cover against a 14-day replenishment lead time, breaching the 95% target fill rate. Action is needed this week to protect the launch.", "Stockout Risk — 2 of 5 Launch SKUs Below Safety Cover")
kpis = LsKpiRow([{label: "At-Risk SKUs", value: "2 / 5", delta: -0.4, positive_direction: false}, {label: "Min Days of Cover", value: "9 days", delta: -0.36, positive_direction: false}, {label: "Stockout Risk (14d)", value: "38%", delta: -0.22, positive_direction: false}, {label: "Current Fill Rate", value: "91%", delta: -0.04, positive_direction: false}, {label: "Target Fill Rate", value: "95%"}, {label: "Inbound PO ETA", value: "18 days"}])
skuTable = LsDataTable(["SKU", "On Hand", "Daily Velocity", "Days of Cover", "Stockout Risk", "Status"], [["Hydra-Boost Serum 30ml", "4,180", "465/day", "9 days", "38%", "At risk"], ["Hydra-Boost Serum 50ml", "6,920", "510/day", "13.6 days", "21%", "At risk"], ["Glow Toner 200ml", "11,400", "390/day", "29 days", "4%", "Healthy"], ["Renewal Cream 50ml", "8,750", "280/day", "31 days", "3%", "Healthy"], ["Barrier Mist 100ml", "9,300", "215/day", "43 days", "1%", "Healthy"]], "Velocity = trailing 7-day average · Replenishment lead time 14 days · Safety cover target ≥ 18 days")
plan = LsStepPlan("Guardrail actions — protect the 95% fill rate", ["Expedite a partial air-freight PO of 12K units across the two Hydra-Boost SKUs (closes the 9-day cover gap before lead time elapses)", "Throttle paid media for Hydra-Boost 30ml by 30% for 7 days to slow velocity to within safety cover", "Raise the safety-stock threshold on launch SKUs from 14 to 21 days of cover for the launch quarter", "Set a daily stockout-risk alert at the 25% threshold and notify the supply + growth channels"])
chips = LsSuggestionChips(["Model the air-freight cost vs stockout cost", "Show velocity by region", "What if the PO slips 5 more days?", "Recompute cover if media is throttled 30%"])`
