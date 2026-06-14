import { useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Compass, X } from "lucide-react"
import { create } from "zustand"
import { Button } from "@/components/ui/button"

/**
 * A self-contained "Guided Tour" overlay that walks a reviewer through the POC.
 * No external tour lib — driven by a tiny local zustand store + TanStack Router
 * navigation. Each step carries a navigation target; param routes use the typed
 * form so they type-check against the route tree.
 */

/** A single tour stop. `nav` is passed straight to `useNavigate()`. */
type TourStep = {
  title: string
  body: string
  nav:
    | { to: "/showcase" | "/cockpit" | "/geo" }
    | { to: "/decisions/$id"; params: { id: string } }
    | { to: "/hitl/$id"; params: { id: string } }
}

const STEPS: TourStep[] = [
  {
    title: "Welcome",
    body: "OpenUI renders agent responses as live UI. This is the 17-component showcase.",
    nav: { to: "/showcase" },
  },
  {
    title: "Streaming",
    body: "Watch the alert assemble progressively — structure first, then data. Try Demo speed → Slow.",
    nav: { to: "/cockpit" },
  },
  {
    title: "Evidence",
    body: "Geo holdout results: KPIs, confidence, charts — all from one streamed program.",
    nav: { to: "/geo" },
  },
  {
    title: "Decision",
    body: "The decision packet: Action vs Inaction, scenarios, confidence.",
    nav: { to: "/decisions/$id", params: { id: "media-reallocation-001" } },
  },
  {
    title: "Approval",
    body: "Human-in-the-loop checkpoint. Approve to close the loop.",
    nav: { to: "/hitl/$id", params: { id: "media-reallocation-001" } },
  },
  {
    title: "MIA",
    body: "Press Alt+C anywhere to open MIA — the same question answers differently per page context.",
    nav: { to: "/showcase" },
  },
]

interface TourStore {
  active: boolean
  step: number
  start: () => void
  next: () => void
  prev: () => void
  stop: () => void
}

export const useTourStore = create<TourStore>((set) => ({
  active: false,
  step: 0,
  start: () => set({ active: true, step: 0 }),
  next: () => set((s) => ({ step: Math.min(s.step + 1, STEPS.length - 1) })),
  prev: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),
  stop: () => set({ active: false, step: 0 }),
}))

/**
 * Bottom-center overlay card. Renders nothing when the tour is inactive.
 * Navigates on every step change (start/next/prev) and on Escape stops the tour.
 */
export function GuidedTour() {
  const navigate = useNavigate()
  const active = useTourStore((s) => s.active)
  const step = useTourStore((s) => s.step)
  const next = useTourStore((s) => s.next)
  const prev = useTourStore((s) => s.prev)
  const stop = useTourStore((s) => s.stop)

  const current = STEPS[step]

  // Navigate to the current step's route whenever it changes while active.
  useEffect(() => {
    if (!active || !current) return
    void navigate(current.nav)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, step])

  // Escape stops the tour from anywhere.
  useEffect(() => {
    if (!active) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") stop()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [active, stop])

  if (!active || !current) return null

  const isFirst = step === 0
  const isLast = step === STEPS.length - 1

  return (
    <div
      role="dialog"
      aria-label="Guided tour"
      aria-modal="false"
      className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 rounded-lg border border-border bg-card p-4 shadow-2xl"
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md text-white"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--primary), var(--primary-cta-dark))",
          }}
        >
          <Compass className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">{current.title}</h2>
            <span className="shrink-0 text-[10px] text-muted-foreground">
              Step {step + 1} / {STEPS.length}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {current.body}
          </p>
        </div>
        <button
          onClick={stop}
          aria-label="Close tour"
          className="-mr-1 -mt-1 shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={prev}
          disabled={isFirst}
          className="h-7 text-xs"
        >
          Back
        </Button>
        {isLast ? (
          <Button size="sm" onClick={stop} className="h-7 text-xs">
            Done
          </Button>
        ) : (
          <Button size="sm" onClick={next} className="h-7 text-xs">
            Next
          </Button>
        )}
      </div>
    </div>
  )
}

/** Convenience hook for triggering the tour (e.g. from the header button). */
export function useTour() {
  return useTourStore((s) => ({ active: s.active, start: s.start, stop: s.stop }))
}

export { STEPS as TOUR_STEPS }
