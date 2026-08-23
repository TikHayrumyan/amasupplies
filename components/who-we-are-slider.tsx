"use client";

import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const SLIDES = [
  "/dashboard/login-bg.jpg",
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80",
] as const;

export function WhoWeAreSlider() {
  const [autoplay] = useState(() =>
    Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true }),
  );
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[autoplay]}
      setApi={setApi}
      className="w-full"
    >
      <CarouselContent className="ml-0">
        {SLIDES.map((src) => (
          <CarouselItem key={src} className="pl-0">
            <div className="relative aspect-4/5 bg-surface">
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <div className="absolute bottom-5 left-5 z-10 flex gap-2">
        {SLIDES.map((src, index) => (
          <button
            key={src}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "h-px w-6 bg-white/40 transition-colors",
              current === index && "bg-white",
            )}
          />
        ))}
      </div>
    </Carousel>
  );
}
