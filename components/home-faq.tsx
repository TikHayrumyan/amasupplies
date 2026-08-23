"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ITEMS = [
  {
    question: "How do I place an order?",
    answer: (
      <>
        Getting started is easy. Simply reach out to us by phone or email
        through our{" "}
        <Link
          href="/contact"
          className="text-foreground underline-offset-4 hover:underline"
        >
          Contact page
        </Link>
        . One of our representatives will get back to you shortly to walk you
        through placing your first bulk order and ensure you get exactly what
        you need.
      </>
    ),
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept bank transfers, Zelle, checks, and credit card payments. Please note that a 2.99% surcharge applies to all credit card transactions.",
  },
  {
    question: "Is there a minimum order quantity?",
    answer: "Yes, a minimum purchase of $300 is required for all orders.",
  },
  {
    question: "Why can’t I see pricing on the website?",
    answer:
      "To view our prices, you must first contact us to set up an approved account. Once your application is approved, our team will provide you with a comprehensive product list and price guide.",
  },
  {
    question: "What is your shipping policy?",
    answer:
      "All orders are processed and shipped the next business day, subject to product availability. Delivery lead times vary depending on your destination.",
  },
] as const;

export function HomeFaq() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            FAQ
          </h2>
        </div>

        <Accordion
          type="single"
          collapsible
          defaultValue="item-1"
          className="lg:col-span-8"
        >
          {ITEMS.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`item-${index + 1}`}
              className="border-t border-border last:border-b"
            >
              <AccordionTrigger className="rounded-none py-6 text-left text-lg font-medium tracking-tight hover:no-underline md:text-xl">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground md:text-lg">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
