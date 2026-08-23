"use client";

import { Menu, Search, X } from "lucide-react";
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
import { NAV_LINKS } from "@/lib/nav";

export function MobileNav() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="grid w-full grid-cols-[2.5rem_1fr_2.5rem] items-center md:hidden">
      <Sheet>
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
            {NAV_LINKS.map((link) => (
              <SheetClose asChild key={link.href}>
                <Link
                  href={link.href}
                  className="py-2 text-3xl font-medium tracking-tight text-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </SheetClose>
            ))}
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
              className="h-12 border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0 md:text-base"
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
