import { AlertTriangle, Wifi } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DataAnomalyAlert, ConnectorWarning } from "@/mocks/cockpit/cockpit-data"

const severityBadge: Record<string, string> = {
  high:   "text-red-400 border-red-800",
  medium: "text-amber-400 border-amber-800",
  low:    "text-blue-400 border-blue-800",
}

interface CockpitDataSectionProps {
  anomalies: DataAnomalyAlert[]
  warnings: ConnectorWarning[]
}

export function CockpitDataSection({ anomalies, warnings }: CockpitDataSectionProps) {
  const total = anomalies.length + warnings.length
  if (total === 0) return null

  return (
    <div className="space-y-4">
      {anomalies.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
            Anomalies
          </p>
          {anomalies.map((a) => (
            <div key={a.id} className="flex items-start gap-2.5 rounded-md border border-border bg-card px-3 py-2.5">
              <AlertTriangle
                className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", a.severity === "high" ? "text-red-400" : a.severity === "medium" ? "text-amber-400" : "text-blue-400")}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-medium text-foreground">{a.source}</p>
                  <Badge variant="outline" className={cn("text-[9px] h-4 px-1", severityBadge[a.severity])}>
                    {a.severity}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{a.type}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{a.message}</p>
                <p className="text-[10px] text-muted-foreground">Detected {a.detected_at}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
            Connector Warnings
          </p>
          {warnings.map((w) => (
            <div key={w.id} className="flex items-start gap-2.5 rounded-md border border-border bg-card px-3 py-2.5">
              <Wifi
                className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", w.severity === "high" ? "text-red-400" : w.severity === "medium" ? "text-amber-400" : "text-muted-foreground")}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-medium text-foreground">{w.connector}</p>
                  <Badge variant="outline" className={cn("text-[9px] h-4 px-1", severityBadge[w.severity])}>
                    {w.severity}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{w.platform}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{w.message}</p>
                <p className="text-[10px] text-muted-foreground">Last sync: {w.last_sync}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
