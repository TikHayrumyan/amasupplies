import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhoWeAreSlider } from "@/components/who-we-are-slider";

export function WhoWeAre() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto grid items-center gap-12 px-4 lg:grid-cols-2 lg:gap-20">
        <WhoWeAreSlider />

        <div>
          <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
            Who We Are
          </p>
          <h2 className="mt-5 text-3xl font-medium tracking-tight md:text-4xl">
            America&apos;s Premier Wholesale Medical Supply Partner
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            AMA Supplies is a nationwide wholesale distributor of medical
            supplies, serving healthcare facilities, clinics, hospitals, and
            medical professionals across the United States.
          </p>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            We work exclusively with approved business accounts, offering
            negotiated wholesale pricing, flexible net terms, and a catalog of
            over 10,000 medical supply products ready to ship nationwide.
          </p>

          <p className="mt-8 flex items-center gap-3">
            <span className="flex text-foreground">
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} className="size-4 fill-current text-yellow-500" />
              ))}
            </span>
            <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
              1k+ Reviews
            </span>
          </p>

          <Button
            asChild
            className="mt-8 h-12 rounded-none px-8 text-sm tracking-[0.16em] uppercase"
          >
            <Link href="/contact">Request an Account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
