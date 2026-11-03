import type { Metadata } from "next";
import { NotFoundContent } from "@/components/not-found-content";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Page not found | ${seo.siteName}`,
  description: "This page does not exist or is no longer available.",
  robots: { index: false, follow: true },
};

export default function StoreNotFound() {
  return <NotFoundContent />;
}
