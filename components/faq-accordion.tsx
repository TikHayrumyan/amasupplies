"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "@/components/faq-data";
import { cn } from "@/lib/utils";

type FaqAccordionProps = {
  items: readonly FaqItem[];
  className?: string;
  numbered?: boolean;
  start?: number;
  defaultOpen?: boolean;
};

export function FaqAccordion({
  items,
  className,
  numbered = false,
  start = 1,
  defaultOpen = false,
}: FaqAccordionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? "item-1" : undefined}
      className={className}
    >
      {items.map((item, index) => (
        <AccordionItem
          key={item.question}
          value={`item-${index + 1}`}
          className="border-t border-border/80 last:border-b"
        >
          <AccordionTrigger
            className={cn(
              "rounded-none text-left font-medium tracking-tight hover:no-underline [&>svg]:size-3.5 [&>svg]:text-foreground/35",
              numbered
                ? "items-center py-7 text-lg md:py-8 md:text-xl"
                : "py-6 text-lg md:text-xl",
            )}
          >
            {numbered ? (
              <span className="flex items-start gap-5">
                <span className="caption w-8 shrink-0 pt-1 tracking-[0.16em] text-muted-foreground">
                  {String(start + index).padStart(2, "0")}
                </span>
                <span>{item.question}</span>
              </span>
            ) : (
              item.question
            )}
          </AccordionTrigger>
          <AccordionContent
            className={cn(
              "max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg",
              numbered ? "pb-8 pl-13" : "pb-6",
            )}
          >
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
