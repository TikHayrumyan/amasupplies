import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { CategoryFilters } from "@/components/category-filters";
import { CategoryFiltersSheet } from "@/components/category-filters-sheet";
import { CategorySort } from "@/components/category-sort";
import { ProductCard } from "@/components/product-card";
import { crumbs } from "@/lib/breadcrumbs";
import {
  hasActiveCatalogFilters,
  parseCatalogQuery,
} from "@/lib/catalog-fields";
import { getCategoryCatalog } from "@/lib/catalog";
import { getCategoryBySlug } from "@/lib/category";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category || !category.isPublished) {
    return {};
  }
  return {
    title: `${category.title} | AMA Supplies`,
    description: category.description || undefined,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const query = await searchParams;
  const category = await getCategoryBySlug(slug);

  if (!category || !category.isPublished) {
    notFound();
  }

  const catalog = await getCategoryCatalog(
    category.id,
    parseCatalogQuery(query),
  );
  const pathname = `/products/${category.slug}`;
  const catalogQuery = { ...catalog.filters, sort: catalog.sort };
  const hasFilters =
    catalog.facets.types.length > 0 ||
    catalog.facets.brands.length > 0 ||
    catalog.facets.sizes.length > 0;

  return (
    <div>
      <div className="container mx-auto px-4 pt-6 md:pt-8">
        <PageBreadcrumbs
          items={crumbs(
            { label: "Products", href: "/products" },
            { label: category.title, href: `/products/${category.slug}` },
          )}
        />
      </div>
      <div className="relative mt-6 h-[40vh] min-h-72 overflow-hidden bg-foreground md:mt-8">
        <Image
          src={category.imageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/15 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 py-12">
            <h1 className="font-medium tracking-tight text-white">
              {category.title}
            </h1>
            {category.description ? (
              <p className="mt-4 max-w-lg text-white/80">
                {category.description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        {catalog.total === 0 ? (
          <p className="text-muted-foreground">No products in this category yet.</p>
        ) : (
          <div
            className={
              hasFilters
                ? "lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-x-16 xl:grid-cols-[16rem_minmax(0,1fr)]"
                : undefined
            }
          >
            {hasFilters ? (
              <aside className="hidden lg:sticky lg:top-32 lg:block lg:self-start">
                <CategoryFilters
                  pathname={pathname}
                  query={catalogQuery}
                  facets={catalog.facets}
                />
              </aside>
            ) : null}
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
                  {catalog.products.length === catalog.total
                    ? `${catalog.total} ${catalog.total === 1 ? "product" : "products"}`
                    : `${catalog.products.length} of ${catalog.total}`}
                </p>
                <div className="flex items-center gap-6">
                  <CategorySort pathname={pathname} query={catalogQuery} />
                  {hasFilters ? (
                    <div className="lg:hidden">
                      <CategoryFiltersSheet
                        active={hasActiveCatalogFilters(catalog.filters)}
                      >
                        <CategoryFilters
                          pathname={pathname}
                          query={catalogQuery}
                          facets={catalog.facets}
                          showHeading={false}
                        />
                      </CategoryFiltersSheet>
                    </div>
                  ) : null}
                </div>
              </div>
              {catalog.products.length === 0 ? (
                <p className="mt-10 text-muted-foreground">
                  No products match these filters.
                </p>
              ) : (
                <div className="mt-8 grid gap-10 sm:grid-cols-2 xl:grid-cols-3">
                  {catalog.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
