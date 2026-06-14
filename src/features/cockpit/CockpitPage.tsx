import { useCallback, useEffect, useRef, useState } from "react"
import { LayoutDashboard, List, Pin, Sparkles, Circle } from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useMia } from "@/providers/mia-provider"
import { useCockpitData } from "@/api/useCockpitData"
import { useOpenUIStream } from "@/hooks/useOpenUIStream"
import { createOpenUIActionHandler } from "@/lib/openui-actions"
import { COCKPIT_FIXTURE } from "@/mocks/fixtures/cockpit"
import { COCKPIT_SPEND_ANOMALY_FIXTURE, COCKPIT_MEDIA_FIXTURE, COCKPIT_DATA_FIXTURE } from "@/mocks/cockpit/cockpit-openui-fixtures"
import { buildCockpitAlertFix } from "@/mocks/cockpit/build-cockpit-alert-fix"
import { CockpitAgentJumpBar } from "@/features/cockpit/cockpit-agent-jump-bar"
import { CockpitLivePlanHero } from "@/features/cockpit/cockpit-live-plan-hero"
import { CockpitAlignmentWidget, CockpitAlignmentWidgetEmpty } from "@/features/cockpit/cockpit-alignment-widget"
import { CockpitGoalsWidget, CockpitGoalsWidgetEmpty } from "@/features/cockpit/cockpit-goals-widget"
import { CockpitMediaWidget } from "@/features/cockpit/cockpit-media-widget"
import { CockpitOnboardingWidget } from "@/features/cockpit/cockpit-onboarding-widget"
import { CockpitExperimentSection } from "@/features/cockpit/cockpit-experiment-section"
import { CockpitDataSection } from "@/features/cockpit/cockpit-data-section"
import { CockpitSpendSection } from "@/features/cockpit/cockpit-spend-section"
import { CockpitAlertDetail } from "@/features/cockpit/cockpit-alert-detail"
import { CockpitWidgetHeader } from "@/features/cockpit/cockpit-widget-header"

// Alert key → pre-built OpenUI fixture (Tier B: streamed). If key not found,
// buildCockpitAlertFix() generates it from structured data (Tier C).
const ALERT_FIXTURE_MAP: Record<string, string> = {
  "rec-paid-social": COCKPIT_FIXTURE,
  "rec-tiktok":      COCKPIT_SPEND_ANOMALY_FIXTURE,
  "rec-display":     COCKPIT_SPEND_ANOMALY_FIXTURE,
  "rec-search-branded": COCKPIT_MEDIA_FIXTURE,
  "media-fatigue":   COCKPIT_MEDIA_FIXTURE,
  "data-connector":  COCKPIT_DATA_FIXTURE,
}

function CockpitSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-56 w-full" />
    </div>
  )
}

export function CockpitPage() {
  const { openPanel } = useMia()
  const navigate = useNavigate()
  const { data, isLoading } = useCockpitData()

  const stream = useOpenUIStream()
  const alertDetailRef = useRef<HTMLDivElement>(null)

  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)
  const [fixtureSource, setFixtureSource] = useState<"fixture" | "generated" | null>(null)

  const handleAction = createOpenUIActionHandler({
    route: "Cockpit",
    navigate: (to) => navigate({ to: to as never }),
    openMia: (o) => openPanel({ source: "Cockpit", ...(o ?? {}) } as never),
  })

  const selectAlert = useCallback(
    async (alertId: string) => {
      setSelectedAlertId(alertId)

      const prebuilt = ALERT_FIXTURE_MAP[alertId]
      let fixture: string
      let source: "fixture" | "generated"

      if (prebuilt) {
        fixture = prebuilt
        source = "fixture"
      } else if (data) {
        const rec = data.spendRecommendations.find((r) => r.id === alertId)
        if (rec) {
          fixture = buildCockpitAlertFix(rec)
          source = "generated"
        } else {
          toast.info("Historical alert — view only")
          return
        }
      } else {
        return
      }

      setFixtureSource(source)
      await stream.replay(fixture)

      // Scroll to alert detail panel after brief delay for layout stability
      setTimeout(() => {
        document.getElementById("cockpit-alert-detail")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    },
    [data, stream],
  )

  const replaySelected = useCallback(async () => {
    if (!selectedAlertId) return
    await selectAlert(selectedAlertId)
  }, [selectedAlertId, selectAlert])

  // Auto-stream Paid Social alert on mount (demonstrates live Sentinel delivery)
  useEffect(() => {
    if (data) {
      void selectAlert("rec-paid-social")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!data])

  const selectedLabel = selectedAlertId
    ? data?.spendRecommendations.find((r) => r.id === selectedAlertId)?.channel ?? selectedAlertId
    : null

  if (isLoading || !data) return <CockpitSkeleton />

  const { agentLive, liveMarketingPlan, spendRecommendations, experimentAlerts, dataAnomalyAlerts, connectorWarnings } = data

  return (
    <div id="cockpit-top" className="space-y-4">
      {/* ── Page header — matches ls4x layout ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            Cockpit
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Recommendations and alerts surfaced by ambient agents · Gen&nbsp;AI–powered artifacts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground hidden sm:inline">Updated {data.updatedAt}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => toast.info("Artifact List — coming soon")}
              disabled
            >
              <List className="h-3.5 w-3.5" aria-hidden="true" />
              Artifact List
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => openPanel({ source: "Cockpit" })}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Ask MIA
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main tabs ── */}
      <Tabs defaultValue="recommendations">
        <TabsList className="h-8 flex-wrap">
          <TabsTrigger value="recommendations" className="text-xs h-7 px-3">
            Recommendations &amp; Alerts
          </TabsTrigger>
          <TabsTrigger value="pinned" className="text-xs h-7 px-3" disabled>
            <Pin className="h-3 w-3 mr-1" aria-hidden="true" />
            Pinned artifact
          </TabsTrigger>
        </TabsList>

        {/* ── Recommendations & Alerts tab ── */}
        <TabsContent value="recommendations" className="mt-1">
          <div className="space-y-4">

            {/* Sticky agent jump bar */}
            <CockpitAgentJumpBar agentLive={agentLive} />

            {/* Section 0 — Live Marketing Plan hero */}
            <CockpitLivePlanHero plan={liveMarketingPlan} />

            {/* Section 1 — Alignment Agent */}
            {agentLive.alignment && (
              <div id="agent-alignment" style={{ scrollMarginTop: "3rem" }}>
                <CockpitAlignmentWidget />
              </div>
            )}
            {!agentLive.alignment && (
              <div id="agent-alignment" style={{ scrollMarginTop: "3rem" }}>
                <CockpitAlignmentWidgetEmpty />
              </div>
            )}

            {/* Section 2 — Goals Agent */}
            {agentLive.goals && (
              <div id="agent-goals" style={{ scrollMarginTop: "3rem" }}>
                <CockpitGoalsWidget />
              </div>
            )}
            {!agentLive.goals && (
              <div id="agent-goals" style={{ scrollMarginTop: "3rem" }}>
                <CockpitGoalsWidgetEmpty />
              </div>
            )}

            {/* Section 3 — Media Agent */}
            {agentLive.media && (
              <div id="agent-media" style={{ scrollMarginTop: "3rem" }}>
                <CockpitMediaWidget
                  onExpandFatigueAlert={() => void selectAlert("media-fatigue")}
                />
              </div>
            )}

            {/* Section 4 — Data Agent */}
            {agentLive.data && (
              <div id="agent-data" style={{ scrollMarginTop: "3rem" }}>
                <DataWidget
                  anomalies={dataAnomalyAlerts}
                  warnings={connectorWarnings}
                  onExpandConnectorAlert={() => void selectAlert("data-connector")}
                />
              </div>
            )}

            {/* Section 5 — Model Agent (coming soon stub) */}
            {agentLive.model && (
              <div id="agent-model" style={{ scrollMarginTop: "3rem" }}>
                <ModelWidgetStub />
              </div>
            )}

            {/* Section 6 — Onboarding Agent */}
            {agentLive.onboarding && (
              <div id="agent-onboarding" style={{ scrollMarginTop: "3rem" }}>
                <CockpitOnboardingWidget />
              </div>
            )}

            {/* Section 7 — Spend Recommendations */}
            <Card>
              <CardHeader className="pb-2 pt-3 px-4">
                <CockpitWidgetHeader
                  title="Spend Recommendations"
                  agentId="sentinel"
                  agentName="Sentinel Agent"
                  insightsHref="/attribution"
                  askPrompt="Which channels are most under-pacing and what should I prioritise this week?"
                />
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                <CockpitExperimentSection experiments={experimentAlerts} />
                <CockpitSpendSection
                  recommendations={spendRecommendations}
                  selectedAlertId={selectedAlertId}
                  onSelectAlert={(id) => void selectAlert(id)}
                />
              </CardContent>
            </Card>

            {/* Section 8 — Alert Detail (OpenUI streamed panel) */}
            <div ref={alertDetailRef}>
              <CockpitAlertDetail
                stream={stream}
                selectedLabel={selectedLabel}
                fixtureSource={fixtureSource}
                onReplay={() => void replaySelected()}
                onAction={handleAction}
              />
            </div>

          </div>
        </TabsContent>

        {/* ── Pinned artifact tab (stub) ── */}
        <TabsContent value="pinned">
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card py-12 text-center">
            <Pin className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <p className="text-xs text-muted-foreground">No pinned artifacts yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ── Data widget — wraps data sections with shared WidgetHeader ────────────────

function DataWidget({
  anomalies,
  warnings,
  onExpandConnectorAlert,
}: {
  anomalies: import("@/mocks/cockpit/cockpit-data").DataAnomalyAlert[]
  warnings: import("@/mocks/cockpit/cockpit-data").ConnectorWarning[]
  onExpandConnectorAlert: () => void
}) {
  const total = anomalies.length + warnings.length
  return (
    <Card>
      <CardHeader className="pb-2 pt-3 px-4">
        <CockpitWidgetHeader
          title="Data"
          agentId="data"
          agentName="Data Agent"
          insightsHref="/attribution"
          askPrompt="Summarise the current data health — any connector issues, anomalies, or sync failures I should know about?"
        />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {total === 0 ? (
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <Circle className="h-4 w-4 shrink-0 fill-emerald-400" aria-hidden="true" />
            All connectors healthy, no anomalies detected.
          </div>
        ) : (
          <div className="space-y-2">
            <CockpitDataSection anomalies={anomalies} warnings={warnings} />
            {(anomalies.length > 0 || warnings.length > 0) && (
              <button
                onClick={onExpandConnectorAlert}
                className="text-[10px] text-primary hover:underline"
              >
                View detailed connector health →
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Model widget stub ─────────────────────────────────────────────────────────

function ModelWidgetStub() {
  return (
    <Card>
      <CardHeader className="pb-2 pt-3 px-4">
        <CockpitWidgetHeader
          title="Model"
          agentId="model"
          agentName="Model Agent"
          insightsHref="/mmm"
          askPrompt="How is the production model performing? Any drift signals or refresh actions needed?"
        />
      </CardHeader>
      <CardContent className="px-4 pb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Circle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Widget spec in progress — will be defined in{" "}
        <code className="text-[10px] bg-muted px-1 rounded">model_cockpit_widget.md</code>
      </CardContent>
    </Card>
  )
}
