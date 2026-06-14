import { useEffect } from "react"
import { AlertTriangle, GitCompareArrows, Play } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { OpenUIDemoRenderer } from "@/components/openui-demo-renderer"
import { useOpenUIStream } from "@/hooks/useOpenUIStream"
import { AGENT_FIXTURE } from "@/mocks/fixtures/agent"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

/**
 * /compare — Before vs After. The same agent response rendered two ways:
 *  LEFT  — what Lifesight 3.0's json-render pipeline produces today: a set of
 *          widget types that were never implemented, so users see blank space.
 *  RIGHT — the OpenUI 4.0 generative-UI pipeline, streamed via the shared infra.
 */

/** A single 3.0 widget gap — a dashed placeholder mimicking what json-render emits. */
function LegacyWidgetStub({ label }: { label: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-dashed border-border/70 bg-background/30 p-3 text-xs text-muted-foreground">
      <AlertTriangle className="mt-px size-3.5 shrink-0 text-[var(--negative)]/70" aria-hidden="true" />
      <span className="font-mono">{label}</span>
    </div>
  )
}

export function ComparePage() {
  const stream = useOpenUIStream()

  useEffect(() => {
    void stream.replay(AGENT_FIXTURE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        icon={GitCompareArrows}
        title="Before vs After — OpenUI vs json-render"
        subtitle="The same agent response: 3.0 stubbed widgets vs OpenUI generative UI"
        breadcrumb={["OpenUI", "Compare"]}
        actions={
          <Button size="sm" onClick={() => void stream.replay(AGENT_FIXTURE)}>
            <Play aria-hidden="true" />
            Replay
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* ── LEFT: 3.0 json-render (stubbed / blank) ─────────────────────────── */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center rounded-sm bg-accent px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Before
              </span>
              3.0 — json-render
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <LegacyWidgetStub label="WidgetType.Table — not implemented (returns null)" />
            <LegacyWidgetStub label="WidgetType.Comparison — not implemented (returns null)" />
            <LegacyWidgetStub label="Vega-Lite spec — render failed" />
            <p className="text-[11px] text-muted-foreground/70">
              json-render maps each widget to a hard-coded React component. Unhandled
              widget types fall through to <code className="font-mono">null</code>, so the
              user sees blank space — this is what ships today.
            </p>
          </CardContent>
        </Card>

        {/* ── RIGHT: 4.0 OpenUI (live generative UI) ──────────────────────────── */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center rounded-sm bg-[var(--primary)]/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--primary)]">
                After
              </span>
              4.0 OpenUI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OpenUIDemoRenderer stream={stream} skeletonVariant="analytics" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
