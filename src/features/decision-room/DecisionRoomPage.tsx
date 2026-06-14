import type { ActionEvent } from "@openuidev/react-lang"
import { Link, useNavigate, useParams } from "@tanstack/react-router"
import { FlaskConical, Radio } from "lucide-react"
import { useEffect, useState } from "react"
import { DECISIONS_ANALYST_SUFFIX, DECISIONS_FIXTURE } from "@/mocks/fixtures/decisions"
import { useDecisionPacket } from "@/api/useDecisionPacket"
import { useUiModeStore } from "@/stores/useUiModeStore"
import { useOpenUIStream } from "@/hooks/useOpenUIStream"
import { OpenUIDemoRenderer } from "@/components/openui-demo-renderer"
import { createOpenUIActionHandler } from "@/lib/openui-actions"
import { useMia } from "@/providers/mia-provider"
import { UiModeToggle } from "./UiModeToggle"
import { PageHeader } from "@/components/page-header"
import { DecisionJourney } from "@/components/decision-journey"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const STATUS_LABEL: Record<string, string> = {
  recommendation_drafted: "Recommendation Ready",
  awaiting_approval: "Awaiting Approval",
  approved: "Approved",
  in_analysis: "In Analysis",
}

/**
 * /decisions/:id — Decision Room with Executive/Analyst toggle + Stream mode
 *
 * Two load modes demonstrated (Stream is the default):
 *  - Stream: progressive 3-tab layout assembly via useOpenUIStream.replay
 *  - Fixture: instant load via useOpenUIStream.loadInstant
 *  - Analyst suffix: same Renderer + extra detail panel via string concatenation
 *
 * Streaming UX (skeleton / progress / parse banner / keyed Renderer) is owned by
 * OpenUIDemoRenderer; abort/race handling is owned by useOpenUIStream.
 *
 * Covers: 4.0 use case #2 (Action/Inaction), #3 (Scenario matrix), #5 (streaming
 * Decision Packet assembly).
 */
export function DecisionRoomPage() {
  const { id } = useParams({ from: "/decisions/$id" })
  const { data: packet, isLoading } = useDecisionPacket(id)
  const { mode } = useUiModeStore()
  const [streamMode, setStreamMode] = useState(true)
  const stream = useOpenUIStream()
  const navigate = useNavigate()
  const { openPanel } = useMia()

  function getFixture() {
    return mode === "analyst" ? DECISIONS_FIXTURE + DECISIONS_ANALYST_SUFFIX : DECISIONS_FIXTURE
  }

  useEffect(() => {
    if (streamMode) void stream.replay(getFixture())
    else stream.loadInstant(getFixture())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, mode, streamMode])

  // Chips like "Draft approval memo" pivot straight to the HITL review; everything
  // else falls back to the shared toast + MIA handler.
  const sharedAction = createOpenUIActionHandler({
    route: "Decision Room",
    navigate: (to) => navigate({ to: to as string }),
    openMia: (o) => openPanel(o),
  })
  const handleAction = (event: ActionEvent) => {
    const msg = (event.humanFriendlyMessage ?? "").trim()
    if (/approval|memo|hitl/i.test(msg)) {
      navigate({ to: "/hitl/$id", params: { id: "media-reallocation-001" } })
      return
    }
    sharedAction(event)
  }

  const title = isLoading ? "Loading decision…" : (packet?.title ?? id)

  const statusBadge = packet ? (
    <Badge
      variant="secondary"
      className="text-xs capitalize bg-[var(--primary)]/15 text-[var(--primary)] border-0"
    >
      {STATUS_LABEL[packet.status] ?? packet.status.replace(/_/g, " ")}
    </Badge>
  ) : undefined

  const subtitle = packet ? (
    <>
      {packet.decision_type.replace(/_/g, " ")} · Owner:{" "}
      <span className="text-foreground">{packet.owner}</span>
      {" · "}Confidence:{" "}
      <span
        className={
          packet.confidence_level === "high"
            ? "text-[var(--positive)]"
            : packet.confidence_level === "medium"
              ? "text-[var(--warning)]"
              : "text-[var(--negative)]"
        }
      >
        {packet.confidence_level}
      </span>
    </>
  ) : undefined

  const actions = (
    <>
      {/* Fixture / Stream mode toggle */}
      <Button
        size="sm"
        variant={streamMode ? "default" : "secondary"}
        onClick={() => setStreamMode((v) => !v)}
        className={[
          "h-7 gap-1.5 text-xs",
          streamMode && "bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {streamMode ? (
          <>
            <Radio className="size-3.5" aria-hidden="true" />
            Stream
          </>
        ) : (
          <>
            <FlaskConical className="size-3.5" aria-hidden="true" />
            Fixture
          </>
        )}
      </Button>
      {stream.isStreaming && (
        <span className="animate-pulse text-xs text-[var(--primary)]">assembling…</span>
      )}
      <UiModeToggle />
    </>
  )

  return (
    <div className="space-y-4">
      <DecisionJourney />
      <PageHeader title={title} badge={statusBadge} subtitle={subtitle} actions={actions} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="h-8">
          <TabsTrigger value="overview" className="text-xs h-7">
            Overview
          </TabsTrigger>
          <TabsTrigger value="approvals" className="text-xs h-7">
            Approvals
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs h-7">
            Audit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OpenUIDemoRenderer stream={stream} onAction={handleAction} />
        </TabsContent>

        <TabsContent value="approvals">
          <Link
            to="/hitl/$id"
            params={{ id: "media-reallocation-001" }}
            className="flex items-center justify-between rounded-lg border border-border bg-card p-4 text-sm text-foreground transition-colors hover:border-[var(--primary)]/50 hover:bg-accent"
          >
            <span className="flex flex-col gap-0.5">
              <span className="font-medium">Approvals</span>
              <span className="text-xs text-muted-foreground">
                Review and action pending human-in-the-loop approvals for this decision.
              </span>
            </span>
            <span className="text-[var(--primary)]">Open approvals →</span>
          </Link>
        </TabsContent>

        <TabsContent value="audit">
          <p className="text-sm text-muted-foreground">Audit trail — coming soon</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
