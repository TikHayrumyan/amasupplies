import { Clock, Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { NAV_LINKS } from "@/lib/nav";

const COMPANY_LINKS = NAV_LINKS.filter((link) => link.href !== "/");

const POLICY_LINKS = [
  { href: "#", label: "Privacy policy" },
  { href: "#", label: "Refund policy" },
  { href: "#", label: "Terms of use" },
  { href: "#", label: "Disclaimer" },
] as const;

const SOCIAL_LINKS = [
  { href: "#", label: "Facebook", src: "/icons/facebook.svg" },
  { href: "#", label: "Twitter", src: "/icons/twitter.svg" },
] as const;

const linkClass =
  "text-sm text-muted-foreground transition-colors hover:text-foreground";

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="caption tracking-[0.16em] text-foreground uppercase">
      {children}
    </p>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto grid gap-12 px-4 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" aria-label="AmaSupplies">
            <BrandLogo className="h-15 w-auto md:h-15"/>
          </Link>
          <div className="mt-8 flex items-center gap-4">
            {SOCIAL_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                prefetch={false}
                aria-label={link.label}
                className="opacity-80 transition-opacity hover:opacity-100"
              >
                <Image
                  src={link.src}
                  alt=""
                  width={30}
                  height={30}
                  unoptimized
                />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <FooterHeading>Contact us</FooterHeading>
          <div className="mt-5 flex flex-col gap-3 text-sm text-muted-foreground">
            <a
              href="mailto:amasuppliesinc@gmail.com"
              className="flex items-start gap-3 transition-colors hover:text-foreground"
            >
              <Mail className="mt-0.5 size-4 shrink-0" />
              amasuppliesinc@gmail.com
            </a>
            <a
              href="tel:+18189139975"
              className="flex items-start gap-3 transition-colors hover:text-foreground"
            >
              <Phone className="mt-0.5 size-4 shrink-0" />
              +1 818 913 9975
            </a>
            <p className="flex items-start gap-3">
              <Clock className="mt-0.5 size-4 shrink-0" />
              <span>
                Monday – Friday 9:00 AM to 6:00 PM
                <br />
                Saturday 10:00 AM to 4:00 PM
              </span>
            </p>
          </div>
        </div>

        <div>
          <FooterHeading>Company</FooterHeading>
          <ul className="mt-5 flex flex-col gap-3">
            {COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <FooterHeading>Policies</FooterHeading>
          <ul className="mt-5 flex flex-col gap-3">
            {POLICY_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} prefetch={false} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/80">
        <div className="container mx-auto px-4 py-5 text-sm text-muted-foreground">
          © 2026 AMA Supplies
        </div>
      </div>
    </footer>
  );
}
