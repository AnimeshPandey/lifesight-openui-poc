import { Microscope, Zap } from "lucide-react"
import { useUiModeStore } from "@/stores/useUiModeStore"
import { Button } from "@/components/ui/button"

/**
 * Executive / Analyst mode toggle.
 *
 * Executive (default): clean dual-card + simulation matrix — decision at a glance.
 * Analyst: same layout + additional model detail panel (training stats, R², MAPE).
 *
 * Demonstrates the 4.0 UX_SPEC principle: "Executive-simple, Analyst-deep".
 */
export function UiModeToggle() {
  const { mode, toggle } = useUiModeStore()
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">View</span>
      <Button
        size="sm"
        variant="secondary"
        onClick={toggle}
        className="h-7 gap-1.5 text-xs"
        title={
          mode === "executive"
            ? "Switch to Analyst view — adds model detail panel"
            : "Switch to Executive view — decisions at a glance"
        }
      >
        {mode === "executive" ? (
          <>
            <Zap className="size-3.5" aria-hidden="true" />
            Executive
          </>
        ) : (
          <>
            <Microscope className="size-3.5" aria-hidden="true" />
            Analyst
          </>
        )}
      </Button>
    </div>
  )
}
