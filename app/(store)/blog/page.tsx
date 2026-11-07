import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { crumbs } from "@/lib/breadcrumbs";
import { listBlogCategories, type BlogCategory } from "@/lib/blog-category";
import { formatBlogDate, type BlogPostListItem } from "@/lib/blog-fields";
import { listPublishedBlogPosts } from "@/lib/blog";
import { cn } from "@/lib/utils";
import {
  blogSchema,
  breadcrumbSchema,
  createMetadata,
  JsonLd,
} from "@/lib/seo";

export const revalidate = 3600;

const LISTING_DESCRIPTION =
  "Notes from AMA Supplies on wholesale medical supplies and working with approved healthcare accounts.";

function categoryParam(
  value: string | string[] | undefined,
): string {
  return typeof value === "string" ? value : "";
}

export async function generateMetadata({
  searchParams,
}: PageProps<"/blog">) {
  const params = await searchParams;
  const slug = categoryParam(params.category);
  if (!slug) {
    return createMetadata({
      title: "Medical Supply Blog",
      description: LISTING_DESCRIPTION,
      path: "/blog",
    });
  }
  const category = (await listBlogCategories()).find((row) => row.slug === slug);
  if (!category) {
    return createMetadata({
      title: "Blog",
      description: "This blog category is not available.",
      path: "/blog",
      noIndex: true,
    });
  }
  return createMetadata({
    title: `${category.title} Articles`,
    description: `${category.title} articles from AMA Supplies for approved healthcare accounts.`,
    path: `/blog?category=${category.slug}`,
  });
}

export default async function BlogPage({
  searchParams,
}: PageProps<"/blog">) {
  const params = await searchParams;
  const categorySlug = categoryParam(params.category);
  const categories = await listBlogCategories();
  const selected = categorySlug
    ? (categories.find((row) => row.slug === categorySlug) ?? null)
    : null;

  // Must run before anything suspends: once streaming starts the status is 200.
  if (categorySlug && !selected) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />
      <PageBreadcrumbs
        items={crumbs({ label: "Blog", href: "/blog" })}
      />
      <p className="caption mt-8 tracking-[0.16em] text-muted-foreground uppercase">
        Journal
      </p>
      <h1 className="mt-4 font-medium tracking-tight">Blog</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Notes from AMA Supplies on wholesale medical supplies and working with
        approved healthcare accounts.
      </p>
      <Suspense fallback={<BlogPostsSkeleton />}>
        <BlogPosts selected={selected} categories={categories} />
      </Suspense>
    </div>
  );
}

async function BlogPosts({
  selected,
  categories,
}: {
  selected: BlogCategory | null;
  categories: BlogCategory[];
}) {
  const allPosts = await listPublishedBlogPosts();
  const posts = selected
    ? allPosts.filter((post) => post.categorySlug === selected.slug)
    : allPosts;
  const filters = categories.filter(
    (category) =>
      category.slug === selected?.slug ||
      allPosts.some((post) => post.categorySlug === category.slug),
  );
  const [featured, ...rest] = posts;

  return (
    <>
      <JsonLd
        data={blogSchema(
          posts.map((post) => ({
            title: post.title,
            path: `/blog/${post.slug}`,
          })),
        )}
      />
      {filters.length > 1 ? (
        <nav
          aria-label="Blog categories"
          className="mt-10 flex flex-wrap gap-x-8 gap-y-3 caption tracking-[0.16em] uppercase"
        >
          <Link
            href="/blog"
            className={cn(
              selected
                ? "text-muted-foreground transition-colors hover:text-foreground"
                : "text-foreground",
            )}
          >
            All
          </Link>
          {filters.map((category) => (
            <Link
              key={category.id}
              href={`/blog?category=${category.slug}`}
              className={cn(
                selected?.slug === category.slug
                  ? "text-foreground"
                  : "text-muted-foreground transition-colors hover:text-foreground",
              )}
            >
              {category.title}
            </Link>
          ))}
        </nav>
      ) : null}

      {posts.length === 0 ? (
        <p className="mt-12 text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="mt-12">
          {featured ? <FeaturedPost post={featured} /> : null}
          {rest.length > 0 ? (
            <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}

function BlogPostsSkeleton() {
  return (
    <div role="status" className="mt-12">
      <span className="sr-only">Loading posts…</span>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <Skeleton className="aspect-4/3" />
        <div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-4 h-20 max-w-md" />
          <Skeleton className="mt-5 h-16 max-w-lg" />
          <Skeleton className="mt-8 h-11 w-32" />
        </div>
      </div>
      <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index}>
            <Skeleton className="aspect-4/3" />
            <Skeleton className="mt-4 h-4 w-24" />
            <Skeleton className="mt-2 h-12" />
            <Skeleton className="mt-3 h-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturedPost({ post }: { post: BlogPostListItem }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group grid gap-8 lg:grid-cols-2 lg:items-center">
      <div className="relative aspect-4/3 bg-surface">
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/15" />
      </div>
      <div>
        <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
          {post.categoryTitle}
        </p>
        <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">
          {post.title}
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {formatBlogDate(post.publishedAt)}
        </p>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
        <span className="mt-8 inline-flex h-11 items-center justify-center bg-foreground px-8 text-sm tracking-[0.16em] text-background uppercase transition-colors group-hover:bg-primary">
          Read
        </span>
      </div>
    </Link>
  );
}

function BlogCard({ post }: { post: BlogPostListItem }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative aspect-4/3 bg-surface">
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/15" />
      </div>
      <p className="caption mt-4 tracking-[0.16em] text-muted-foreground uppercase">
        {post.categoryTitle}
      </p>
      <h2 className="mt-2 line-clamp-2 text-lg font-medium leading-snug tracking-tight">
        {post.title}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {formatBlogDate(post.publishedAt)}
      </p>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {post.excerpt}
      </p>
    </Link>
  );
}
