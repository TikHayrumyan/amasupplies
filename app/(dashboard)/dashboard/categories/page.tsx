import { listCategories } from "@/lib/category";
import { CategoryManager } from "./category-manager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="font-medium tracking-tight">Categories</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Drag to set the order shoppers see. Moving one card updates that card
        only.
      </p>
      <CategoryManager categories={categories} />
    </div>
  );
}
