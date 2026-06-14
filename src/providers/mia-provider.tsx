import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useContextStore, type MiaInvocationContext } from "@/stores/useContextStore"

export interface MiaOpenOptions extends Partial<MiaInvocationContext> {
  /** Where the panel was invoked from — shown as a context chip (e.g. "Cockpit"). */
  source?: string
}

interface MiaContextValue {
  open: boolean
  source: string | null
  openPanel: (opts?: MiaOpenOptions) => void
  closePanel: () => void
  togglePanel: () => void
}

/**
 * Safe no-op default so `useMia()` never throws when a component is rendered
 * outside the provider — the existing feature-page unit tests mount pages with
 * only a QueryClientProvider, and must keep working.
 */
const NOOP: MiaContextValue = {
  open: false,
  source: null,
  openPanel: () => {},
  closePanel: () => {},
  togglePanel: () => {},
}

const MiaContext = createContext<MiaContextValue>(NOOP)

export function useMia(): MiaContextValue {
  return useContext(MiaContext)
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

/**
 * Simplified MIA provider — manages only the docked panel's open state and
 * invocation context. No backend, no chat lifecycle (ls4x's provider has both);
 * the panel renders OpenUI fixtures via the existing context store.
 */
export function MiaProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [source, setSource] = useState<string | null>(null)
  const setContext = useContextStore((s) => s.setContext)

  const openPanel = useCallback(
    (opts?: MiaOpenOptions) => {
      if (opts) {
        const { source: src, ...ctx } = opts
        if (Object.keys(ctx).length > 0) setContext(ctx)
        if (src !== undefined) setSource(src)
      }
      setOpen(true)
    },
    [setContext]
  )

  const closePanel = useCallback(() => setOpen(false), [])
  const togglePanel = useCallback(() => setOpen((o) => !o), [])

  // Alt+C toggles the panel globally (matches ls4x), ignoring text fields.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) return
      if (!event.altKey || event.metaKey || event.ctrlKey) return
      if (event.key.toLowerCase() !== "c") return
      if (isTypingTarget(event.target)) return
      event.preventDefault()
      togglePanel()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [togglePanel])

  const value = useMemo<MiaContextValue>(
    () => ({ open, source, openPanel, closePanel, togglePanel }),
    [open, source, openPanel, closePanel, togglePanel]
  )

  return <MiaContext.Provider value={value}>{children}</MiaContext.Provider>
}
