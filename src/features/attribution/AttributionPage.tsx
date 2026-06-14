import { useEffect } from "react"
import { GitCompareArrows } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { ATTRIBUTION_FIXTURE } from "@/mocks/fixtures/attribution"
import { useOpenUIStream } from "@/hooks/useOpenUIStream"
import { OpenUIDemoRenderer } from "@/components/openui-demo-renderer"
import { createOpenUIActionHandler } from "@/lib/openui-actions"
import { useMia } from "@/providers/mia-provider"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { DecisionJourney } from "@/components/decision-journey"

/**
 * /attribution — Attribution Deep-Dive
 *
 * Demonstrates: LsTabs (3 tabs), LsDataTable (channel × model comparison),
 * LsComparison (data-driven vs last-touch gap), LsChart (share over time),
 * LsInfoPanel (warning + tip), LsStepPlan (methodology), LsMermaidDiagram
 * (attribution pipeline).
 *
 * This is the 3.0 use case #3: attribution breakdown explainer. More detailed
 * than the /agent fixture — dedicated to the "explain this channel's attribution
 * share" workflow with methodology transparency.
 */
export function AttributionPage() {
  const stream = useOpenUIStream()
  const navigate = useNavigate()
  const { openPanel } = useMia()

  // Auto-stream on mount so progressive rendering is visible without a click.
  useEffect(() => {
    void stream.replay(ATTRIBUTION_FIXTURE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAction = createOpenUIActionHandler({
    route: "Attribution",
    navigate: (to) => navigate({ to: to as string }),
    openMia: (o) => openPanel(o),
  })

  return (
    <div className="space-y-4">
      <DecisionJourney />
      <PageHeader
        title="Attribution Deep-Dive"
        icon={GitCompareArrows}
        breadcrumb={["Intelligence", "Attribution"]}
        subtitle="NovaBrand · Data-driven MMM vs Last-Touch · Channel share comparison · Q4 2025 · LsTabs · LsDataTable · LsComparison · LsChart · LsMermaidDiagram"
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void stream.replay(ATTRIBUTION_FIXTURE)}
            disabled={stream.isStreaming}
            aria-label="Replay stream"
            className="h-7 text-xs"
          >
            {stream.isStreaming ? "Streaming…" : "Replay stream"}
          </Button>
        }
      />

      <OpenUIDemoRenderer stream={stream} onAction={handleAction} />
    </div>
  )
}
