"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { ProductSearch } from "@/components/product-search";
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

export function MobileSearch() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 justify-self-end"
          aria-label="Open search"
        >
          <Search className="size-5" strokeWidth={1.5} />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="top"
        showCloseButton={false}
        className="h-dvh w-full max-w-none gap-0 border-0 bg-surface p-0 sm:max-w-none"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Search</SheetTitle>
          <SheetDescription>
            Search products by name, brand, SKU, or item number
          </SheetDescription>
        </SheetHeader>
        {open ? (
          <ProductSearch
            layout="overlay"
            autoFocus
            onNavigate={() => setOpen(false)}
            trailing={
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10"
                  aria-label="Close search"
                >
                  <X className="size-5" strokeWidth={1.5} />
                </Button>
              </SheetClose>
            }
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
