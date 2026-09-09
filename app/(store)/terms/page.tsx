import type { Metadata } from "next";
import { PolicyPage, policyMetadata } from "@/components/policy-page";

export const metadata: Metadata = policyMetadata("terms");

export default function TermsPage() {
  return <PolicyPage slug="terms" />;
}
