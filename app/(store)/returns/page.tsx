import type { Metadata } from "next";
import { PolicyPage, policyMetadata } from "@/components/policy-page";

export const metadata: Metadata = policyMetadata("returns");

export default function ReturnsPage() {
  return <PolicyPage slug="returns" />;
}
