import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="surface rounded-xl border border-muted p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={`item-${i}`}
              className="flex justify-between items-center"
            >
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
        <div className="border-t border-muted pt-4 flex justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <Skeleton className="h-12 w-full" rounded="md" />
    </div>
  );
}
