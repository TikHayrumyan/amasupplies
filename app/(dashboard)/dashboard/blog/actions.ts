"use server";

import { requireStaff } from "@/lib/auth";
import { isEmptyHtml, sanitizeProductHtml } from "@/lib/product-fields";
import { validateBlogPostCopy } from "@/lib/blog-fields";
import { getBlogCategoryById } from "@/lib/blog-category";
import {
  createBlogPost,
  deleteBlogPost,
  getBlogPostById,
  listBlogPosts,
  removeBlogMedia,
  reorderBlogPost,
  sanitizeBlogRelatedIds,
  updateBlogPost,
  uploadBlogImage,
} from "@/lib/blog";
import { listProducts } from "@/lib/product";
import { revalidatePath } from "next/cache";

type Result = { error: string | null; done?: boolean };

function refresh(slug?: string) {
  revalidatePath("/dashboard/blog");
  revalidatePath("/blog");
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}

export async function saveBlogPost(formData: FormData): Promise<Result> {
  await requireStaff();

  const idValue = String(formData.get("id") ?? "");
  const id = idValue ? Number(idValue) : null;
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const metaTitle = String(formData.get("metaTitle") ?? "").trim();
  const metaDescription = String(formData.get("metaDescription") ?? "").trim();
  const authorName = String(formData.get("authorName") ?? "").trim();
  const categoryId = Number(formData.get("categoryId") ?? 0);
  const isPublished = formData.get("isPublished") === "on";
  const contentRaw = String(formData.get("content") ?? "");
  const content = isEmptyHtml(contentRaw) ? "" : sanitizeProductHtml(contentRaw);
  const relatedIdsRaw = formData
    .getAll("relatedProductId")
    .map((value) => Number(value))
    .filter((value) => value > 0);

  const category = await getBlogCategoryById(categoryId);
  if (!category) {
    return { error: "Category is required." };
  }

  const copyError = validateBlogPostCopy({
    title,
    slug,
    excerpt,
    metaTitle,
    metaDescription,
    authorName,
    categoryId,
  });
  if (copyError) {
    return { error: copyError };
  }

  try {
    const current = id ? await getBlogPostById(id) : null;
    const imageFile = formData.get("image");
    const uploaded = await uploadBlogImage(
      imageFile instanceof File ? imageFile : null,
    );
    const imageUrl = uploaded ?? current?.imageUrl ?? null;
    if (!imageUrl) {
      return { error: "An image is required." };
    }

    const catalogIds = new Set((await listProducts()).map((row) => row.id));
    const relatedIds = sanitizeBlogRelatedIds(relatedIdsRaw, catalogIds);

    if (current) {
      await updateBlogPost(current.id, {
        title,
        slug,
        excerpt,
        content,
        imageUrl,
        metaTitle,
        metaDescription,
        authorName,
        categoryId,
        isPublished,
        relatedIds,
      });
      if (uploaded && current.imageUrl !== uploaded) {
        await removeBlogMedia([current.imageUrl]);
      }
    } else {
      await createBlogPost({
        title,
        slug,
        excerpt,
        content,
        imageUrl,
        metaTitle,
        metaDescription,
        authorName,
        categoryId,
        isPublished,
        relatedIds,
      });
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save post.",
    };
  }

  refresh(slug);
  return { error: null, done: true };
}

export async function removeBlogPost(formData: FormData): Promise<Result> {
  await requireStaff();
  const id = Number(formData.get("id") ?? 0);
  if (!id) {
    return { error: "Missing post." };
  }
  const current = await getBlogPostById(id);
  try {
    await deleteBlogPost(id);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not delete post.",
    };
  }
  refresh(current?.slug);
  return { error: null, done: true };
}

export async function moveBlogPost(input: {
  id: number;
  beforeId: number | null;
  afterId: number | null;
}): Promise<Result> {
  await requireStaff();
  try {
    await reorderBlogPost(input);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not reorder post.",
    };
  }
  revalidatePath("/dashboard/blog");
  revalidatePath("/blog");
  return { error: null, done: true };
}
