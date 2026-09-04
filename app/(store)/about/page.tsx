import type { Metadata } from "next";
import { AboutContent } from "@/components/about-content";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { crumbs } from "@/lib/breadcrumbs";

export const metadata: Metadata = {
  title: "About Us | AMA Supplies",
  description:
    "AMA Supplies is a nationwide distributor of medical and facility supplies, built exclusively for approved business customers across the United States.",
};

export default function AboutPage() {
  return (
    <div>
      <div className="container mx-auto px-4 pt-6 md:pt-8">
        <PageBreadcrumbs
          items={crumbs({ label: "About Us", href: "/about" })}
        />
      </div>
      <AboutContent />
    </div>
  );
}
