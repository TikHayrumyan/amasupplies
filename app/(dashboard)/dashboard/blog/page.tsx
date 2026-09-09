import { listBlogCategories } from "@/lib/blog-category";
import { listBlogPosts } from "@/lib/blog";
import { BlogSubnav } from "./blog-subnav";
import { BlogPostManager } from "./post-manager";

export const dynamic = "force-dynamic";

export default async function BlogDashboardPage() {
  const [posts, categories] = await Promise.all([
    listBlogPosts(),
    listBlogCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="font-medium tracking-tight">Blog</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Write posts after you add at least one category. Drag to set the
        public order.
      </p>
      <BlogSubnav current="posts" />
      <BlogPostManager
        key={posts
          .map((post) => `${post.id}-${post.sortOrder}-${post.updatedAt}`)
          .join()}
        posts={posts}
        categories={categories}
      />
    </div>
  );
}
