import { listCategories } from "@/lib/category";
import { listProducts } from "@/lib/product";
import { ProductManager } from "./product-manager";

export const dynamic = "force-dynamic";

export default async function ProductsDashboardPage() {
  const [products, categories] = await Promise.all([
    listProducts(),
    listCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="font-medium tracking-tight">Products</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        One category per product. Filter by category to set the store order.
      </p>
      <ProductManager
        key={products
          .map((product) => `${product.id}-${product.sortOrder}-${product.updatedAt}`)
          .join()}
        products={products}
        categories={categories}
      />
    </div>
  );
}
