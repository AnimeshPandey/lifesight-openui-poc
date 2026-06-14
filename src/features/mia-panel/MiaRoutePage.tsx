import { useEffect } from "react"
import { Sparkles } from "lucide-react"
import { useMia } from "@/providers/mia-provider"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"

/**
 * /mia — launcher / fullscreen fallback. MIA itself is now a global docked
 * panel (Alt+C or the header ✨), so this route auto-opens the panel on mount
 * and explains where MIA lives, rather than duplicating the panel's content.
 */
export function MiaRoutePage() {
  const { openPanel, open } = useMia()

  useEffect(() => {
    openPanel({ source: "MIA route" })
  }, [openPanel])

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Sparkles}
        title="MIA"
        subtitle="Marketing Intelligence Assistant — a context-aware docked copilot"
        breadcrumb={["Intelligence", "MIA"]}
      />
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-10 text-center">
        <span
          className="flex size-12 items-center justify-center rounded-full text-white"
          style={{ backgroundImage: "linear-gradient(135deg, var(--primary), var(--primary-cta-dark))" }}
        >
          <Sparkles className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">MIA opens as a docked panel</p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            The same question yields a different structured answer per page context
            (Models · Experiments · MMM · Campaigns). Open it anywhere with{" "}
            <kbd className="rounded border border-border bg-accent px-1 py-0.5 text-[10px]">Alt</kbd>
            {" + "}
            <kbd className="rounded border border-border bg-accent px-1 py-0.5 text-[10px]">C</kbd>
            {" "}or the ✨ in the header.
          </p>
        </div>
        {!open && (
          <Button size="sm" onClick={() => openPanel({ source: "MIA route" })} className="h-8">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Open MIA
          </Button>
        )}
      </div>
    </div>
  )
}
