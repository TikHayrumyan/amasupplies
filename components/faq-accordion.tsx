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
          className="border-t border-border last:border-b"
        >
          <AccordionTrigger
            className={cn(
              "rounded-none py-5 text-left font-medium tracking-tight hover:no-underline",
              numbered
                ? "items-center text-base md:text-lg"
                : "py-6 text-lg md:text-xl",
            )}
          >
            {numbered ? (
              <span className="flex items-start gap-4">
                <span className="caption w-8 shrink-0 pt-0.5 tracking-[0.16em] text-primary">
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
              "text-base leading-relaxed text-muted-foreground md:text-lg",
              numbered ? "pb-5 pl-12" : "pb-6",
            )}
          >
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
