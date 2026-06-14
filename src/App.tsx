import {
  Link,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"
import { Sparkles } from "lucide-react"
import { AppShell } from "@/layout/AppShell"
import { allNavItems } from "@/lib/navigation"
import { useMia } from "@/providers/mia-provider"
import { AgentChatPage } from "@/features/agent-chat/AgentChatPage"
import { CockpitPage } from "@/features/cockpit/CockpitPage"
import { DecisionRoomPage } from "@/features/decision-room/DecisionRoomPage"
import { MiaRoutePage } from "@/features/mia-panel/MiaRoutePage"
import { GeoExperimentPage } from "@/features/geo/GeoExperimentPage"
import { MmmDagPage } from "@/features/mmm/MmmDagPage"
import { AttributionPage } from "@/features/attribution/AttributionPage"
import { TemplateWizardPage } from "@/features/template-wizard/TemplateWizardPage"
import { HitlPage } from "@/features/hitl/HitlPage"
import { ComponentShowcasePage } from "@/features/showcase/ComponentShowcasePage"
import { ComparePage } from "@/features/compare/ComparePage"

// ── Root layout — the ls4x 4.0 app shell renders the routed page via <Outlet/> ──
const rootRoute = createRootRoute({ component: AppShell })

// ── Index / landing — compact, product-style Lucide grid (no emoji dev nav) ─────
function HomePage() {
  const { openPanel } = useMia()
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Lifesight OpenUI POC</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          <code className="rounded bg-accent px-1.5 py-0.5 text-xs text-foreground">
            @openuidev/react-lang
          </code>{" "}
          powering generative UI across the decision-intelligence surfaces, now wearing
          the Lifesight 4.0 app shell.
        </p>
      </div>

      {/* MIA callout — MIA is global, not a nav item */}
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <span
            className="flex size-9 items-center justify-center rounded-md text-white"
            style={{ backgroundImage: "linear-gradient(135deg, var(--primary), var(--primary-cta-dark))" }}
          >
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">MIA is everywhere</p>
            <p className="text-xs text-muted-foreground">
              Context-aware copilot — press Alt+C or the ✨ in the header on any page.
            </p>
          </div>
        </div>
        <button
          onClick={() => openPanel({ source: "Home" })}
          className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Open MIA
        </button>
      </div>

      <div>
        <p className="section-label mb-2">Demo surfaces</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allNavItems.map((item) => (
            <Link
              key={item.url}
              to={item.url}
              className="card-hover group flex items-start gap-3 rounded-lg border border-border bg-card p-3"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-muted-foreground transition-colors group-hover:text-primary">
                <item.icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{item.title}</span>
                <span className="block text-xs text-muted-foreground">{item.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        17 OpenUI components · 9 routes · React 19 + Vite 6 + shadcn/ui radix-mira (dark)
      </p>
    </div>
  )
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
})

// ── Feature routes (URLs unchanged so all fixtures/streams keep working) ────────
const agentRoute       = createRoute({ getParentRoute: () => rootRoute, path: "/agent",         component: AgentChatPage })
const miaRoute         = createRoute({ getParentRoute: () => rootRoute, path: "/mia",           component: MiaRoutePage })
const decisionsRoute   = createRoute({ getParentRoute: () => rootRoute, path: "/decisions/$id", component: DecisionRoomPage })
const cockpitRoute     = createRoute({ getParentRoute: () => rootRoute, path: "/cockpit",       component: CockpitPage })
const geoRoute         = createRoute({ getParentRoute: () => rootRoute, path: "/geo",           component: GeoExperimentPage })
const mmmRoute         = createRoute({ getParentRoute: () => rootRoute, path: "/mmm",           component: MmmDagPage })
const attributionRoute = createRoute({ getParentRoute: () => rootRoute, path: "/attribution",   component: AttributionPage })
const templateRoute    = createRoute({ getParentRoute: () => rootRoute, path: "/template/$id",  component: TemplateWizardPage })
const hitlRoute        = createRoute({ getParentRoute: () => rootRoute, path: "/hitl/$id",      component: HitlPage })
const showcaseRoute    = createRoute({ getParentRoute: () => rootRoute, path: "/showcase",      component: ComponentShowcasePage })
const compareRoute     = createRoute({ getParentRoute: () => rootRoute, path: "/compare",       component: ComparePage })

const routeTree = rootRoute.addChildren([
  indexRoute,
  agentRoute,
  miaRoute,
  decisionsRoute,
  cockpitRoute,
  geoRoute,
  mmmRoute,
  attributionRoute,
  templateRoute,
  hitlRoute,
  showcaseRoute,
  compareRoute,
])

const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

export function App() {
  return <RouterProvider router={router} />
}
