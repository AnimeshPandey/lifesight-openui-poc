/**
 * Mock agent query router.
 *
 * Maps user query strings to OpenUI Lang fixture strings via substring matching.
 * In production this is replaced by a real POST SSE call to the backend agent.
 *
 * Matching is case-insensitive; the first matching entry wins.
 * The catch-all at the end returns the default Q4 ROI analysis fixture.
 */

import { AGENT_FIXTURE } from "./fixtures/agent"
import { ATTRIBUTION_FIXTURE } from "./fixtures/attribution"
import { DISPLAY_FIXTURE } from "./fixtures/display"
import { GEO_FIXTURE } from "./fixtures/geo"
import { MMM_FIXTURE } from "./fixtures/mmm"
import { COCKPIT_FIXTURE } from "./fixtures/cockpit"
import { DECISIONS_FIXTURE } from "./fixtures/decisions"
import { TEMPLATE_FIXTURE } from "./fixtures/template"
import { HITL_FIXTURE } from "./fixtures/hitl"
import { PRICING_FIXTURE } from "./fixtures/pricing"
import { PROMO_FIXTURE } from "./fixtures/promo"
import { INVENTORY_FIXTURE } from "./fixtures/inventory"

interface QueryEntry {
  /** Regex tested against the lowercased query string */
  pattern: RegExp
  /** OpenUI Lang fixture to stream back */
  fixture: string
  /** Short label shown in console trace */
  label: string
}

const QUERY_MAP: QueryEntry[] = [
  // Geo experiment
  {
    pattern: /geo|holdout|experiment|lift|dma|region|treatment|control/i,
    fixture: GEO_FIXTURE,
    label: "geo-experiment",
  },
  // MMM / causal DAG
  {
    pattern: /causal|dag|model structure|adstock|saturation|bayesian|pymc|variable importance/i,
    fixture: MMM_FIXTURE,
    label: "mmm-dag",
  },
  // Attribution methodology
  {
    pattern: /attribution|last.touch|data.driven|channel share|credit|explain.*attribution/i,
    fixture: ATTRIBUTION_FIXTURE,
    label: "attribution",
  },
  // Display underperformance
  {
    pattern: /display|underperform|why.*bad|view.through|banner|programmatic/i,
    fixture: DISPLAY_FIXTURE,
    label: "display-analysis",
  },
  // Budget / cockpit / pace
  {
    pattern: /budget.*pace|pace.*budget|underspend|overspend|sentinel|alert|guardrail/i,
    fixture: COCKPIT_FIXTURE,
    label: "budget-pace-alert",
  },
  // Decision / reallocation
  {
    pattern: /decision|reallocat|approv|scenario|simulation|action.*inaction/i,
    fixture: DECISIONS_FIXTURE,
    label: "decision-room",
  },
  // Template / wizard / activate
  {
    pattern: /template|wizard|activat|readiness|setup|blockers/i,
    fixture: TEMPLATE_FIXTURE,
    label: "template-wizard",
  },
  // HITL / approval checkpoint
  {
    pattern: /hitl|checkpoint|approve.*decision|governance|t2|sign.off/i,
    fixture: HITL_FIXTURE,
    label: "hitl-checkpoint",
  },
  // Pricing / elasticity / margin
  {
    pattern: /pric|elasticit|margin/i,
    fixture: PRICING_FIXTURE,
    label: "pricing-review",
  },
  // Promotion / discount / cannibalization
  {
    pattern: /promo|discount|cannibal/i,
    fixture: PROMO_FIXTURE,
    label: "promo-planner",
  },
  // Inventory / stockout / service level
  {
    pattern: /inventory|stockout|fill rate|service level/i,
    fixture: INVENTORY_FIXTURE,
    label: "inventory-guardrail",
  },
  // Paid Social ROI / Q4 analysis (default)
  {
    pattern: /.*/,
    fixture: AGENT_FIXTURE,
    label: "q4-roi-analysis",
  },
]

/**
 * Find the best fixture for a user query.
 * Returns { fixture, label } — label is used for console tracing.
 */
export function resolveAgentFixture(query: string): { fixture: string; label: string } {
  for (const entry of QUERY_MAP) {
    if (entry.pattern.test(query)) {
      return { fixture: entry.fixture, label: entry.label }
    }
  }
  // Unreachable (catch-all above), but TypeScript needs this
  return { fixture: AGENT_FIXTURE, label: "default" }
}

/**
 * Suggested starter queries shown in the chat input placeholder / onboarding.
 */
export const SUGGESTED_QUERIES = [
  "Explain Q4 paid social ROI",
  "Why is Display underperforming?",
  "Show geo experiment results",
  "Explain the MMM model structure",
  "Attribution: data-driven vs last-touch",
  "Show budget pace alert",
  "Review the Q1 price change for Hydra-Boost",
  "Plan the Black Friday promo for skincare",
  "Check inventory cover for the launch SKUs",
]
