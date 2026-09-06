import Link from "next/link";
import type { ReactNode } from "react";
import { EMAIL_DISPLAY, EMAIL_HREF, PHONE_DISPLAY, PHONE_HREF } from "@/lib/contact";

export type FaqItem = {
  question: string;
  answer: ReactNode;
};

export type FaqGroup = {
  id: string;
  title: string;
  items: FaqItem[];
};

const contactLink = (
  <Link
    href="/contact"
    className="text-foreground underline-offset-4 hover:underline"
  >
    Contact page
  </Link>
);

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "ordering",
    title: "Ordering",
    items: [
      {
        question: "How do I place an order?",
        answer: (
          <>
            Getting started is easy. Simply reach out to us by phone or email
            through our {contactLink}. One of our representatives will get back
            to you shortly to walk you through placing your first bulk order
            and ensure you get exactly what you need.
          </>
        ),
      },
      {
        question: "Is there a minimum order quantity?",
        answer: "Yes, a minimum purchase of $300 is required for all orders.",
      },
      {
        question: "Can I place an order on the website?",
        answer: (
          <>
            The website is for browsing our catalog. To place an order, contact
            us through the {contactLink} or request an approved account. Once
            approved, you can place and manage orders through your account.
          </>
        ),
      },
      {
        question: "What products do you carry?",
        answer:
          "AMA Supplies carries a catalog of over 10,000 medical and facility supplies, including incontinence and hygiene products, disinfectants, wound care, disposable gloves, and nutrition shakes. If you need something you do not see listed, ask us when you request a quote.",
      },
      {
        question: "What if I cannot find a product I need?",
        answer: (
          <>
            Send us the item name, brand, or item number through the{" "}
            {contactLink}. We will check availability and help you source the
            supplies your facility needs.
          </>
        ),
      },
      {
        question: "Can I place bulk or repeat orders?",
        answer:
          "Yes. We support bulk ordering for businesses. Approved accounts can save supply lists and reorder frequently used products.",
      },
    ],
  },
  {
    id: "payment",
    title: "Payment",
    items: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept bank transfers, Zelle, checks, and credit card payments. Please note that a 2.99% surcharge applies to all credit card transactions.",
      },
      {
        question: "Do you offer net terms?",
        answer:
          "Yes. Net terms are available for approved business accounts. Exact terms are confirmed when your account is set up.",
      },
      {
        question: "How is pricing determined?",
        answer:
          "Each approved account receives customized wholesale pricing based on business type, order volume, and requirements. Public website prices are not displayed.",
      },
      {
        question: "Will I receive invoices?",
        answer:
          "Yes. Approved accounts can manage billing and payments from the account dashboard. If you need a copy of an invoice, contact us and we will assist you.",
      },
      {
        question: "How do I make a payment?",
        answer:
          "You can pay by bank transfer, Zelle, check, or credit card. Approved accounts can also manage billing and make payments from the account dashboard.",
      },
    ],
  },
  {
    id: "accounts",
    title: "Accounts",
    items: [
      {
        question: "Why can’t I see pricing on the website?",
        answer:
          "To view our prices, you must first contact us to set up an approved account. Once your application is approved, our team will provide you with a comprehensive product list and price guide.",
      },
      {
        question: "Do you sell to the public?",
        answer:
          "No. We are not a retail store. AMA Supplies works exclusively with approved business customers.",
      },
      {
        question: "Who can open an account?",
        answer:
          "We work with verified businesses such as medical clinics and hospitals, healthcare professionals, dental and specialty practices, and commercial facilities and offices.",
      },
      {
        question: "How do I apply for an account?",
        answer: (
          <>
            Request an account through our {contactLink}, or call{" "}
            <Link
              href={PHONE_HREF}
              className="text-foreground underline-offset-4 hover:underline"
            >
              {PHONE_DISPLAY}
            </Link>
            . A representative will follow up to complete your application.
          </>
        ),
      },
      {
        question: "What do I get after my account is approved?",
        answer:
          "Approved customers can view product pricing, access negotiated wholesale rates, and place and manage orders. You also get an account dashboard to track orders, save supply lists, reorder products, manage billing, and keep business and delivery information up to date.",
      },
      {
        question: "How long does account approval take?",
        answer: (
          <>
            Timing depends on the information you provide. After you contact us,
            our team will follow up to review your application and confirm next
            steps. Use the {contactLink} to get started.
          </>
        ),
      },
      {
        question: "What are your business hours?",
        answer: (
          <>
            Monday–Friday, 9 AM – 6 PM, and Saturday, 10 AM – 4 PM. Call{" "}
            <Link
              href={PHONE_HREF}
              className="text-foreground underline-offset-4 hover:underline"
            >
              {PHONE_DISPLAY}
            </Link>{" "}
            or email{" "}
            <Link
              href={EMAIL_HREF}
              className="text-foreground underline-offset-4 hover:underline"
            >
              {EMAIL_DISPLAY}
            </Link>
            .
          </>
        ),
      },
    ],
  },
  {
    id: "shipping",
    title: "Shipping",
    items: [
      {
        question: "What is your shipping policy?",
        answer:
          "All orders are processed and shipped the next business day, subject to product availability. Delivery lead times vary depending on your destination.",
      },
      {
        question: "Do you ship nationwide?",
        answer:
          "Yes. We provide nationwide shipping to businesses across the United States.",
      },
      {
        question: "How long does delivery take?",
        answer: (
          <>
            Lead times vary depending on your destination and product
            availability. Contact us through the {contactLink} for an estimate
            for your location.
          </>
        ),
      },
      {
        question: "What if an item is out of stock?",
        answer:
          "Orders are subject to product availability. We confirm stock when you place the order and will work with you on timing or alternatives if an item is unavailable.",
      },
      {
        question: "How do I check my order status?",
        answer: (
          <>
            Approved accounts can track orders in the account dashboard. You
            can also reach us through the {contactLink} for a status update.
          </>
        ),
      },
    ],
  },
];

const PREVIEW_QUESTIONS = new Set([
  "How do I place an order?",
  "Is there a minimum order quantity?",
  "What payment methods do you accept?",
  "Why can’t I see pricing on the website?",
  "What is your shipping policy?",
]);

export const FAQ_PREVIEW = FAQ_GROUPS.flatMap((group) => group.items).filter(
  (item) => PREVIEW_QUESTIONS.has(item.question),
);
