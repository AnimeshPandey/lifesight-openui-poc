import { Compass } from "lucide-react"
import { type DemoSpeed, useDemoStore } from "@/stores/useDemoStore"
import { useTourStore } from "@/components/guided-tour"
import { cn } from "@/lib/utils"

const SPEEDS: { value: DemoSpeed; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "slow", label: "Slow" },
]

/**
 * Header demo controls: a global "Streaming" indicator (lit whenever any OpenUI
 * stream is in flight) plus a demo-speed toggle (Slow makes progressive
 * streaming impossible to miss). Both read the shared useDemoStore.
 */
export function DemoControls() {
  const activeStreams = useDemoStore((s) => s.activeStreams)
  const speed = useDemoStore((s) => s.speed)
  const setSpeed = useDemoStore((s) => s.setSpeed)
  const streaming = activeStreams > 0
  const startTour = useTourStore((s) => s.start)

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={startTour}
        className="flex items-center gap-1 rounded-md border border-border bg-accent px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Start guided tour"
      >
        <Compass className="size-3" aria-hidden="true" />
        Tour
      </button>

      <span
        className={cn(
          "flex items-center gap-1.5 text-[11px] transition-opacity",
          streaming ? "text-[var(--primary)] opacity-100" : "opacity-0"
        )}
        aria-hidden={!streaming}
        aria-live="polite"
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--primary)] opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-[var(--primary)]" />
        </span>
        Streaming
      </span>

      <div
        className="hidden items-center rounded-md border border-border bg-accent p-0.5 sm:flex"
        role="group"
        aria-label="Demo speed"
      >
        {SPEEDS.map((s) => (
          <button
            key={s.value}
            onClick={() => setSpeed(s.value)}
            aria-pressed={speed === s.value}
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
              speed === s.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
