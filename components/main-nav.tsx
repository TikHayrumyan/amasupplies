import Link from "next/link";
import { NAV_LINKS } from "@/lib/nav";

export function MainNav() {
  return (
    <div className="hidden w-full items-center justify-between gap-6 md:flex">
      <Link
        href="/"
        className="shrink-0 text-lg font-semibold tracking-tight transition-colors hover:text-primary"
      >
        AmaSupplies
      </Link>
      <nav aria-label="Main">
        <ul className="flex items-center gap-6 text-sm">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
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
