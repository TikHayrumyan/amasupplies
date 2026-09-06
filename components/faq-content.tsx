import Link from "next/link";
import { FaqAccordion } from "@/components/faq-accordion";
import { FAQ_GROUPS } from "@/components/faq-data";
import { Button } from "@/components/ui/button";

const GROUP_STARTS = FAQ_GROUPS.map((_, index) =>
  FAQ_GROUPS.slice(0, index).reduce(
    (total, group) => total + group.items.length,
    1,
  ),
);

export function FaqContent() {
  return (
    <>
      <section className="bg-background">
        <div className="container mx-auto px-4 pt-10 pb-16 text-center md:pt-16 md:pb-24">
          <h1 className="mx-auto max-w-3xl text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl">
            Frequently asked questions
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl font-medium tracking-tight text-foreground/80 md:text-2xl">
            Answers about ordering, payment, accounts, and shipping.
          </p>
          <div className="mx-auto mt-16 h-px w-12 bg-primary md:mt-20" />
        </div>
      </section>

      <section className="bg-background pb-16 md:pb-24">
        <div className="container mx-auto grid items-start gap-16 px-4 md:grid-cols-2 md:gap-x-16 md:gap-y-20">
          {FAQ_GROUPS.map((group, index) => (
            <div key={group.id}>
              <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
                {group.title}
              </p>
              <FaqAccordion
                items={group.items}
                numbered
                start={GROUP_STARTS[index]}
                className="mt-6"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-background">
        <div className="container mx-auto flex flex-col gap-8 px-4 py-16 md:flex-row md:items-end md:justify-between md:py-24">
          <div className="max-w-xl">
            <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
              Contact
            </p>
            <h2 className="mt-5 text-3xl font-medium tracking-tight md:text-4xl">
              Still have a question?
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              Reach out by phone or email and we will help you place an order
              or set up an approved account.
            </p>
          </div>
          <Button
            asChild
            className="h-12 rounded-none px-8 text-sm tracking-[0.16em] uppercase"
          >
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
