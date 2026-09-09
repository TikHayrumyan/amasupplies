import type { Metadata } from "next";
import { NotFoundContent } from "@/components/not-found-content";

export const metadata: Metadata = {
  title: "Page not found | AMA Supplies",
  description: "This page does not exist or is no longer available.",
};

export default function StoreNotFound() {
  return <NotFoundContent />;
}
