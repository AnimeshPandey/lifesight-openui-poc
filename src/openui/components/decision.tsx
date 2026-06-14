import { defineComponent, useTriggerAction } from "@openuidev/react-lang"
import { z } from "zod/v4"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export const LsActionInaction = defineComponent({
  name: "LsActionInaction",
  description:
    "Executive dual-card showing Action vs Inaction side-by-side. Left = Act (positive framing), Right = Don't Act (cost/risk). Core of the decision-first UX. Always use on /decisions routes.",
  props: z.object({
    action_label: z
      .string()
      .describe("Heading for the 'Act' card, e.g. 'Reallocate Media Budget'."),
    action_summary: z.string().describe("One-sentence description of the action."),
    action_kpis: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .describe("2–3 projected outcome KPIs."),
    inaction_label: z.string().describe("Heading for the 'Don't Act' card."),
    inaction_summary: z.string().describe("One-sentence cost/risk of inaction."),
    inaction_kpis: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .describe("2–3 cost/risk KPIs."),
  }),
  component: ({ props }) => (
    <div className="grid grid-cols-2 gap-2">
      {/* Act panel */}
      <div className="rounded-md border border-emerald-900/30 bg-emerald-950/30 p-3">
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-emerald-400">
          If we act
        </p>
        <div className="mb-2 flex items-center gap-2">
          <TrendingUp className="size-4 text-emerald-400" />
          <p className="text-sm font-semibold text-foreground">{props.action_label}</p>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{props.action_summary}</p>
        <div className="flex flex-col gap-1.5">
          {props.action_kpis.map((k, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{k.label}</span>
              <span className="font-medium tabular-nums text-foreground">{k.value}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Don't Act panel */}
      <div className="rounded-md border border-red-900/30 bg-red-950/30 p-3">
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-red-400">
          If we don&apos;t
        </p>
        <div className="mb-2 flex items-center gap-2">
          <TrendingDown className="size-4 text-red-400" />
          <p className="text-sm font-semibold text-foreground">{props.inaction_label}</p>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{props.inaction_summary}</p>
        <div className="flex flex-col gap-1.5">
          {props.inaction_kpis.map((k, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{k.label}</span>
              <span className="font-medium tabular-nums text-foreground">{k.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
})

export const LsScenarioMatrix = defineComponent({
  name: "LsScenarioMatrix",
  description:
    "Comparison matrix for simulation scenarios. Shows name, budget delta %, projected ROI, and confidence badge per row. Use in Simulation tabs.",
  props: z.object({
    scenarios: z
      .array(
        z.object({
          name: z.string().describe("Scenario name."),
          budget_delta_pct: z
            .number()
            .describe("Budget change percentage. Positive = increase."),
          roi_forecast: z
            .number()
            .describe("Projected ROI as a multiplier e.g. 2.4."),
          confidence: z
            .enum(["high", "medium", "low"])
            .describe("Model confidence in this forecast."),
          recommended: z
            .boolean()
            .optional()
            .describe("Highlight as recommended row."),
        })
      )
      .describe("Scenario rows to compare."),
  }),
  component: ({ props }) => {
    const confStyle: Record<string, string> = {
      high: "bg-[var(--positive)]/15 text-[var(--positive)]",
      medium: "bg-[var(--warning)]/15 text-[var(--warning)]",
      low: "bg-[var(--negative)]/15 text-[var(--negative)]",
    }
    return (
      <div className="overflow-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-accent">
              <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Scenario</th>
              <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Budget Δ%</th>
              <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground">ROI Forecast</th>
              <th className="px-4 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {props.scenarios.map((s, i) => (
              <tr
                key={i}
                className={cn(
                  "border-b border-border transition-colors last:border-0 hover:bg-row-highlight",
                  s.recommended && "bg-[var(--primary)]/5"
                )}
              >
                <td className="px-4 py-2.5 font-medium text-foreground">
                  {s.name}
                  {s.recommended && (
                    <span className="ml-2 rounded-full bg-[var(--primary)]/20 px-2 py-0.5 text-[10px] text-[var(--primary)]">
                      Recommended
                    </span>
                  )}
                </td>
                <td
                  className={cn(
                    "px-4 py-2.5 text-right font-medium tabular-nums",
                    s.budget_delta_pct >= 0
                      ? "text-[var(--positive)]"
                      : "text-[var(--negative)]"
                  )}
                >
                  {s.budget_delta_pct >= 0 ? "+" : ""}
                  {s.budget_delta_pct}%
                </td>
                <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-foreground">
                  {s.roi_forecast}x
                </td>
                <td className="px-4 py-2.5 text-center">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize",
                      confStyle[s.confidence]
                    )}
                  >
                    {s.confidence}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  },
})

export const LsConfidenceBadge = defineComponent({
  name: "LsConfidenceBadge",
  description:
    "Inline confidence indicator badge. Always pair with model outputs and recommendations to make trust visible.",
  props: z.object({
    level: z.enum(["high", "medium", "low"]).describe("Confidence level."),
    label: z
      .string()
      .optional()
      .describe("Optional label text. Default: the level itself."),
    detail: z
      .string()
      .optional()
      .describe("Supplementary detail text (model name, R², training window)."),
  }),
  component: ({ props }) => {
    const tagClass = {
      high: "tag-high-green",
      medium: "tag-medium",
      low: "tag-low",
    }[props.level]
    return (
      <div className="inline-flex flex-col gap-1">
        <span
          className={cn(
            "inline-flex w-fit items-center rounded px-1.5 py-0.5 text-[10px] font-medium capitalize",
            tagClass
          )}
        >
          {props.label ?? `${props.level} confidence`}
        </span>
        {props.detail && (
          <span className="text-xs text-muted-foreground">{props.detail}</span>
        )}
      </div>
    )
  },
})

// ── LsReadinessChecklist ──────────────────────────────────────────────────────

const BlockerSchema = z.object({
  label: z.string().describe("Requirement name, e.g. 'Media spend data'."),
  status: z
    .enum(["connected", "missing", "low_quality"])
    .describe("Current connection status."),
  detail: z.string().optional().describe("Short status detail, e.g. 'Last sync: 2h ago'."),
})

export const LsReadinessChecklist = defineComponent({
  name: "LsReadinessChecklist",
  description:
    "Template activation readiness score with per-requirement checklist. Shows connected, missing, and low-quality data sources at a glance. Use in template setup and wizard routes.",
  props: z.object({
    score: z.number().describe("Readiness percentage 0–100."),
    blockers: z.array(BlockerSchema).describe("Requirement list with connection status."),
    threshold: z
      .number()
      .optional()
      .describe("Score required to activate (default 100)."),
    template_name: z
      .string()
      .optional()
      .describe("Template name shown as context."),
  }),
  component: ({ props }) => {
    const threshold = props.threshold ?? 100
    const isReady = props.score >= threshold
    const statusIcon = {
      connected: <CheckCircle2 className="size-4 shrink-0 text-[var(--positive)]" />,
      missing: <XCircle className="size-4 shrink-0 text-[var(--negative)]" />,
      low_quality: <AlertTriangle className="size-4 shrink-0 text-[var(--warning)]" />,
    }
    const statusLabel = {
      connected: "text-[var(--positive)]",
      missing: "text-[var(--negative)]",
      low_quality: "text-[var(--warning)]",
    }
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
        {/* Header + score ring */}
        <div className="flex items-center justify-between gap-3">
          <div>
            {props.template_name && (
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{props.template_name}</p>
            )}
            <p className="text-sm font-semibold text-foreground">
              {isReady ? "Ready to activate" : `${props.score}% ready`}
            </p>
          </div>
          <div className="relative flex size-14 items-center justify-center">
            <svg className="size-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="var(--border)" strokeWidth="6" />
              <circle
                cx="28" cy="28" r="22" fill="none"
                stroke={isReady ? "var(--positive)" : props.score >= 70 ? "var(--warning)" : "var(--negative)"}
                strokeWidth="6"
                strokeDasharray={`${(props.score / 100) * 138.2} 138.2`}
                strokeLinecap="round"
              />
            </svg>
            <span className={cn(
              "absolute text-xs font-bold",
              isReady ? "text-[var(--positive)]" : props.score >= 70 ? "text-[var(--warning)]" : "text-[var(--negative)]"
            )}>
              {props.score}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${props.score}%`,
              background: isReady ? "var(--positive)" : props.score >= 70 ? "var(--warning)" : "var(--negative)",
            }}
          />
        </div>

        {/* Requirement list */}
        <ul className="flex flex-col gap-1.5">
          {props.blockers.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              {statusIcon[b.status]}
              <div className="flex flex-1 items-start justify-between gap-2">
                <span className="text-xs text-foreground">{b.label}</span>
                {b.detail && (
                  <span className={cn("text-[10px] shrink-0", statusLabel[b.status])}>
                    {b.detail}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  },
})

// ── LsApprovalPanel ────────────────────────────────────────────────────────────

const TIER_COLOR: Record<string, string> = {
  T0: "bg-muted text-muted-foreground",
  T1: "bg-[var(--chart-3)]/15 text-[var(--chart-3)]",
  T2: "bg-[var(--warning)]/15 text-[var(--warning)]",
  T3: "bg-[var(--chart-4)]/15 text-[var(--chart-4)]",
  T4: "bg-[var(--negative)]/15 text-[var(--negative)]",
}

const TIER_LABEL: Record<string, string> = {
  T0: "T0 · Informational",
  T1: "T1 · Auto-execute",
  T2: "T2 · Human approval",
  T3: "T3 · Committee approval",
  T4: "T4 · Board sign-off",
}

export const LsApprovalPanel = defineComponent({
  name: "LsApprovalPanel",
  description:
    "HITL governance approval panel. Shows policy tier badge, approver role, optional deadline, and Approve/Reject action buttons. Fires onAction callback — never auto-executes. Always the final block in a HITL route.",
  props: z.object({
    governance_tier: z
      .enum(["T0", "T1", "T2", "T3", "T4"])
      .describe("Decision policy tier per MDIP governance model."),
    approver_role: z
      .string()
      .describe("Role required to approve, e.g. 'CMO' or 'Commercial Director'."),
    deadline: z
      .string()
      .optional()
      .describe("Approval deadline as readable string e.g. 'Nov 15, 2025 17:00 GMT'."),
    context: z
      .string()
      .optional()
      .describe("One-line note shown above the buttons."),
    approve_label: z
      .string()
      .optional()
      .describe("Approve button label. Default: 'Approve Decision'."),
    reject_label: z
      .string()
      .optional()
      .describe("Reject button label. Default: 'Send Back for Revision'."),
  }),
  component: ({ props }) => {
    const triggerAction = useTriggerAction()
    const tierStyle = TIER_COLOR[props.governance_tier] ?? TIER_COLOR.T2
    const tierLabel = TIER_LABEL[props.governance_tier] ?? props.governance_tier

    return (
      <div className="flex flex-col gap-3 rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-4">
        {/* Tier badge + approver */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider", tierStyle)}>
              {tierLabel}
            </span>
            <span className="text-xs text-muted-foreground">
              Approver: <span className="font-medium text-foreground">{props.approver_role}</span>
            </span>
          </div>
          {props.deadline && (
            <span className="text-[10px] uppercase tracking-wider text-[var(--warning)]">Due: {props.deadline}</span>
          )}
        </div>

        {props.context && (
          <p className="text-xs text-foreground">{props.context}</p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
            onClick={() => triggerAction(props.approve_label ?? "Approve Decision")}
          >
            {props.approve_label ?? "Approve Decision"}
          </Button>
          <Button
            variant="secondary"
            className="flex-1 border border-[var(--negative)]/30 text-[var(--negative)] hover:bg-[var(--negative)]/10"
            onClick={() => triggerAction(props.reject_label ?? "Send Back for Revision")}
          >
            {props.reject_label ?? "Send Back for Revision"}
          </Button>
        </div>
      </div>
    )
  },
})
