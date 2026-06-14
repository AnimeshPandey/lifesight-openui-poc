import type { ActionEvent } from "@openuidev/react-lang"
import { useParams, useNavigate } from "@tanstack/react-router"
import { useEffect, useMemo } from "react"
import { LayoutTemplate, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { buildTemplateFix } from "@/mocks/fixtures/template"
import { useTemplateReadiness } from "@/api/useTemplateReadiness"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { useOpenUIStream } from "@/hooks/useOpenUIStream"
import { OpenUIDemoRenderer } from "@/components/openui-demo-renderer"
import { createOpenUIActionHandler } from "@/lib/openui-actions"

/**
 * /template/:id — Template Activation Wizard
 *
 * Demonstrates: LsReadinessChecklist (new component — score ring + per-blocker
 * status), LsTabs (Setup / Preview), LsStepPlan (remediation steps),
 * LsInfoPanel, LsKpiRow (template metadata), LsCtaButton.
 *
 * Key architectural point: the OpenUI Lang string is GENERATED from live
 * TanStack Query data — this is how a real backend agent would work. The fixture
 * function `buildTemplateFix` takes readiness data and produces the layout string.
 * The fixture is then STREAMED through the shared useOpenUIStream controller, so
 * the readiness checklist assembles progressively just like a live agent.
 *
 * This is the 4.0 use case #6: template activation gap-fill wizard.
 */
export function TemplateWizardPage() {
  const { id } = useParams({ from: "/template/$id" })
  const navigate = useNavigate()
  const { data, isLoading, refetch, isFetching } = useTemplateReadiness(id)
  const stream = useOpenUIStream()

  // Data-driven OpenUI Lang generation: the fixture string is built from live
  // API data, not a static file. Recomputed whenever the readiness data changes.
  const fixture = useMemo(
    () => (data ? buildTemplateFix(data.readinessScore, data.blockers) : null),
    [data]
  )

  const dataReady = Boolean(data && fixture)

  // Stream the generated fixture once the readiness data is loaded.
  useEffect(() => {
    if (dataReady && fixture) void stream.replay(fixture)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixture, dataReady])

  // Refetch the readiness query, then re-stream from the freshly-built fixture.
  async function handleRegenerate() {
    const { data: fresh } = await refetch()
    if (fresh) {
      void stream.replay(buildTemplateFix(fresh.readinessScore, fresh.blockers))
    }
  }

  // CTA → activate the template → toast + open the decision room. Everything else
  // (chips, generic CTAs) falls through to the shared action handler.
  const fallbackAction = createOpenUIActionHandler({
    route: "Template",
    navigate: (to) => navigate({ to }),
  })

  function handleAction(event: ActionEvent) {
    if (event.humanFriendlyMessage?.includes("activate")) {
      toast.success("Template activated — opening the decision room.")
      navigate({ to: "/decisions/$id", params: { id: "media-reallocation-001" } })
      return
    }
    fallbackAction(event)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Media Reallocation"
        subtitle="Decision template · NovaBrand"
        icon={LayoutTemplate}
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void handleRegenerate()}
            disabled={stream.isStreaming || isFetching || isLoading}
          >
            <RefreshCw aria-hidden="true" />
            {stream.isStreaming || isFetching ? "Regenerating…" : "Regenerate from API"}
          </Button>
        }
      />

      <OpenUIDemoRenderer stream={stream} onAction={handleAction} />
    </div>
  )
}
