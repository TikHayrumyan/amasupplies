import Link from "next/link";
import { NAV_LINKS } from "@/lib/nav";

export function MainNav() {
  return (
    <div className="hidden w-full items-center justify-between gap-8 md:flex">
      <Link
        href="/"
        className="shrink-0 text-sm font-semibold tracking-[0.22em] uppercase transition-colors hover:text-primary"
      >
        AmaSupplies
      </Link>
      <nav aria-label="Main">
        <ul className="flex items-center gap-8 text-[13px] tracking-[0.12em]">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-foreground/70 transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
