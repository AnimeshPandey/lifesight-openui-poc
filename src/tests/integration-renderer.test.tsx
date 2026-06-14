/**
 * Integration coverage that would have caught the empty-render regression:
 * render each major fixture through the real Renderer (instant mode) and assert
 * expected content appears with no critical parse-error banner.
 */
import { screen, waitFor } from "@testing-library/react"
import { useEffect } from "react"
import { describe, expect, it } from "vitest"
import { useOpenUIStream } from "@/hooks/useOpenUIStream"
import { OpenUIDemoRenderer } from "@/components/openui-demo-renderer"
import { renderWithProviders } from "./test-utils"
import { AGENT_FIXTURE } from "@/mocks/fixtures/agent"
import { DECISIONS_FIXTURE } from "@/mocks/fixtures/decisions"
import { COCKPIT_FIXTURE } from "@/mocks/fixtures/cockpit"
import { HITL_FIXTURE } from "@/mocks/fixtures/hitl"
import { GEO_FIXTURE } from "@/mocks/fixtures/geo"
import { TEMPLATE_FIXTURE } from "@/mocks/fixtures/template"

function Instant({ fixture }: { fixture: string }) {
  const stream = useOpenUIStream()
  useEffect(() => {
    stream.loadInstant(fixture)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <OpenUIDemoRenderer stream={stream} />
}

const CASES: { name: string; fixture: string; snippet: RegExp }[] = [
  { name: "agent", fixture: AGENT_FIXTURE, snippet: /Paid Social/i },
  { name: "decisions", fixture: DECISIONS_FIXTURE, snippet: /If we act/i },
  { name: "cockpit", fixture: COCKPIT_FIXTURE, snippet: /Budget Pace/i },
  { name: "hitl", fixture: HITL_FIXTURE, snippet: /Approve/i },
  { name: "geo", fixture: GEO_FIXTURE, snippet: /Incremental Lift/i },
  { name: "template", fixture: TEMPLATE_FIXTURE, snippet: /Media Reallocation/i },
]

describe("fixture rendering integration", () => {
  CASES.forEach(({ name, fixture, snippet }) => {
    it(`renders the ${name} fixture with no critical parse errors`, async () => {
      renderWithProviders(<Instant fixture={fixture} />)
      await waitFor(() => expect(screen.getAllByText(snippet).length).toBeGreaterThan(0))
      expect(screen.queryByText(/could not be rendered/i)).not.toBeInTheDocument()
    })
  })
})
