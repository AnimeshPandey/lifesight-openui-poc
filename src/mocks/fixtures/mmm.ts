/**
 * OpenUI Lang fixture for /mmm route.
 * Scenario: MMM causal DAG walkthrough — NovaBrand model structure explanation
 * Proves: LsMermaidDiagram (actual causal DAG), LsKpiRow (model stats),
 *         LsDataTable (variable importance), LsChart (contribution decomposition)
 */
export const MMM_FIXTURE = `root = LsStack("vertical", "md", [header, meta, kpis, dag, importance, contribChart, satNote, chips])
  header = LsInfoPanel("info", "Bayesian MMM using PyMC-Marketing. Trained on 24 months (Jan 2024–Dec 2025). Media variables use Adstock transformation with saturation (Hill function). Baseline captures trend, seasonality, and external macroeconomic controls.", "MMM v2.3 — NovaBrand Model Structure")
  meta = LsStack("horizontal", "sm", [metaTrained, metaMethod, metairoas, metaCal])
  metaTrained = LsMetadataChip("Trained", "Jan–Dec 2025")
  metaMethod = LsMetadataChip("Method", "Bayesian MMM")
  metairoas = LsMetadataChip("Paid Social iROAS", "2.1x")
  metaCal = LsMetadataChip("Geo-calibrated", "±0.0x")
  kpis = LsKpiRow([{label: "Model R²", value: "0.94"}, {label: "Holdout R²", value: "0.91"}, {label: "MAPE", value: "8.2%"}, {label: "Training Weeks", value: "104"}, {label: "Media Variables", value: "8"}, {label: "Control Variables", value: "12"}])
  dag = LsMermaidDiagram("graph TD\n    PS[Paid Social Spend] -->|Adstock λ=0.6| PSA[PS Adstock]\n    SEM[Search Spend] -->|Adstock λ=0.4| SEMA[SEM Adstock]\n    DIS[Display Spend] -->|Adstock λ=0.3| DISA[Display Adstock]\n    AFF[Affiliate Spend] -->|Adstock λ=0.2| AFFA[Affiliate Adstock]\n    PSA -->|Saturation α=0.8| REV[Revenue]\n    SEMA -->|Saturation α=0.7| REV\n    DISA -->|Saturation α=0.4| REV\n    AFFA -->|Saturation α=0.5| REV\n    SEAS[Seasonality] --> REV\n    TREND[Trend] --> REV\n    PRICE[Price Index] --> REV\n    COMP[Competitor Activity] --> REV\n    style PS fill:#00bc7d,color:#000\n    style SEM fill:#2b7fff,color:#fff\n    style DIS fill:#fb2c36,color:#fff\n    style REV fill:#027b8e,color:#fff", "Causal DAG — NovaBrand MMM v2.3. Arrow weights = adstock decay λ. Node saturation = Hill function α parameter.")
  importance = LsDataTable(["Variable", "Adstock λ", "Saturation α", "Contribution %", "iROAS"], [["Paid Social", "0.60", "0.80", "23.4%", "2.1x"], ["Search (SEM)", "0.40", "0.70", "16.8%", "1.8x"], ["Display", "0.30", "0.40", "4.9%", "0.4x"], ["Affiliate", "0.20", "0.50", "7.2%", "1.6x"], ["Seasonality", "—", "—", "18.3%", "—"], ["Trend", "—", "—", "14.6%", "—"], ["Price / Promo", "—", "—", "8.9%", "—"], ["Competitor", "—", "—", "5.9%", "—"]], "Contribution % = share of total revenue variance explained. iROAS = incremental return on ad spend.")
  contribChart = LsChart("bar", [{name: "Paid Social", value: 23.4}, {name: "Search", value: 16.8}, {name: "Seasonality", value: 18.3}, {name: "Trend", value: 14.6}, {name: "Affiliate", value: 7.2}, {name: "Price/Promo", value: 8.9}, {name: "Display", value: 4.9}, {name: "Competitor", value: 5.9}], "Revenue contribution decomposition — Q4 2025", null, null, {unit: "%"})
  satNote = LsInfoPanel("tip", "Display has the lowest saturation parameter (α=0.4) meaning it reaches diminishing returns fastest. At current spend levels ($300K/month), Display operates well past its saturation point — confirmed by geo holdout (iROAS 0.4x). Paid Social still has headroom (α=0.8 — saturation not yet reached at current $1.2M/month).", "Saturation Insight")
  chips = LsSuggestionChips(["Show geo holdout validation", "Deep-dive Paid Social saturation curve", "Compare to previous model version", "What would retrain improve?"])`
