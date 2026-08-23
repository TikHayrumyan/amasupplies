import { Phone, Receipt, ShieldCheck, Truck, type LucideIcon } from "lucide-react";

const TERMS: { index: string; title: string; icon: LucideIcon }[] = [
  { index: "01", title: "Net Terms Available", icon: Receipt },
  { index: "02", title: "Approved Accounts Only", icon: ShieldCheck },
  { index: "03", title: "Nationwide Shipping", icon: Truck },
];

export function HomeInfoBar() {
  return (
    <section className="bg-surface py-16 md:py-24">
      <div className="container mx-auto grid items-start gap-14 px-4 lg:grid-cols-12 lg:gap-0">
        <div className="lg:col-span-5 lg:pr-16">
          <p className="caption flex items-center gap-2 tracking-[0.16em] text-muted-foreground uppercase">
            <Phone className="size-4" />
            Contact us
          </p>
          <a
            href="tel:+18189139975"
            className="mt-5 block text-4xl font-medium tracking-tight transition-colors hover:text-primary md:text-5xl"
          >
            818-913-9975
          </a>
        </div>

        <ul className="lg:col-span-7 lg:border-l lg:border-border lg:pl-16">
          {TERMS.map((term) => (
            <li key={term.index} className="border-t border-border py-6 last:pb-0">
              <p className="caption flex items-center gap-2 tracking-[0.16em] text-muted-foreground">
                <term.icon className="size-4" />
                {term.index}
              </p>
              <p className="mt-2 text-xl font-medium tracking-tight md:text-2xl">
                {term.title}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
