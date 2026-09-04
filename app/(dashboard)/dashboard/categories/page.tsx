import { listCategories } from "@/lib/category";
import { listProductTypes } from "@/lib/product-type";
import { CategoryManager } from "./category-manager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const [categories, types] = await Promise.all([
    listCategories(),
    listProductTypes(),
  ]);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="font-medium tracking-tight">Categories</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Drag to set the store order. Types live on each category and become
        filters on that category page.
      </p>
      <CategoryManager
        categories={categories}
        types={types}
      />
    </div>
  );
}
