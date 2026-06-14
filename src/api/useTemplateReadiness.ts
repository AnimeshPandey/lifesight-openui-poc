import { useQuery } from "@tanstack/react-query"

export interface TemplateBlocker {
  id: string
  label: string
  status: "connected" | "missing" | "low_quality"
  detail: string
}

export interface TemplateReadiness {
  templateId: string
  readinessScore: number
  blockers: TemplateBlocker[]
}

async function fetchReadiness(templateId: string): Promise<TemplateReadiness> {
  await new Promise((r) => setTimeout(r, 200))
  return {
    templateId,
    readinessScore: 72,
    blockers: [
      { id: "b1", label: "Media spend data", status: "connected", detail: "Last sync: 2h ago" },
      { id: "b2", label: "Attribution model", status: "connected", detail: "MMM v2.3 active" },
      { id: "b3", label: "Conversion events", status: "low_quality", detail: "< 30 days history" },
    ],
  }
}

export function useTemplateReadiness(templateId: string) {
  return useQuery({
    queryKey: ["templateReadiness", templateId],
    queryFn: () => fetchReadiness(templateId),
    staleTime: Infinity,
  })
}
