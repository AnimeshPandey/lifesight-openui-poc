import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { renderWithProviders } from "@/tests/test-utils"
import { CockpitPage } from "@/features/cockpit/CockpitPage"
import { buildCockpitAlertFix } from "@/mocks/cockpit/build-cockpit-alert-fix"
import { COCKPIT_BUDGET_PACE_FIXTURE, COCKPIT_SPEND_ANOMALY_FIXTURE, COCKPIT_MEDIA_FIXTURE, COCKPIT_DATA_FIXTURE } from "@/mocks/cockpit/cockpit-openui-fixtures"
import type { SpendRecommendation } from "@/mocks/cockpit/cockpit-data"

// Suppress act() warnings from async stream effects
vi.spyOn(console, "warn").mockImplementation(() => {})

// Stub the SSE stream so tests complete instantly without real timers
vi.mock("@/mocks/sseStream", () => ({
  createFakeSSEStream: () => ({
    getReader: () => ({
      read: vi.fn().mockResolvedValueOnce({ done: true, value: undefined }),
      releaseLock: vi.fn(),
    }),
  }),
  readSSEStream: vi.fn().mockResolvedValue(undefined),
}))

// ── Smoke tests ──────────────────────────────────────────────────────────────

describe("CockpitPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the Cockpit heading", async () => {
    renderWithProviders(<CockpitPage />)
    expect(await screen.findByRole("heading", { name: /cockpit/i })).toBeInTheDocument()
  })

  it("shows the Recommendations & Alerts tab", async () => {
    renderWithProviders(<CockpitPage />)
    expect(await screen.findByRole("tab", { name: /recommendations/i })).toBeInTheDocument()
  })

  it("shows the Pinned artifact tab (disabled)", async () => {
    renderWithProviders(<CockpitPage />)
    const pinned = await screen.findByRole("tab", { name: /pinned artifact/i })
    expect(pinned).toBeInTheDocument()
    expect(pinned).toBeDisabled()
  })
})

// ── Agent jump bar ────────────────────────────────────────────────────────────

describe("Agent jump bar", () => {
  it("shows Alignment pill", async () => {
    renderWithProviders(<CockpitPage />)
    expect(await screen.findByRole("button", { name: /alignment/i })).toBeInTheDocument()
  })

  it("shows Media pill", async () => {
    renderWithProviders(<CockpitPage />)
    // Jump bar has a "Media" button pill; use findAllByRole since there may be
    // multiple buttons matching /media/i (e.g. tab triggers)
    const btns = await screen.findAllByRole("button", { name: /^media$/i }, { timeout: 5000 })
    expect(btns.length).toBeGreaterThan(0)
  })

  it("shows Goals pill", async () => {
    renderWithProviders(<CockpitPage />)
    expect(await screen.findByRole("button", { name: /goals/i })).toBeInTheDocument()
  })

  it("shows Data pill", async () => {
    renderWithProviders(<CockpitPage />)
    expect(await screen.findByRole("button", { name: /data/i })).toBeInTheDocument()
  })

  it("shows Onboarding pill", async () => {
    renderWithProviders(<CockpitPage />)
    expect(await screen.findByRole("button", { name: /onboarding/i })).toBeInTheDocument()
  })
})

// ── Spend section ─────────────────────────────────────────────────────────────

describe("Spend section", () => {
  it("shows Paid Social row", async () => {
    renderWithProviders(<CockpitPage />)
    // findAllByText because "Paid Social" can appear in jump bar + spend row
    const els = await screen.findAllByText(/paid social/i, {}, { timeout: 5000 })
    expect(els.length).toBeGreaterThan(0)
  })

  it("shows pacing percentage for Paid Social (77%)", async () => {
    renderWithProviders(<CockpitPage />)
    const el = await screen.findByText("77%", {}, { timeout: 5000 })
    expect(el).toBeInTheDocument()
  })

  it("shows Display row", async () => {
    renderWithProviders(<CockpitPage />)
    const displayEls = await screen.findAllByText(/display/i, {}, { timeout: 5000 })
    expect(displayEls.length).toBeGreaterThan(0)
  })
})

// ── Alert detail streaming ────────────────────────────────────────────────────

describe("Alert detail", () => {
  it("shows Replay button after data loads", async () => {
    renderWithProviders(<CockpitPage />)
    // Wait for data and the replay button to appear
    expect(await screen.findByRole("button", { name: /replay alert stream/i })).toBeInTheDocument()
  })

  it("shows alert detail section after Paid Social row click", async () => {
    renderWithProviders(<CockpitPage />)
    const paidSocialRow = await screen.findAllByText("Paid Social")
    // Click the first Paid Social button/row in the spend section
    fireEvent.click(paidSocialRow[0])
    await waitFor(() => {
      expect(document.getElementById("cockpit-alert-detail")).toBeInTheDocument()
    })
  })
})

// ── buildCockpitAlertFix smoke tests ─────────────────────────────────────────

describe("buildCockpitAlertFix", () => {
  const rec: SpendRecommendation = {
    id: "rec-test",
    channel: "Paid Social",
    level: "channel",
    status: "under_pacing",
    pacing_rate: 0.77,
    planned_spend: 240000,
    actual_spend: 184000,
    recommendation: "Increase daily budget.",
  }

  it("returns a string containing LsStack", () => {
    const result = buildCockpitAlertFix(rec)
    expect(result).toContain("LsStack")
  })

  it("returns a string containing the channel name", () => {
    const result = buildCockpitAlertFix(rec)
    expect(result).toContain("Paid Social")
  })

  it("returns a string with LsCtaButton", () => {
    const result = buildCockpitAlertFix(rec)
    expect(result).toContain("LsCtaButton")
  })

  it("returns a string with LsActionInaction", () => {
    const result = buildCockpitAlertFix(rec)
    expect(result).toContain("LsActionInaction")
  })

  it("works for over_pacing status", () => {
    const result = buildCockpitAlertFix({ ...rec, status: "over_pacing", pacing_rate: 1.09 })
    expect(result).toContain("LsStack")
    expect(result).toContain("over")
  })
})

// ── Fixture existence ─────────────────────────────────────────────────────────

describe("OpenUI fixtures", () => {
  it("COCKPIT_BUDGET_PACE_FIXTURE is non-empty and contains LsStack", () => {
    expect(COCKPIT_BUDGET_PACE_FIXTURE.length).toBeGreaterThan(10)
    expect(COCKPIT_BUDGET_PACE_FIXTURE).toContain("LsStack")
  })

  it("COCKPIT_SPEND_ANOMALY_FIXTURE is non-empty and contains LsStack", () => {
    expect(COCKPIT_SPEND_ANOMALY_FIXTURE.length).toBeGreaterThan(10)
    expect(COCKPIT_SPEND_ANOMALY_FIXTURE).toContain("LsStack")
  })

  it("COCKPIT_MEDIA_FIXTURE is non-empty and contains LsChart", () => {
    expect(COCKPIT_MEDIA_FIXTURE.length).toBeGreaterThan(10)
    expect(COCKPIT_MEDIA_FIXTURE).toContain("LsChart")
  })

  it("COCKPIT_DATA_FIXTURE is non-empty and contains LsReadinessChecklist", () => {
    expect(COCKPIT_DATA_FIXTURE.length).toBeGreaterThan(10)
    expect(COCKPIT_DATA_FIXTURE).toContain("LsReadinessChecklist")
  })
})
