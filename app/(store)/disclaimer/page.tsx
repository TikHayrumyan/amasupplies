import type { Metadata } from "next";
import { PolicyPage, policyMetadata } from "@/components/policy-page";

export const metadata: Metadata = policyMetadata("disclaimer");

export default function DisclaimerPage() {
  return <PolicyPage slug="disclaimer" />;
}
