import { describe, expect, it, vi } from "vitest"
import { createFakeSSEStream, readSSEStream } from "@/mocks/sseStream"

describe("createFakeSSEStream + readSSEStream", () => {
  it("reassembles the full text exactly", async () => {
    const text = "Hello OpenUI world — this is a test stream"
    const stream = createFakeSSEStream(text, 0, 5)
    const result = await readSSEStream(stream, () => {})
    expect(result).toBe(text)
  })

  it("calls onDelta multiple times for multi-chunk text", async () => {
    const text = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const stream = createFakeSSEStream(text, 0, 3)
    const onDelta = vi.fn()
    await readSSEStream(stream, onDelta)
    // 26 chars / 3 per chunk = 9 calls
    expect(onDelta.mock.calls.length).toBeGreaterThan(1)
  })

  it("each onDelta call receives strictly more text than the previous", async () => {
    const text = "ABCDE"
    const stream = createFakeSSEStream(text, 0, 1)
    const calls: string[] = []
    await readSSEStream(stream, (acc) => calls.push(acc))
    expect(calls[calls.length - 1]).toBe(text)
    for (let i = 1; i < calls.length; i++) {
      expect(calls[i].length).toBeGreaterThan(calls[i - 1].length)
    }
  })

  it("final accumulated text equals the input text", async () => {
    const text = "Short text"
    const stream = createFakeSSEStream(text, 0, 2)
    const result = await readSSEStream(stream, () => {})
    expect(result).toBe(text)
  })

  it("handles empty text without throwing", async () => {
    const stream = createFakeSSEStream("", 0, 5)
    const result = await readSSEStream(stream, () => {})
    expect(result).toBe("")
  })

  it("returns correct result with very large chunks (single emit)", async () => {
    const text = "abc"
    const stream = createFakeSSEStream(text, 0, 1000)
    const calls: string[] = []
    const result = await readSSEStream(stream, (acc) => calls.push(acc))
    expect(result).toBe(text)
    expect(calls).toHaveLength(1)
    expect(calls[0]).toBe(text)
  })
})
