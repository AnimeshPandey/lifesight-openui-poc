import { Fragment } from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import { Check, ChevronRight } from "lucide-react"
import { pathSection } from "@/lib/navigation"
import { cn } from "@/lib/utils"

/**
 * Decision Journey stepper — links the commercial decision-lifecycle routes
 * into one followable narrative: Detect → Measure → Decide → Approve.
 *
 * The active stage is derived from the first path segment of the current
 * route. "Measure" spans the three Intelligence routes (geo/mmm/attribution),
 * so any of those highlights the same stage. It is always safe to render: if
 * the route matches no stage, nothing is highlighted (no completed checks).
 */

type StageLink =
  | { to: "/cockpit" }
  | { to: "/geo" }
  | { to: "/decisions/$id"; params: { id: string } }
  | { to: "/hitl/$id"; params: { id: string } }

interface Stage {
  /** Display label. */
  label: string
  /** First path segments that map to this stage. */
  sections: string[]
  /** Typed TanStack Link target. */
  link: StageLink
}

const STAGES: Stage[] = [
  { label: "Detect", sections: ["cockpit"], link: { to: "/cockpit" } },
  {
    label: "Measure",
    sections: ["geo", "mmm", "attribution"],
    link: { to: "/geo" },
  },
  {
    label: "Decide",
    sections: ["decisions"],
    link: { to: "/decisions/$id", params: { id: "media-reallocation-001" } },
  },
  {
    label: "Approve",
    sections: ["hitl"],
    link: { to: "/hitl/$id", params: { id: "media-reallocation-001" } },
  },
]

export function DecisionJourney() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const section = pathSection(pathname)

  // Index of the active stage, or -1 when the route maps to no stage.
  const activeIndex = STAGES.findIndex((s) => s.sections.includes(section))

  return (
    <nav
      aria-label="Decision journey"
      className="flex items-center gap-1 text-xs"
    >
      {STAGES.map((stage, i) => {
        const isActive = i === activeIndex
        const isComplete = activeIndex > -1 && i < activeIndex

        return (
          <Fragment key={stage.label}>
            {i > 0 && (
              <ChevronRight
                className="size-3 shrink-0 text-border"
                aria-hidden="true"
              />
            )}
            <Link
              {...stage.link}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-md border px-2.5 transition-colors",
                isActive
                  ? "border-[--primary] bg-[--primary]/10 text-[--primary] font-medium"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
              )}
            >
              {isComplete ? (
                <Check className="size-3 shrink-0" aria-hidden="true" />
              ) : (
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] leading-none",
                    isActive
                      ? "bg-[--primary] text-[--primary-foreground]"
                      : "bg-accent text-muted-foreground",
                  )}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
              )}
              <span>{stage.label}</span>
            </Link>
          </Fragment>
        )
      })}
    </nav>
  )
}
