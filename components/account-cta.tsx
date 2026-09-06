import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AccountCta() {
  return (
    <section className="bg-background">
      <div className="container mx-auto flex flex-col gap-8 px-4 py-16 md:flex-row md:items-end md:justify-between md:py-24">
        <div className="max-w-xl">
          <p className="caption tracking-[0.16em] uppercase">Contact</p>
          <h2 className="mt-5 text-3xl font-medium tracking-tight md:text-4xl">
            Request an Account
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            Our platform is designed specifically for approved business
            customers who require reliable supply, competitive pricing, and
            efficient fulfillment.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button
            asChild
            className="h-12 rounded-none px-8 text-sm tracking-[0.16em] uppercase"
          >
            <Link href="/contact">Request an Account</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-none border-primary px-8 text-sm tracking-[0.16em] text-primary uppercase hover:bg-primary hover:text-primary-foreground"
          >
            <Link href="/products">View Products</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
