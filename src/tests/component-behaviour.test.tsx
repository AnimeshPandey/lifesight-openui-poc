/**
 * Component contract tests — LsReadinessChecklist and LsApprovalPanel.
 *
 * These tests verify:
 *  1. The component is registered in the library
 *  2. The Zod props schema validates correct inputs
 *  3. The Zod schema rejects invalid inputs
 *  4. The component description is LLM-optimised (non-empty, meaningful)
 *
 * Note: Rendered DOM output is validated manually (npm run dev) and via the
 * smoke tests in new-routes.test.tsx. The <Renderer> in jsdom works but
 * component-level rendering depends on the parser accepting the fixture
 * format, which is verified in integration via the real app.
 */
import { describe, expect, it } from "vitest"
import { library } from "@/openui/library"
import { LsReadinessChecklist, LsApprovalPanel } from "@/openui/components/decision"

// ── LsReadinessChecklist ──────────────────────────────────────────────────────

describe("LsReadinessChecklist — component contract", () => {
  it("is registered in the library", () => {
    expect(library.components["LsReadinessChecklist"]).toBeDefined()
  })

  it("has a non-trivial LLM description", () => {
    expect(LsReadinessChecklist.description.length).toBeGreaterThan(30)
    expect(LsReadinessChecklist.description).toContain("readiness")
  })

  it("props schema accepts valid input", () => {
    const result = LsReadinessChecklist.props.safeParse({
      score: 72,
      threshold: 100,
      template_name: "Media Reallocation",
      blockers: [
        { label: "Media spend", status: "connected", detail: "2h ago" },
        { label: "Conversion events", status: "low_quality" },
      ],
    })
    expect(result.success).toBe(true)
  })

  it("props schema accepts optional fields as optional", () => {
    // threshold and template_name are optional
    const minimal = LsReadinessChecklist.props.safeParse({
      score: 50,
      blockers: [],
    })
    expect(minimal.success).toBe(true)
  })

  it("props schema rejects invalid status values", () => {
    const invalid = LsReadinessChecklist.props.safeParse({
      score: 72,
      blockers: [{ label: "Test", status: "unknown_status" }],
    })
    expect(invalid.success).toBe(false)
  })

  it("props schema rejects score outside numeric type", () => {
    const invalid = LsReadinessChecklist.props.safeParse({
      score: "seventy-two",
      blockers: [],
    })
    expect(invalid.success).toBe(false)
  })

  it("parsed data includes all fields correctly", () => {
    const result = LsReadinessChecklist.props.safeParse({
      score: 72,
      threshold: 100,
      template_name: "Media Reallocation",
      blockers: [
        { label: "Data source", status: "connected", detail: "Active" },
      ],
    })
    if (!result.success) throw new Error(JSON.stringify(result.error))
    expect(result.data.score).toBe(72)
    expect(result.data.threshold).toBe(100)
    expect(result.data.template_name).toBe("Media Reallocation")
    expect(result.data.blockers[0].status).toBe("connected")
  })
})

// ── LsApprovalPanel ───────────────────────────────────────────────────────────

describe("LsApprovalPanel — component contract", () => {
  it("is registered in the library", () => {
    expect(library.components["LsApprovalPanel"]).toBeDefined()
  })

  it("has a non-trivial LLM description that mentions governance", () => {
    expect(LsApprovalPanel.description.length).toBeGreaterThan(30)
    expect(LsApprovalPanel.description).toContain("governance")
  })

  it("props schema accepts valid input with all fields", () => {
    const result = LsApprovalPanel.props.safeParse({
      governance_tier: "T2",
      approver_role: "CMO",
      deadline: "Nov 14, 2025 17:00 GMT",
      context: "Budget window opens Nov 15.",
      approve_label: "Approve Decision",
      reject_label: "Send Back for Revision",
    })
    expect(result.success).toBe(true)
  })

  it("props schema accepts minimal required fields only", () => {
    const minimal = LsApprovalPanel.props.safeParse({
      governance_tier: "T2",
      approver_role: "CMO",
    })
    expect(minimal.success).toBe(true)
  })

  it("props schema rejects invalid governance_tier", () => {
    const invalid = LsApprovalPanel.props.safeParse({
      governance_tier: "T5",  // T0–T4 are valid; T5 is not
      approver_role: "CMO",
    })
    expect(invalid.success).toBe(false)
  })

  it("all 5 governance tiers are accepted", () => {
    for (const tier of ["T0", "T1", "T2", "T3", "T4"] as const) {
      const result = LsApprovalPanel.props.safeParse({
        governance_tier: tier,
        approver_role: "CMO",
      })
      expect(result.success, `tier ${tier} should be valid`).toBe(true)
    }
  })

  it("parsed data preserves approve_label", () => {
    const result = LsApprovalPanel.props.safeParse({
      governance_tier: "T2",
      approver_role: "CMO",
      approve_label: "Custom Approve Text",
    })
    if (!result.success) throw new Error(JSON.stringify(result.error))
    expect(result.data.approve_label).toBe("Custom Approve Text")
  })
})

// ── System prompt coverage ────────────────────────────────────────────────────

describe("System prompt coverage of new components", () => {
  const { SYSTEM_PROMPT } = (() => {
    // Re-import to get the current exported value
    return { SYSTEM_PROMPT: library.prompt() }
  })()

  it("includes LsReadinessChecklist in system prompt", () => {
    expect(SYSTEM_PROMPT).toContain("LsReadinessChecklist")
  })

  it("includes LsApprovalPanel in system prompt", () => {
    expect(SYSTEM_PROMPT).toContain("LsApprovalPanel")
  })

  it("includes governance tier note for LsApprovalPanel", () => {
    expect(SYSTEM_PROMPT).toContain("LsApprovalPanel")
    expect(SYSTEM_PROMPT).toContain("never auto-executes")
  })
})
