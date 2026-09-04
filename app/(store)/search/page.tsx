import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { crumbs } from "@/lib/breadcrumbs";

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const { query } = await searchParams;
  const q = typeof query === "string" ? query : "";

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <PageBreadcrumbs items={crumbs({ label: "Search", href: "/search" })} />
      <h1 className="mt-8 font-medium tracking-tight">Search</h1>
      <p className="mt-3 text-muted-foreground">
        {q ? `Results for “${q}”` : "Enter a search query."}
      </p>
    </div>
  );
}

