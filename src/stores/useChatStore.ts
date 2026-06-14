import { create } from "zustand"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

interface ChatStore {
  messages: ChatMessage[]
  isStreaming: boolean
  activeSession: string | null
  addMessage: (msg: ChatMessage) => void
  setStreaming: (v: boolean) => void
  setSession: (id: string) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  activeSession: null,
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setStreaming: (v) => set({ isStreaming: v }),
  setSession: (id) => set({ activeSession: id }),
  clearMessages: () => set({ messages: [] }),
}))
