import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=2000&q=80";
const OFFER_IMAGE =
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80";

const CUSTOMERS = [
  "Medical clinics and hospitals",
  "Healthcare professionals",
  "Dental and specialty practices",
  "Commercial facilities and offices",
] as const;

const ACCESS = [
  "View product pricing",
  "Access negotiated wholesale rates",
  "Place and manage orders",
] as const;

const OFFER = [
  "Wholesale pricing tailored to your business",
  "Flexible net payment terms",
  "Bulk ordering capabilities",
  "Fast and reliable nationwide shipping",
] as const;

const DASHBOARD = [
  "Track and manage orders in real time",
  "Save and organize supply lists",
  "Reorder frequently used products",
  "Manage billing and make payments",
  "Maintain business and delivery information",
] as const;

const REASONS = [
  "Business-only wholesale platform",
  "Custom pricing for every account",
  "Reliable product availability",
  "Streamlined ordering and reordering",
  "Dedicated support for professional clients",
] as const;

function SectionCaption({ children }: { children: React.ReactNode }) {
  return (
    <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-5 text-3xl font-medium tracking-tight md:text-4xl">
      {children}
    </h2>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
      {children}
    </p>
  );
}

export function AboutContent() {
  return (
    <>
      <section className="bg-background">
        <div className="container mx-auto px-4 pt-10 pb-12 md:pt-16 md:pb-16">
          <div className="max-w-3xl">
            <SectionCaption>About Us</SectionCaption>
            <h1 className="mt-5 text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl">
              About AMA Supplies
            </h1>
            <p className="mt-6 text-xl font-medium tracking-tight text-foreground/80 md:text-2xl">
              Your Trusted Wholesale Medical Supply Partner
            </p>
            <p className="mt-8 text-base leading-relaxed text-muted-foreground md:mt-10 md:text-lg">
              AMA Supplies is a nationwide distributor of medical and facility
              supplies, built exclusively for businesses, healthcare providers,
              and professional organizations across the United States.
            </p>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              We are not a retail store. Our platform is designed specifically
              for approved business customers who require reliable supply,
              competitive pricing, and efficient fulfillment.
            </p>
          </div>

          <p className="mt-16 max-w-3xl text-3xl font-medium tracking-tight md:mt-20 md:text-5xl">
            We are not a retail store.
          </p>
        </div>

        <div className="relative mt-4 h-[42vh] min-h-72 overflow-hidden bg-foreground md:h-[52vh]">
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/10 to-transparent" />
        </div>
      </section>

      <section className="bg-surface">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <SectionCaption>Clients</SectionCaption>
            <SectionTitle>Built for Businesses</SectionTitle>
            <Body>
              At AMA Supplies, we work exclusively with verified business
              accounts to ensure a professional and streamlined purchasing
              experience.
            </Body>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              Our customers include:
            </p>
          </div>
          <ul className="mt-12 grid gap-x-12 sm:grid-cols-2">
            {CUSTOMERS.map((item) => (
              <li
                key={item}
                className="border-t border-border/80 py-6 text-lg font-medium tracking-tight md:text-xl"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:mt-8 md:text-lg">
            By focusing only on business clients, we are able to offer better
            pricing, better service, and better supply consistency.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="container mx-auto grid gap-12 px-4 py-16 md:py-24 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <SectionCaption>Accounts</SectionCaption>
            <SectionTitle>Access-Based Pricing Model</SectionTitle>
            <Body>
              Unlike traditional eCommerce stores, pricing on AMA Supplies is
              not publicly displayed.
            </Body>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              All customers must create an account and be approved to:
            </p>
          </div>
          <div className="lg:col-span-7 lg:pt-12">
            <ul className="border-l border-foreground pl-6 md:pl-8">
              {ACCESS.map((item) => (
                <li
                  key={item}
                  className="py-4 text-lg font-medium tracking-tight first:pt-0 last:pb-0 md:text-xl"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-base leading-relaxed text-muted-foreground md:text-lg">
              Each account is customized with its own pricing structure based on
              business type, order volume, and requirements.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="container mx-auto grid items-start gap-12 px-4 py-16 md:py-24 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <div className="relative aspect-4/5 overflow-hidden bg-foreground">
              <Image
                src={OFFER_IMAGE}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <p className="caption tracking-[0.16em] text-white/70 uppercase">
                  Catalog
                </p>
                <p className="mt-3 text-5xl font-medium tracking-tight text-white md:text-6xl">
                  10,000+
                </p>
                <p className="mt-2 text-lg text-white/80">products</p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 lg:pt-4">
            <SectionTitle>What We Offer</SectionTitle>
            <Body>
              With a catalog of over 10,000+ products, AMA Supplies supports
              your day-to-day operations with:
            </Body>
            <ul className="mt-10 grid sm:grid-cols-2 sm:gap-x-10">
              {OFFER.map((item) => (
                <li
                  key={item}
                  className="border-t border-border/80 py-5 text-base leading-snug md:text-lg"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-base leading-relaxed text-muted-foreground md:text-lg">
              We are committed to being a dependable supply partner for your
              organization.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <SectionCaption>Account</SectionCaption>
            <SectionTitle>Designed for Efficiency</SectionTitle>
            <Body>
              Once approved, customers gain access to a powerful account
              dashboard that allows them to:
            </Body>
          </div>
          <div className="mt-10 lg:grid lg:grid-cols-12 lg:items-start lg:gap-20">
            <ul className="lg:col-span-7">
              {DASHBOARD.map((item) => (
                <li
                  key={item}
                  className="flex gap-4 border-t border-border/80 py-5 text-lg tracking-tight"
                >
                  <span
                    aria-hidden
                    className="mt-2 size-1.5 shrink-0 bg-foreground"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-10 text-base leading-relaxed text-muted-foreground lg:col-span-5 lg:mt-0 lg:border-t lg:border-border/80 lg:pt-5 md:text-lg">
              Our system is built to simplify procurement and save time for busy
              professionals.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="container mx-auto grid gap-12 px-4 py-16 md:py-24 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <SectionCaption>Partnership</SectionCaption>
            <SectionTitle>Why Choose AMA Supplies</SectionTitle>
          </div>
          <ol className="lg:col-span-7">
            {REASONS.map((item, i) => (
              <li
                key={item}
                className="flex gap-6 border-t border-border/80 py-6"
              >
                <span className="caption w-8 shrink-0 tracking-[0.16em] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-lg font-medium tracking-tight md:text-xl">
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-background">
        <div className="container mx-auto flex flex-col gap-8 px-4 py-16 md:flex-row md:items-end md:justify-between md:py-24">
          <div className="max-w-xl">
            <SectionCaption>Contact</SectionCaption>
            <h2 className="mt-5 text-3xl font-medium tracking-tight md:text-4xl">
              Request an Account
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              Our platform is designed specifically for approved business
              customers who require reliable supply, competitive pricing, and
              efficient fulfillment.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button
              asChild
              className="h-12 rounded-none px-8 text-sm tracking-[0.16em] uppercase"
            >
              <Link href="/contact">Request an Account</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-none px-8 text-sm tracking-[0.16em] uppercase"
            >
              <Link href="/products">View Products</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
