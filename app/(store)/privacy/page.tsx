import type { Metadata } from "next";
import { PolicyPage, policyMetadata } from "@/components/policy-page";

export const metadata: Metadata = policyMetadata("privacy");

export default function PrivacyPage() {
  return <PolicyPage slug="privacy" />;
}
