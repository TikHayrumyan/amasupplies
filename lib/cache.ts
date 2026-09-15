import "server-only";

import { unstable_cache } from "next/cache";

/**
 * Cache tags for on-demand revalidation from dashboard mutations.
 * Storefront reads (catalog, categories, brands, hero, ...) share one tag;
 * blog reads use their own. Dashboard actions call `revalidateTag(tag, "max")`.
 */
export const STOREFRONT_TAG = "storefront";
export const BLOG_TAG = "blog";

/** Time-based fallback (seconds) when no on-demand revalidation happens. */
export const STOREFRONT_REVALIDATE = 3600;

/**
 * Wrap a pure database read in Next.js' persistent cache with tags.
 * Result is reused across requests until the TTL elapses or a matching
 * `revalidateTag` runs. Do not use for functions that read cookies/headers.
 */
export function cacheStorefront<Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
  keyParts: string[],
  tags: string[] = [STOREFRONT_TAG],
): (...args: Args) => Promise<Result> {
  return unstable_cache(fn, keyParts, {
    tags,
    revalidate: STOREFRONT_REVALIDATE,
  });
}
