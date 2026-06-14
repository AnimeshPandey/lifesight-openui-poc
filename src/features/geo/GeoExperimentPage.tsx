import { useEffect } from "react"
import { Globe } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { GEO_FIXTURE } from "@/mocks/fixtures/geo"
import { useOpenUIStream } from "@/hooks/useOpenUIStream"
import { OpenUIDemoRenderer } from "@/components/openui-demo-renderer"
import { createOpenUIActionHandler } from "@/lib/openui-actions"
import { useMia } from "@/providers/mia-provider"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { DecisionJourney } from "@/components/decision-journey"

/**
 * /geo — Geo Experiment Results Narrator
 *
 * Demonstrates: LsKpiRow (significance stats), LsChart ×2 (treatment vs control
 * response curve + lift by DMA), LsComparison, LsInfoPanel (success),
 * LsConfidenceBadge — all from a single OpenUI Lang string.
 *
 * This is the 3.0 use case #4: geo experiment results structured response.
 * Previously this would be raw markdown text. OpenUI makes it scannable.
 */
export function GeoExperimentPage() {
  const stream = useOpenUIStream()
  const navigate = useNavigate()
  const { openPanel } = useMia()

  // Auto-stream on mount so progressive rendering is visible without a click.
  useEffect(() => {
    void stream.replay(GEO_FIXTURE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAction = createOpenUIActionHandler({
    route: "Geo",
    navigate: (to) => navigate({ to: to as string }),
    openMia: (o) => openPanel(o),
  })

  return (
    <div className="space-y-4">
      <DecisionJourney />
      <PageHeader
        title="Geo Experiment Results"
        icon={Globe}
        breadcrumb={["Intelligence", "Geo"]}
        subtitle="NovaBrand · Paid Social holdout · 12 DMAs · 6 weeks · Q4 2025 · LsKpiRow · LsChart · LsComparison · LsConfidenceBadge"
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void stream.replay(GEO_FIXTURE)}
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
