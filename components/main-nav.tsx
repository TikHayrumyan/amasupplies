import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { NAV_LINKS, type NavCategory } from "@/lib/nav";

const linkClass = "text-foreground/70 transition-colors hover:text-primary";

export function MainNav({ categories }: { categories: NavCategory[] }) {
  return (
    <div className="hidden w-full items-center justify-between gap-8 md:flex">
      <Link href="/" className="shrink-0" aria-label="AmaSupplies">
        <BrandLogo className="h-12 w-auto md:h-12" priority />
      </Link>
      <nav aria-label="Main">
        <ul className="flex items-center gap-8 text-[13px] tracking-[0.12em]">
          {NAV_LINKS.map((link) =>
            link.href === "/products" ? (
              <li key={link.href} className="group relative">
                <Link href={link.href} className={`${linkClass} inline-flex items-center gap-1`}>
                  {link.label}
                  {categories.length > 0 ? (
                    <ChevronDown className="size-3.5" strokeWidth={1.5} />
                  ) : null}
                </Link>
                {categories.length > 0 ? (
                  <div className="invisible absolute top-full left-0 z-50 pt-3 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <ul className="min-w-56 border border-border bg-background py-3">
                      <li>
                        <Link
                          href="/products"
                          className="block px-5 py-2 text-foreground/70 transition-colors hover:text-primary"
                        >
                          All products
                        </Link>
                      </li>
                      {categories.map((category) => (
                        <li key={category.slug}>
                          <Link
                            href={`/products/${category.slug}`}
                            className="block px-5 py-2 text-foreground/70 transition-colors hover:text-primary"
                          >
                            {category.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            ) : (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ),
          )}
        </ul>
      </nav>
    </div>
  );
}
