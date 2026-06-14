import { useEffect, useRef, useState } from "react"
import { Bot, Sparkles } from "lucide-react"
import { type AgentMessage, AgentMessageList } from "./AgentMessageList"
import { AgentChatInput } from "./AgentChatInput"
import { createFakeSSEStream, readSSEStream } from "@/mocks/sseStream"
import { resolveAgentFixture, SUGGESTED_QUERIES } from "@/mocks/mockAgent"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

let nextId = 1
function uid() { return String(nextId++) }

/**
 * /agent — Conversational Agent Chat
 *
 * A full multi-turn chat interface backed by a mock agent lookup table.
 * Type any query — the mock agent matches it to the most relevant OpenUI fixture
 * and streams the response back progressively.
 *
 * Proves: conversational multi-turn UX, different fixture types per query,
 * SSE streaming, OpenUI progressive rendering — all in one interface.
 *
 * Mock agent lookup (src/mocks/mockAgent.ts) covers:
 *   - Q4 ROI analysis          → AGENT_FIXTURE
 *   - Display underperformance → DISPLAY_FIXTURE
 *   - Geo experiment           → GEO_FIXTURE
 *   - MMM causal DAG           → MMM_FIXTURE
 *   - Attribution comparison   → ATTRIBUTION_FIXTURE
 *   - Budget pace alert        → COCKPIT_FIXTURE
 *   - Decision / reallocation  → DECISIONS_FIXTURE
 *   - Template / wizard        → TEMPLATE_FIXTURE
 *   - HITL / approval          → HITL_FIXTURE
 */
export function AgentChatPage() {
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Seed the conversation with the default Q4 ROI analysis on mount
  useEffect(() => {
    void sendQuery("Explain Q4 paid social ROI")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-scroll to bottom after each message update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendQuery(query: string) {
    if (isStreaming) return

    const { fixture, label } = resolveAgentFixture(query)
    console.warn("[OpenUI POC] /agent query:", query, "→ fixture:", label)

    // 1. Append user message
    const userMsg: AgentMessage = { id: uid(), role: "user", content: query }
    // 2. Append empty streaming assistant message
    const assistantId = uid()
    const assistantMsg: AgentMessage = { id: assistantId, role: "assistant", content: "", isStreaming: true }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setIsStreaming(true)

    // 3. Stream the fixture and update the assistant message content progressively
    const stream = createFakeSSEStream(fixture, 120, 32)
    await readSSEStream(stream, (accumulated) => {
      setMessages((prev) =>
        prev.map((m) => m.id === assistantId ? { ...m, content: accumulated } : m)
      )
    })

    // 4. Mark streaming complete
    setMessages((prev) =>
      prev.map((m) => m.id === assistantId ? { ...m, isStreaming: false } : m)
    )
    setIsStreaming(false)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Agent Chat"
        icon={Bot}
        subtitle="Multi-turn conversational interface — mock agent routes queries to relevant OpenUI fixtures"
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2 py-0.5 text-[11px] text-muted-foreground ring-1 ring-foreground/10">
            <span className={`size-1.5 rounded-full ${isStreaming ? "animate-pulse bg-primary" : "bg-[var(--positive)]"}`} />
            {isStreaming ? "streaming" : "ready"}
          </span>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        {/* LEFT: suggestion prompts */}
        <Card size="sm" className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-muted-foreground" aria-hidden="true" />
              Suggested prompts
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5">
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => void sendQuery(q)}
                disabled={isStreaming}
                className="rounded-md bg-accent/50 px-2.5 py-1.5 text-left text-xs text-foreground ring-1 ring-foreground/10 transition-colors hover:bg-primary/10 hover:text-primary hover:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* RIGHT: chat column */}
        <div className="flex min-w-0 flex-col gap-4">
          <AgentMessageList messages={messages} sendQuery={(q) => void sendQuery(q)} />
          <div ref={bottomRef} />

          <div className="sticky bottom-0 bg-background pt-2 pb-1">
            <AgentChatInput
              onSubmit={(q) => void sendQuery(q)}
              disabled={isStreaming}
              placeholder="Ask about your media data… (e.g. 'Why is Display underperforming?')"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
