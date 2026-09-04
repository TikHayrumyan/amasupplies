"use client";

import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CATALOG_SORT_OPTIONS,
  catalogHref,
  type CatalogQuery,
} from "@/lib/catalog-fields";
import { cn } from "@/lib/utils";

export function CategorySort({
  pathname,
  query,
}: {
  pathname: string;
  query: CatalogQuery;
}) {
  const router = useRouter();
  const current =
    CATALOG_SORT_OPTIONS.find((option) => option.value === query.sort) ??
    CATALOG_SORT_OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="caption flex items-center gap-2 tracking-[0.16em] uppercase outline-none">
        <span className="text-muted-foreground">Sort</span>
        <span>{current.label}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-44 rounded-none border-border bg-background p-1 shadow-none"
      >
        {CATALOG_SORT_OPTIONS.map((option) => {
          const checked = query.sort === option.value;
          return (
            <DropdownMenuItem
              key={option.value}
              className="rounded-none"
              onSelect={() => {
                router.push(
                  catalogHref(pathname, query, { sort: option.value }),
                  { scroll: false },
                );
              }}
            >
              <span
                aria-hidden
                className={cn(
                  "flex size-3.5 shrink-0 items-center justify-center border",
                  checked
                    ? "border-foreground bg-foreground"
                    : "border-foreground/30 bg-background",
                )}
              >
                {checked ? (
                  <Check className="size-2.5 text-background" strokeWidth={3} />
                ) : null}
              </span>
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

