import { ChevronLeft } from "lucide-react"
import { useRouter, useRouterState } from "@tanstack/react-router"
import { pathSection } from "@/lib/navigation"

/**
 * Stubbed back navigation — ls4x tracks a sessionStorage history stack; the POC
 * keeps it light: a back affordance that only appears on detail routes
 * (decisions/template/hitl), mirroring where ls4x shows it above the page body.
 */
const DETAIL_SECTIONS = new Set(["decisions", "template", "hitl"])

export function BackNavigation() {
  const router = useRouter()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  if (!DETAIL_SECTIONS.has(pathSection(pathname))) {
    return null
  }

  return (
    <button
      onClick={() => router.history.back()}
      className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      <ChevronLeft className="size-3.5" aria-hidden="true" />
      Back
    </button>
  )
}
