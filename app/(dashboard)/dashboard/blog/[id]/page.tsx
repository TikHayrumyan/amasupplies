import { notFound } from "next/navigation";
import { listBlogCategories } from "@/lib/blog-category";
import { getBlogPostDetail } from "@/lib/blog";
import { listProducts } from "@/lib/product";
import { BlogPostForm, DeleteBlogPostButton } from "../post-form";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
  params,
}: PageProps<"/dashboard/blog/[id]">) {
  const { id } = await params;
  const postId = Number(id);
  if (!postId) {
    notFound();
  }

  const [post, categories, products] = await Promise.all([
    getBlogPostDetail(postId),
    listBlogCategories(),
    listProducts(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
        Blog
      </p>
      <h1 className="mt-3 font-medium tracking-tight">Edit post</h1>
      <BlogPostForm
        post={post}
        categories={categories}
        catalog={products.map((row) => ({
          id: row.id,
          title: row.title,
          categoryTitle: row.categoryTitle,
          itemNumber: row.itemNumber,
        }))}
      />
      <DeleteBlogPostButton id={post.id} />
    </div>
  );
}
