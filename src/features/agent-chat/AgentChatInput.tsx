import { type KeyboardEvent, useRef, useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface Props {
  onSubmit: (query: string) => void
  disabled?: boolean
  placeholder?: string
}

/**
 * Chat input bar with submit button.
 * Submit on Enter (Shift+Enter for newline) or button click. Clears after submit.
 */
export function AgentChatInput({ onSubmit, disabled, placeholder }: Props) {
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSubmit(trimmed)
    setValue("")
    inputRef.current?.focus()
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex items-end gap-2 rounded-lg bg-card p-2 ring-1 ring-foreground/10">
      <Textarea
        ref={inputRef}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled}
        placeholder={placeholder ?? "Ask a question about your media data…"}
        className="min-h-9 flex-1 resize-none border-0 bg-transparent px-2 py-1.5 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Agent chat input"
      />
      <Button
        type="button"
        size="icon"
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="shrink-0"
      >
        <Send className="size-3.5" aria-hidden="true" />
      </Button>
    </div>
  )
}
