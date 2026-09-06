import Link from "next/link";
import { FaqAccordion } from "@/components/faq-accordion";
import { Button } from "@/components/ui/button";
import type { FaqItem, FaqSectionAction } from "@/lib/faq-fields";
import { cn } from "@/lib/utils";

type FaqSectionProps = {
  items: readonly FaqItem[];
  caption?: string;
  title?: string;
  action?: FaqSectionAction;
  defaultOpen?: boolean;
  className?: string;
};

export function FaqSection({
  items,
  caption = "Frequently asked questions",
  title = "Got a question?",
  action,
  defaultOpen = false,
  className,
}: FaqSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className={cn("bg-background py-16 md:py-24", className)}>
      <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
            {caption}
          </p>
          <h2 className="mt-5 text-3xl font-medium tracking-tight md:text-4xl">
            {title}
          </h2>
          {action ? (
            <Button
              asChild
              className="mt-8 h-12 rounded-none px-8 text-sm tracking-[0.16em] uppercase"
            >
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : null}
        </div>

        <FaqAccordion
          items={items}
          defaultOpen={defaultOpen}
          className="lg:col-span-8"
        />
      </div>
    </section>
  );
}
