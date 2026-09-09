import type { Metadata } from "next";
import Image from "next/image";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AccountCta } from "@/components/account-cta";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { RelatedProductsSlider } from "@/components/related-products-slider";
import { crumbs } from "@/lib/breadcrumbs";
import {
  formatBlogDate,
  toIsoDate,
} from "@/lib/blog-fields";
import {
  getPublishedBlogPostBySlug,
  listBlogRelatedPublishedProducts,
} from "@/lib/blog";
import { sanitizeProductHtml } from "@/lib/product-fields";

export const dynamic = "force-dynamic";

async function siteOrigin() {
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) {
    return "";
  }
  const protocol =
    headerList.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) {
    return {};
  }
  const origin = await siteOrigin();
  const path = `/blog/${post.slug}`;
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  const publishedTime = toIsoDate(post.publishedAt);
  const modifiedTime = toIsoDate(post.updatedAt);

  return {
    title: `${title} | AMA Supplies`,
    description,
    authors: [{ name: post.authorName }],
    alternates: origin ? { canonical: `${origin}${path}` } : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      url: origin ? `${origin}${path}` : undefined,
      images: [{ url: post.imageUrl }],
      publishedTime,
      modifiedTime,
      authors: [post.authorName],
      section: post.categoryTitle,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [post.imageUrl],
    },
  };
}

export default async function BlogPostPage({
  params,
}: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const [related, origin] = await Promise.all([
    listBlogRelatedPublishedProducts(post.id),
    siteOrigin(),
  ]);
  const content = sanitizeProductHtml(post.content);
  const published = toIsoDate(post.publishedAt);
  const modified = toIsoDate(post.updatedAt);
  const path = `/blog/${post.slug}`;
  const jsonLd = origin
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt,
        image: post.imageUrl,
        datePublished: published,
        dateModified: modified,
        author: {
          "@type": "Person",
          name: post.authorName,
        },
        publisher: {
          "@type": "Organization",
          name: "AMA Supplies",
        },
        mainEntityOfPage: `${origin}${path}`,
      }
    : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <PageBreadcrumbs
          items={crumbs(
            { label: "Blog", href: "/blog" },
            { label: post.title, href: path },
          )}
        />

        <p className="caption mt-10 tracking-[0.16em] text-muted-foreground uppercase">
          {post.categoryTitle}
        </p>
        <h1 className="mt-4 max-w-3xl font-medium tracking-tight">
          {post.title}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {[post.authorName, formatBlogDate(post.publishedAt)]
            .filter(Boolean)
            .join(" · ")}
        </p>

        <div className="relative mt-10 aspect-4/3 bg-surface md:aspect-2/1">
          <Image
            src={post.imageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {content ? (
          <div
            className="mt-12 max-w-5xl text-base leading-relaxed [&_li]:mb-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <p className="mt-12 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        )}

        <RelatedProductsSlider
          products={related}
          title="Related products"
        />
      </div>
      <AccountCta />
    </>
  );
}
