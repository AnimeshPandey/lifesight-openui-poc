import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ComponentShowcasePage } from "@/features/showcase/ComponentShowcasePage"
import { SHOWCASE_COMPONENT_NAMES } from "@/mocks/fixtures/showcase"
import { renderWithProviders } from "./test-utils"

describe("ComponentShowcasePage", () => {
  it("renders the heading and a coverage entry for every component", async () => {
    renderWithProviders(<ComponentShowcasePage />)
    expect(await screen.findByText("OpenUI Component Showcase")).toBeInTheDocument()
    expect(SHOWCASE_COMPONENT_NAMES).toHaveLength(21)
    for (const name of SHOWCASE_COMPONENT_NAMES) {
      // Appears at least in the coverage checklist (and again as a section label).
      expect(screen.getAllByText(name).length).toBeGreaterThan(0)
    }
  })

  it("renders the instant gallery fixtures with no critical parse errors", async () => {
    renderWithProviders(<ComponentShowcasePage />)
    // From the LsActionInaction section fixture.
    expect(await screen.findByText(/Reallocate \$800K to Paid Social/i)).toBeInTheDocument()
    // From the LsApprovalPanel section.
    expect(screen.getByText(/Approve — Proceed/i)).toBeInTheDocument()
    // No critical (unknown-component) banner anywhere.
    expect(screen.queryByText(/could not be rendered/i)).not.toBeInTheDocument()
  })
})
