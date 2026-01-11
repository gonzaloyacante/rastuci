import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Generic form loading skeleton for settings and admin forms.
 * Displays a realistic-looking form placeholder while data loads.
 */
export function FormSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      {/* Title section */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Form fields */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={`form-row-${i}`} className="space-y-4">
          <div className="surface-secondary rounded-lg p-6 space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" rounded="md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" rounded="md" />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Action button */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-40" rounded="md" />
      </div>
    </div>
  );
}

/**
 * Table loading skeleton for list views (orders, products, users, etc.)
 */
export function TableSkeleton({
  rows = 5,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="surface rounded-lg border border-muted overflow-hidden">
      {/* Header */}
      <div className="surface-secondary border-b border-muted px-6 py-4">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-4 w-24" />
          ))}
        </div>
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={`row-${rowIdx}`}
          className="px-6 py-4 border-b border-muted last:border-b-0"
        >
          <div className="flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, colIdx) => (
              <Skeleton
                key={`cell-${rowIdx}-${colIdx}`}
                className={`h-4 ${colIdx === 0 ? "w-32" : "w-20"}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Dashboard stats skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`stat-${i}`}
            className="surface rounded-lg border border-muted p-6"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-12 w-12" rounded="full" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="surface rounded-lg border border-muted p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-64 w-full" rounded="md" />
        </div>
        <div className="surface rounded-lg border border-muted p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-64 w-full" rounded="md" />
        </div>
      </div>
    </div>
  );
}

/**
 * Card grid skeleton (for products, categories, etc.)
 */
export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`card-${i}`}
          className="surface rounded-xl border border-muted overflow-hidden"
        >
          <Skeleton className="aspect-square w-full" rounded="none" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
