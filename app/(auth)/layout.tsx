import type { Metadata } from "next";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Sign in | ${seo.siteName}`,
  description: "Staff sign in for AMA Supplies.",
  robots: { index: false, follow: true },
};

export default function AuthLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <div className="flex-1 min-h-screen bg-surface text-foreground">{children}</div>
  );
}
