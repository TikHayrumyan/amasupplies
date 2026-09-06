import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ProductsNavMenu } from "@/components/products-nav-menu";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/contact";
import { NAV_LINKS, type NavCategory } from "@/lib/nav";

const linkClass = "text-foreground/70 transition-colors hover:text-primary";

export function MainNav({ categories }: { categories: NavCategory[] }) {
  return (
    <div className="hidden w-full items-center justify-between gap-8 md:flex">
      <div className="flex min-w-0 items-center gap-5">
        <Link href="/" className="shrink-0" aria-label="AmaSupplies">
          <BrandLogo className="h-12 w-auto md:h-12" priority />
        </Link>
        <Link
          href={PHONE_HREF}
          className="caption shrink-0 whitespace-nowrap border-l border-border/80 pl-5 tracking-[0.12em] text-muted-foreground transition-colors hover:text-primary"
        >
          {PHONE_DISPLAY}
        </Link>
      </div>
      <nav aria-label="Main">
        <ul className="flex items-center gap-8 text-[13px] tracking-[0.12em]">
          {NAV_LINKS.map((link) =>
            link.href === "/products" && categories.length > 0 ? (
              <li key={link.href}>
                <ProductsNavMenu label={link.label} categories={categories} />
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
