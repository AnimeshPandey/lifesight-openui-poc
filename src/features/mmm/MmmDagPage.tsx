import { useEffect } from "react"
import { Atom } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { MMM_FIXTURE } from "@/mocks/fixtures/mmm"
import { useOpenUIStream } from "@/hooks/useOpenUIStream"
import { OpenUIDemoRenderer } from "@/components/openui-demo-renderer"
import { createOpenUIActionHandler } from "@/lib/openui-actions"
import { useMia } from "@/providers/mia-provider"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { DecisionJourney } from "@/components/decision-journey"

/**
 * /mmm — MMM Causal DAG Walkthrough
 *
 * Demonstrates: LsMermaidDiagram (actual causal DAG showing Adstock/Saturation
 * nodes), LsKpiRow (model fit stats), LsDataTable (variable importance with λ/α),
 * LsChart (revenue contribution decomposition), LsInfoPanel (saturation insight).
 *
 * This is the 3.0 use case #5: MMM causal DAG walkthrough. Previously analysts
 * had to read documentation to understand the model structure. OpenUI surfaces it
 * inline in chat when asked.
 */
export function MmmDagPage() {
  const stream = useOpenUIStream()
  const navigate = useNavigate()
  const { openPanel } = useMia()

  // Auto-stream on mount so progressive rendering is visible without a click.
  useEffect(() => {
    void stream.replay(MMM_FIXTURE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAction = createOpenUIActionHandler({
    route: "MMM",
    navigate: (to) => navigate({ to: to as string }),
    openMia: (o) => openPanel(o),
  })

  return (
    <div className="space-y-4">
      <DecisionJourney />
      <PageHeader
        title="MMM Model Structure"
        icon={Atom}
        breadcrumb={["Intelligence", "MMM"]}
        subtitle="NovaBrand MMM v2.3 · Causal DAG · Variable importance · Revenue decomposition · LsMermaidDiagram · LsKpiRow · LsDataTable · LsChart"
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void stream.replay(MMM_FIXTURE)}
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
