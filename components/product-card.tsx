import Image from "next/image";
import Link from "next/link";
import type { ProductListItem } from "@/lib/product-fields";

export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link
      href={`/products/${product.categorySlug}/${product.slug}`}
      className="group block"
    >
      <div className="relative aspect-4/3 bg-surface">
        <Image
          src={product.imageUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/15" />
      </div>
      <h2 className="mt-4 text-lg font-medium tracking-tight">{product.title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{product.brandTitle}</p>
      <p className="mt-1 text-sm text-muted-foreground">{product.itemNumber}</p>
      <p className="caption mt-3 tracking-[0.14em] text-muted-foreground uppercase">
        See more
      </p>
    </Link>
  );
}
