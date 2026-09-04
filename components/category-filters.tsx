import Link from "next/link";
import {
  catalogHref,
  hasActiveCatalogFilters,
  toggleCatalogFilter,
  type CatalogFacet,
  type CatalogFilters,
} from "@/lib/catalog-fields";
import { cn } from "@/lib/utils";

function FilterRow({
  label,
  options,
  selected,
  hrefFor,
}: {
  label: string;
  options: CatalogFacet[];
  selected: string | null;
  hrefFor: (slug: string) => string;
}) {
  if (options.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected === option.slug;
          return (
            <Link
              key={option.slug}
              href={hrefFor(option.slug)}
              scroll={false}
              className={cn(
                "inline-flex h-10 items-center border px-4 text-sm transition-colors",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:border-foreground/50",
              )}
            >
              {option.title}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function CategoryFilters({
  pathname,
  filters,
  facets,
  shown,
  total,
}: {
  pathname: string;
  filters: CatalogFilters;
  facets: {
    types: CatalogFacet[];
    brands: CatalogFacet[];
    sizes: CatalogFacet[];
  };
  shown: number;
  total: number;
}) {
  const active = hasActiveCatalogFilters(filters);
  const hasFacets =
    facets.types.length > 0 || facets.brands.length > 0 || facets.sizes.length > 0;

  if (!hasFacets && !active) {
    return (
      <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
        {total} {total === 1 ? "product" : "products"}
      </p>
    );
  }

  function hrefFor(key: keyof CatalogFilters, slug: string) {
    return catalogHref(pathname, toggleCatalogFilter(filters, key, slug));
  }

  return (
    <div className="border-b border-border/80 pb-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
          {shown === total ? `${total} products` : `${shown} of ${total}`}
        </p>
        {active ? (
          <Link
            href={pathname}
            scroll={false}
            className="caption tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            Clear filters
          </Link>
        ) : null}
      </div>
      <div className="mt-8 flex flex-col gap-8">
        <FilterRow
          label="Type"
          options={facets.types}
          selected={filters.type}
          hrefFor={(slug) => hrefFor("type", slug)}
        />
        <FilterRow
          label="Brand"
          options={facets.brands}
          selected={filters.brand}
          hrefFor={(slug) => hrefFor("brand", slug)}
        />
        <FilterRow
          label="Size"
          options={facets.sizes}
          selected={filters.size}
          hrefFor={(slug) => hrefFor("size", slug)}
        />
      </div>
    </div>
  );
}
