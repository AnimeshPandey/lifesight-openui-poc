import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * Stubbed notification center — ls4x streams alerts from the backend; the POC
 * shows a small static feed so the header reads like the production shell.
 */
const STUB_NOTIFICATIONS = [
  {
    id: "n1",
    title: "Budget pace alert",
    body: "Paid Search is 18% ahead of plan for Q4.",
    tone: "warning" as const,
  },
  {
    id: "n2",
    title: "Experiment ready",
    body: "Geo holdout for Display reached significance.",
    tone: "positive" as const,
  },
]

export function NotificationCenter() {
  const count = STUB_NOTIFICATIONS.length
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8" aria-label="Notifications">
          <Bell className="h-4 w-4" aria-hidden="true" />
          {count > 0 && (
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-destructive" aria-hidden="true" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <span className="text-[10px] font-normal text-muted-foreground">{count} new</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {STUB_NOTIFICATIONS.map((n) => (
          <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2">
            <div className="flex items-center gap-1.5">
              <span
                className={
                  n.tone === "warning"
                    ? "size-1.5 rounded-full bg-warning"
                    : "size-1.5 rounded-full bg-positive"
                }
                aria-hidden="true"
              />
              <span className="text-xs font-medium text-foreground">{n.title}</span>
            </div>
            <span className="text-[11px] text-muted-foreground">{n.body}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
