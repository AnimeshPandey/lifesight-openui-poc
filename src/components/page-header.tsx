import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Shared page header — the chrome the ls4x feature pages share above their
 * body content. Supports an optional Intelligence-style breadcrumb, a leading
 * icon, a subtitle, a trailing badge, and right-aligned action slots (e.g.
 * fixture/stream toggles, replay buttons).
 */
export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  breadcrumb,
  badge,
  actions,
  className,
}: {
  title: string
  subtitle?: ReactNode
  icon?: LucideIcon
  breadcrumb?: string[]
  badge?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {breadcrumb.map((crumb, i) => (
            <span key={`${crumb}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-border" aria-hidden>›</span>}
              <span className={i === breadcrumb.length - 1 ? "text-foreground" : undefined}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2.5 min-w-0">
          {Icon && (
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-muted-foreground">
              <Icon className="size-4" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold leading-tight text-foreground truncate">
                {title}
              </h1>
              {badge}
            </div>
            {subtitle && (
              <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
