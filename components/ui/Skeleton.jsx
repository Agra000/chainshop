/**
 * Loading placeholders shown while data is fetched from the backend.
 */
export function Skeleton({ className = "" }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-border/70 ${className}`} />;
}

export function ProductGridSkeleton({ count = 10 }) {
  return (
    <div
      role="status"
      aria-label="Loading products"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <Skeleton className="aspect-square w-full !rounded-none" />
          <div className="flex flex-col gap-2 p-3">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="mt-1 h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card flex items-center gap-3 p-4">
          <Skeleton className="h-14 w-14 shrink-0" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 4 }) {
  return (
    <div role="status" aria-label="Loading form" className="card flex flex-col gap-4 p-5 sm:p-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="mt-1 h-10 w-full" />
    </div>
  );
}

export function SellerDashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard" className="grid gap-5 md:grid-cols-[280px_1fr] md:items-start">
      <div className="card overflow-hidden">
        <Skeleton className="h-28 w-full !rounded-none" />
        <div className="flex flex-col items-center gap-3 p-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-52" />
          <Skeleton className="h-3 w-36" />
          <Skeleton className="mt-2 h-8 w-full" />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card flex flex-col gap-2 px-4 py-3.5">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-6 w-10" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
        <ListSkeleton count={3} />
      </div>
    </div>
  );
}
