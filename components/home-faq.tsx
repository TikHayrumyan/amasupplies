import Link from "next/link";
import { FaqAccordion } from "@/components/faq-accordion";
import { FAQ_PREVIEW } from "@/components/faq-data";
import { Button } from "@/components/ui/button";

export function HomeFaq() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
            Frequently asked questions
          </p>
          <h2 className="mt-5 text-3xl font-medium tracking-tight md:text-4xl">
            Got a question?
          </h2>
          <Button
            asChild
            className="mt-8 h-12 rounded-none px-8 text-sm tracking-[0.16em] uppercase"
          >
            <Link href="/faq">View all FAQs</Link>
          </Button>
        </div>

        <FaqAccordion
          items={FAQ_PREVIEW}
          defaultOpen
          className="lg:col-span-8"
        />
      </div>
    </section>
  );
}
