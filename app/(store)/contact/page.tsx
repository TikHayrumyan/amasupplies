import { ContactContent } from "@/components/contact-content";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { crumbs } from "@/lib/breadcrumbs";
import { ADDRESS_DISPLAY } from "@/lib/contact";
import {
  breadcrumbSchema,
  createMetadata,
  JsonLd,
  webPageSchema,
} from "@/lib/seo";

const PATH = "/contact";
const title = "Contact Us";
const description = `Contact AMA Supplies at ${ADDRESS_DISPLAY}. Call, email, or send a message to request an approved wholesale account.`;

export const metadata = createMetadata({ title, description, path: PATH });

export default function ContactPage() {
  return (
    <div>
      <JsonLd
        data={[
          webPageSchema({
            path: PATH,
            name: title,
            description,
            type: "ContactPage",
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact", path: PATH },
          ]),
        ]}
      />
      <div className="container mx-auto px-4 pt-6 md:pt-8">
        <PageBreadcrumbs
          items={crumbs({ label: "Contact", href: "/contact" })}
        />
      </div>
      <ContactContent />
    </div>
  );
}
