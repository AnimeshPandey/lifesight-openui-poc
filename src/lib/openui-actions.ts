import type { ActionEvent } from "@openuidev/react-lang"
import { toast } from "sonner"

export interface OpenUIActionContext {
  /** Current route label, used in toasts/MIA source (e.g. "Cockpit"). */
  route: string
  /** Navigate to an internal path (already-resolved string, e.g. "/decisions/..."). */
  navigate?: (to: string) => void
  /** Send a follow-up chat query (used on /agent — chips become a second turn). */
  sendQuery?: (text: string) => void
  /** Open the MIA panel (used when chips/CTAs should pivot to MIA). */
  openMia?: (opts?: { source?: string; module?: string }) => void
  /** Page-specific approval handler (HITL). Receives the action label. */
  onApprove?: (label: string) => void
}

const APPROVAL_RE = /^(approve|reject|send back|decline|deny)/i

/**
 * Build a Renderer `onAction` handler that gives every OpenUI interaction a
 * VISIBLE effect (toast / navigation / follow-up query) instead of a console
 * log. Pages compose it with their own context.
 */
export function createOpenUIActionHandler(ctx: OpenUIActionContext) {
  return (event: ActionEvent) => {
    const msg = (event.humanFriendlyMessage ?? "").trim()
    const url = typeof event.params?.url === "string" ? (event.params.url as string) : undefined

    // 1. Explicit navigation (LsCtaButton href / OpenUrl action).
    if (url) {
      if (/^https?:\/\//.test(url)) {
        window.open(url, "_blank", "noopener,noreferrer")
      } else if (ctx.navigate) {
        toast.success(`Opening ${msg || url}`)
        ctx.navigate(url)
      }
      return
    }

    // 2. Approval / rejection verbs → page handler.
    if (APPROVAL_RE.test(msg) && ctx.onApprove) {
      ctx.onApprove(msg)
      return
    }

    // 3. Follow-up text (suggestion chips, MIA prompts).
    if (msg) {
      if (ctx.sendQuery) {
        toast.info(`Follow-up: ${msg}`)
        ctx.sendQuery(msg)
        return
      }
      if (ctx.openMia) {
        toast.info(`Ask MIA: ${msg}`)
        ctx.openMia({ source: ctx.route })
        return
      }
      toast.info(msg)
      return
    }

    // 4. Fallback — surface something rather than silently dropping.
    toast.info(`Action: ${event.type}`)
  }
}
