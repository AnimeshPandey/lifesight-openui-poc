import { Link, useRouterState } from "@tanstack/react-router"
import { navigationSections, pathSection } from "@/lib/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

function SidebarToggleIcon({ direction }: { direction: "expand" | "collapse" }) {
  const isExpand = direction === "expand"
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="size-6 shrink-0"
      style={{ display: "block" }}
      aria-hidden="true"
    >
      <rect
        x="0.5"
        y="0.5"
        width="23"
        height="23"
        rx="5.5"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeOpacity="0.2"
      />
      <path
        d={isExpand ? "M10 8.5L13.5 12L10 15.5" : "M14 8.5L10.5 12L14 15.5"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * App sidebar — ported from ls4x-main/frontend/components/app-sidebar.tsx and
 * simplified for the POC: no session/role gating or localStorage nav prefs
 * (no backend), TanStack <Link> instead of next/link, and a text wordmark in
 * place of the /logos/*.svg assets the POC doesn't ship. Collapses to an icon
 * rail (defaultOpen={false} in the shell).
 */
export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const activeSection = pathSection(pathname)

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="h-12 justify-center border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            {state === "collapsed" ? (
              <SidebarMenuButton
                onClick={toggleSidebar}
                tooltip="Expand menu"
                aria-label="Expand menu"
                className="group flex w-full cursor-pointer items-center justify-center group-data-[collapsible=icon]:!p-0"
              >
                <span className="flex size-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground group-hover:hidden">
                  L
                </span>
                <span className="hidden text-sidebar-foreground/70 group-hover:block" aria-hidden>
                  <SidebarToggleIcon direction="expand" />
                </span>
              </SidebarMenuButton>
            ) : (
              <div className="flex w-full items-center justify-between px-2 py-1.5">
                <span className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
                    L
                  </span>
                  <span className="text-sm font-semibold tracking-tight text-sidebar-accent-foreground">
                    Lifesight
                  </span>
                </span>
                <button
                  onClick={toggleSidebar}
                  aria-label="Collapse menu"
                  className="flex cursor-pointer items-center justify-center text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground"
                >
                  <SidebarToggleIcon direction="collapse" />
                </button>
              </div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="pt-3">
        {navigationSections.map((section, idx) => (
          <SidebarGroup key={section.label ?? idx}>
            {section.label && (
              <>
                <SidebarGroupLabel className="mb-0.5 px-2 py-0 group-data-[collapsible=icon]:hidden">
                  <div className="flex w-full items-center gap-2">
                    <span className="shrink-0 select-none text-[10px] uppercase tracking-wider text-muted-foreground/50">
                      {section.label}
                    </span>
                    <div className="h-px flex-1 bg-sidebar-border" />
                  </div>
                </SidebarGroupLabel>
                <div className="hidden flex-col items-center gap-0 px-0.5 group-data-[collapsible=icon]:flex pointer-events-none">
                  <div className="w-full border-t border-sidebar-border" />
                </div>
              </>
            )}
            <SidebarMenu>
              {section.items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathSection(item.url) === activeSection}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
