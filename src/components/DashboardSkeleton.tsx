import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="space-y-2 text-right">
          <Skeleton className="ml-auto h-4 w-24" />
          <Skeleton className="ml-auto h-10 w-40" />
          <Skeleton className="ml-auto h-5 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-3 h-7 w-24" />
            <Skeleton className="mt-2 h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-4 h-64 w-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
