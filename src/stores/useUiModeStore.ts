import { create } from "zustand"

export type UiMode = "executive" | "analyst"

interface UiModeStore {
  mode: UiMode
  toggle: () => void
  setMode: (m: UiMode) => void
}

export const useUiModeStore = create<UiModeStore>((set) => ({
  mode: "executive",
  toggle: () => set((s) => ({ mode: s.mode === "executive" ? "analyst" : "executive" })),
  setMode: (mode) => set({ mode }),
}))
