import { FlaskConical, Circle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ExperimentAlert } from "@/mocks/cockpit/cockpit-data"

const statusDot: Record<ExperimentAlert["status"], string> = {
  live: "bg-emerald-400",
  completed: "bg-blue-400",
  paused: "bg-amber-400",
}

const statusLabel: Record<ExperimentAlert["status"], string> = {
  live: "Live",
  completed: "Completed",
  paused: "Paused",
}

interface CockpitExperimentSectionProps {
  experiments: ExperimentAlert[]
}

export function CockpitExperimentSection({ experiments }: CockpitExperimentSectionProps) {
  if (experiments.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <FlaskConical className="h-4 w-4 text-blue-400" aria-hidden="true" />
        Experiment Alerts
        <span className="text-[10px] font-normal text-muted-foreground">({experiments.length})</span>
      </h3>
      <div className="space-y-2">
        {experiments.map((exp) => (
          <div key={exp.id} className="flex items-start gap-3 rounded-md border border-border bg-card px-3 py-2.5">
            <Circle
              className={cn("mt-0.5 h-2 w-2 shrink-0 rounded-full fill-current", statusDot[exp.status])}
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs font-medium text-foreground">{exp.name}</p>
                <Badge variant="outline" className="text-[9px] h-4 px-1">
                  {statusLabel[exp.status]}
                </Badge>
                <span className="text-[10px] text-muted-foreground">{exp.platform}</span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground">{exp.type}</span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground">Day {exp.days_running}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{exp.message}</p>
              {exp.lift_estimate && exp.confidence !== null && (
                <p className="text-[11px] text-emerald-400 font-medium">
                  {exp.lift_estimate} · {exp.confidence}% confidence
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
