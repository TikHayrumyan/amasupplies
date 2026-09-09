import Link from "next/link";
import { listBlogCategories } from "@/lib/blog-category";
import { listProducts } from "@/lib/product";
import { BlogPostForm } from "../post-form";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  const [categories, products] = await Promise.all([
    listBlogCategories(),
    listProducts(),
  ]);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
        Blog
      </p>
      <h1 className="mt-3 font-medium tracking-tight">Add post</h1>
      {categories.length === 0 ? (
        <p className="mt-6 max-w-xl text-muted-foreground">
          Add at least one{" "}
          <Link href="/dashboard/blog/categories" className="underline">
            category
          </Link>{" "}
          first.
        </p>
      ) : (
        <BlogPostForm
          post={null}
          categories={categories}
          catalog={products.map((row) => ({
            id: row.id,
            title: row.title,
            categoryTitle: row.categoryTitle,
            itemNumber: row.itemNumber,
          }))}
        />
      )}
    </div>
  );
}
