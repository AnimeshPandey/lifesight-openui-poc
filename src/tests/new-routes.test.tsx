/**
 * Smoke tests for all 5 new routes.
 * Verifies each page mounts without crashing and renders its heading.
 */
import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { renderWithProviders } from "@/tests/test-utils"
import { GeoExperimentPage } from "@/features/geo/GeoExperimentPage"
import { MmmDagPage } from "@/features/mmm/MmmDagPage"
import { AttributionPage } from "@/features/attribution/AttributionPage"
import { CockpitPage } from "@/features/cockpit/CockpitPage"

// Stub the SSE stream so streaming pages complete instantly
vi.mock("@/mocks/sseStream", () => ({
  createFakeSSEStream: () => ({
    getReader: () => ({
      read: vi.fn().mockResolvedValueOnce({ done: true, value: undefined }),
      releaseLock: vi.fn(),
    }),
  }),
  readSSEStream: vi.fn().mockResolvedValue(undefined),
}))

describe("GeoExperimentPage", () => {
  it("renders heading", async () => {
    renderWithProviders(<GeoExperimentPage />)
    expect(await screen.findByText("Geo Experiment Results")).toBeInTheDocument()
  })
  it("shows replay button", async () => {
    renderWithProviders(<GeoExperimentPage />)
    expect(await screen.findByRole("button", { name: /Replay/i })).toBeInTheDocument()
  })
})

describe("MmmDagPage", () => {
  it("renders heading", async () => {
    renderWithProviders(<MmmDagPage />)
    expect(await screen.findByText("MMM Model Structure")).toBeInTheDocument()
  })
  it("shows replay button", async () => {
    renderWithProviders(<MmmDagPage />)
    expect(await screen.findByRole("button", { name: /Replay/i })).toBeInTheDocument()
  })
})

describe("AttributionPage", () => {
  it("renders heading", async () => {
    renderWithProviders(<AttributionPage />)
    expect(await screen.findByText("Attribution Deep-Dive")).toBeInTheDocument()
  })
  it("shows replay button", async () => {
    renderWithProviders(<AttributionPage />)
    expect(await screen.findByRole("button", { name: /Replay/i })).toBeInTheDocument()
  })
})

describe("CockpitPage", () => {
  it("renders heading", async () => {
    renderWithProviders(<CockpitPage />)
    expect(await screen.findByRole("heading", { name: /cockpit/i })).toBeInTheDocument()
  })
})
