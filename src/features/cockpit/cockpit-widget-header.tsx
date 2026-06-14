import { Bot, ArrowRight, Sparkles } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { CardTitle } from "@/components/ui/card"
import { useMia } from "@/providers/mia-provider"

interface CockpitWidgetHeaderProps {
  title: string
  agentId: string
  agentName: string
  meta?: string
  insightsHref?: string
  askPrompt?: string
}

/**
 * Shared header for every Cockpit agent widget — mirrors ls4x WidgetHeader.
 * Shows title, agent pill (links to /agent), optional meta text,
 * optional Insights link, and an Ask→MIA button.
 */
export function CockpitWidgetHeader({
  title,
  agentId,
  agentName,
  meta,
  insightsHref,
  askPrompt,
}: CockpitWidgetHeaderProps) {
  const { openPanel } = useMia()

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <Link
          to="/agent"
          search={{ agent: agentId } as never}
          className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground transition-colors bg-muted/50 rounded-full px-2 py-0.5 shrink-0"
        >
          <Bot className="h-2.5 w-2.5" aria-hidden="true" />
          {agentName}
        </Link>
        {meta && (
          <span className="text-[10px] text-muted-foreground truncate">{meta}</span>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {insightsHref && (
          <Link
            to={insightsHref as never}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Insights <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        )}
        <button
          onClick={() =>
            openPanel({
              source: "Cockpit",
              module: title,
              ...(askPrompt ? { askPrompt } : {}),
            } as never)
          }
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          Ask
        </button>
      </div>
    </div>
  )
}
