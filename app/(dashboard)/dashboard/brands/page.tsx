import { listProductBrands } from "@/lib/product-brand";
import { BrandManager } from "./brand-manager";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const brands = await listProductBrands();

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="font-medium tracking-tight">Brands</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Manufacturer names on products. Homepage logos stay under Home →
        Trusted brands.
      </p>
      <BrandManager
        key={brands
          .map((brand) => `${brand.id}-${brand.sortOrder}-${brand.updatedAt}`)
          .join()}
        brands={brands}
      />
    </div>
  );
}
