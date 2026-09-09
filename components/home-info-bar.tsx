import { CreditCard, Phone, Truck, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { PHONE_HREF } from "@/lib/contact";

const ITEMS: { title: string; icon: LucideIcon; href?: string }[] = [
  { title: "Net Terms Available", icon: Users },
  { title: "Approved Accounts Only", icon: CreditCard },
  { title: "Nationwide Shipping", icon: Truck },
  { title: "Contact Us: 818-913-9975", icon: Phone, href: PHONE_HREF },
];

export function HomeInfoBar() {
  return (
    <section className="bg-surface py-14 md:py-20">
      <div className="container mx-auto grid grid-cols-2 gap-x-8 gap-y-10 px-4 md:grid-cols-4 md:gap-12">
        {ITEMS.map((item) => {
          const title = item.href ? (
            <Link
              href={item.href}
              className="transition-colors hover:text-primary"
            >
              {item.title}
            </Link>
          ) : (
            item.title
          );

          return (
            <div
              key={item.title}
              className="flex flex-col items-center text-center"
            >
              <item.icon
                className="size-6 text-foreground"
                strokeWidth={1.25}
                aria-hidden
              />
              <p className="caption mt-5 max-w-44 text-balance tracking-[0.14em] text-foreground uppercase">
                {title}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
