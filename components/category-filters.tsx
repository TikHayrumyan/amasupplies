import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  catalogHref,
  hasActiveCatalogFilters,
  type CatalogFacet,
  type CatalogFilters,
} from "@/lib/catalog-fields";
import { cn } from "@/lib/utils";

function FilterDropdown({
  label,
  options,
  selected,
  allHref,
  hrefFor,
}: {
  label: string;
  options: CatalogFacet[];
  selected: string | null;
  allHref: string;
  hrefFor: (slug: string) => string;
}) {
  if (options.length === 0) {
    return null;
  }

  const current = options.find((option) => option.slug === selected);

  return (
    <details className="group border-b border-border/80">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="caption block tracking-[0.16em] text-muted-foreground uppercase">
            {label}
          </span>
          <span className="mt-1 block truncate text-sm">
            {current?.title ?? "All"}
          </span>
        </span>
        <ChevronDown
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
          strokeWidth={1.5}
        />
      </summary>
      <ul className="pb-5">
        <li>
          <Link
            href={allHref}
            scroll={false}
            className={cn(
              "block py-1.5 text-sm transition-colors",
              selected
                ? "text-muted-foreground hover:text-foreground"
                : "text-foreground",
            )}
          >
            All
          </Link>
        </li>
        {options.map((option) => {
          const active = selected === option.slug;
          return (
            <li key={option.slug}>
              <Link
                href={hrefFor(option.slug)}
                scroll={false}
                className={cn(
                  "block py-1.5 text-sm transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

export function CategoryFilters({
  pathname,
  filters,
  facets,
}: {
  pathname: string;
  filters: CatalogFilters;
  facets: {
    types: CatalogFacet[];
    brands: CatalogFacet[];
    sizes: CatalogFacet[];
  };
}) {
  const active = hasActiveCatalogFilters(filters);
  const hasFacets =
    facets.types.length > 0 ||
    facets.brands.length > 0 ||
    facets.sizes.length > 0;

  if (!hasFacets) {
    return null;
  }

  function hrefFor(key: keyof CatalogFilters, slug: string | null) {
    return catalogHref(pathname, filters, { [key]: slug });
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 border-b border-border/80 pb-4">
        <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Filter
        </p>
        {active ? (
          <Link
            href={pathname}
            scroll={false}
            className="caption tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            Clear
          </Link>
        ) : null}
      </div>
      <FilterDropdown
        label="Type"
        options={facets.types}
        selected={filters.type}
        allHref={hrefFor("type", null)}
        hrefFor={(slug) => hrefFor("type", slug)}
      />
      <FilterDropdown
        label="Brand"
        options={facets.brands}
        selected={filters.brand}
        allHref={hrefFor("brand", null)}
        hrefFor={(slug) => hrefFor("brand", slug)}
      />
      <FilterDropdown
        label="Size"
        options={facets.sizes}
        selected={filters.size}
        allHref={hrefFor("size", null)}
        hrefFor={(slug) => hrefFor("size", slug)}
      />
    </div>
  );
}
