import { Skeleton } from "@/components/ui/skeleton";

function PageHeadingSkeleton() {
  return (
    <>
      <Skeleton className="h-10 w-56" />
      <Skeleton className="mt-3 h-5 w-full max-w-xl" />
    </>
  );
}

/** Loading state for dashboard pages that list records. */
export function DashboardListSkeleton() {
  return (
    <div role="status" className="container mx-auto px-4 py-12 md:py-16">
      <span className="sr-only">Loading…</span>
      <PageHeadingSkeleton />
      <div className="mt-10 flex justify-end">
        <Skeleton className="h-11 w-36" />
      </div>
      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-16" />
        ))}
      </div>
    </div>
  );
}

/** Loading state for dashboard pages built around an edit form. */
export function DashboardFormSkeleton() {
  return (
    <div role="status" className="container mx-auto px-4 py-12 md:py-16">
      <span className="sr-only">Loading…</span>
      <PageHeadingSkeleton />
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-11" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-8 h-48" />
      <Skeleton className="mt-8 h-11 w-40" />
    </div>
  );
}
