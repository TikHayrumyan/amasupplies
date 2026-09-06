import type { ReactNode } from "react";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { CONTACT_FAQS } from "@/components/faq-data";
import { FaqSection } from "@/components/faq-section";
import {
  ADDRESS_CITY,
  ADDRESS_DISPLAY,
  ADDRESS_MAP_EMBED,
  ADDRESS_MAPS_HREF,
  ADDRESS_STREET,
  HOURS_SATURDAY,
  HOURS_WEEKDAY,
  INQUIRY_EMAIL,
  INQUIRY_EMAIL_HREF,
  PHONE_DISPLAY,
  PHONE_HREF,
} from "@/lib/contact";

function InfoBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-border/80 py-6 first:border-t-0 first:pt-0">
      <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-3 text-lg font-medium tracking-tight md:text-xl">
        {children}
      </div>
    </div>
  );
}

export function ContactContent() {
  return (
    <>
      <section className="bg-background">
        <div className="container mx-auto px-4 pt-10 pb-16 md:pt-16 md:pb-24">
          <h1 className="max-w-3xl text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl">
            Contact Us
          </h1>
          <p className="mt-6 max-w-2xl text-xl font-medium tracking-tight text-foreground/80 md:text-2xl">
            Call, email, or send a message. We work with approved business
            accounts across the United States.
          </p>
          <div className="mt-16 h-px w-12 bg-foreground/20 md:mt-20" />
        </div>
      </section>

      <section className="bg-background pb-16 md:pb-24">
        <div className="container mx-auto grid items-start gap-16 px-4 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <InfoBlock label="Call us">
              <Link href={PHONE_HREF} className="transition-colors hover:text-primary">
                {PHONE_DISPLAY}
              </Link>
            </InfoBlock>
            <InfoBlock label="Email">
              <Link
                href={INQUIRY_EMAIL_HREF}
                className="transition-colors hover:text-primary"
              >
                {INQUIRY_EMAIL}
              </Link>
            </InfoBlock>
            <InfoBlock label="Address">
              <Link
                href={ADDRESS_MAPS_HREF}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-primary"
              >
                {ADDRESS_STREET}
                <br />
                {ADDRESS_CITY}
              </Link>
            </InfoBlock>
            <InfoBlock label="Hours">
              <p>{HOURS_WEEKDAY}</p>
              <p>{HOURS_SATURDAY}</p>
            </InfoBlock>
          </div>

          <div className="lg:col-span-7">
            <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
              Message
            </p>
            <h2 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">
              Send us a message
            </h2>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <FaqSection
        items={CONTACT_FAQS}
        caption="Questions"
        title="Before you write"
        action={{ href: "/faq", label: "View all FAQs" }}
        className="border-t border-border/80"
      />

      <section className="bg-surface">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
            Location
          </p>
          <p className="mt-5 text-2xl font-medium tracking-tight md:text-3xl">
            {ADDRESS_DISPLAY}
          </p>
          <div className="mt-10 overflow-hidden border border-border bg-background">
            <iframe
              title={`Map of AMA Supplies, ${ADDRESS_DISPLAY}`}
              src={ADDRESS_MAP_EMBED}
              className="block h-[50vh] min-h-80 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </>
  );
}
