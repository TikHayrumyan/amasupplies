import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { crumbs } from "@/lib/breadcrumbs";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <PageBreadcrumbs
        items={crumbs({ label: "Contact", href: "/contact" })}
      />
      <h1 className="mt-8 font-medium tracking-tight">Contact</h1>
    </div>
  );
}
