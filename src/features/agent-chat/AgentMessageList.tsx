import { Bot, User } from "lucide-react"
import { Renderer } from "@openuidev/react-lang"
import { library } from "@/openui/library"
import { Skeleton } from "@/components/ui/skeleton"
import { createOpenUIActionHandler } from "@/lib/openui-actions"
import { resolveAgentFixture } from "@/mocks/mockAgent"

export interface AgentMessage {
  id: string
  role: "user" | "assistant"
  content: string        // for user: query text; for assistant: OpenUI Lang string
  isStreaming?: boolean  // true while the assistant is still streaming
}

interface Props {
  messages: AgentMessage[]
  /**
   * Existing query submitter (from AgentChatPage). Threaded down so a clicked
   * suggestion chip inside an assistant response becomes a new user turn.
   */
  sendQuery: (text: string) => void
}

/**
 * Renders a scrollable list of chat messages as compact cards.
 *
 * User messages are right-aligned compact bubbles.
 * Assistant messages are rendered via <Renderer> — each message gets its own
 * Renderer instance so they can have independent streaming state.
 */
export function AgentMessageList({ messages, sendQuery }: Props) {
  // Clicked suggestion chips inside an assistant response become a new user
  // turn via the shared action handler (toast.info("Follow-up: …") + sendQuery).
  // OpenUI disables interactions while a message is streaming.
  const handleAction = createOpenUIActionHandler({ route: "Agent", sendQuery })

  return (
    <div className="flex flex-col gap-4">
      {messages.map((msg, i) => {
        // Derive the fixture label from the user query that triggered this
        // assistant reply (the immediately-preceding user message).
        const fixtureLabel =
          msg.role === "assistant"
            ? resolveAgentFixture(messages[i - 1]?.content ?? "").label
            : null
        return (
        msg.role === "user" ? (
          <div key={msg.id} className="flex justify-end gap-2">
            <div className="max-w-md rounded-lg bg-accent px-3 py-2 text-sm text-foreground ring-1 ring-foreground/10">
              {msg.content}
            </div>
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-accent text-muted-foreground">
              <User className="size-3.5" aria-hidden="true" />
            </span>
          </div>
        ) : (
          <div key={msg.id} className="flex gap-2">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Bot className="size-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 rounded-lg bg-card p-3 ring-1 ring-foreground/10">
              {/* Agent label */}
              <div className="mb-2 flex items-center gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">MIA</span>
                {fixtureLabel && (
                  <span className="rounded-full bg-accent px-1.5 py-px text-[10px] text-muted-foreground ring-1 ring-foreground/10">
                    Fixture: {fixtureLabel}
                  </span>
                )}
                {msg.isStreaming && (
                  <span className="flex items-center gap-1 text-xs text-primary">
                    <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                    streaming
                  </span>
                )}
              </div>

              {/* Skeleton while the first chunk hasn't arrived */}
              {!msg.content && msg.isStreaming && (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-4 gap-2">
                    {[...Array(4)].map((_, s) => (
                      <Skeleton key={s} className="h-14 rounded-lg bg-accent" />
                    ))}
                  </div>
                  <Skeleton className="h-36 w-full rounded-lg bg-accent" />
                </div>
              )}

              {/* OpenUI Renderer */}
              {msg.content && (
                <Renderer
                  response={msg.content}
                  library={library}
                  isStreaming={msg.isStreaming ?? false}
                  onAction={handleAction}
                  onError={(errors) => {
                    if (errors.length) console.warn("[OpenUI POC] chat parse errors:", errors)
                  }}
                />
              )}
            </div>
          </div>
        )
        )
      })}
    </div>
  )
}
