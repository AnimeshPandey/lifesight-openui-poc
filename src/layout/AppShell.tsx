import { Outlet } from "@tanstack/react-router"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { WorkspaceSwitcher } from "@/components/workspace-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notification-center"
import { BackNavigation } from "@/components/back-navigation"
import { MiaPanel, MiaTrigger } from "@/components/mia-panel"
import { DemoControls } from "@/components/demo-controls"
import { GuidedTour } from "@/components/guided-tour"
import { Toaster } from "@/components/ui/sonner"

/**
 * App shell — adapted from ls4x-main/frontend/app/(app)/layout.tsx for Vite +
 * TanStack Router. The themed/Mia/Tooltip providers live in main.tsx; this
 * component owns the sidebar + header + docked MIA rail and renders the routed
 * page via <Outlet/>. Main content is full-width (no max-w cap) to match 4.0.
 */
export function AppShell() {
  return (
    <SidebarProvider defaultOpen={false}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>
      <AppSidebar />
      <SidebarInset className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <WorkspaceSwitcher />
          <div className="ml-auto flex items-center gap-1">
            <DemoControls />
            <div className="mx-1 h-4 w-px bg-border" />
            <ThemeToggle />
            <div className="mx-2 h-4 w-px bg-border" />
            <MiaTrigger />
            <div className="mx-2 h-4 w-px bg-border" />
            <NotificationCenter />
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <main
            id="main-content"
            className="thin-scrollbar flex-1 overflow-auto p-4 lg:p-6"
          >
            <BackNavigation />
            <Outlet />
          </main>
          <MiaPanel />
        </div>
      </SidebarInset>
      <GuidedTour />
      <Toaster />
    </SidebarProvider>
  )
}
