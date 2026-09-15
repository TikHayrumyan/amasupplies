"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ErrorContent({
  title,
  description,
  reset,
}: {
  title: string;
  description: string;
  reset: () => void;
}) {
  return (
    <section className="flex min-h-[70vh] flex-col justify-center md:min-h-[calc(100svh-14rem)]">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_min(100%,22rem)] md:gap-20">
          <p
            aria-hidden
            className="font-medium tracking-tight text-[clamp(6rem,20vw,12rem)] leading-[0.8]"
          >
            500
          </p>
          <div>
            <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
              Error
            </p>
            <h1 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">
              {title}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              {description}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button
                className="h-12 rounded-none px-8 text-sm tracking-[0.16em] uppercase"
                onClick={reset}
              >
                Try again
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-none px-8 text-sm tracking-[0.16em] uppercase"
              >
                <Link href="/products">Catalog</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
