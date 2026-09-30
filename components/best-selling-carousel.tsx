"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { ProductListItem } from "@/lib/product-fields";

const arrowClass =
  "static top-auto left-auto size-11 translate-none rounded-none border-border bg-background shadow-none hover:bg-surface disabled:opacity-30";

export function BestSellingCarousel({
  products,
}: {
  products: ProductListItem[];
}) {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <Carousel
          opts={{ align: "start", containScroll: "trimSnaps" }}
          className="w-full"
        >
          <div className="flex items-end justify-between gap-6">
            <h2 className="text-2xl font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Best Selling Items
            </h2>
            <div className="flex gap-2">
              <CarouselPrevious className={arrowClass} />
              <CarouselNext className={`${arrowClass} right-auto`} />
            </div>
          </div>

          <CarouselContent className="mt-10 -ml-4 md:mt-14">
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="basis-[78%] pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/5"
              >
                <Link
                  href={`/products/${product.categorySlug}/${product.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-4/5 overflow-hidden bg-surface">
                    <Image
                      src={product.imageUrl}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 20vw"
                      className="object-contain"
                    />
                    <Badge className="absolute top-3 left-3 rounded-none tracking-[0.14em] uppercase">
                      Best seller
                    </Badge>
                    <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/15" />
                  </div>
                  <p className="caption mt-4 tracking-[0.16em] text-muted-foreground uppercase">
                    {product.brandTitle}
                  </p>
                  <p className="mt-2 line-clamp-2 h-[2lh] text-lg font-medium leading-snug tracking-tight">
                    {product.title}
                  </p>
                  <span className="mt-5 inline-flex h-11 w-full items-center justify-center bg-foreground text-sm tracking-[0.16em] text-background uppercase transition-colors group-hover:bg-primary">
                    See more
                  </span>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
