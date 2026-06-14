import { defineComponent, useIsStreaming } from "@openuidev/react-lang"
import { z } from "zod/v4"
import mermaid from "mermaid"
import { useEffect, useId, useRef } from "react"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle, Info, Lightbulb, XCircle } from "lucide-react"

// ── Mermaid initialisation (runs once at module level) ────────────────────────
let mermaidReady = false
function initMermaid() {
  if (mermaidReady) return
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    darkMode: true,
    themeVariables: {
      // Mirror 4.0 dark design tokens from src/index.css
      primaryColor: "#027b8e",        // --primary (teal CTA)
      primaryTextColor: "#ebebeb",     // --foreground
      primaryBorderColor: "#1f1f21",   // --border
      lineColor: "#818181",            // --muted-foreground
      secondaryColor: "#0f0f10",       // --card
      tertiaryColor: "#1f1f21",        // --accent
      background: "#000000",           // --background
      nodeBorder: "#027b8e",
      clusterBkg: "#0f0f10",
      titleColor: "#ebebeb",
      edgeLabelBackground: "#0f0f10",
      fontFamily: "Inter, system-ui, sans-serif",
    },
    flowchart: { htmlLabels: true, curve: "basis" },
  })
  mermaidReady = true
}

const variantIcon = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: XCircle,
  tip: Lightbulb,
} as const

// Subtle alert-card tints: faint semantic border + bg wash. The icon picks up the
// accent colour while title/body stay on neutral foreground tokens for ls4x density.
const variantStyle = {
  info: "border-[var(--primary)]/25 bg-[var(--primary)]/[0.06]",
  warning: "border-[var(--warning)]/25 bg-[var(--warning)]/[0.06]",
  success: "border-[var(--positive)]/25 bg-[var(--positive)]/[0.06]",
  error: "border-[var(--negative)]/25 bg-[var(--negative)]/[0.06]",
  tip: "border-[var(--chart-4)]/25 bg-[var(--chart-4)]/[0.06]",
} as const

const variantIconColor = {
  info: "text-[var(--primary)]",
  warning: "text-[var(--warning)]",
  success: "text-[var(--positive)]",
  error: "text-[var(--negative)]",
  tip: "text-[var(--chart-4)]",
} as const

export const LsInfoPanel = defineComponent({
  name: "LsInfoPanel",
  description:
    "Callout panel with icon, variant colour, and message text. Use for key findings, warnings, and contextual tips.",
  props: z.object({
    variant: z
      .enum(["info", "warning", "success", "error", "tip"])
      .describe("Visual style and icon."),
    content: z.string().describe("The message text."),
    title: z.string().optional().describe("Optional bold title above content."),
  }),
  component: ({ props }) => {
    const Icon = variantIcon[props.variant]
    return (
      <div className={cn("flex gap-2.5 rounded-md border p-3", variantStyle[props.variant])}>
        <Icon className={cn("mt-px size-3.5 shrink-0", variantIconColor[props.variant])} />
        <div className="flex flex-col gap-0.5">
          {props.title && (
            <p className="text-xs font-medium leading-snug text-foreground">{props.title}</p>
          )}
          <p className="text-xs leading-relaxed text-muted-foreground">{props.content}</p>
        </div>
      </div>
    )
  },
})

export const LsStepPlan = defineComponent({
  name: "LsStepPlan",
  description:
    "Numbered step list for multi-step workflows, setup wizards, or action sequences.",
  props: z.object({
    title: z.string().optional().describe("Optional section heading."),
    items: z.array(z.string()).describe("Step descriptions in order."),
  }),
  component: ({ props }) => (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-3">
      {props.title && (
        <p className="text-xs font-medium text-foreground">{props.title}</p>
      )}
      <ol className="flex flex-col gap-1.5">
        {props.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/15 text-[10px] font-semibold text-[var(--primary)]">
              {i + 1}
            </span>
            <span className="text-xs leading-relaxed text-foreground">{item}</span>
          </li>
        ))}
      </ol>
    </div>
  ),
})

export const LsMermaidDiagram = defineComponent({
  name: "LsMermaidDiagram",
  description:
    "Renders a Mermaid diagram (graph TD, flowchart, etc.) as an interactive SVG. Used for causal DAGs, flowcharts, decision trees, and methodology pipelines.",
  props: z.object({
    definition: z
      .string()
      .describe("Mermaid diagram source, e.g. 'graph TD\\n  A --> B'."),
    caption: z.string().optional().describe("Optional caption shown below the diagram."),
  }),
  component: ({ props }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const isStreaming = useIsStreaming()
    // useId produces ":r0:" style IDs — strip non-alphanumeric chars for Mermaid element IDs
    const rawId = useId()
    const baseId = "lsm" + rawId.replace(/[^a-zA-Z0-9]/g, "")
    // Monotonic counter so every render attempt gets a unique Mermaid element id —
    // avoids same-id collisions when the effect re-runs (e.g. across streaming chunks).
    const seq = useRef(0)

    useEffect(() => {
      // Don't render partial source mid-stream — Mermaid can't parse an incomplete
      // graph, and racing renders on each chunk leaves an empty/clobbered container.
      // Wait until the full definition has streamed in.
      if (!containerRef.current || isStreaming) return
      initMermaid()

      let cancelled = false
      const diagramId = `${baseId}_${(seq.current += 1)}`
      mermaid
        .render(diagramId, props.definition)
        .then(({ svg }) => {
          if (cancelled || !containerRef.current) return
          containerRef.current.innerHTML = svg
          // Make the generated SVG fill the container width
          const svgEl = containerRef.current.querySelector("svg")
          if (svgEl) {
            svgEl.setAttribute("width", "100%")
            svgEl.style.maxWidth = "100%"
            svgEl.style.height = "auto"
          }
        })
        .catch(() => {
          // Fallback: render as a code block if Mermaid can't parse the source
          if (cancelled || !containerRef.current) return
          const pre = document.createElement("pre")
          pre.className = "text-xs text-[color:var(--text-secondary)] overflow-auto"
          pre.textContent = props.definition
          containerRef.current.replaceChildren(pre)
        })

      return () => {
        cancelled = true
      }
    }, [baseId, props.definition, isStreaming])

    return (
      <div className="flex flex-col gap-2">
        <div
          ref={containerRef}
          className="overflow-auto rounded-md border border-border bg-card p-3 [&_svg]:mx-auto"
          aria-label="Mermaid diagram"
        >
          {/* Placeholder shown while Mermaid renders */}
          <p className="text-xs text-muted-foreground animate-pulse">Rendering diagram…</p>
        </div>
        {props.caption && (
          <p className="text-xs text-muted-foreground">{props.caption}</p>
        )}
      </div>
    )
  },
})
