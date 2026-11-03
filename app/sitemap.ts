import type { MetadataRoute } from "next";

import { listPublishedBlogPosts } from "@/lib/blog";
import { listBlogCategories } from "@/lib/blog-category";
import { listPublishedCategories } from "@/lib/category";
import { listPublishedProducts } from "@/lib/product";
import { absoluteUrl, asDate } from "@/lib/seo";

type Entry = MetadataRoute.Sitemap[number];

export const revalidate = 3600;

/**
 * Every indexable URL. `lastModified` is set only where the database keeps a
 * real change date; static pages leave it out rather than claim a fake one.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, posts, blogCategories] = await Promise.all([
    listPublishedCategories(),
    listPublishedProducts(),
    listPublishedBlogPosts(),
    listBlogCategories(),
  ]);

  const publishedCategorySlugs = new Set(
    categories.map((category) => category.slug),
  );
  const visibleProducts = products.filter(
    (product) =>
      product.slug && publishedCategorySlugs.has(product.categorySlug),
  );
  const usedBlogCategories = blogCategories.filter((category) =>
    posts.some((post) => post.categorySlug === category.slug),
  );

  const page = (
    path: string,
    priority: number,
    lastModified?: Date,
  ): Entry => ({
    url: absoluteUrl(path),
    ...(lastModified ? { lastModified } : {}),
    priority,
  });

  const newest = (values: Array<Date | string | null | undefined>) => {
    let latest: Date | undefined;
    for (const value of values) {
      const date = asDate(value);
      if (!date) continue;
      if (!latest || date.getTime() > latest.getTime()) latest = date;
    }
    return latest;
  };

  return [
    page("/", 1),
    page("/products", 0.9, newest(categories.map((category) => category.updatedAt))),
    page("/products/all", 0.8, newest(visibleProducts.map((product) => product.updatedAt))),
    ...categories.map((category) =>
      page(
        `/products/${category.slug}`,
        0.8,
        asDate(category.updatedAt),
      ),
    ),
    ...visibleProducts.map((product) =>
      page(
        `/products/${product.categorySlug}/${product.slug}`,
        0.7,
        asDate(product.updatedAt),
      ),
    ),
    page("/about", 0.7),
    page("/contact", 0.7),
    page("/faq", 0.6),
    page("/blog", 0.7, newest(posts.map((post) => post.updatedAt))),
    ...usedBlogCategories.map((category) =>
      page(
        `/blog?category=${category.slug}`,
        0.5,
        newest(
          posts
            .filter((post) => post.categorySlug === category.slug)
            .map((post) => post.updatedAt),
        ),
      ),
    ),
    ...posts.map((post) =>
      page(`/blog/${post.slug}`, 0.6, asDate(post.updatedAt)),
    ),
    page("/privacy", 0.3),
    page("/returns", 0.3),
    page("/terms", 0.3),
    page("/disclaimer", 0.3),
  ];
}
