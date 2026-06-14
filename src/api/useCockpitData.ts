import { useQuery } from "@tanstack/react-query"
import { COCKPIT_MOCK_DATA, type CockpitMockData } from "@/mocks/cockpit/cockpit-data"

async function fetchCockpitData(): Promise<CockpitMockData> {
  await new Promise((r) => setTimeout(r, 200))
  return COCKPIT_MOCK_DATA
}

export function useCockpitData() {
  return useQuery<CockpitMockData>({
    queryKey: ["cockpit"],
    queryFn: fetchCockpitData,
    staleTime: 60_000,
  })
}
