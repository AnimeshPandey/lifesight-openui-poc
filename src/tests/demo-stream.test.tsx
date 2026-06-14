import { act, renderHook, screen, waitFor } from "@testing-library/react"
import { useEffect } from "react"
import { describe, expect, it } from "vitest"
import { useOpenUIStream } from "@/hooks/useOpenUIStream"
import { OpenUIDemoRenderer } from "@/components/openui-demo-renderer"
import { renderWithProviders } from "./test-utils"

const FIXTURE = `root = LsStack("vertical", "md", [k])
k = LsKpiRow([{label: "Revenue", value: "$2.4M", delta: 0.12}])`

describe("useOpenUIStream", () => {
  it("loadInstant sets the full response immediately, not streaming", () => {
    const { result } = renderHook(() => useOpenUIStream())
    act(() => result.current.loadInstant(FIXTURE))
    expect(result.current.response).toBe(FIXTURE)
    expect(result.current.isStreaming).toBe(false)
    expect(result.current.progress).toBe(100)
  })

  it("loadStream clears, accumulates, and ends at the full fixture", async () => {
    const { result } = renderHook(() => useOpenUIStream({ chunkMs: 0, chunkSize: 8 }))
    await act(async () => {
      await result.current.loadStream(FIXTURE)
    })
    expect(result.current.response).toBe(FIXTURE)
    expect(result.current.progress).toBe(100)
    expect(result.current.isStreaming).toBe(false)
  })

  it("replay bumps streamKey so the Renderer remounts", async () => {
    const { result } = renderHook(() => useOpenUIStream({ chunkMs: 0, chunkSize: 16 }))
    const before = result.current.streamKey
    await act(async () => {
      await result.current.replay(FIXTURE)
    })
    expect(result.current.streamKey).toBeGreaterThan(before)
    expect(result.current.response).toBe(FIXTURE)
  })
})

describe("OpenUIDemoRenderer", () => {
  function Harness({ load }: { load: boolean }) {
    const stream = useOpenUIStream()
    useEffect(() => {
      if (load) stream.loadInstant(FIXTURE)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return <OpenUIDemoRenderer stream={stream} />
  }

  it("shows the empty/skeleton hint when there is no response", async () => {
    renderWithProviders(<Harness load={false} />)
    expect(await screen.findByText(/Waiting for agent response/i)).toBeInTheDocument()
  })

  it("renders fixture content once loaded", async () => {
    renderWithProviders(<Harness load={true} />)
    await waitFor(() => expect(screen.getByText("Revenue")).toBeInTheDocument())
    expect(screen.getByText("$2.4M")).toBeInTheDocument()
  })
})
