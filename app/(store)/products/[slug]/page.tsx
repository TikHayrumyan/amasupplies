import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { CategoryFilters } from "@/components/category-filters";
import { CategoryFiltersSheet } from "@/components/category-filters-sheet";
import { CategorySort } from "@/components/category-sort";
import { ProductCard } from "@/components/product-card";
import { crumbs } from "@/lib/breadcrumbs";
import {
  catalogHref,
  hasActiveCatalogFilters,
  parseCatalogQuery,
} from "@/lib/catalog-fields";
import { ALL_PRODUCTS_SLUG, getCatalog } from "@/lib/catalog";
import { getCategoryBySlug } from "@/lib/category";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  if (slug === ALL_PRODUCTS_SLUG) {
    return {
      title: "All Products | AMA Supplies",
      description:
        "Browse every published product in the AMA Supplies wholesale catalog.",
    };
  }
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
  const catalog = await getCatalog(slug, parseCatalogQuery(query));

  if (!catalog) {
    notFound();
  }

  const category = catalog.category;
  const pathname = `/products/${category?.slug ?? ALL_PRODUCTS_SLUG}`;
  const catalogQuery = { ...catalog.filters, sort: catalog.sort };
  const filtersActive = hasActiveCatalogFilters(catalog.filters);
  const hasFilters =
    catalog.facets.types.length > 0 ||
    catalog.facets.brands.length > 0 ||
    catalog.facets.sizes.length > 0;
  const countLabel =
    catalog.products.length === catalog.total
      ? `${catalog.total} ${catalog.total === 1 ? "product" : "products"}`
      : `${catalog.products.length} of ${catalog.total}`;
  const clearHref = catalogHref(pathname, catalogQuery, {
    type: null,
    brand: null,
    size: null,
  });

  return (
    <div>
      <div className="container mx-auto px-4 pt-6 md:pt-8">
        <PageBreadcrumbs
          items={crumbs(
            { label: "Products", href: "/products" },
            {
              label: category?.title ?? "All products",
              href: pathname,
            },
          )}
        />
        <h1 className="mt-8 font-medium tracking-tight">
          {category?.title ?? "All products"}
        </h1>
        {category?.description ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {category.description}
          </p>
        ) : null}
      </div>
      <div className="container mx-auto px-4 py-12 md:py-16">
        {catalog.total === 0 ? (
          <p className="text-muted-foreground">
            {category
              ? "No products in this category yet."
              : "No products yet."}
          </p>
        ) : (
          <div
            className={
              hasFilters
                ? "lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-x-16 xl:grid-cols-[16rem_minmax(0,1fr)]"
                : undefined
            }
          >
            {hasFilters ? (
              <aside className="hidden lg:sticky lg:top-36 lg:block lg:self-start">
                <CategoryFilters
                  pathname={pathname}
                  query={catalogQuery}
                  facets={catalog.facets}
                />
              </aside>
            ) : null}
            <div>
              <div className="lg:hidden">
                <div className="flex items-center justify-between gap-3">
                  <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
                    {countLabel}
                  </p>
                  {filtersActive ? (
                    <Link
                      href={clearHref}
                      scroll={false}
                      className="caption tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-foreground"
                    >
                      Clear
                    </Link>
                  ) : null}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <CategorySort
                    pathname={pathname}
                    query={catalogQuery}
                    align="start"
                  />
                  {hasFilters ? (
                    <CategoryFiltersSheet active={filtersActive}>
                      <CategoryFilters
                        pathname={pathname}
                        query={catalogQuery}
                        facets={catalog.facets}
                        showHeading={false}
                      />
                    </CategoryFiltersSheet>
                  ) : null}
                </div>
              </div>
              <div className="hidden items-center justify-between gap-4 lg:flex">
                <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
                  {countLabel}
                </p>
                <CategorySort pathname={pathname} query={catalogQuery} />
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
