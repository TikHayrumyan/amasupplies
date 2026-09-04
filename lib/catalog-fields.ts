export type CatalogFilters = {
  type: string | null;
  brand: string | null;
  size: string | null;
};

export type CatalogFacet = {
  slug: string;
  title: string;
  count: number;
};

export function parseCatalogFilters(searchParams: {
  type?: string | string[];
  brand?: string | string[];
  size?: string | string[];
}): CatalogFilters {
  function one(value?: string | string[]) {
    return typeof value === "string" && value.length > 0 ? value : null;
  }
  return {
    type: one(searchParams.type),
    brand: one(searchParams.brand),
    size: one(searchParams.size),
  };
}

export function catalogHref(
  pathname: string,
  filters: CatalogFilters,
  patch: Partial<CatalogFilters> = {},
) {
  const next = { ...filters, ...patch };
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
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function toggleCatalogFilter(
  filters: CatalogFilters,
  key: keyof CatalogFilters,
  slug: string,
): CatalogFilters {
  return {
    ...filters,
    [key]: filters[key] === slug ? null : slug,
  };
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
