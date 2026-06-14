import { describe, expect, it } from "vitest"
import { resolveAgentFixture } from "@/mocks/mockAgent"
import { GEO_FIXTURE } from "@/mocks/fixtures/geo"
import { MMM_FIXTURE } from "@/mocks/fixtures/mmm"
import { ATTRIBUTION_FIXTURE } from "@/mocks/fixtures/attribution"
import { DISPLAY_FIXTURE } from "@/mocks/fixtures/display"
import { COCKPIT_FIXTURE } from "@/mocks/fixtures/cockpit"
import { AGENT_FIXTURE } from "@/mocks/fixtures/agent"

describe("resolveAgentFixture", () => {
  it("routes geo / holdout / experiment queries to GEO_FIXTURE", () => {
    expect(resolveAgentFixture("Show geo experiment results").fixture).toBe(GEO_FIXTURE)
    expect(resolveAgentFixture("What was the holdout lift?").fixture).toBe(GEO_FIXTURE)
    expect(resolveAgentFixture("DMA performance breakdown").fixture).toBe(GEO_FIXTURE)
  })

  it("routes causal DAG queries to MMM_FIXTURE", () => {
    expect(resolveAgentFixture("Explain the causal DAG").fixture).toBe(MMM_FIXTURE)
    expect(resolveAgentFixture("What is the adstock decay?").fixture).toBe(MMM_FIXTURE)
    expect(resolveAgentFixture("Show me the model structure").fixture).toBe(MMM_FIXTURE)
  })

  it("routes attribution queries to ATTRIBUTION_FIXTURE", () => {
    expect(resolveAgentFixture("Show attribution by channel").fixture).toBe(ATTRIBUTION_FIXTURE)
    expect(resolveAgentFixture("last-touch vs data-driven").fixture).toBe(ATTRIBUTION_FIXTURE)
  })

  it("routes display queries to DISPLAY_FIXTURE", () => {
    expect(resolveAgentFixture("Why is Display underperforming?").fixture).toBe(DISPLAY_FIXTURE)
    expect(resolveAgentFixture("display is bad").fixture).toBe(DISPLAY_FIXTURE)
    expect(resolveAgentFixture("view-through issue").fixture).toBe(DISPLAY_FIXTURE)
  })

  it("routes budget / pace queries to COCKPIT_FIXTURE", () => {
    expect(resolveAgentFixture("budget pace alert").fixture).toBe(COCKPIT_FIXTURE)
    expect(resolveAgentFixture("we are underspending").fixture).toBe(COCKPIT_FIXTURE)
  })

  it("falls back to AGENT_FIXTURE for unrecognised queries", () => {
    expect(resolveAgentFixture("hello").fixture).toBe(AGENT_FIXTURE)
    expect(resolveAgentFixture("Q4 ROI").fixture).toBe(AGENT_FIXTURE)
    expect(resolveAgentFixture("").fixture).toBe(AGENT_FIXTURE)
  })

  it("returns a label for every resolved query", () => {
    const queries = [
      "geo experiment", "mmm causal", "attribution", "display", "budget pace",
      "decision", "template", "hitl", "random query",
    ]
    for (const q of queries) {
      const { label } = resolveAgentFixture(q)
      expect(label, `query "${q}" missing label`).toBeTruthy()
    }
  })
})
