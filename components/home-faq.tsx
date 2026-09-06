import { FaqSection } from "@/components/faq-section";
import { FAQ_PREVIEW } from "@/components/faq-data";

export function HomeFaq() {
  return (
    <FaqSection
      items={FAQ_PREVIEW}
      defaultOpen
      action={{ href: "/faq", label: "View all FAQs" }}
    />
  );
}
