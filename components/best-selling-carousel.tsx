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

const PAGE_SIZE = 10;

const arrowClass =
  "static top-auto left-auto size-11 translate-none rounded-none border-border bg-background shadow-none hover:bg-surface disabled:opacity-30";

function pagesOf(products: ProductListItem[]) {
  const pages: ProductListItem[][] = [];
  for (let index = 0; index < products.length; index += PAGE_SIZE) {
    pages.push(products.slice(index, index + PAGE_SIZE));
  }
  return pages;
}

export function BestSellingCarousel({
  products,
}: {
  products: ProductListItem[];
}) {
  const pages = pagesOf(products);

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
            {pages.map((page, pageIndex) => (
              <CarouselItem key={pageIndex} className="basis-full pl-4">
                <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-12 lg:grid-cols-5">
                  {page.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.categorySlug}/${product.slug}`}
                      className="group block"
                    >
                      <div className="relative aspect-4/5 overflow-hidden bg-surface">
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          fill
                          sizes="(max-width: 1024px) 50vw, 20vw"
                          className="object-contain p-4"
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
                  ))}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
