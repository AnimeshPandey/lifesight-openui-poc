import { Sparkles, X, RefreshCw } from "lucide-react"
import { useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import { MIA_FIXTURE } from "@/mocks/fixtures/mia"
import { MIA_EXPERIMENTS_FIXTURE } from "@/mocks/fixtures/mia-experiments"
import { MIA_MMM_FIXTURE } from "@/mocks/fixtures/mia-mmm"
import { MIA_CAMPAIGNS_FIXTURE } from "@/mocks/fixtures/mia-campaigns"
import { useOpenUIStream } from "@/hooks/useOpenUIStream"
import { OpenUIDemoRenderer } from "@/components/openui-demo-renderer"
import { createOpenUIActionHandler } from "@/lib/openui-actions"
import { useContextStore } from "@/stores/useContextStore"
import { useMia } from "@/providers/mia-provider"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type Module = "Models" | "Experiments" | "MMM" | "Campaigns"

const MODULE_FIXTURES: Record<Module, string> = {
  Models: MIA_FIXTURE,
  Experiments: MIA_EXPERIMENTS_FIXTURE,
  MMM: MIA_MMM_FIXTURE,
  Campaigns: MIA_CAMPAIGNS_FIXTURE,
}

const MODULES: Module[] = ["Models", "Experiments", "MMM", "Campaigns"]
const MIA_QUERY = "Which channels drive incremental impact?"

/**
 * Header trigger that opens/closes the docked MIA panel (also bound to Alt+C).
 */
export function MiaTrigger() {
  const { togglePanel, open } = useMia()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePanel}
          aria-label="Ask MIA"
          aria-pressed={open}
          className={cn("h-8 w-8", open && "text-primary")}
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Ask MIA · Alt+C</TooltipContent>
    </Tooltip>
  )
}

/**
 * Docked MIA panel — a 420px right rail (ls4x parity). Demonstrates the core
 * 4.0 MIA behaviour: the SAME question yields a DIFFERENT structured answer per
 * page context. Streams OpenUI fixtures through the Renderer; no backend.
 */
export function MiaPanel() {
  const { open, source, closePanel } = useMia()
  const { context, setContext } = useContextStore()
  const activeModule: Module =
    (context.module as Module) in MODULE_FIXTURES ? (context.module as Module) : "Models"

  const stream = useOpenUIStream()
  const navigate = useNavigate()
  const handleAction = createOpenUIActionHandler({
    route: "MIA",
    navigate: (to) => navigate({ to }),
  })

  // Stream the active module's fixture whenever the panel opens.
  useEffect(() => {
    if (open) void stream.replay(MODULE_FIXTURES[activeModule])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function switchModule(module: Module) {
    if (stream.isStreaming) return
    setContext({ module })
    void stream.replay(MODULE_FIXTURES[module])
  }

  if (!open) return null

  return (
    <aside
      className="flex h-full w-[420px] shrink-0 flex-col border-l border-border bg-card"
      aria-label="MIA panel"
    >
      {/* Gradient header */}
      <div
        className="relative shrink-0 px-4 py-3 text-white"
        style={{ backgroundImage: "linear-gradient(135deg, var(--primary), var(--primary-cta-dark))" }}
      >
        <button
          onClick={closePanel}
          aria-label="Close MIA panel"
          className="absolute right-3 top-3 rounded p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="size-4" aria-hidden="true" />
          <span className="text-sm font-semibold">MIA</span>
        </div>
        <p className="mt-1 pr-6 text-xs text-white/85">"{MIA_QUERY}"</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-white/80">
          <span className="rounded bg-white/15 px-1.5 py-0.5">{context.entity}</span>
          <span className="rounded bg-white/15 px-1.5 py-0.5">
            {context.dateRange.from} → {context.dateRange.to}
          </span>
          {source && <span className="rounded bg-white/15 px-1.5 py-0.5">from {source}</span>}
        </div>
      </div>

      {/* Module context switcher */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-2">
        <span className="section-label">Context</span>
        <div className="flex gap-0.5 rounded-md border border-border bg-accent p-0.5">
          {MODULES.map((mod) => (
            <button
              key={mod}
              onClick={() => switchModule(mod)}
              disabled={stream.isStreaming}
              className={cn(
                "rounded px-2 py-0.5 text-[11px] font-medium transition-colors disabled:opacity-60",
                activeModule === mod
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {mod}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="thin-scrollbar flex-1 overflow-auto p-4">
        <OpenUIDemoRenderer stream={stream} onAction={handleAction} showParseErrors={false} />
      </div>

      {/* Footer — replay + stubbed ask bar */}
      <div className="shrink-0 border-t border-border p-3">
        <div className="flex items-center gap-2">
          <input
            disabled
            placeholder="Ask MIA about NovaBrand…"
            aria-label="Ask MIA (stubbed)"
            className="flex-1 rounded-md border border-border bg-input px-2 text-xs text-muted-foreground placeholder:text-muted-foreground/70"
          />
          <Button
            size="icon"
            variant="secondary"
            onClick={() => void stream.replay(MODULE_FIXTURES[activeModule])}
            disabled={stream.isStreaming}
            aria-label="Replay response"
            className="h-7 w-7 shrink-0"
          >
            <RefreshCw className={cn("size-3.5", stream.isStreaming && "animate-spin")} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
