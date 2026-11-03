import { notFound } from "next/navigation";
import { AccountCta } from "@/components/account-cta";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_FAQS, faqSchemaItems } from "@/components/faq-data";
import { FaqSection } from "@/components/faq-section";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { ProductGallery } from "@/components/product-gallery";
import { ProductInquiryForm } from "@/components/product-inquiry-form";
import { RelatedProductsSlider } from "@/components/related-products-slider";
import { crumbs } from "@/lib/breadcrumbs";
import { cn } from "@/lib/utils";
import { sanitizeProductHtml } from "@/lib/product-fields";
import {
  asDate,
  breadcrumbSchema,
  createMetadata,
  faqSchema,
  JsonLd,
  productSchema,
  webPageSchema,
} from "@/lib/seo";
import {
  getPublishedProductBySlug,
  listPublishedProducts,
  listRelatedPublishedProducts,
} from "@/lib/product";

export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await listPublishedProducts();
  return products.map((product) => ({
    slug: product.categorySlug,
    productSlug: product.slug,
  }));
}

function productDescription(product: {
  title: string;
  brandTitle: string;
  metaDescription: string;
  description: string;
}) {
  const written = product.metaDescription.trim();
  if (written) return written;
  const plain = product.description
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain) return plain.length > 160 ? `${plain.slice(0, 157).trimEnd()}...` : plain;
  return `${product.title} by ${product.brandTitle}. Wholesale medical supplies for approved AMA Supplies accounts.`;
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]/[productSlug]">) {
  const { slug, productSlug } = await params;
  const product = await getPublishedProductBySlug(slug, productSlug);
  if (!product) {
    return createMetadata({
      title: "Product",
      description: "This product is not available.",
      path: `/products/${slug}/${productSlug}`,
      noIndex: true,
    });
  }
  const path = `/products/${product.categorySlug}/${product.slug}`;
  return createMetadata({
    title: product.metaTitle || product.title,
    description: productDescription(product),
    path,
    image: product.imageUrl
      ? { url: product.imageUrl, alt: product.title }
      : undefined,
  });
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
  ].filter(Boolean);
  const description = sanitizeProductHtml(product.description);
  const related = await listRelatedPublishedProducts(product.id);
  const path = `/products/${product.categorySlug}/${product.slug}`;
  const summary = productDescription(product);

  return (
    <>
      <JsonLd
        data={[
          webPageSchema({
            path,
            name: product.title,
            description: summary,
            dateModified: asDate(product.updatedAt),
          }),
          productSchema({
            path,
            name: product.title,
            description: summary,
            images,
            sku: product.sku,
            itemNumber: product.itemNumber,
            brand: product.brandTitle,
            category: product.categoryTitle,
          }),
          faqSchema(faqSchemaItems(PRODUCT_FAQS)),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            {
              name: product.categoryTitle,
              path: `/products/${product.categorySlug}`,
            },
            { name: product.title, path },
          ]),
        ]}
      />
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

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-3 lg:gap-12">
          <ProductGallery images={images} title={product.title} />
          <div>
            {product.isBestSeller ? (
              <Badge className="rounded-none tracking-[0.14em] uppercase">
                Best seller
              </Badge>
            ) : null}
            <p
              className={cn(
                "caption tracking-[0.16em] text-muted-foreground uppercase",
                product.isBestSeller && "mt-4",
              )}
            >
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
          <ProductInquiryForm
            productId={product.id}
            productTitle={product.title}
          />
        </div>

        <RelatedProductsSlider products={related} />
      </div>

      <FaqSection
        items={PRODUCT_FAQS}
        action={{ href: "/faq", label: "View all FAQs" }}
        className="border-t border-border/80"
      />

      <AccountCta />
    </>
  );
}
