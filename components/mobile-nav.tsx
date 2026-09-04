"use client";

import { ChevronDown, Menu, Search, X } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BrandLogo } from "@/components/brand-logo";
import { NAV_LINKS, type NavCategory } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function MobileNav({ categories }: { categories: NavCategory[] }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  return (
    <div className="grid w-full grid-cols-[2.5rem_1fr_2.5rem] items-center md:hidden">
      <Sheet onOpenChange={(open) => !open && setProductsOpen(false)}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-10"
            aria-label="Open menu"
          >
            <Menu className="size-5" strokeWidth={1.5} />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="h-dvh w-full max-w-none gap-0 border-0 bg-surface p-0 sm:max-w-none"
        >
          <SheetHeader className="flex h-14 flex-row items-center justify-between space-y-0 px-4">
            <SheetTitle>
              <BrandLogo className="h-9 w-auto md:h-9" />
            </SheetTitle>
            <SheetDescription className="sr-only">
              Site navigation
            </SheetDescription>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="size-10" aria-label="Close menu">
                <X className="size-5" strokeWidth={1.5} />
              </Button>
            </SheetClose>
          </SheetHeader>
          <nav
            aria-label="Mobile"
            className="flex flex-1 flex-col justify-center gap-2 px-8 pb-24"
          >
            {NAV_LINKS.map((link) =>
              link.href === "/products" && categories.length > 0 ? (
                <div key={link.href}>
                  <button
                    type="button"
                    aria-expanded={productsOpen}
                    onClick={() => setProductsOpen((open) => !open)}
                    className="flex w-full items-center justify-between py-2 text-left text-3xl font-medium tracking-tight text-foreground"
                  >
                    {link.label}
                    <ChevronDown
                      className={cn(
                        "size-5 text-muted-foreground transition-transform",
                        productsOpen && "rotate-180",
                      )}
                      strokeWidth={1.5}
                    />
                  </button>
                  {productsOpen ? (
                    <div className="mb-2 flex flex-col gap-1 pb-2 pl-1">
                      <SheetClose asChild>
                        <Link
                          href="/products"
                          className="py-1.5 text-lg text-muted-foreground transition-colors hover:text-foreground"
                        >
                          All products
                        </Link>
                      </SheetClose>
                      {categories.map((category) => (
                        <SheetClose asChild key={category.slug}>
                          <Link
                            href={`/products/${category.slug}`}
                            className="py-1.5 text-lg text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {category.title}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <SheetClose asChild key={link.href}>
                  <Link
                    href={link.href}
                    className="py-2 text-3xl font-medium tracking-tight text-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              ),
            )}
          </nav>
        </SheetContent>
      </Sheet>

      <Link href="/" className="justify-self-center" aria-label="AmaSupplies">
        <BrandLogo priority />
      </Link>

      <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
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
          className="border-b border-border bg-background p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Search</SheetTitle>
            <SheetDescription>Search products</SheetDescription>
          </SheetHeader>
          <Form
            action="/search"
            className="flex h-14 items-center gap-2 px-4"
            onSubmit={() => setSearchOpen(false)}
          >
            <Search
              className="size-4 shrink-0 text-muted-foreground"
              strokeWidth={1.5}
            />
            <Input
              type="search"
              name="query"
              placeholder="Search"
              aria-label="Search"
              autoFocus
              variant="ghost"
              className="px-0 md:text-base"
            />
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="size-10" aria-label="Close search">
                <X className="size-5" strokeWidth={1.5} />
              </Button>
            </SheetClose>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
