import { listPublishedBlogPosts } from "@/lib/blog";
import { listPublishedCategories } from "@/lib/category";
import {
  ADDRESS_DISPLAY,
  HOURS_SATURDAY,
  EMAIL_DISPLAY,
  HOURS_WEEKDAY,
  PHONE_DISPLAY,
} from "@/lib/contact";
import { listPublishedProducts } from "@/lib/product";
import { absoluteUrl, seo } from "@/lib/seo";

export const revalidate = 3600;

function link(title: string, path: string, description?: string) {
  return `- [${title}](${absoluteUrl(path)})${description ? `: ${description}` : ""}`;
}

export async function GET() {
  const [categories, products, posts] = await Promise.all([
    listPublishedCategories().catch(() => []),
    listPublishedProducts().catch(() => []),
    listPublishedBlogPosts().catch(() => []),
  ]);
  const publishedSlugs = new Set(categories.map((category) => category.slug));
  const visibleProducts = products.filter((product) =>
    publishedSlugs.has(product.categorySlug),
  );

  const body = [
    `# ${seo.siteName}`,
    "",
    `> ${seo.description}`,
    "",
    "AMA Supplies is a wholesale distributor of medical and facility supplies for approved business customers. The website is a catalog. Pricing is not public. Orders are placed with the sales team after an account is approved. The warehouse is in Glendale, California, with local pickup and nationwide shipping.",
    "",
    "## Contact",
    "",
    `- Phone: ${PHONE_DISPLAY}`,
    `- Email: ${EMAIL_DISPLAY}`,
    `- Address: ${ADDRESS_DISPLAY}`,
    `- Hours: ${HOURS_WEEKDAY}; ${HOURS_SATURDAY}`,
    "- Service area: United States, with local pickup in Glendale, California",
    link("Request an account", "/contact"),
    "",
    "## Catalog",
    "",
    link(
      "Wholesale medical supplies",
      "/products",
      "Shop by category. Wholesale pricing is available to approved accounts.",
    ),
    link("All products", "/products/all"),
    ...categories.map((category) =>
      link(
        category.title,
        `/products/${category.slug}`,
        category.description || undefined,
      ),
    ),
    ...visibleProducts.map((product) =>
      link(
        product.title,
        `/products/${product.categorySlug}/${product.slug}`,
        product.metaDescription || undefined,
      ),
    ),
    "",
    "## Company",
    "",
    link("About AMA Supplies", "/about"),
    link(
      "Frequently asked questions",
      "/faq",
      "Ordering, payment, accounts, shipping, and products",
    ),
    "",
    "## Blog",
    "",
    link("Medical supply blog", "/blog"),
    ...posts.map((post) =>
      link(post.title, `/blog/${post.slug}`, post.excerpt),
    ),
    "",
    "## Optional",
    "",
    link("Privacy policy", "/privacy"),
    link("Returns and refund policy", "/returns"),
    link("Terms of service", "/terms"),
    link("Disclaimer", "/disclaimer"),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
