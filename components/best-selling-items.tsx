import { BestSellingCarousel } from "@/components/best-selling-carousel";
import { listBestSellers } from "@/lib/product";

export async function BestSellingItems() {
  const products = await listBestSellers();
  if (products.length === 0) {
    return null;
  }

  return <BestSellingCarousel products={products} />;
}
