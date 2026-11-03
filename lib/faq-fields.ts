import type { ReactNode } from "react";

export type FaqItem = {
  question: string;
  answer: ReactNode;
  /**
   * Plain text of a rich-text answer. String answers use `answer` itself.
   * Required so FAQPage JSON-LD matches the words on the page.
   */
  text?: string;
};

export type FaqGroup = {
  id: string;
  title: string;
  items: FaqItem[];
};

export type FaqSectionAction = {
  href: string;
  label: string;
};
