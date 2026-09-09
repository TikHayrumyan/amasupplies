import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { PolicyDoc } from "@/lib/policy-fields";

function BlockList({
  items,
  ordered,
}: {
  items: readonly string[];
  ordered?: boolean;
}) {
  const List = ordered ? "ol" : "ul";

  return (
    <List className="mt-6">
      {items.map((item, index) => (
        <li
          key={item}
          className="border-t border-border/80 py-5 text-center"
        >
          {ordered ? (
            <span className="caption block tracking-[0.16em] text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
          ) : (
            <span className="mx-auto mt-1 mb-3 block h-px w-4 bg-primary" aria-hidden />
          )}
          <span className="mt-3 block text-base leading-relaxed text-muted-foreground md:text-lg">
            {item}
          </span>
        </li>
      ))}
    </List>
  );
}

export function PolicyContent({ policy }: { policy: PolicyDoc }) {
  return (
    <>
      <section className="bg-background">
        <div className="container mx-auto px-4 pt-10 pb-16 text-center md:pt-16 md:pb-24">
          <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
            Policies
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl">
            {policy.title}
          </h1>
          <div className="mx-auto mt-16 h-px w-12 bg-primary md:mt-20" />
        </div>
      </section>

      <section className="bg-background pb-16 md:pb-24">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          {policy.blocks.map((block, index) => {
            if (block.type === "heading") {
              return (
                <h2
                  key={`${block.title}-${index}`}
                  className="mt-14 text-2xl font-medium tracking-tight md:mt-16 md:text-3xl"
                >
                  {block.title}
                </h2>
              );
            }
            if (block.type === "bullets") {
              return <BlockList key={index} items={block.items} />;
            }
            if (block.type === "steps") {
              return <BlockList key={index} items={block.items} ordered />;
            }
            return (
              <p
                key={index}
                className="mt-6 text-base leading-relaxed text-muted-foreground first:mt-0 md:text-lg"
              >
                {block.children}
              </p>
            );
          })}
        </div>
      </section>

      <section className="border-t border-border bg-background">
        <div className="container mx-auto flex flex-col items-center gap-8 px-4 py-16 text-center md:py-24">
          <div className="max-w-xl">
            <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
              Contact
            </p>
            <h2 className="mt-5 text-3xl font-medium tracking-tight md:text-4xl">
              Questions about this policy?
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              Reach out by phone or email and we will help you with your
              account or an order.
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
