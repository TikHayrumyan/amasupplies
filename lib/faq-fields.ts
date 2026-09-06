import type { ReactNode } from "react";

export type FaqItem = {
  question: string;
  answer: ReactNode;
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
