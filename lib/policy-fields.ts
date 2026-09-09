import type { ReactNode } from "react";

export type PolicySlug = "disclaimer" | "returns" | "terms" | "privacy";

export type PolicyBlock =
  | { type: "paragraph"; children: ReactNode }
  | { type: "heading"; title: string }
  | { type: "bullets"; items: readonly string[] }
  | { type: "steps"; items: readonly string[] };

export type PolicyDoc = {
  slug: PolicySlug;
  href: string;
  navLabel: string;
  title: string;
  description: string;
  blocks: PolicyBlock[];
};
