import Image from "next/image";
import Link from "next/link";
import { listPublishedCategories } from "@/lib/category";

export async function ShopByCategory() {
  const categories = (await listPublishedCategories()).slice(0, 5);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Shop by category
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 md:mt-14 md:gap-x-6 md:gap-y-12 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products/${category.slug}`}
              className="group block"
            >
              <div className="relative aspect-3/4 bg-surface">
                <Image
                  src={category.imageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 50vw, 20vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/15" />
              </div>
              <p className="mt-3 text-sm tracking-[0.14em] uppercase md:mt-4 md:text-base">
                {category.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
