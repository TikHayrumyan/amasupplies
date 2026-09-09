import { listBlogCategories } from "@/lib/blog-category";
import { BlogSubnav } from "../blog-subnav";
import { BlogCategoryManager } from "./category-manager";

export const dynamic = "force-dynamic";

export default async function BlogCategoriesPage() {
  const categories = await listBlogCategories();

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="font-medium tracking-tight">Blog</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Add categories first, then write posts. Drag to set the order on the
        blog.
      </p>
      <BlogSubnav current="categories" />
      <BlogCategoryManager
        key={categories
          .map((row) => `${row.id}-${row.sortOrder}-${row.updatedAt}`)
          .join()}
        categories={categories}
      />
    </div>
  );
}
