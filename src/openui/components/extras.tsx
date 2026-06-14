import { defineComponent } from "@openuidev/react-lang"
import { z } from "zod/v4"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp } from "lucide-react"

/**
 * Visual primitives — richer, single-purpose display components.
 * Reimplemented in the POC (adapted from ls4x ui/* references); dark-token styled.
 */

export const LsConfidenceGauge = defineComponent({
  name: "LsConfidenceGauge",
  description:
    "Circular ring gauge showing a confidence score 0–100, colored by band (≥80 positive, ≥60 warning, else negative). A richer alternative to LsConfidenceBadge for a hero confidence figure.",
  props: z.object({
    score: z.number().describe("Confidence score, 0–100."),
    label: z.string().optional().describe("Short label under the gauge, e.g. 'Model confidence'."),
    detail: z.string().optional().describe("Supporting detail text."),
  }),
  component: ({ props }) => {
    const score = Math.max(0, Math.min(100, props.score))
    const color =
      score >= 80
        ? "var(--positive)"
        : score >= 60
          ? "var(--warning)"
          : "var(--negative)"

    const size = 88
    const stroke = 8
    const radius = (size - stroke) / 2
    const circumference = 2 * Math.PI * radius
    const filled = circumference * (score / 100)

    return (
      <div className="inline-flex flex-col items-center gap-2 rounded-lg border border-border bg-surface-dark p-4">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--border)"
              strokeWidth={stroke}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${filled} ${circumference}`}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-semibold tabular-nums" style={{ color }}>
              {Math.round(score)}
            </span>
          </div>
        </div>
        {props.label && <p className="section-label text-center">{props.label}</p>}
        {props.detail && (
          <p className="max-w-[14rem] text-center text-[11px] leading-snug text-muted-foreground">
            {props.detail}
          </p>
        )}
      </div>
    )
  },
})

export const LsStatHero = defineComponent({
  name: "LsStatHero",
  description:
    "Large hero metric block: a section label, a big value, an optional colored delta with ▲/▼, and an optional sublabel. Use for a single headline metric.",
  props: z.object({
    label: z.string().describe("Metric name / section label."),
    value: z.string().describe("Formatted headline value, e.g. '$2.88M' or '2.4x'."),
    delta: z
      .number()
      .optional()
      .describe("Fractional change e.g. 0.15 means +15%. Positive = good."),
    sublabel: z.string().optional().describe("Supporting caption below the value."),
  }),
  component: ({ props }) => {
    const isPositive = props.delta !== undefined && props.delta >= 0
    const deltaColor =
      props.delta === undefined ? "" : isPositive ? "text-[var(--positive)]" : "text-[var(--negative)]"

    return (
      <div className="rounded-lg border border-border bg-surface-dark p-4">
        <p className="section-label">{props.label}</p>
        <div className="mt-1.5 flex items-baseline gap-2">
          <p className="text-3xl font-semibold tabular-nums leading-none text-foreground">{props.value}</p>
          {props.delta !== undefined && (
            <span className={cn("flex items-center gap-0.5 text-xs font-medium tabular-nums", deltaColor)}>
              {isPositive ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
              {props.delta >= 0 ? "+" : ""}
              {(props.delta * 100).toFixed(1)}%
            </span>
          )}
        </div>
        {props.sublabel && (
          <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{props.sublabel}</p>
        )}
      </div>
    )
  },
})

export const LsSeverityBadge = defineComponent({
  name: "LsSeverityBadge",
  description:
    "Pill badge colored by alert/issue severity, with a small dot and label. Use for alert feeds and issue lists.",
  props: z.object({
    severity: z
      .enum(["critical", "high", "medium", "low", "info"])
      .describe("Severity level."),
    label: z.string().describe("Badge text."),
  }),
  component: ({ props }) => {
    const tagClass: Record<string, string> = {
      critical: "tag-high",
      high: "tag-high",
      medium: "tag-medium",
      low: "tag-low",
      info: "bg-accent text-muted-foreground",
    }
    const dotColor: Record<string, string> = {
      critical: "var(--negative)",
      high: "var(--negative)",
      medium: "var(--warning)",
      low: "var(--warning)",
      info: "var(--muted-foreground)",
    }

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
          tagClass[props.severity]
        )}
      >
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ background: dotColor[props.severity] }}
          aria-hidden="true"
        />
        {props.label}
      </span>
    )
  },
})

export const LsMetadataChip = defineComponent({
  name: "LsMetadataChip",
  description:
    "Small inline key/value chip: a muted label and a foreground value. Use for inline metadata like owner, window, or source.",
  props: z.object({
    label: z.string().describe("Muted key/label."),
    value: z.string().describe("Foreground value."),
  }),
  component: ({ props }) => (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-accent px-2 py-0.5 text-[11px]">
      <span className="text-muted-foreground">{props.label}</span>
      <span className="font-medium text-foreground">{props.value}</span>
    </span>
  ),
})
