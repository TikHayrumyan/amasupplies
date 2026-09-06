import type { Metadata } from "next";
import { FaqContent } from "@/components/faq-content";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { crumbs } from "@/lib/breadcrumbs";

export const metadata: Metadata = {
  title: "FAQ | AMA Supplies",
  description:
    "Answers about ordering, payment methods, account approval, pricing, and shipping at AMA Supplies.",
};

export default function FaqPage() {
  return (
    <div>
      <div className="container mx-auto px-4 pt-6 md:pt-8">
        <PageBreadcrumbs items={crumbs({ label: "FAQ", href: "/faq" })} />
      </div>
      <FaqContent />
    </div>
  );
}
