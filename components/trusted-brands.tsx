import Image from "next/image";
import { listPublishedBrands } from "@/lib/brand";

export async function TrustedBrands() {
  const brands = await listPublishedBrands();

  if (brands.length === 0) {
    return null;
  }

  const copies = Math.max(2, Math.ceil(8 / brands.length));
  const loop = Array.from({ length: copies }, () => brands).flat();
  const track = [...loop, ...loop];

  return (
    <section className="overflow-hidden bg-surface py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Trusted Brands
        </h2>
      </div>

      <div className="group mt-10 md:mt-14">
        <div
          className="animate-marquee flex w-max group-hover:paused motion-reduce:animate-none"
          style={{ animationDuration: `${Math.max(24, loop.length * 4)}s` }}
        >
          {track.map((brand, index) => (
            <div
              key={`${brand.id}-${index}`}
              className="flex h-16 shrink-0 items-center px-8 md:h-20 md:px-12"
            >
              <Image
                src={brand.imageUrl}
                alt={brand.title}
                width={180}
                height={72}
                className="h-24 w-36 object-contain opacity-70 grayscale transition-opacity duration-300 group-hover:opacity-100 md:h-24"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
