import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CockpitWidgetHeader } from "@/features/cockpit/cockpit-widget-header"

// NovaBrand Q4 hardcoded goals — mirrors ls4x GoalsWidget data shape
const GOAL_DATA = {
  scenarioName: "NovaBrand Q4 Aggressive Growth",
  horizon: "3 months",
  daysElapsed: 14,
  daysTotal: 90,
  actualSpend: 560000,
  plannedSpend: 840000,
  actualRevenue: 1680000,
  plannedRevenue: 6300000,
  pacingRate: 0.88,
}

type PacingStatus = "on_pace" | "under_pacing" | "over_pacing"

const PACING_LABELS: Record<PacingStatus, string> = {
  on_pace: "On Pace",
  under_pacing: "Under Pacing",
  over_pacing: "Over Pacing",
}

const PACING_COLORS: Record<PacingStatus, string> = {
  on_pace: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  under_pacing: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  over_pacing: "text-red-400 border-red-500/40 bg-red-500/10",
}

function pacingStatus(rate: number): PacingStatus {
  if (rate >= 0.95 && rate <= 1.05) return "on_pace"
  if (rate < 0.95) return "under_pacing"
  return "over_pacing"
}

function fmtCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export function CockpitGoalsWidget() {
  const g = GOAL_DATA
  const progressPct = Math.round((g.daysElapsed / g.daysTotal) * 100)
  const pacing = pacingStatus(g.pacingRate)
  const outcomePct = (g.actualRevenue / g.plannedRevenue) * 100
  const probability = Math.min(Math.max(outcomePct * 0.6 + g.pacingRate * 100 * 0.4, 0), 100)

  return (
    <Card>
      <CardHeader className="pb-2 pt-3 px-4">
        <CockpitWidgetHeader
          title="Goals"
          agentId="goals"
          agentName="Goals Agent"
          meta={`Monitoring ${g.scenarioName} · ${g.horizon}`}
          insightsHref="/mmm"
          askPrompt="How is the active plan tracking against its goals? What is the pacing rate and probability of hitting target?"
        />
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Day {g.daysElapsed} of {g.daysTotal}</span>
            <span>{g.horizon} horizon</span>
          </div>
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-muted-foreground/40 transition-[width]" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Actual Spend" primary={fmtCurrency(g.actualSpend)} secondary={`vs Planned ${fmtCurrency(g.plannedSpend)}`} />
          <KpiCard label="Actual Revenue" primary={fmtCurrency(g.actualRevenue)} secondary={`vs Planned ${fmtCurrency(g.plannedRevenue)}`} />
          <div className="rounded-lg border bg-card p-3 space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Pacing Rate</p>
            <p className="text-lg font-semibold leading-tight">{(g.pacingRate * 100).toFixed(0)}%</p>
            <Badge variant="outline" className={`text-[10px] h-5 px-1.5 ${PACING_COLORS[pacing]}`}>
              {PACING_LABELS[pacing]}
            </Badge>
          </div>
          <div className="rounded-lg border bg-card p-3 space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Goal Probability</p>
            <p className="text-lg font-semibold leading-tight">{probability.toFixed(0)}%</p>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-[width] ${probability >= 70 ? "bg-emerald-500" : probability >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                style={{ width: `${probability}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function CockpitGoalsWidgetEmpty() {
  return (
    <Card>
      <CardHeader className="pb-2 pt-3 px-4">
        <CockpitWidgetHeader
          title="Goals"
          agentId="goals"
          agentName="Goals Agent"
          askPrompt="How is the active plan tracking against its goals?"
        />
      </CardHeader>
      <CardContent className="px-4 pb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <TrendingUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        No active plan. Promote a scenario in Planning to start tracking goals.
      </CardContent>
    </Card>
  )
}

function KpiCard({ label, primary, secondary }: { label: string; primary: string; secondary?: string }) {
  return (
    <div className="rounded-lg border bg-card p-3 space-y-1.5">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-lg font-semibold leading-tight">{primary}</p>
      {secondary && <p className="text-[11px] text-muted-foreground">{secondary}</p>}
    </div>
  )
}
