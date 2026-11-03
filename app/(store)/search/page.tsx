import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { ProductCard } from "@/components/product-card";
import { crumbs } from "@/lib/breadcrumbs";
import { normalizeSearchQuery } from "@/lib/search-fields";
import { searchPublishedProducts } from "@/lib/search";
import {
  breadcrumbSchema,
  createMetadata,
  JsonLd,
  webPageSchema,
} from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata({
  searchParams,
}: PageProps<"/search">) {
  const { query } = await searchParams;
  const q = typeof query === "string" ? normalizeSearchQuery(query) : "";
  const title = q ? `Search “${q}”` : "Search";
  const description = q
    ? `Products matching “${q}” in the AMA Supplies wholesale catalog.`
    : "Search the AMA Supplies wholesale catalog.";
  return createMetadata({
    title,
    description,
    path: q ? `/search?query=${encodeURIComponent(q)}` : "/search",
    noIndex: true,
  });
}

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const { query } = await searchParams;
  const q = typeof query === "string" ? normalizeSearchQuery(query) : "";
  const { products, total } = q
    ? await searchPublishedProducts(q)
    : { products: [], total: 0 };

  const title = q ? `Results for “${q}”` : "Search products";
  const description = q
    ? `Products matching “${q}” in the AMA Supplies wholesale catalog.`
    : "Search the AMA Supplies wholesale catalog.";

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <JsonLd
        data={[
          webPageSchema({
            path: "/search",
            name: title,
            description,
            type: "SearchResultsPage",
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Search", path: "/search" },
          ]),
        ]}
      />
      <PageBreadcrumbs items={crumbs({ label: "Search", href: "/search" })} />
      <p className="caption mt-8 tracking-[0.16em] text-muted-foreground uppercase">
        Search
      </p>
      <h1 className="mt-4 font-medium tracking-tight">
        {q ? `Results for “${q}”` : "Search products"}
      </h1>
      {q ? (
        <p className="mt-3 text-muted-foreground">
          {total === 0
            ? "No products match this search."
            : `${total} ${total === 1 ? "product" : "products"}`}
        </p>
      ) : (
        <p className="mt-3 text-muted-foreground">
          Search by name, brand, SKU, or item number.
        </p>
      )}

      {products.length > 0 ? (
        <div className="mt-10 grid gap-10 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
