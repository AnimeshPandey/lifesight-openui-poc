import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"
import { DecisionRoomPage } from "@/features/decision-room/DecisionRoomPage"
import { useUiModeStore } from "@/stores/useUiModeStore"

function makeRouter() {
  const root = createRootRoute({ component: DecisionRoomPage })
  const route = createRoute({
    getParentRoute: () => root,
    path: "/decisions/$id",
    component: DecisionRoomPage,
  })
  return createRouter({
    routeTree: root.addChildren([route]),
    history: createMemoryHistory({ initialEntries: ["/decisions/media-reallocation-001"] }),
  })
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {children}
    </QueryClientProvider>
  )
}

describe("DecisionRoomPage", () => {
  beforeEach(() => {
    // Reset Zustand store to baseline state between tests
    useUiModeStore.getState().setMode("executive")
  })

  it("renders the UiMode toggle button", async () => {
    render(<RouterProvider router={makeRouter()} />, { wrapper: Wrapper })
    // findByRole waits for async route resolution
    expect(await screen.findByRole("button", { name: /Executive|Analyst/i })).toBeInTheDocument()
  })

  it("starts in Executive mode", async () => {
    render(<RouterProvider router={makeRouter()} />, { wrapper: Wrapper })
    expect(await screen.findByRole("button", { name: /Executive/i })).toBeInTheDocument()
  })

  it("clicking toggle switches to Analyst mode", async () => {
    render(<RouterProvider router={makeRouter()} />, { wrapper: Wrapper })
    const btn = await screen.findByRole("button", { name: /Executive/i })
    await userEvent.click(btn)
    expect(await screen.findByRole("button", { name: /Analyst/i })).toBeInTheDocument()
  })

  it("clicking toggle again returns to Executive mode", async () => {
    render(<RouterProvider router={makeRouter()} />, { wrapper: Wrapper })
    const execBtn = await screen.findByRole("button", { name: /Executive/i })
    await userEvent.click(execBtn) // → Analyst
    const analystBtn = await screen.findByRole("button", { name: /Analyst/i })
    await userEvent.click(analystBtn) // → Executive
    expect(await screen.findByRole("button", { name: /Executive/i })).toBeInTheDocument()
  })
})
