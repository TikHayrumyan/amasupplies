import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import {
  catalogHref,
  hasActiveCatalogFilters,
  type CatalogFacet,
  type CatalogFilters,
} from "@/lib/catalog-fields";
import { cn } from "@/lib/utils";

function FilterCheck({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "mt-px flex size-3.5 shrink-0 items-center justify-center border transition-colors",
        checked
          ? "border-foreground bg-foreground"
          : "border-foreground/30 bg-background group-hover:border-foreground/60",
      )}
    >
      {checked ? (
        <Check className="size-2.5 text-background" strokeWidth={3} />
      ) : null}
    </span>
  );
}

function FilterOption({
  href,
  label,
  checked,
}: {
  href: string;
  label: string;
  checked: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        scroll={false}
        aria-current={checked ? "true" : undefined}
        className="group flex items-start gap-3 py-2"
      >
        <FilterCheck checked={checked} />
        <span
          className={cn(
            "text-sm leading-snug transition-colors",
            checked
              ? "text-foreground"
              : "text-muted-foreground group-hover:text-foreground",
          )}
        >
          {label}
        </span>
      </Link>
    </li>
  );
}

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
    <details className="group/filter border-b border-border/80">
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
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open/filter:rotate-180"
          strokeWidth={1.5}
        />
      </summary>
      <ul className="pt-1 pb-5 pl-5">
        <FilterOption href={allHref} label="All" checked={!selected} />
        {options.map((option) => (
          <FilterOption
            key={option.slug}
            href={hrefFor(option.slug)}
            label={option.title}
            checked={selected === option.slug}
          />
        ))}
      </ul>
    </details>
  );
}

export function CategoryFilters({
  pathname,
  filters,
  facets,
  showHeading = true,
}: {
  pathname: string;
  filters: CatalogFilters;
  facets: {
    types: CatalogFacet[];
    brands: CatalogFacet[];
    sizes: CatalogFacet[];
  };
  showHeading?: boolean;
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
      {showHeading ? (
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
      ) : active ? (
        <div className="flex justify-end border-b border-border/80 pb-4">
          <Link
            href={pathname}
            scroll={false}
            className="caption tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            Clear
          </Link>
        </div>
      ) : null}
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
