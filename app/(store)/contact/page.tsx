import type { Metadata } from "next";
import { ContactContent } from "@/components/contact-content";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { crumbs } from "@/lib/breadcrumbs";
import { ADDRESS_DISPLAY } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact Us | AMA Supplies",
  description: `Contact AMA Supplies at ${ADDRESS_DISPLAY}. Call, email, or send a message to request an approved wholesale account.`,
};

export default function ContactPage() {
  return (
    <div>
      <div className="container mx-auto px-4 pt-6 md:pt-8">
        <PageBreadcrumbs
          items={crumbs({ label: "Contact", href: "/contact" })}
        />
      </div>
      <ContactContent />
    </div>
  );
}
