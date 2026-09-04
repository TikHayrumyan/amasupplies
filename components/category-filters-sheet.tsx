"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function CategoryFiltersSheet({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "caption tracking-[0.16em] uppercase transition-colors",
            active
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Filters
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="h-dvh w-full max-w-none gap-0 border-0 bg-surface p-0 sm:max-w-none"
      >
        <SheetHeader className="flex h-14 flex-row items-center justify-between space-y-0 px-4">
          <SheetTitle className="caption font-medium tracking-[0.16em] uppercase">
            Filters
          </SheetTitle>
          <SheetDescription className="sr-only">
            Filter products by type, brand, and size
          </SheetDescription>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-10"
              aria-label="Close filters"
            >
              <X className="size-5" strokeWidth={1.5} />
            </Button>
          </SheetClose>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-8 pb-16">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
