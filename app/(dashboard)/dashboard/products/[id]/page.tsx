import { notFound } from "next/navigation";
import { listCategories } from "@/lib/category";
import { listProductBrands } from "@/lib/product-brand";
import { getProductDetail } from "@/lib/product";
import { listProductTypes } from "@/lib/product-type";
import { listSizes } from "@/lib/size";
import { DeleteProductButton, ProductForm } from "../product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: PageProps<"/dashboard/products/[id]">) {
  const { id } = await params;
  const productId = Number(id);
  if (!productId) {
    notFound();
  }

  const [product, categories, brands, types, sizes] = await Promise.all([
    getProductDetail(productId),
    listCategories(),
    listProductBrands(),
    listProductTypes(),
    listSizes(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
        Products
      </p>
      <h1 className="mt-3 font-medium tracking-tight">Edit product</h1>
      <ProductForm
        product={product}
        categories={categories}
        brands={brands}
        types={types}
        sizes={sizes}
      />
      <DeleteProductButton id={product.id} />
    </div>
  );
}
