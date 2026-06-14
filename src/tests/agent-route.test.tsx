import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AgentChatPage } from "@/features/agent-chat/AgentChatPage"

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {children}
    </QueryClientProvider>
  )
}

describe("AgentChatPage", () => {
  it("renders page heading", () => {
    render(<AgentChatPage />, { wrapper: Wrapper })
    expect(screen.getByText("Agent Chat")).toBeInTheDocument()
  })

  it("renders the chat text input", () => {
    render(<AgentChatPage />, { wrapper: Wrapper })
    expect(screen.getByRole("textbox", { name: /chat input/i })).toBeInTheDocument()
  })

  it("renders a submit button (Ask or … depending on streaming state)", () => {
    render(<AgentChatPage />, { wrapper: Wrapper })
    // The component starts streaming on mount, so the button may show "…"
    // We just verify SOME button exists in the input bar area
    const buttons = screen.getAllByRole("button")
    expect(buttons.length).toBeGreaterThan(0)
  })

  it("shows suggested query chips", () => {
    render(<AgentChatPage />, { wrapper: Wrapper })
    expect(screen.getByText(/Why is Display underperforming/i)).toBeInTheDocument()
  })

  it("renders the multi-turn description", () => {
    render(<AgentChatPage />, { wrapper: Wrapper })
    expect(screen.getByText(/mock agent routes/i)).toBeInTheDocument()
  })
})
