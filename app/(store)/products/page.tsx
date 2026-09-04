import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { crumbs } from "@/lib/breadcrumbs";
import { listPublishedCategories } from "@/lib/category";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wholesale Medical Supplies | AMA Supplies",
  description:
    "Browse the AMA Supplies wholesale catalog by category. Medical supplies for approved healthcare accounts, with nationwide shipping.",
};

export default async function ProductsPage() {
  const categories = await listPublishedCategories();

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <PageBreadcrumbs
        items={crumbs({ label: "Products", href: "/products" })}
      />
      <p className="caption mt-8 tracking-[0.16em] text-muted-foreground uppercase">
        Catalog
      </p>
      <h1 className="mt-4 font-medium tracking-tight">
        Wholesale medical supplies
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Shop by category for clinics, hospitals, and healthcare facilities
        across the United States. Wholesale pricing is available to approved
        accounts.
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
              <div className="relative aspect-4/3 bg-surface">
                <Image
                  src={category.imageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/15" />
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
