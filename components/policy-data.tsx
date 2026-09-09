import Link from "next/link";
import type { PolicyDoc, PolicySlug } from "@/lib/policy-fields";

const contactLink = (
  <Link
    href="/contact"
    className="text-foreground underline-offset-4 hover:underline"
  >
    contact us
  </Link>
);

const POLICIES: Record<PolicySlug, PolicyDoc> = {
  disclaimer: {
    slug: "disclaimer",
    href: "/disclaimer",
    navLabel: "Disclaimer",
    title: "Disclaimer",
    description:
      "Product information from AMA Supplies is for general informational and business purposes. We do not provide medical advice.",
    blocks: [
      {
        type: "paragraph",
        children:
          "The information provided by AMA Supplies is for general informational and business purposes only. We supply products intended strictly for professional, commercial, and healthcare facility use. We do not provide medical advice, diagnostics, or treatment recommendations. All products must be used in accordance with the product specifications, packaging instructions, and standard medical industry practices.",
      },
      {
        type: "paragraph",
        children:
          "AMA Supplies disclaims all express or implied warranties, including warranties of merchantability and fitness for a particular purpose. AMA Supplies shall not be held liable for:",
      },
      {
        type: "bullets",
        items: [
          "Misuse, improper handling, or off-label application of products.",
          "Any direct, indirect, incidental, or consequential damages arising from product usage.",
          "Decisions or actions taken based on information provided on this website.",
        ],
      },
      {
        type: "paragraph",
        children:
          "While we strive to ensure product descriptions and specifications are accurate, we do not guarantee completeness or real-time accuracy. Customers assume full responsibility for ensuring that products are suitable for their specific facility requirements and for complying with all applicable local, state, and federal health and safety regulations.",
      },
      {
        type: "paragraph",
        children:
          "For specific technical or safety-related inquiries, please refer to the product packaging or consult a qualified healthcare professional.",
      },
    ],
  },
  returns: {
    slug: "returns",
    href: "/returns",
    navLabel: "Refund policy",
    title: "Returns & Refund Policy",
    description:
      "Returns of medical disposables are accepted only in limited cases, with an RMA and inspection before any refund.",
    blocks: [
      {
        type: "paragraph",
        children:
          "Due to the sanitary nature of medical disposables and the scale of our bulk supply operations, returns are accepted under strictly limited conditions.",
      },
      {
        type: "heading",
        title: "Eligible Returns",
      },
      {
        type: "paragraph",
        children: "Returns are only authorized for the following scenarios:",
      },
      {
        type: "bullets",
        items: [
          "Products damaged during transit prior to delivery.",
          "Receipt of incorrect items due to a fulfillment error.",
        ],
      },
      {
        type: "heading",
        title: "Return Request Process",
      },
      {
        type: "paragraph",
        children:
          "To initiate a return, buyers must complete the following steps:",
      },
      {
        type: "steps",
        items: [
          "Notify AMA Supplies within 48 hours of the delivery timestamp.",
          "Provide clear photographic or video evidence of the damage or incorrect item.",
          "Receive an official Return Merchandise Authorization (RMA) number from our team.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Returns shipped without an authorized RMA will be refused.",
      },
      {
        type: "heading",
        title: "Non-Returnable Items",
      },
      {
        type: "paragraph",
        children:
          "For health, safety, and compliance reasons, we strictly cannot accept returns on:",
      },
      {
        type: "bullets",
        items: [
          "Any used, opened, or unsealed products.",
          "Custom or bulk orders processed specifically upon request.",
          "Clearance, liquidated, or special-order items.",
        ],
      },
      {
        type: "heading",
        title: "Inspection and Refund Processing",
      },
      {
        type: "paragraph",
        children:
          "We reserve the right to inspect all returned merchandise upon arrival at our facility before issuing a refund or replacement.",
      },
      {
        type: "bullets",
        items: [
          "If the return is due to our error or transit damage, AMA Supplies will cover return shipping costs.",
          "Approved refunds will be processed to the original method of payment within 7 to 10 business days of a successful warehouse inspection.",
        ],
      },
    ],
  },
  terms: {
    slug: "terms",
    href: "/terms",
    navLabel: "Terms of use",
    title: "Terms of Service",
    description:
      "Terms for using AMA Supplies, including pricing, net payment terms, intellectual property, and California governing law.",
    blocks: [
      {
        type: "paragraph",
        children:
          "By accessing and using AMA Supplies, you agree to comply with and be bound by the following terms. All products listed are intended strictly for business, commercial, and professional healthcare facility use.",
      },
      {
        type: "heading",
        title: "Pricing and Order Fulfillment",
      },
      {
        type: "paragraph",
        children:
          "Prices, specifications, and availability of products are subject to change without notice. We reserve the right to:",
      },
      {
        type: "bullets",
        items: [
          "Refuse or cancel any order for any reason, including suspected fraud or inventory limitations.",
          "Limit quantities on bulk purchases.",
          "Correct any typographical errors, inaccuracies, or omissions relating to product descriptions or pricing at any time.",
        ],
      },
      {
        type: "paragraph",
        children:
          "Customers are solely responsible for providing accurate billing, shipping, and delivery documentation. AMA Supplies is not liable for fulfillment delays caused by inaccurate customer information.",
      },
      {
        type: "heading",
        title: "Payment and Net Terms",
      },
      {
        type: "paragraph",
        children:
          "For business customers operating under approved net payment terms, all invoices must be paid in full by the designated due date. If an invoice remains unpaid 7 days after the stated deadline, a daily late fee will be applied to the outstanding balance and will continue to accrue daily until the balance is paid in full.",
      },
      {
        type: "paragraph",
        children:
          "Furthermore, AMA Supplies will suspend all purchasing privileges for any account with a past-due balance. No new orders will be accepted or fulfilled until the outstanding balance, including all accrued late fees, is settled completely.",
      },
      {
        type: "heading",
        title: "Intellectual Property",
      },
      {
        type: "paragraph",
        children:
          "All content on this website—including text, graphics, logos, and proprietary product information—is the exclusive property of AMA Supplies. It may not be copied, reproduced, or distributed without express written permission. Unauthorized use of this website or commercial misuse of our brand assets may result in legal action.",
      },
      {
        type: "heading",
        title: "Governing Law",
      },
      {
        type: "paragraph",
        children:
          "These terms and conditions are governed by and construed in accordance with the laws of the State of California. Any disputes arising from the use of this website or the purchase of our products shall be subject to the exclusive jurisdiction of the courts located in California.",
      },
    ],
  },
  privacy: {
    slug: "privacy",
    href: "/privacy",
    navLabel: "Privacy policy",
    title: "Privacy Policy",
    description:
      "How AMA Supplies collects, uses, and protects personal and business information. We do not sell your data.",
    blocks: [
      {
        type: "paragraph",
        children:
          "At AMA Supplies, we respect your privacy and are committed to protecting your personal and business information.",
      },
      {
        type: "heading",
        title: "Information We Collect",
      },
      {
        type: "paragraph",
        children:
          "When you place an order, request a quote, or contact us, we collect necessary information including your name, business details, contact number, email address, billing address, and shipping address. We also automatically collect standard technical data when you visit our website, such as your IP address and browsing behavior, through the use of cookies to ensure our website functions correctly.",
      },
      {
        type: "heading",
        title: "How We Use Your Information",
      },
      {
        type: "paragraph",
        children: "The information we collect is used strictly to:",
      },
      {
        type: "bullets",
        items: [
          "Process, fulfill, and deliver your orders.",
          "Evaluate and manage Net Term billing agreements.",
          "Communicate order updates, tracking details, and customer support.",
          "Improve our website functionality and overall customer experience.",
        ],
      },
      {
        type: "heading",
        title: "Information Sharing and Security",
      },
      {
        type: "paragraph",
        children:
          "We do not sell, trade, or rent your personal or business information to third parties. Your data is only shared with trusted, essential service partners—such as payment gateways, fraud-prevention services, and delivery providers—strictly for the purpose of order fulfillment and secure payment processing.",
      },
      {
        type: "paragraph",
        children:
          "AMA Supplies does not store raw credit card data on our local servers. We implement industry-standard administrative and technical security measures to protect your data against unauthorized access, alteration, or disclosure.",
      },
      {
        type: "heading",
        title: "Your Rights and Consent",
      },
      {
        type: "paragraph",
        children:
          "By using our website, you consent to the collection and use of your information as outlined in this policy. You may opt out of any marketing or promotional communications from us at any time by following the unsubscribe instructions in those emails or by contacting us directly.",
      },
      {
        type: "paragraph",
        children: (
          <>
            For any questions regarding your privacy, data, or to request
            updates to your business information, please {contactLink}.
          </>
        ),
      },
    ],
  },
};

export const POLICY_LIST = [
  POLICIES.privacy,
  POLICIES.returns,
  POLICIES.terms,
  POLICIES.disclaimer,
] as const;

export function getPolicy(slug: PolicySlug) {
  return POLICIES[slug];
}
