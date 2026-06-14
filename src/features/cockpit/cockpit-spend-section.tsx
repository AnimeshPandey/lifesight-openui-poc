import { useState } from "react"
import { DollarSign, ArrowRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { SpendRecommendation, SpendStatus } from "@/mocks/cockpit/cockpit-data"

const statusDot: Record<SpendStatus, string> = {
  on_pace:      "bg-emerald-400",
  under_pacing: "bg-amber-400",
  over_pacing:  "bg-red-400",
}

const statusLabel: Record<SpendStatus, string> = {
  on_pace:      "On pace",
  under_pacing: "Under-pacing",
  over_pacing:  "Over-pacing",
}

const pacingColor: Record<SpendStatus, string> = {
  on_pace:      "text-emerald-400",
  under_pacing: "text-amber-400",
  over_pacing:  "text-red-400",
}

function fmtUsd(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
  return `$${v.toFixed(0)}`
}

interface SpendRowProps {
  rec: SpendRecommendation
  selected: boolean
  onClick: () => void
}

function SpendRow({ rec, selected, onClick }: SpendRowProps) {
  return (
    <button
      className={cn(
        "group w-full flex items-center justify-between gap-4 rounded-md border px-3 py-2.5 text-left transition-colors",
        selected ? "border-primary/40 bg-primary/5" : "border-border hover:bg-accent/50",
        rec.status === "under_pacing" ? "ring-1 ring-amber-500/20" : undefined,
      )}
      onClick={onClick}
      aria-pressed={selected}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold">{rec.channel}</span>
          {rec.tactic && <span className="text-[10px] text-muted-foreground">· {rec.tactic}</span>}
        </div>
        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{rec.recommendation}</p>
      </div>

      <div className="flex shrink-0 items-center gap-4 text-right tabular-nums">
        <div className="min-w-[60px]">
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Planned</p>
          <p className="text-[11px] font-medium">{fmtUsd(rec.planned_spend)}</p>
        </div>
        <div className="min-w-[60px]">
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Actual</p>
          <p className="text-[11px] font-medium">{fmtUsd(rec.actual_spend)}</p>
        </div>
        <div className="min-w-[70px]">
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Pacing</p>
          <div className="flex items-center justify-end gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", statusDot[rec.status])} title={statusLabel[rec.status]} />
            <p className={cn("text-[11px] font-semibold", pacingColor[rec.status])}>
              {Math.round(rec.pacing_rate * 100)}%
            </p>
          </div>
        </div>
      </div>

      <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden="true" />
    </button>
  )
}

interface CockpitSpendSectionProps {
  recommendations: SpendRecommendation[]
  selectedAlertId: string | null
  onSelectAlert: (id: string) => void
}

export function CockpitSpendSection({ recommendations, selectedAlertId, onSelectAlert }: CockpitSpendSectionProps) {
  const [tab, setTab] = useState<"channel" | "tactic">("channel")

  const channelRows = recommendations.filter((r) => r.level === "channel")
  const tacticRows  = recommendations.filter((r) => r.level === "tactic")

  if (recommendations.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <DollarSign className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          Spend Recommendations
          <span className="text-[10px] font-normal text-muted-foreground">({recommendations.length})</span>
        </h3>
        <span className="text-[10px] text-muted-foreground">
          Click an under-pacing row to stream alert detail below
        </span>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="h-7">
          <TabsTrigger value="channel" className="h-6 px-3 text-xs">
            Channel ({channelRows.length})
          </TabsTrigger>
          <TabsTrigger value="tactic" className="h-6 px-3 text-xs">
            Tactic ({tacticRows.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="channel" className="mt-3 space-y-2">
          {channelRows.map((r) => (
            <SpendRow
              key={r.id}
              rec={r}
              selected={selectedAlertId === r.id}
              onClick={() => onSelectAlert(r.id)}
            />
          ))}
        </TabsContent>

        <TabsContent value="tactic" className="mt-3 space-y-2">
          {tacticRows.map((r) => (
            <SpendRow
              key={r.id}
              rec={r}
              selected={selectedAlertId === r.id}
              onClick={() => onSelectAlert(r.id)}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
