import type { ActionEvent } from "@openuidev/react-lang"
import { useEffect, useState } from "react"
import { ShieldCheck, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { HITL_FIXTURE } from "@/mocks/fixtures/hitl"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/page-header"
import { DecisionJourney } from "@/components/decision-journey"
import { useOpenUIStream } from "@/hooks/useOpenUIStream"
import { OpenUIDemoRenderer } from "@/components/openui-demo-renderer"

type ApprovalResult = "pending" | "approved" | "rejected"

/**
 * /hitl/:id — HITL Governance Approval Checkpoint
 *
 * Demonstrates: LsApprovalPanel (new component — governance tier badge,
 * approver role, deadline, Approve/Reject buttons), LsCard, LsActionInaction
 * (condensed final framing), LsConfidenceBadge, LsInfoPanel (governance policy
 * note), LsStepPlan (post-approval execution steps), LsKpiRow.
 *
 * The approval panel streams in progressively via the shared useOpenUIStream
 * controller, then fires onAction({ humanFriendlyMessage: "Approve Decision" |
 * "Send Back..." }). This page surfaces an immediate toast and shows a
 * post-approval confirmation state.
 *
 * This is the 4.0 use case #7: HITL checkpoint panel — closes the decision lifecycle.
 */
export function HitlPage() {
  const [result, setResult] = useState<ApprovalResult>("pending")
  const stream = useOpenUIStream()

  // Auto-stream the approval panel on mount so it assembles progressively.
  useEffect(() => {
    void stream.replay(HITL_FIXTURE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleAction(event: ActionEvent) {
    const approving = event.humanFriendlyMessage?.toLowerCase().includes("approve")
    // Fire the toast IMMEDIATELY, then transition state.
    if (approving) {
      toast.success("Decision approved — releasing for execution")
      setResult("approved")
    } else {
      toast.info("Sent back for revision")
      setResult("rejected")
    }
  }

  return (
    <div className="space-y-4">
      <DecisionJourney />
      <PageHeader
        title="Media Reallocation — Approvals"
        subtitle="Human-in-the-loop · Governance T2"
        icon={ShieldCheck}
        breadcrumb={["Deploy", "Approvals"]}
        badge={
          result !== "pending" ? (
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                result === "approved"
                  ? "border-positive/30 bg-positive/10 text-positive"
                  : "border-[var(--negative)]/30 bg-[var(--negative)]/10 text-[var(--negative)]"
              )}
            >
              {result === "approved" ? "Decision Approved" : "Sent Back for Revision"}
            </span>
          ) : undefined
        }
      />

      <div>
        <h3 className="text-sm font-semibold text-foreground">Approvals</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Review and sign off on the recommended media reallocation. Approving this checkpoint
          releases the decision for execution and starts monitoring.
        </p>
      </div>

      {/* OpenUI approval panel — streams in, disabled after action */}
      {result === "pending" && (
        <OpenUIDemoRenderer stream={stream} onAction={handleAction} />
      )}

      {/* Post-approval confirmation */}
      {result === "approved" && (
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-positive" aria-hidden="true" />
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Decision approved</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Here's what happens next:</p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-foreground">
                {[
                  "Status updated to 'Approved' — media agency brief sent automatically",
                  "Budget shift will execute in Meta Ads Manager within 24h",
                  "Monitoring agent activated — weekly ROI vs forecast check begins Dec 15",
                  "If actual ROI deviates >20% from forecast, a new HITL checkpoint fires",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-positive" aria-hidden="true" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {result === "rejected" && (
        <div className="flex flex-col gap-3 rounded-xl border border-[var(--negative)]/30 bg-[var(--negative)]/5 p-5">
          <p className="text-sm font-semibold text-[var(--negative)]">Decision sent back for revision:</p>
          <p className="text-sm text-foreground">
            The analytics team will receive your feedback and update the evidence package.
            You'll be notified when it's ready for re-review.
          </p>
        </div>
      )}
    </div>
  )
}
