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
          className="object-contain"
        />
        <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/15" />
      </div>

      <h2 className="mt-4 line-clamp-2 h-[2lh] text-lg font-medium leading-snug tracking-tight">
        {product.title}
      </h2>

      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
            Brand
          </p>
          <p className="mt-1 truncate text-sm">{product.brandTitle}</p>
        </div>
        <div>
          <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
            Item number
          </p>
          <p className="mt-1 truncate text-sm">{product.itemNumber}</p>
        </div>
      </div>

      <span className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-none bg-foreground text-sm tracking-[0.16em] text-background uppercase transition-colors group-hover:bg-primary">
        See more
      </span>
    </Link>
  );
}
