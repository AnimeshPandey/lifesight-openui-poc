import { useCallback, useEffect, useRef, useState } from "react"
import { createFakeSSEStream, readSSEStream } from "@/mocks/sseStream"
import { SPEED_TIMING, useDemoStore } from "@/stores/useDemoStore"

export interface OpenUIStreamOptions {
  /** Override the demo-speed chunk delay (ms). Defaults to the global demo speed. */
  chunkMs?: number
  /** Override the demo-speed chunk size (chars). Defaults to the global demo speed. */
  chunkSize?: number
}

export interface OpenUIStreamApi {
  /** Accumulated OpenUI Lang text (null = cleared / awaiting first chunk). */
  response: string | null
  isStreaming: boolean
  /** 0–100, based on accumulated length / total fixture length. */
  progress: number
  /** Increments on every load/replay — pass as `key` to force a clean Renderer remount. */
  streamKey: number
  /** Load a fixture instantly (no streaming animation). */
  loadInstant: (fixture: string) => void
  /** Stream a fixture progressively. */
  loadStream: (fixture: string) => Promise<void>
  /** Clear → brief skeleton → stream. Use for "Replay" buttons. */
  replay: (fixture: string) => Promise<void>
  /** Abort any in-flight stream. */
  abort: () => void
}

/**
 * Centralised OpenUI streaming controller used by every demo surface. Wraps the
 * mock SSE utilities, tracks progress + a remount key, honours the global demo
 * speed (Normal/Slow), and reports in-flight streams to the header indicator.
 */
export function useOpenUIStream(options?: OpenUIStreamOptions): OpenUIStreamApi {
  const [response, setResponse] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [progress, setProgress] = useState(0)
  const [streamKey, setStreamKey] = useState(0)
  const abortRef = useRef<AbortController | null>(null)
  const streamingRef = useRef(false)

  const speed = useDemoStore((s) => s.speed)
  const beginStream = useDemoStore((s) => s.beginStream)
  const endStream = useDemoStore((s) => s.endStream)

  const timing = SPEED_TIMING[speed]
  const chunkMs = options?.chunkMs ?? timing.chunkMs
  const chunkSize = options?.chunkSize ?? timing.chunkSize

  // Mark a stream as finished exactly once (for the global indicator counter).
  const finishStreaming = useCallback(() => {
    if (streamingRef.current) {
      streamingRef.current = false
      endStream()
    }
    setIsStreaming(false)
  }, [endStream])

  const abort = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    finishStreaming()
  }, [finishStreaming])

  const loadInstant = useCallback(
    (fixture: string) => {
      abortRef.current?.abort()
      abortRef.current = null
      finishStreaming()
      setProgress(100)
      setStreamKey((k) => k + 1)
      setResponse(fixture)
    },
    [finishStreaming]
  )

  const loadStream = useCallback(
    async (fixture: string) => {
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      if (!streamingRef.current) {
        streamingRef.current = true
        beginStream()
      }
      setResponse(null)
      setProgress(0)
      setStreamKey((k) => k + 1)
      setIsStreaming(true)

      const total = fixture.length || 1
      const stream = createFakeSSEStream(fixture, chunkMs, chunkSize)
      await readSSEStream(stream, (acc) => {
        if (ctrl.signal.aborted) return
        setResponse(acc)
        setProgress(Math.min(99, Math.round((acc.length / total) * 100)))
      })
      if (!ctrl.signal.aborted) {
        setProgress(100)
        finishStreaming()
      }
    },
    [beginStream, chunkMs, chunkSize, finishStreaming]
  )

  const replay = useCallback(
    async (fixture: string) => {
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      if (!streamingRef.current) {
        streamingRef.current = true
        beginStream()
      }
      // Clear → skeleton beat → stream, so replays visibly reset every time.
      setResponse(null)
      setProgress(0)
      setStreamKey((k) => k + 1)
      setIsStreaming(true)
      await new Promise((r) => setTimeout(r, 200))
      if (ctrl.signal.aborted) return

      const total = fixture.length || 1
      const stream = createFakeSSEStream(fixture, chunkMs, chunkSize)
      await readSSEStream(stream, (acc) => {
        if (ctrl.signal.aborted) return
        setResponse(acc)
        setProgress(Math.min(99, Math.round((acc.length / total) * 100)))
      })
      if (!ctrl.signal.aborted) {
        setProgress(100)
        finishStreaming()
      }
    },
    [beginStream, chunkMs, chunkSize, finishStreaming]
  )

  // Clean up the global counter if a component unmounts mid-stream.
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      if (streamingRef.current) {
        streamingRef.current = false
        endStream()
      }
    }
  }, [endStream])

  return { response, isStreaming, progress, streamKey, loadInstant, loadStream, replay, abort }
}
