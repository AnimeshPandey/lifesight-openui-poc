import { create } from "zustand"

export type DemoSpeed = "normal" | "slow"

/** Stream timing per demo speed (chunkMs = delay between chunks, chunkSize = chars/chunk). */
export const SPEED_TIMING: Record<DemoSpeed, { chunkMs: number; chunkSize: number }> = {
  normal: { chunkMs: 90, chunkSize: 28 },
  slow: { chunkMs: 200, chunkSize: 16 },
}

interface DemoStore {
  /** Demo playback speed — "slow" makes progressive streaming impossible to miss. */
  speed: DemoSpeed
  setSpeed: (speed: DemoSpeed) => void
  /** Count of in-flight OpenUI streams; drives the global header "Streaming" indicator. */
  activeStreams: number
  beginStream: () => void
  endStream: () => void
}

export const useDemoStore = create<DemoStore>((set) => ({
  speed: "normal",
  setSpeed: (speed) => set({ speed }),
  activeStreams: 0,
  beginStream: () => set((s) => ({ activeStreams: s.activeStreams + 1 })),
  endStream: () => set((s) => ({ activeStreams: Math.max(0, s.activeStreams - 1) })),
}))
