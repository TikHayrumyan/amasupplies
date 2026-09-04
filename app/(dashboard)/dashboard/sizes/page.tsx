import { listSizes } from "@/lib/size";
import { SizeManager } from "./size-manager";

export const dynamic = "force-dynamic";

export default async function SizesPage() {
  const sizes = await listSizes();

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="font-medium tracking-tight">Sizes</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Add labels like S, L, 100 ml, or 1 gallon. Assign them when you edit a
        product.
      </p>
      <SizeManager
        key={sizes.map((size) => `${size.id}-${size.sortOrder}-${size.updatedAt}`).join()}
        sizes={sizes}
      />
    </div>
  );
}
