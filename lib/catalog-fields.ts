export type CatalogFilters = {
  type: string | null;
  brand: string | null;
  size: string | null;
};

export type CatalogSort = "featured" | "az" | "za";

export type CatalogQuery = CatalogFilters & {
  sort: CatalogSort;
};

export type CatalogFacet = {
  slug: string;
  title: string;
  count: number;
};

export const CATALOG_SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "az", label: "A–Z" },
  { value: "za", label: "Z–A" },
];

function one(value?: string | string[]) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function parseCatalogSort(value?: string | string[]): CatalogSort {
  const sort = one(value);
  if (sort === "az" || sort === "za") {
    return sort;
  }
  return "featured";
}

export function parseCatalogQuery(searchParams: {
  type?: string | string[];
  brand?: string | string[];
  size?: string | string[];
  sort?: string | string[];
}): CatalogQuery {
  return {
    type: one(searchParams.type),
    brand: one(searchParams.brand),
    size: one(searchParams.size),
    sort: parseCatalogSort(searchParams.sort),
  };
}

export function catalogHref(
  pathname: string,
  query: CatalogQuery,
  patch: Partial<CatalogQuery> = {},
) {
  const next = { ...query, ...patch };
  const params = new URLSearchParams();
  if (next.type) {
    params.set("type", next.type);
  }
  if (next.brand) {
    params.set("brand", next.brand);
  }
  if (next.size) {
    params.set("size", next.size);
  }
  if (next.sort && next.sort !== "featured") {
    params.set("sort", next.sort);
  }
  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function hasActiveCatalogFilters(filters: CatalogFilters) {
  return Boolean(filters.type || filters.brand || filters.size);
}

export function catalogFacetVisible(
  options: CatalogFacet[],
  selected: string | null,
) {
  return options.length >= 2 || selected !== null;
}
