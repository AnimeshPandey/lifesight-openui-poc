import {
  LayoutDashboard,
  CloudUpload,
  Bot,
  Globe,
  Atom,
  GitCompareArrows,
  LayoutTemplate,
  ShieldCheck,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react"

/**
 * POC navigation IA — a subset of ls4x-main/frontend/lib/navigation.ts shaped
 * around the 9 OpenUI demo routes. URLs are unchanged from App.tsx so every
 * fixture/stream behaviour keeps working; only the chrome around them is new.
 */
export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  description: string
}

export interface NavSection {
  label?: string
  items: NavItem[]
}

export const navigationSections: NavSection[] = [
  {
    items: [
      {
        title: "Cockpit",
        url: "/cockpit",
        icon: LayoutDashboard,
        description: "Recommendations & alerts",
      },
    ],
  },
  {
    label: "Action",
    items: [
      {
        title: "Deploy",
        url: "/decisions/media-reallocation-001",
        icon: CloudUpload,
        description: "Decision room, approvals & audit",
      },
    ],
  },
  {
    label: "Intelligence",
    items: [
      {
        title: "Geo Experiments",
        url: "/geo",
        icon: Globe,
        description: "Holdout lift & significance",
      },
      {
        title: "MMM",
        url: "/mmm",
        icon: Atom,
        description: "Causal DAG & contribution",
      },
      {
        title: "Attribution",
        url: "/attribution",
        icon: GitCompareArrows,
        description: "Data-driven vs last-touch",
      },
    ],
  },
  {
    label: "Agent",
    items: [
      {
        title: "Agent Chat",
        url: "/agent",
        icon: Bot,
        description: "Conversational analysis",
      },
    ],
  },
  {
    label: "Templates",
    items: [
      {
        title: "Templates",
        url: "/template/media-reallocation",
        icon: LayoutTemplate,
        description: "Decision template wizard",
      },
      {
        title: "HITL",
        url: "/hitl/media-reallocation-001",
        icon: ShieldCheck,
        description: "Human-in-the-loop approval",
      },
    ],
  },
  {
    label: "OpenUI",
    items: [
      {
        title: "Showcase",
        url: "/showcase",
        icon: LayoutGrid,
        description: "All 17 components — instant + streamed",
      },
      {
        title: "Compare",
        url: "/compare",
        icon: GitCompareArrows,
        description: "json-render vs OpenUI",
      },
    ],
  },
]

export const allNavItems: NavItem[] = navigationSections.flatMap((s) => s.items)

/**
 * Top-level section a path belongs to (e.g. "/decisions/abc" → "decisions"),
 * used by the sidebar to highlight the active item even on parameterised
 * detail routes like /decisions/$id or /template/$id.
 */
export function pathSection(pathname: string): string {
  return pathname.split("/")[1] ?? ""
}
