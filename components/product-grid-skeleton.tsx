import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Mirrors the ProductCard grid so the real cards replace it without a layout shift. */
export function ProductGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn("grid gap-10 sm:grid-cols-2 xl:grid-cols-3", className)}
    >
      <span className="sr-only">Loading products…</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          <Skeleton className="aspect-4/3" />
          <Skeleton className="mt-4 h-[2lh] text-lg leading-snug" />
          <div className="mt-3 grid grid-cols-2 gap-4">
            <Skeleton className="h-9" />
            <Skeleton className="h-9" />
          </div>
          <Skeleton className="mt-5 h-11" />
        </div>
      ))}
    </div>
  );
}
