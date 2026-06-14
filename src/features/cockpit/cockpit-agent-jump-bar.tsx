import { useEffect, useState } from "react"

interface AgentTab {
  id: string
  label: string
  show: boolean
}

interface CockpitAgentJumpBarProps {
  agentLive: {
    alignment: boolean
    goals: boolean
    media: boolean
    data: boolean
    model: boolean
    onboarding: boolean
  }
}

/**
 * Sticky pill navigation bar that scrolls to each live agent widget section.
 * Shows a "↑ Top" button after the user scrolls 200px. Mirrors ls4x jump bar.
 */
export function CockpitAgentJumpBar({ agentLive }: CockpitAgentJumpBarProps) {
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const main = document.getElementById("main-content") ?? document.documentElement
    const handler = () => setShowTop(main.scrollTop > 200)
    main.addEventListener("scroll", handler, { passive: true })
    return () => main.removeEventListener("scroll", handler)
  }, [])

  const tabs: AgentTab[] = [
    { id: "agent-alignment",  label: "Alignment",  show: agentLive.alignment },
    { id: "agent-goals",      label: "Goals",      show: agentLive.goals },
    { id: "agent-media",      label: "Media",      show: agentLive.media },
    { id: "agent-data",       label: "Data",       show: agentLive.data },
    { id: "agent-model",      label: "Model",      show: agentLive.model },
    { id: "agent-onboarding", label: "Onboarding", show: agentLive.onboarding },
  ].filter((t) => t.show)

  if (tabs.length === 0) return null

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const scrollTop = () => {
    const el = document.getElementById("cockpit-top") ?? document.getElementById("main-content")
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="flex items-center gap-1 flex-wrap border-b border-border pb-2 sticky top-0 z-20 bg-background pt-2 -mt-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          className="text-[10px] px-2 py-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => scrollTo(t.id)}
        >
          {t.label}
        </button>
      ))}
      {showTop && (
        <>
          <span className="w-px h-4 bg-border mx-0.5" aria-hidden="true" />
          <button
            className="text-[10px] px-2 py-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors font-medium"
            onClick={scrollTop}
          >
            ↑ Top
          </button>
        </>
      )}
    </div>
  )
}
