import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6 text-center">
      <Skeleton className="h-16 w-16 mx-auto" rounded="full" />
      <Skeleton className="h-8 w-64 mx-auto" />
      <Skeleton className="h-4 w-96 mx-auto" />
      <div className="surface rounded-xl border border-muted p-6 space-y-4 mt-8">
        <Skeleton className="h-6 w-48 mx-auto" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={`detail-${i}`}
              className="flex justify-between items-center"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
      <Skeleton className="h-12 w-48 mx-auto" rounded="md" />
    </div>
  );
}
