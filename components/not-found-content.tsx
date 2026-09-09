import Link from "next/link";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/products", label: "Products" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

export function NotFoundContent() {
  return (
    <section className="flex min-h-[70vh] flex-col justify-center md:min-h-[calc(100svh-14rem)]">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_min(100%,22rem)] md:gap-20">
          <p
            aria-hidden
            className="font-medium tracking-tight text-[clamp(6rem,20vw,12rem)] leading-[0.8]"
          >
            404
          </p>
          <div>
            <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
              Error
            </p>
            <h1 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">
              Page not found
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              This page does not exist or is no longer available.
            </p>
            <Button
              asChild
              className="mt-10 h-12 rounded-none px-8 text-sm tracking-[0.16em] uppercase"
            >
              <Link href="/">Home</Link>
            </Button>
            <nav
              aria-label="Suggested pages"
              className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-border/80 pt-8 caption tracking-[0.16em] uppercase"
            >
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
