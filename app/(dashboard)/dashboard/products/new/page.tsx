import Link from "next/link";
import { listProductBrands } from "@/lib/product-brand";
import { listCategories } from "@/lib/category";
import { listProductTypes } from "@/lib/product-type";
import { listProducts } from "@/lib/product";
import { listSizes } from "@/lib/size";
import { ProductForm } from "../product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, brands, types, sizes, products] = await Promise.all([
    listCategories(),
    listProductBrands(),
    listProductTypes(),
    listSizes(),
    listProducts(),
  ]);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
        Products
      </p>
      <h1 className="mt-3 font-medium tracking-tight">Add product</h1>
      {categories.length === 0 || brands.length === 0 ? (
        <p className="mt-6 max-w-xl text-muted-foreground">
          Add at least one{" "}
          <Link href="/dashboard/categories" className="underline">
            category
          </Link>{" "}
          and one{" "}
          <Link href="/dashboard/brands" className="underline">
            brand
          </Link>{" "}
          first.
        </p>
      ) : (
        <ProductForm
          product={null}
          categories={categories}
          brands={brands}
          types={types}
          sizes={sizes}
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
