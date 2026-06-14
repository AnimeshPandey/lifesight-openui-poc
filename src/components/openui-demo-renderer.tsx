/**
 * OpenUIDemoRenderer — the single wrapper every demo surface uses to render an
 * OpenUI Lang response with visible streaming UX: a progress bar, an agentic
 * "thinking" trace, a layout-matched skeleton, an inline parse-error banner, and
 * the keyed Renderer.
 *
 * ── Phase 0 diagnosis (root causes the demo-interactivity pass fixed) ──────────
 *  1. Fixtures originally used a named-arg / indented-children dialect that
 *     @openuidev/react-lang@0.2.6 silently rejects → every body rendered empty.
 *     Fixed by migrating all fixtures to the canonical POSITIONAL grammar.
 *  2. Pages loaded fixtures INSTANTLY → no visible streaming. Now they auto-stream
 *     via useOpenUIStream.
 *  3. onAction only console.warn'd → dead buttons. Now routed through openui-actions.
 *  4. Parse failures hid in console.warn → now surfaced as an inline banner.
 *  5. defineComponent uses ({ props }) — verified; Recharts LsChart has a height.
 */
import { Renderer } from "@openuidev/react-lang"
import type { ActionEvent, OpenUIError } from "@openuidev/react-lang"
import { AlertTriangle, Check, Loader2, Sparkles } from "lucide-react"
import { type ReactNode, useEffect, useState } from "react"
import { library } from "@/openui/library"
import type { OpenUIStreamApi } from "@/hooks/useOpenUIStream"
import { cn } from "@/lib/utils"

export type SkeletonVariant = "default" | "analytics" | "decision" | "panel" | "chat"

const DEFAULT_THOUGHTS = [
  "Interpreting the request",
  "Pulling MMM v2.3 + experiment data",
  "Selecting components for the answer",
  "Composing the layout",
  "Streaming the response",
]

function SkeletonBlock({ variant }: { variant: SkeletonVariant }) {
  const bar = "rounded-lg bg-card"
  if (variant === "panel") {
    return (
      <div className="flex animate-pulse flex-col gap-3" aria-hidden="true">
        <div className={cn("h-12 w-full", bar)} />
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={cn("h-12", bar)} />
          ))}
        </div>
        <div className={cn("h-32 w-full", bar)} />
      </div>
    )
  }
  if (variant === "chat") {
    return (
      <div className="flex animate-pulse flex-col gap-2" aria-hidden="true">
        <div className={cn("h-4 w-40", bar)} />
        <div className={cn("h-24 w-full", bar)} />
      </div>
    )
  }
  if (variant === "decision") {
    return (
      <div className="flex animate-pulse flex-col gap-3" aria-hidden="true">
        <div className="grid grid-cols-2 gap-3">
          <div className={cn("h-40", bar)} />
          <div className={cn("h-40", bar)} />
        </div>
        <div className={cn("h-28 w-full", bar)} />
      </div>
    )
  }
  // default + analytics: KPI row + chart
  return (
    <div className="flex animate-pulse flex-col gap-3" aria-hidden="true">
      <div className="h-12 w-full rounded-lg bg-card" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(variant === "analytics" ? 6 : 4)].map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-card" />
        ))}
      </div>
      <div className="h-44 w-full rounded-lg bg-card" />
    </div>
  )
}

/** Agentic "thinking" trace — reveals reasoning lines in step with stream progress. */
function ThoughtTrace({ thoughts, progress }: { thoughts: string[]; progress: number }) {
  // How many thoughts to reveal so far, paced by progress (always show the first).
  const revealed = Math.max(1, Math.min(thoughts.length, Math.ceil((progress / 100) * thoughts.length)))
  return (
    <div className="rounded-md border border-[var(--primary)]/20 bg-[var(--primary)]/[0.04] p-2.5">
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-[var(--primary)]">
        <Sparkles className="size-3" aria-hidden="true" />
        MIA is thinking
      </div>
      <ul className="space-y-0.5">
        {thoughts.slice(0, revealed).map((t, i) => {
          const done = i < revealed - 1 || progress >= 100
          return (
            <li key={t} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {done ? (
                <Check className="size-3 shrink-0 text-[var(--positive)]" aria-hidden="true" />
              ) : (
                <Loader2 className="size-3 shrink-0 animate-spin text-[var(--primary)]" aria-hidden="true" />
              )}
              <span className={done ? undefined : "text-foreground"}>{t}…</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function OpenUIDemoRenderer({
  stream,
  onAction,
  showProgressBar = true,
  showParseErrors = true,
  showThoughts = true,
  thoughts = DEFAULT_THOUGHTS,
  skeleton,
  skeletonVariant = "default",
  emptyHint = "Waiting for agent response…",
  className,
}: {
  stream: OpenUIStreamApi
  onAction?: (event: ActionEvent) => void
  showProgressBar?: boolean
  showParseErrors?: boolean
  /** Show the agentic "MIA is thinking" trace while streaming. */
  showThoughts?: boolean
  /** Reasoning lines revealed in step with progress. */
  thoughts?: string[]
  /** Custom skeleton node (overrides skeletonVariant). */
  skeleton?: ReactNode
  /** Built-in skeleton shape matched to the page layout. */
  skeletonVariant?: SkeletonVariant
  emptyHint?: string
  className?: string
}) {
  const { response, isStreaming, progress, streamKey } = stream
  const [errors, setErrors] = useState<OpenUIError[]>([])

  useEffect(() => {
    setErrors([])
  }, [streamKey])

  const critical = errors.filter((e) => e.code === "unknown-component")
  const notes = errors.length - critical.length

  return (
    <div className={cn("space-y-3", className)}>
      {showProgressBar && isStreaming && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--primary)]">
            <Loader2 className="size-3 animate-spin" aria-hidden="true" />
            Streaming OpenUI Lang… {progress}%
          </div>
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-accent">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {showThoughts && isStreaming && <ThoughtTrace thoughts={thoughts} progress={progress} />}

      {showParseErrors && critical.length > 0 && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-[var(--negative)]/30 bg-[var(--negative)]/[0.08] p-2.5 text-xs"
        >
          <AlertTriangle className="mt-px size-3.5 shrink-0 text-[var(--negative)]" aria-hidden="true" />
          <div>
            <p className="font-medium text-foreground">
              {critical.length} component{critical.length > 1 ? "s" : ""} could not be rendered
            </p>
            <p className="mt-0.5 text-muted-foreground">
              {critical.map((e) => e.component ?? e.message).join(", ")} — check the fixture's
              OpenUI Lang syntax.
            </p>
          </div>
        </div>
      )}

      {response === null ? (
        <div>
          {skeleton ?? <SkeletonBlock variant={skeletonVariant} />}
          <p className="mt-2 text-[11px] text-muted-foreground">{emptyHint}</p>
        </div>
      ) : (
        <Renderer
          key={streamKey}
          response={response}
          library={library}
          isStreaming={isStreaming}
          onAction={onAction}
          onError={(errs) => {
            if (errs.length) setErrors(errs)
          }}
        />
      )}

      {showParseErrors && notes > 0 && critical.length === 0 && (
        <p className="text-[10px] text-muted-foreground/60">
          {notes} non-blocking validation note{notes > 1 ? "s" : ""} (parser rendered all components)
        </p>
      )}
    </div>
  )
}
