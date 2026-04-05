import { Skeleton } from "@/components/ui/Skeleton";

export function ContactPageSkeleton() {
  return (
    <div role="status" aria-busy="true" className="min-h-screen surface">
      <main className="max-w-300 mx-auto py-8 px-6">
        <span className="sr-only">Cargando información de contacto…</span>
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-96 mx-auto mb-4" rounded="md" />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto" rounded="md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="surface p-6 rounded-xl border border-muted flex flex-col items-center text-center space-y-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-48 mx-auto" />
                <Skeleton className="h-4 w-40 mx-auto" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-40" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-48 mb-6" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  );
}
