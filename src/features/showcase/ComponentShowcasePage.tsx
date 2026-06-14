import { useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import { CheckCircle2, LayoutGrid, Play } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { OpenUIDemoRenderer } from "@/components/openui-demo-renderer"
import { useOpenUIStream } from "@/hooks/useOpenUIStream"
import { createOpenUIActionHandler } from "@/lib/openui-actions"
import { useMia } from "@/providers/mia-provider"
import { Button } from "@/components/ui/button"
import {
  SHOWCASE_SECTIONS,
  SHOWCASE_COMPONENT_NAMES,
  SHOWCASE_FIXTURE,
  type ShowcaseSection,
} from "@/mocks/fixtures/showcase"

function useShowcaseActions() {
  const navigate = useNavigate()
  const { openPanel } = useMia()
  return createOpenUIActionHandler({
    route: "Showcase",
    navigate: (to) => navigate({ to }),
    openMia: (o) => openPanel(o),
  })
}

/** Instant render of a single component's mini fixture. */
function ShowcaseCard({ section, onAction }: { section: ShowcaseSection; onAction: ReturnType<typeof useShowcaseActions> }) {
  const stream = useOpenUIStream()
  useEffect(() => {
    stream.loadInstant(section.fixture)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div>
        <code className="text-xs font-semibold text-foreground">{section.name}</code>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{section.description}</p>
      </div>
      <div className="rounded-md border border-border/60 bg-background/40 p-3">
        <OpenUIDemoRenderer stream={stream} onAction={onAction} showProgressBar={false} />
      </div>
    </div>
  )
}

/**
 * /showcase — proves all 17 Ls* components render, without relying on LLM/stream
 * timing. Each section renders a minimal fixture instantly; "Stream all" streams
 * a single program nesting every component.
 */
export function ComponentShowcasePage() {
  const onAction = useShowcaseActions()
  const allStream = useOpenUIStream()

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        icon={LayoutGrid}
        title="OpenUI Component Showcase"
        breadcrumb={["OpenUI", "Showcase"]}
        subtitle={`All ${SHOWCASE_COMPONENT_NAMES.length} Ls* components · instant gallery + streamed`}
        actions={
          <Button
            size="sm"
            onClick={() => void allStream.replay(SHOWCASE_FIXTURE)}
            disabled={allStream.isStreaming}
            className="h-7 gap-1.5 bg-[var(--primary)] text-xs text-white hover:bg-[var(--primary)]/90"
          >
            <Play className="size-3.5" aria-hidden="true" />
            {allStream.isStreaming ? "Streaming…" : "Stream all"}
          </Button>
        }
      />

      {/* Coverage checklist */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="section-label mb-2">Component coverage — {SHOWCASE_COMPONENT_NAMES.length} / 17</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3 lg:grid-cols-4">
          {SHOWCASE_COMPONENT_NAMES.map((name) => (
            <span key={name} className="flex items-center gap-1.5 text-xs text-foreground">
              <CheckCircle2 className="size-3.5 shrink-0 text-[var(--positive)]" aria-hidden="true" />
              <code className="text-[11px]">{name}</code>
            </span>
          ))}
        </div>
      </div>

      {/* Streamed "all components" output (appears after Stream all) */}
      {allStream.response !== null && (
        <div className="rounded-lg border border-[var(--primary)]/30 bg-card p-4">
          <p className="section-label mb-3">Streamed program — all components</p>
          <OpenUIDemoRenderer stream={allStream} onAction={onAction} />
        </div>
      )}

      {/* Per-component instant gallery */}
      <div>
        <p className="section-label mb-2">Instant gallery</p>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {SHOWCASE_SECTIONS.map((section) => (
            <ShowcaseCard key={section.name} section={section} onAction={onAction} />
          ))}
        </div>
      </div>
    </div>
  )
}
