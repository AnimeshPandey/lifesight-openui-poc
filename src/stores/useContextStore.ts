import { create } from "zustand"

export interface MiaInvocationContext {
  module: string
  entity: string
  dateRange: { from: string; to: string }
}

interface ContextStore {
  context: MiaInvocationContext
  setContext: (ctx: Partial<MiaInvocationContext>) => void
}

export const useContextStore = create<ContextStore>((set) => ({
  context: {
    module: "Models",
    entity: "NovaBrand",
    dateRange: { from: "2025-10-01", to: "2025-12-31" },
  },
  setContext: (ctx) => set((s) => ({ context: { ...s.context, ...ctx } })),
}))
