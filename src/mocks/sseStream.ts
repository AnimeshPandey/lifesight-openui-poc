/**
 * Fake SSE stream utilities — mirrors the 3.0 PlannerAgentService event contract.
 *
 * In production the backend (ADK / Temporal agent) emits these events over a
 * POST SSE connection. The POC simulates them locally with a ReadableStream.
 *
 * Event contract (matches lifesight-platform-ui/src/api/Action/PlannerAgentService.ts):
 *   data: {"type":"TEXT_MESSAGE_CONTENT","delta":"..."}   ← OpenUI Lang chunk
 *   data: {"type":"RUN_FINISHED"}                         ← stream complete
 */

export type AgentStreamEvent =
  | { type: "TEXT_MESSAGE_CONTENT"; delta: string }
  | { type: "THOUGHT_TRACE"; trace: string }
  | { type: "RUN_FINISHED" }

/**
 * Creates a ReadableStream that emits AgentStreamEvent JSON lines at regular
 * intervals, simulating a backend SSE stream delivering OpenUI Lang text.
 *
 * @param fullText  - The complete OpenUI Lang string to stream
 * @param chunkMs   - Delay between chunks in milliseconds (default 180)
 * @param chunkSize - Characters per chunk (default 35)
 */
export function createFakeSSEStream(
  fullText: string,
  chunkMs = 180,
  chunkSize = 35
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      // Split the text into chunks
      const chunks: string[] = []
      for (let i = 0; i < fullText.length; i += chunkSize) {
        chunks.push(fullText.slice(i, i + chunkSize))
      }

      for (const chunk of chunks) {
        await new Promise<void>((r) => setTimeout(r, chunkMs))
        const event: AgentStreamEvent = { type: "TEXT_MESSAGE_CONTENT", delta: chunk }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n`))
      }

      // Signal completion
      const finish: AgentStreamEvent = { type: "RUN_FINISHED" }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(finish)}\n`))
      controller.close()
    },
  })
}

/**
 * Reads a fake SSE ReadableStream, accumulating TEXT_MESSAGE_CONTENT deltas
 * and calling `onDelta` with the current accumulated text after each chunk.
 *
 * Returns the fully assembled OpenUI Lang text when the stream closes.
 *
 * @param stream   - ReadableStream from createFakeSSEStream()
 * @param onDelta  - Called with accumulated text after each chunk (for progressive rendering)
 */
export async function readSSEStream(
  stream: ReadableStream<Uint8Array>,
  onDelta: (accumulated: string) => void
): Promise<string> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let accumulated = ""

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue
        try {
          const event: AgentStreamEvent = JSON.parse(line.slice(6))
          if (event.type === "TEXT_MESSAGE_CONTENT") {
            accumulated += event.delta
            onDelta(accumulated)
          }
          // RUN_FINISHED — stream naturally ends, no action needed
        } catch {
          // Malformed SSE line — drop silently (mirrors 3.0 error handling)
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return accumulated
}
