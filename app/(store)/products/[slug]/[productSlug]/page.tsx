import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { ProductGallery } from "@/components/product-gallery";
import { crumbs } from "@/lib/breadcrumbs";
import { sanitizeProductHtml } from "@/lib/product-fields";
import { getPublishedProductBySlug } from "@/lib/product";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]/[productSlug]">): Promise<Metadata> {
  const { slug, productSlug } = await params;
  const product = await getPublishedProductBySlug(slug, productSlug);
  if (!product) {
    return {};
  }
  return {
    title: `${product.metaTitle || product.title} | AMA Supplies`,
    description: product.metaDescription || undefined,
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]/[productSlug]">) {
  const { slug, productSlug } = await params;
  const product = await getPublishedProductBySlug(slug, productSlug);

  if (!product) {
    notFound();
  }

  const images = [
    product.imageUrl,
    ...product.gallery.map((image) => image.imageUrl),
  ];
  const description = sanitizeProductHtml(product.description);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <PageBreadcrumbs
        items={crumbs(
          { label: "Products", href: "/products" },
          {
            label: product.categoryTitle,
            href: `/products/${product.categorySlug}`,
          },
          {
            label: product.title,
            href: `/products/${product.categorySlug}/${product.slug}`,
          },
        )}
      />

      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        <ProductGallery images={images} title={product.title} />
        <div>
          <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
            {product.brandTitle}
          </p>
          <h1 className="mt-3 font-medium tracking-tight">{product.title}</h1>
          <dl className="mt-6 space-y-2 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <dt>Item number</dt>
              <dd>{product.itemNumber}</dd>
            </div>
            <div className="flex gap-3">
              <dt>SKU</dt>
              <dd>{product.sku}</dd>
            </div>
            {product.sizeTitles.length > 0 ? (
              <div className="flex gap-3">
                <dt>Sizes</dt>
                <dd>{product.sizeTitles.join(", ")}</dd>
              </div>
            ) : null}
          </dl>
          {description ? (
            <div
              className="mt-8 text-sm leading-relaxed [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
