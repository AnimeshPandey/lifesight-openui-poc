import { defineComponent, useTriggerAction } from "@openuidev/react-lang"
import { z } from "zod/v4"
import { ArrowRight } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { cn } from "@/lib/utils"

export const LsSuggestionChips = defineComponent({
  name: "LsSuggestionChips",
  description:
    "Row of clickable suggestion chips that trigger a follow-up user message. Always place at the end of every agent response to guide the next step.",
  props: z.object({
    chips: z.array(z.string()).describe("Suggestion texts, 1–5 items."),
  }),
  component: ({ props }) => {
    const triggerAction = useTriggerAction()
    return (
      <div className="flex flex-wrap gap-1.5">
        {props.chips.map((chip, i) => (
          <button
            key={i}
            onClick={() => triggerAction(chip)}
            className={cn(
              "inline-flex items-center rounded-md border border-border bg-accent px-2.5 py-1 text-xs text-foreground",
              "transition-colors hover:border-primary/50 hover:text-primary"
            )}
          >
            {chip}
          </button>
        ))}
      </div>
    )
  },
})

export const LsCtaButton = defineComponent({
  name: "LsCtaButton",
  description:
    "Primary call-to-action button. Navigates to a deep link or triggers a named action. Human-governed — never auto-executes. Use at the end of cockpit alerts and MIA responses.",
  props: z.object({
    label: z.string().describe("Button text."),
    href: z
      .string()
      .optional()
      .describe("Internal route path e.g. '/decisions/media-reallocation-001'."),
    variant: z
      .enum(["primary", "secondary", "destructive"])
      .optional()
      .describe("Visual style. Default: primary."),
    action: z
      .string()
      .optional()
      .describe("Action name to emit via onAction callback when no href is given."),
  }),
  component: ({ props }) => <CtaButtonInner {...props} />,
})

function CtaButtonInner({
  label,
  href,
  action,
}: {
  label: string
  href?: string
  action?: string
}) {
  const navigate = useNavigate()
  const triggerAction = useTriggerAction()
  const isExternal = !!href && /^https?:\/\//.test(href)

  return (
    <button
      type="button"
      onClick={() => {
        if (href) {
          if (isExternal) {
            window.open(href, "_blank", "noopener,noreferrer")
            return
          }
          navigate({ to: href })
          return
        }
        if (action) {
          triggerAction(action)
        }
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground",
        "transition-opacity hover:opacity-90"
      )}
    >
      {label}
      <ArrowRight className="size-3.5" />
    </button>
  )
}
