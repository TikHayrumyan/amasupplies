"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return null;
  }

  return (
    <div>
      <div className="relative aspect-4/3 bg-surface">
        <Image
          src={current}
          alt={title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
        />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              aria-label={`Photo ${index + 1}`}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              className={cn(
                "relative aspect-square bg-surface",
                index === active && "ring-1 ring-foreground",
              )}
            >
              <Image src={image} alt="" fill sizes="120px" className="object-contain" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
