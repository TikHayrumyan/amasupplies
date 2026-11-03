import Image from "next/image";
import { notFound } from "next/navigation";
import { AccountCta } from "@/components/account-cta";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { RelatedProductsSlider } from "@/components/related-products-slider";
import { crumbs } from "@/lib/breadcrumbs";
import {
  formatBlogDate,
  toBlogDate,
  toIsoDate,
} from "@/lib/blog-fields";
import {
  blogPostingSchema,
  breadcrumbSchema,
  createMetadata,
  JsonLd,
} from "@/lib/seo";
import {
  getPublishedBlogPostBySlug,
  listBlogRelatedPublishedProducts,
  listPublishedBlogPosts,
} from "@/lib/blog";
import { sanitizeProductHtml } from "@/lib/product-fields";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await listPublishedBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) {
    return createMetadata({
      title: "Blog",
      description: "This article is not available.",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  const path = `/blog/${post.slug}`;
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  const publishedTime = toIsoDate(post.publishedAt);
  const modifiedTime = toIsoDate(post.updatedAt);
  const metadata = createMetadata({
    title,
    description,
    path,
    image: post.imageUrl
      ? { url: post.imageUrl, alt: post.title }
      : undefined,
  });

  return {
    ...metadata,
    authors: post.authorName ? [{ name: post.authorName }] : undefined,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(post.authorName ? { authors: [post.authorName] } : {}),
      ...(post.categoryTitle ? { section: post.categoryTitle } : {}),
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

  const related = await listBlogRelatedPublishedProducts(post.id);
  const content = sanitizeProductHtml(post.content);
  const path = `/blog/${post.slug}`;

  return (
    <>
      <JsonLd
        data={[
          blogPostingSchema({
            path,
            title: post.title,
            description: post.metaDescription || post.excerpt,
            image: post.imageUrl,
            publishedAt: toBlogDate(post.publishedAt) ?? undefined,
            updatedAt: toBlogDate(post.updatedAt) ?? undefined,
            author: post.authorName,
            section: post.categoryTitle,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path },
          ]),
        ]}
      />
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
            alt={post.title}
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
