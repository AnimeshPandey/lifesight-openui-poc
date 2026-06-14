import { CheckCircle2, Lock } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CockpitWidgetHeader } from "@/features/cockpit/cockpit-widget-header"

// POC: hardcoded 72% completion — 3 of 4 steps done
const STEPS = [
  {
    step: 1,
    title: "Connect Ad Channels",
    subtitle: "Connect ad platforms where you spend budget. Meta + Google are required.",
    done: true,
  },
  {
    step: 2,
    title: "Connect Conversion Events",
    subtitle: "Bring in revenue and order data for attribution.",
    done: true,
  },
  {
    step: 3,
    title: "Configure Keywords",
    subtitle: "Set brand and competitor keywords to track market signals and share of voice.",
    done: true,
  },
  {
    step: 4,
    title: "Check Attribution & Calibrate",
    subtitle: "Review causal attribution results and calibrate the model.",
    done: false,
  },
]

export function CockpitOnboardingWidget() {
  const stepsComplete = STEPS.filter((s) => s.done).length
  const activeStep = STEPS.findIndex((s) => !s.done) + 1

  if (stepsComplete === STEPS.length) {
    return (
      <Card>
        <CardContent className="px-4 py-6 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">Workspace setup complete</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Onboarding Agent will continue to monitor for configuration drift.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3 pt-3 px-4">
        <CockpitWidgetHeader
          title="Onboarding"
          agentId="onboarding"
          agentName="Onboarding Agent"
          meta={`Step ${Math.min(activeStep, 4)} of 4 · Updated today at 06:00`}
          askPrompt="What is left to complete workspace onboarding and what should I do next?"
        />
        <div className="flex gap-1 mt-2.5">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className={`h-1 flex-1 rounded-full transition-colors ${s.done ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {STEPS.map((s, i) => {
          const locked = i > 0 && !STEPS[i - 1].done
          const active = !s.done && !locked
          return (
            <div
              key={s.step}
              className={`rounded-md border p-3 transition-all ${
                s.done  ? "border-emerald-500/30 bg-emerald-500/5" :
                active  ? "border-primary/30 bg-primary/5" :
                locked  ? "border-border opacity-50" :
                          "border-border"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                  s.done  ? "bg-emerald-500 text-white" :
                  active  ? "bg-primary text-primary-foreground" :
                            "bg-muted text-muted-foreground"
                }`}>
                  {s.done ? <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> : locked ? <Lock className="h-2.5 w-2.5" aria-hidden="true" /> : s.step}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">{s.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{s.subtitle}</p>
                  {active && (
                    <p className="text-[10px] text-primary mt-1">Step {s.step} — action required</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
