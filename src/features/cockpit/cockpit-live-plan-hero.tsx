import { TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { LiveMarketingPlan } from "@/mocks/cockpit/cockpit-data"

interface CockpitLivePlanHeroProps {
  plan: LiveMarketingPlan | null
}

/**
 * Compact hero stub for the Live Marketing Plan — mirrors ls4x LiveMarketingPlanHero.
 * Shows plan name, horizon, and progress bar. Full chart integration is out-of-scope for POC.
 */
export function CockpitLivePlanHero({ plan }: CockpitLivePlanHeroProps) {
  if (!plan) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-4 px-4">
          <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium text-foreground">No active marketing plan</p>
            <p className="text-[11px] text-muted-foreground">
              Promote a scenario in Planning to see real-time plan tracking here.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const progressPct = Math.round((plan.days_elapsed / plan.days_total) * 100)

  return (
    <Card className="border-primary/20 bg-primary/[0.03]">
      <CardContent className="py-4 px-4 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <TrendingUp className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{plan.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {plan.strategy.charAt(0).toUpperCase() + plan.strategy.slice(1)} · {plan.horizon} horizon · Day {plan.days_elapsed} of {plan.days_total}
              </p>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {progressPct}% elapsed
          </span>
        </div>
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
