import { Check, ChevronsUpDown, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * Stubbed workspace switcher — ls4x drives this from the session/workspace
 * provider; the POC has no backend, so "NovaBrand" (the canonical demo brand)
 * is hardcoded as the only workspace.
 */
export function WorkspaceSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-1.5 py-1 text-left outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
          NB
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-medium text-foreground">NovaBrand</span>
          <span className="text-[10px] text-muted-foreground">$500M GMV · Demo</span>
        </span>
        <ChevronsUpDown className="ml-1 size-3.5 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Workspace
        </DropdownMenuLabel>
        <DropdownMenuItem className="gap-2">
          <span className="flex size-5 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground">
            NB
          </span>
          <span className="flex-1">NovaBrand</span>
          <Check className="size-4 text-primary" aria-hidden="true" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="gap-2 text-muted-foreground">
          <Plus className="size-4" aria-hidden="true" />
          Add workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
