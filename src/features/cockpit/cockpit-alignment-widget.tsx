import { GitMerge } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CockpitWidgetHeader } from "@/features/cockpit/cockpit-widget-header"

type AlignmentLabel = "positive" | "negative" | "neutral"

interface AlignmentRow {
  id: string
  type: "spend" | "creative" | "bid" | "audience"
  activity: string
  alignment: AlignmentLabel
  impact: number | null
}

const STUB_ROWS: AlignmentRow[] = [
  { id: "a1", type: "spend",    activity: "Increased Paid Search budget +18%",        alignment: "positive", impact: 42000 },
  { id: "a2", type: "creative", activity: "Launched 3 new video creatives on Meta",    alignment: "positive", impact: 31000 },
  { id: "a3", type: "bid",      activity: "Reduced YouTube CPM bids by 12%",           alignment: "neutral",  impact: null  },
  { id: "a4", type: "audience", activity: "Expanded lookalike audience to 5%",          alignment: "positive", impact: 22000 },
  { id: "a5", type: "spend",    activity: "Paused Display retargeting campaign",         alignment: "negative", impact: -19000 },
  { id: "a6", type: "bid",      activity: "Automated bidding switched to Target ROAS",  alignment: "positive", impact: 27000 },
]

const ALIGNMENT_STYLES: Record<AlignmentLabel, string> = {
  positive: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  negative:  "text-red-400 border-red-500/40 bg-red-500/10",
  neutral:   "text-muted-foreground border-border bg-muted/30",
}

const TYPE_STYLES: Record<AlignmentRow["type"], string> = {
  spend:    "text-blue-400 border-blue-500/40 bg-blue-500/10",
  creative: "text-purple-400 border-purple-500/40 bg-purple-500/10",
  bid:      "text-amber-400 border-amber-500/40 bg-amber-500/10",
  audience: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
}

function fmtImpact(n: number): string {
  const abs = Math.abs(n)
  const sign = n >= 0 ? "+" : "-"
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`
  return `${sign}$${abs.toFixed(0)}`
}

export function CockpitAlignmentWidget() {
  const positive = STUB_ROWS.filter((r) => r.alignment === "positive")
  const negative = STUB_ROWS.filter((r) => r.alignment === "negative")
  const valueRealized = positive.reduce((s, r) => s + (r.impact ?? 0), 0)
  const opportunityLost = Math.abs(negative.reduce((s, r) => s + (r.impact ?? 0), 0))

  return (
    <Card>
      <CardHeader className="pb-2 pt-3 px-4">
        <CockpitWidgetHeader
          title="Alignment"
          agentId="alignment"
          agentName="Alignment Agent"
          meta="vs NovaBrand Q4 Aggressive Growth"
          insightsHref="/decisions"
          askPrompt="Which activities are misaligned with the active plan, and what is the estimated opportunity lost?"
        />
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
            <span className="font-medium">✓ Positive</span>
            <span className="font-bold">{positive.length}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-xs text-red-400">
            <span className="font-medium">✗ Negative</span>
            <span className="font-bold">{negative.length}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/5 px-2.5 py-1 text-xs text-emerald-400">
            <span className="text-muted-foreground">↑ Value Realized</span>
            <span className="font-bold">{fmtImpact(valueRealized)}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/5 px-2.5 py-1 text-xs text-amber-400">
            <span className="text-muted-foreground">↓ Opportunity Lost</span>
            <span className="font-bold">{fmtImpact(-opportunityLost)}</span>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-muted/30 text-muted-foreground">
                <th className="text-left px-3 py-2 font-medium w-[80px]">Type</th>
                <th className="text-left px-3 py-2 font-medium">Activity</th>
                <th className="text-left px-3 py-2 font-medium w-[90px]">Alignment</th>
                <th className="text-right px-3 py-2 font-medium w-[100px]">Est. Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {STUB_ROWS.map((row) => (
                <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2">
                    <Badge variant="outline" className={`text-[9px] h-4 px-1 capitalize ${TYPE_STYLES[row.type]}`}>
                      {row.type}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-foreground">{row.activity}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className={`text-[9px] h-4 px-1 capitalize ${ALIGNMENT_STYLES[row.alignment]}`}>
                      {row.alignment}
                    </Badge>
                  </td>
                  <td className={`px-3 py-2 text-right font-medium tabular-nums ${
                    row.impact === null ? "text-muted-foreground" :
                    row.impact > 0 ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {row.impact !== null ? fmtImpact(row.impact) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export function CockpitAlignmentWidgetEmpty() {
  return (
    <Card>
      <CardHeader className="pb-2 pt-3 px-4">
        <CockpitWidgetHeader
          title="Alignment"
          agentId="alignment"
          agentName="Alignment Agent"
          askPrompt="Which activities are misaligned with the active plan?"
        />
      </CardHeader>
      <CardContent className="px-4 pb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <GitMerge className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        No active plan. Promote a scenario in Planning to enable alignment tracking.
      </CardContent>
    </Card>
  )
}
