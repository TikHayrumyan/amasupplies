import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/category";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category || !category.isPublished) {
    notFound();
  }

  return (
    <div>
      <div className="relative h-[40vh] min-h-72 overflow-hidden bg-foreground">
        <Image
          src={category.imageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/15 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 py-12">
            <p className="caption tracking-[0.16em] text-white/70 uppercase">
              <Link href="/products" className="hover:text-white">
                Products
              </Link>
            </p>
            <h1 className="mt-3 font-medium tracking-tight text-white">
              {category.title}
            </h1>
            {category.description ? (
              <p className="mt-4 max-w-lg text-white/80">
                {category.description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        <p className="text-muted-foreground">Products for this category soon.</p>
      </div>
    </div>
  );
}
