"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { ProductListItem } from "@/lib/product-fields";

export function RelatedProductsSlider({
  products,
}: {
  products: ProductListItem[];
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-20 border-t border-border/80 pt-16 md:mt-24 md:pt-20">
      <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
              Related
            </p>
            <h2 className="mt-3 font-medium tracking-tight">You may also like</h2>
          </div>
          {products.length > 1 ? (
            <div className="flex gap-2">
              <CarouselPrevious className="static top-auto left-auto size-11 translate-none rounded-none border-border bg-background shadow-none hover:bg-surface disabled:opacity-30" />
              <CarouselNext className="static top-auto right-auto size-11 translate-none rounded-none border-border bg-background shadow-none hover:bg-surface disabled:opacity-30" />
            </div>
          ) : null}
        </div>

        <CarouselContent className="mt-10 -ml-4">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-[80%] pl-4 sm:basis-1/2 lg:basis-1/3"
            >
              <Link
                href={`/products/${product.categorySlug}/${product.slug}`}
                className="group block"
              >
                <div className="relative aspect-4/3 bg-surface">
                  <Image
                    src={product.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain"
                  />
                  <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/15" />
                </div>
                <p className="caption mt-4 tracking-[0.16em] text-muted-foreground uppercase">
                  {product.brandTitle}
                </p>
                <p className="mt-2 line-clamp-2 h-[2lh] text-lg font-medium leading-snug tracking-tight">
                  {product.title}
                </p>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
