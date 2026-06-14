/**
 * Shell tests for the ls4x 4.0 alignment:
 *  - AppSidebar renders the POC navigation IA
 *  - MiaProvider + MiaTrigger toggle the docked MIA panel (the global-panel
 *    behaviour that replaced the standalone /mia page)
 */
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { AppSidebar } from "@/components/app-sidebar"
import { MiaPanel, MiaTrigger } from "@/components/mia-panel"
import { MiaProvider } from "@/providers/mia-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

function renderSidebar() {
  const root = createRootRoute({
    component: () => (
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      </TooltipProvider>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: "/", component: () => null })
  const router = createRouter({
    routeTree: root.addChildren([index]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  })
  return render(<RouterProvider router={router} />)
}

describe("AppSidebar", () => {
  it("renders the POC navigation items", async () => {
    renderSidebar()
    expect(await screen.findByText("Cockpit")).toBeInTheDocument()
    expect(screen.getByText("Deploy")).toBeInTheDocument()
    expect(screen.getByText("Geo Experiments")).toBeInTheDocument()
    expect(screen.getByText("MMM")).toBeInTheDocument()
    expect(screen.getByText("Attribution")).toBeInTheDocument()
    expect(screen.getByText("Agent Chat")).toBeInTheDocument()
    expect(screen.getByText("HITL")).toBeInTheDocument()
  })

  it("renders section labels from the nav IA", async () => {
    renderSidebar()
    expect(await screen.findByText("Intelligence")).toBeInTheDocument()
  })
})

describe("MIA docked panel", () => {
  function renderMia() {
    return render(
      <TooltipProvider>
        <MiaProvider>
          <MiaTrigger />
          <MiaPanel />
        </MiaProvider>
      </TooltipProvider>
    )
  }

  it("is closed until the trigger is pressed", () => {
    renderMia()
    expect(screen.queryByLabelText("MIA panel")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: /ask mia/i })).toBeInTheDocument()
  })

  it("opens the docked panel when the trigger is clicked", async () => {
    renderMia()
    await userEvent.click(screen.getByRole("button", { name: /ask mia/i }))
    expect(await screen.findByLabelText("MIA panel")).toBeInTheDocument()
    // module switcher present inside the panel
    expect(screen.getByRole("button", { name: "Experiments" })).toBeInTheDocument()
  })

  it("closes the panel from the panel close button", async () => {
    renderMia()
    await userEvent.click(screen.getByRole("button", { name: /ask mia/i }))
    await screen.findByLabelText("MIA panel")
    await userEvent.click(screen.getByRole("button", { name: /close mia panel/i }))
    expect(screen.queryByLabelText("MIA panel")).not.toBeInTheDocument()
  })
})
