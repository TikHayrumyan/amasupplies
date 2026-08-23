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
        <p className="caption text-center tracking-[0.16em] text-muted-foreground uppercase">
          Shop by category
        </p>

        <div className="mt-10 grid grid-cols-5 gap-2 md:mt-14 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products/${category.slug}`}
              className="group block"
            >
              <div className="relative aspect-3/4 overflow-hidden bg-surface">
                <Image
                  src={category.imageUrl}
                  alt=""
                  fill
                  sizes="20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent" />
                <p className="absolute inset-x-0 bottom-0 px-1.5 py-3 text-center text-[10px] leading-tight tracking-[0.12em] text-white uppercase md:px-3 md:py-5 md:text-sm md:tracking-[0.14em]">
                  {category.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
