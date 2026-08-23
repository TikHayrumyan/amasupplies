import Image from "next/image";
import Link from "next/link";
import { listPublishedCategories } from "@/lib/category";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const categories = await listPublishedCategories();

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="font-medium tracking-tight">Products</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Browse by category.
      </p>

      {categories.length === 0 ? (
        <p className="mt-12 text-muted-foreground">No categories yet.</p>
      ) : (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products/${category.slug}`}
              className="group block"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-surface">
                <Image
                  src={category.imageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <h2 className="mt-4 text-lg font-medium tracking-tight">
                {category.title}
              </h2>
              {category.description ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {category.description}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
