import { FaqContent } from "@/components/faq-content";
import { FAQ_GROUPS, faqSchemaItems } from "@/components/faq-data";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { crumbs } from "@/lib/breadcrumbs";
import { breadcrumbSchema, createMetadata, faqSchema, JsonLd } from "@/lib/seo";

const PATH = "/faq";
const title = "Frequently Asked Questions";
const description =
  "Answers about ordering, payment methods, account approval, pricing, and shipping at AMA Supplies.";

export const metadata = createMetadata({ title, description, path: PATH });

export default function FaqPage() {
  return (
    <div>
      <JsonLd
        data={[
          faqSchema(faqSchemaItems(FAQ_GROUPS.flatMap((group) => group.items))),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "FAQ", path: PATH },
          ]),
        ]}
      />
      <div className="container mx-auto px-4 pt-6 md:pt-8">
        <PageBreadcrumbs items={crumbs({ label: "FAQ", href: "/faq" })} />
      </div>
      <FaqContent />
    </div>
  );
}
