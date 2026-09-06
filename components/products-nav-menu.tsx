"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import type { NavCategory } from "@/lib/nav";

const triggerClass =
  "h-auto rounded-none bg-transparent px-0 py-0 text-[13px] font-normal tracking-[0.12em] text-foreground/70 shadow-none hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary data-[state=open]:bg-transparent data-[state=open]:text-primary data-[state=open]:hover:bg-transparent data-[state=open]:focus:bg-transparent";

const itemClass =
  "rounded-none px-5 py-2 text-[13px] tracking-[0.12em] text-foreground/70 hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary";

export function ProductsNavMenu({
  label,
  categories,
}: {
  label: string;
  categories: NavCategory[];
}) {
  return (
    <NavigationMenu viewport={false} className="z-50">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className={triggerClass}>
            {label}
          </NavigationMenuTrigger>
          <NavigationMenuContent className="z-50 min-w-56 rounded-none border-border bg-background p-0 py-3 shadow-none">
            <ul>
              <li>
                <NavigationMenuLink asChild className={itemClass}>
                  <Link href="/products">All products</Link>
                </NavigationMenuLink>
              </li>
              {categories.map((category) => (
                <li key={category.slug}>
                  <NavigationMenuLink asChild className={itemClass}>
                    <Link href={`/products/${category.slug}`}>
                      {category.title}
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
