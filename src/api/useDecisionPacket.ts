import { useQuery } from "@tanstack/react-query"

export interface DecisionKpi {
  label: string
  current: string
  forecast: string
  change: string
  positive: boolean
}

export interface DecisionScenario {
  id: string
  name: string
  budget_delta_pct: number
  roi_forecast: number
  confidence: "high" | "medium" | "low"
}

export interface DecisionPacket {
  id: string
  title: string
  status: string
  decision_type: string
  confidence_level: "high" | "medium" | "low"
  kpis: DecisionKpi[]
  scenarios: DecisionScenario[]
  action_cost: string
  inaction_cost: string
  owner: string
}

const MOCK_PACKETS: Record<string, DecisionPacket> = {
  "media-reallocation-001": {
    id: "media-reallocation-001",
    title: "Q4 Media Reallocation — Paid Social Overweight",
    status: "recommendation_drafted",
    decision_type: "media_reallocation",
    confidence_level: "high",
    owner: "CMO",
    action_cost: "Shift $800K from Display → Paid Social by Nov 15",
    inaction_cost: "Est. -$2.1M incremental revenue vs. optimised mix",
    kpis: [
      { label: "Current Blended ROI", current: "1.8x", forecast: "2.4x", change: "+33%", positive: true },
      { label: "Paid Social ROAS", current: "2.2x", forecast: "3.2x", change: "+45%", positive: true },
      { label: "Display ROAS", current: "0.9x", forecast: "0.7x", change: "-22%", positive: false },
    ],
    scenarios: [
      { id: "s1", name: "Shift 20% Display → Paid Social", budget_delta_pct: 20, roi_forecast: 2.2, confidence: "high" },
      { id: "s2", name: "Shift 40% Display → Paid Social", budget_delta_pct: 40, roi_forecast: 2.4, confidence: "high" },
      { id: "s3", name: "Shift 60% Display → Paid Social", budget_delta_pct: 60, roi_forecast: 2.1, confidence: "medium" },
    ],
  },
}

async function fetchDecisionPacket(id: string): Promise<DecisionPacket> {
  await new Promise((r) => setTimeout(r, 300))
  const packet = MOCK_PACKETS[id]
  if (!packet) throw new Error(`Decision packet ${id} not found`)
  return packet
}

export function useDecisionPacket(id: string) {
  return useQuery({
    queryKey: ["decisionPacket", id],
    queryFn: () => fetchDecisionPacket(id),
    staleTime: Infinity,
  })
}
