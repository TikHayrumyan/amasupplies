import { AboutContent } from "@/components/about-content";
import { ABOUT_FAQS, faqSchemaItems } from "@/components/faq-data";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { crumbs } from "@/lib/breadcrumbs";
import {
  breadcrumbSchema,
  createMetadata,
  faqSchema,
  JsonLd,
  webPageSchema,
} from "@/lib/seo";

const PATH = "/about";
const title = "About Us";
const description =
  "AMA Supplies is a nationwide distributor of medical and facility supplies, built exclusively for approved business customers across the United States.";

export const metadata = createMetadata({ title, description, path: PATH });

export default function AboutPage() {
  return (
    <div>
      <JsonLd
        data={[
          webPageSchema({
            path: PATH,
            name: title,
            description,
            type: "AboutPage",
          }),
          faqSchema(faqSchemaItems(ABOUT_FAQS)),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "About Us", path: PATH },
          ]),
        ]}
      />
      <div className="container mx-auto px-4 pt-6 md:pt-8">
        <PageBreadcrumbs
          items={crumbs({ label: "About Us", href: "/about" })}
        />
      </div>
      <AboutContent />
    </div>
  );
}
