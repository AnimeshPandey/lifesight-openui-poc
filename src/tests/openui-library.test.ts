import { describe, expect, it } from "vitest"
import { SYSTEM_PROMPT, library } from "@/openui/library"

describe("OpenUI library", () => {
  it("registers exactly 21 components", () => {
    expect(Object.keys(library.components)).toHaveLength(21)
  })

  it("includes components from all 5 groups", () => {
    const names = Object.keys(library.components)
    // Layout
    expect(names).toContain("LsStack")
    expect(names).toContain("LsCard")
    expect(names).toContain("LsTabs")
    // Data
    expect(names).toContain("LsKpiRow")
    expect(names).toContain("LsDataTable")
    expect(names).toContain("LsComparison")
    expect(names).toContain("LsChart")
    // Insight
    expect(names).toContain("LsInfoPanel")
    expect(names).toContain("LsStepPlan")
    expect(names).toContain("LsMermaidDiagram")
    // Decision (4.0)
    expect(names).toContain("LsActionInaction")
    expect(names).toContain("LsScenarioMatrix")
    expect(names).toContain("LsConfidenceBadge")
    expect(names).toContain("LsReadinessChecklist")
    expect(names).toContain("LsApprovalPanel")
    // Agent
    expect(names).toContain("LsSuggestionChips")
    expect(names).toContain("LsCtaButton")
  })

  it("has 6 component groups", () => {
    expect(library.componentGroups).toHaveLength(6)
  })

  it("group names match the spec", () => {
    const groupNames = library.componentGroups?.map((g) => g.name)
    expect(groupNames).toEqual(["Layout", "Data", "Insight", "Decision", "Agent", "Visual"])
  })

  it("generates a non-empty system prompt", () => {
    expect(SYSTEM_PROMPT.length).toBeGreaterThan(500)
  })

  it("system prompt includes all 15 component names", () => {
    const componentNames = Object.keys(library.components)
    for (const name of componentNames) {
      expect(SYSTEM_PROMPT).toContain(name)
    }
  })

  it("system prompt includes MIA preamble", () => {
    expect(SYSTEM_PROMPT).toContain("MIA")
    expect(SYSTEM_PROMPT).toContain("decision-first")
  })

  it("each component has a description", () => {
    for (const [name, comp] of Object.entries(library.components)) {
      expect(comp.description, `${name} missing description`).toBeTruthy()
      expect(comp.description.length, `${name} description too short`).toBeGreaterThan(20)
    }
  })
})
