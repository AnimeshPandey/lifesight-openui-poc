import { useRef } from "react"
import { RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OpenUIDemoRenderer } from "@/components/openui-demo-renderer"
import type { OpenUIStreamApi } from "@/hooks/useOpenUIStream"
import type { ActionEvent } from "@openuidev/react-lang"

interface CockpitAlertDetailProps {
  stream: OpenUIStreamApi
  selectedLabel: string | null
  fixtureSource: "fixture" | "generated" | null
  onReplay: () => void
  onAction: (e: ActionEvent) => void
}

/**
 * Renders the selected alert's OpenUI detail panel below the spend table.
 * Shows which fixture source was used (streamed fixture vs Tier C generated).
 */
export function CockpitAlertDetail({
  stream,
  selectedLabel,
  fixtureSource,
  onReplay,
  onAction,
}: CockpitAlertDetailProps) {
  const ref = useRef<HTMLDivElement>(null)

  if (!selectedLabel && !stream.response && !stream.isStreaming) {
    return (
      <div
        id="cockpit-alert-detail"
        className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/50 py-10 text-center"
      >
        <Sparkles className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        <p className="text-xs text-muted-foreground">
          Click a spend row above to stream the Sentinel alert detail here
        </p>
      </div>
    )
  }

  return (
    <div id="cockpit-alert-detail" ref={ref} className="space-y-3 scroll-mt-16">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
          <p className="text-xs font-semibold text-foreground">
            {selectedLabel ?? "Sentinel Alert Detail"}
          </p>
          {fixtureSource === "generated" && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
              Generated from live data
            </span>
          )}
          {fixtureSource === "fixture" && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              Streamed fixture
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1.5 text-xs"
          onClick={onReplay}
          disabled={stream.isStreaming}
        >
          <RefreshCw className={`h-3 w-3 ${stream.isStreaming ? "animate-spin" : ""}`} aria-hidden="true" />
          {stream.isStreaming ? "Streaming…" : "Replay alert stream"}
        </Button>
      </div>

      <OpenUIDemoRenderer
        stream={stream}
        onAction={onAction}
        skeletonVariant="panel"
        emptyHint="Streaming Sentinel analysis…"
        showThoughts={true}
        thoughts={[
          "Loading alert context",
          "Pulling spend pacing data",
          "Computing revenue at risk",
          "Composing recommended steps",
          "Streaming alert detail",
        ]}
      />
    </div>
  )
}
