import { useState } from "react"
import { AlertTriangle, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { CockpitWidgetHeader } from "@/features/cockpit/cockpit-widget-header"

type SignalSeverity = "critical" | "warning" | "info"

interface FatigueSignal { type: "fatigue"; creative: string; impressions: string; fatigueScore: number; ctr: string; ctrBaseline: string; description: string; severity: SignalSeverity }
interface CtrDropSignal  { type: "ctr_drop"; campaign: string; ctr: string; ctrBaseline: string; delta: string; impressions: string; description: string; severity: SignalSeverity }
interface EfficiencySignal { type: "efficiency"; metric: string; current: string; baseline: string; delta: string; negative: boolean; description: string; severity: SignalSeverity }

type PlatformSignal = FatigueSignal | CtrDropSignal | EfficiencySignal

interface PlatformData { id: string; label: string; signals: PlatformSignal[] }

const PLATFORMS: PlatformData[] = [
  {
    id: "meta", label: "Meta",
    signals: [
      { type: "fatigue", creative: "Summer_Hero_v3.mp4", impressions: "2.4M", fatigueScore: 82, ctr: "0.9%", ctrBaseline: "2.1%", description: "CTR dropped 57% from baseline — frequency cap reached in core 25–34 demo.", severity: "critical" },
      { type: "efficiency", metric: "iROAS", current: "3.1×", baseline: "4.2×", delta: "−26.2%", negative: true, description: "Incrementality falling below plan target of 4.0×. Review audience overlap.", severity: "critical" },
      { type: "efficiency", metric: "CPM", current: "$18.40", baseline: "$14.20", delta: "+29.6%", negative: true, description: "CPM elevated above 30-day baseline — auction pressure in Prospecting campaign.", severity: "warning" },
    ],
  },
  {
    id: "google", label: "Google",
    signals: [
      { type: "ctr_drop", campaign: "Brand Search — US", ctr: "4.8%", ctrBaseline: "7.2%", delta: "−33.3%", impressions: "980K", description: "Brand search CTR dropped sharply — possible competitor bid increase.", severity: "critical" },
      { type: "efficiency", metric: "CPC", current: "$2.84", baseline: "$2.10", delta: "+35.2%", negative: true, description: "CPC 35% above 14-day baseline in branded keywords.", severity: "warning" },
    ],
  },
  {
    id: "tiktok", label: "TikTok",
    signals: [
      { type: "fatigue", creative: "UGC_Unboxing_v2.mp4", impressions: "3.8M", fatigueScore: 91, ctr: "1.4%", ctrBaseline: "3.8%", description: "Severe fatigue — top-performing creative underperforming baseline by 63%.", severity: "critical" },
      { type: "efficiency", metric: "CPM", current: "$9.20", baseline: "$6.80", delta: "+35.3%", negative: true, description: "CPM spike following budget increase. Audience pool may be saturated.", severity: "warning" },
    ],
  },
  {
    id: "snapchat", label: "Snapchat",
    signals: [
      { type: "ctr_drop", campaign: "Snapchat US Brand", ctr: "0.6%", ctrBaseline: "1.0%", delta: "−40.0%", impressions: "1.2M", description: "CTR down 40% — story ads underperforming vs benchmark.", severity: "warning" },
    ],
  },
]

function SeverityDot({ severity }: { severity: SignalSeverity }) {
  return (
    <span className={cn("inline-block h-1.5 w-1.5 rounded-full shrink-0 mt-1.5", {
      "bg-red-500": severity === "critical",
      "bg-amber-400": severity === "warning",
      "bg-blue-400": severity === "info",
    })} />
  )
}

function SignalRow({ signal }: { signal: PlatformSignal }) {
  const base = "flex gap-2.5 py-2.5 border-b border-border/40 last:border-0"

  if (signal.type === "fatigue") {
    return (
      <div className={base}>
        <SeverityDot severity={signal.severity} />
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Creative Fatigue</span>
            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">{signal.fatigueScore}% fatigue</Badge>
          </div>
          <p className="text-xs font-medium truncate">{signal.creative}</p>
          <p className="text-[11px] text-muted-foreground">{signal.description}</p>
          <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
            <span>CTR {signal.ctr} <span className="text-red-400">(was {signal.ctrBaseline})</span></span>
            <span>{signal.impressions} impressions</span>
          </div>
        </div>
      </div>
    )
  }

  if (signal.type === "ctr_drop") {
    return (
      <div className={base}>
        <SeverityDot severity={signal.severity} />
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">CTR Drop</span>
            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 text-red-400 border-red-800">{signal.delta}</Badge>
          </div>
          <p className="text-xs font-medium truncate">{signal.campaign}</p>
          <p className="text-[11px] text-muted-foreground">{signal.description}</p>
          <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
            <span>CTR {signal.ctr} <span className="text-red-400">(was {signal.ctrBaseline})</span></span>
            <span>{signal.impressions} impressions</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={base}>
      <SeverityDot severity={signal.severity} />
      <div className="space-y-0.5 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Efficiency</span>
          <span className="text-[10px] font-semibold">{signal.metric}</span>
          <Badge variant="outline" className={cn("text-[9px] px-1 py-0 h-4", signal.negative ? "text-red-400 border-red-800" : "text-emerald-400 border-emerald-800")}>{signal.delta}</Badge>
        </div>
        <p className="text-xs font-medium">{signal.current} <span className="text-muted-foreground font-normal">vs baseline {signal.baseline}</span></p>
        <p className="text-[11px] text-muted-foreground">{signal.description}</p>
      </div>
    </div>
  )
}

interface CockpitMediaWidgetProps {
  onExpandFatigueAlert?: () => void
}

export function CockpitMediaWidget({ onExpandFatigueAlert }: CockpitMediaWidgetProps) {
  const [activeTab, setActiveTab] = useState(PLATFORMS[0].id)
  const totalCritical = PLATFORMS.reduce((n, p) => n + p.signals.filter((s) => s.severity === "critical").length, 0)

  return (
    <Card>
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center gap-2">
          <CockpitWidgetHeader
            title="Media Performance"
            agentId="media"
            agentName="Media Agent"
            insightsHref="/attribution"
            askPrompt="Which ad platforms have the most critical signals right now? Summarise efficiency drops, creative fatigue, and CTR issues."
          />
          {totalCritical > 0 && (
            <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 shrink-0 ml-1">
              {totalCritical} critical
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-7 gap-0.5">
            {PLATFORMS.map((p) => {
              const hasCritical = p.signals.some((s) => s.severity === "critical")
              return (
                <TabsTrigger key={p.id} value={p.id} className="text-[10px] h-6 px-2.5 relative">
                  {p.label}
                  {hasCritical && <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-red-500" />}
                </TabsTrigger>
              )
            })}
          </TabsList>
          {PLATFORMS.map((p) => (
            <TabsContent key={p.id} value={p.id} className="mt-3">
              <div className="flex items-center gap-2 pb-2 pt-1">
                {p.signals.filter((s) => s.severity === "critical").length > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-red-400">
                    <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                    <span>{p.signals.filter((s) => s.severity === "critical").length} critical</span>
                  </div>
                )}
                {p.signals.filter((s) => s.severity === "warning").length > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-400">
                    <Activity className="h-3 w-3" aria-hidden="true" />
                    <span>{p.signals.filter((s) => s.severity === "warning").length} warning</span>
                  </div>
                )}
                {p.id === "meta" && onExpandFatigueAlert && (
                  <button
                    onClick={onExpandFatigueAlert}
                    className="ml-auto text-[10px] text-primary hover:underline"
                  >
                    View fatigue alert detail →
                  </button>
                )}
              </div>
              <div>{p.signals.map((s, i) => <SignalRow key={i} signal={s} />)}</div>
              <p className="text-[10px] text-muted-foreground pt-1">Media Agent · Last checked: today at 07:00 AM</p>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
