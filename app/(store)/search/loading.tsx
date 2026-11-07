import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { ProductGridSkeleton } from "@/components/product-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { crumbs } from "@/lib/breadcrumbs";

export default function SearchLoading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <PageBreadcrumbs items={crumbs({ label: "Search", href: "/search" })} />
      <p className="caption mt-8 tracking-[0.16em] text-muted-foreground uppercase">
        Search
      </p>
      <Skeleton className="mt-4 h-10 w-72 max-w-full" />
      <Skeleton className="mt-3 h-5 w-28" />
      <ProductGridSkeleton className="mt-10" />
    </div>
  );
}
