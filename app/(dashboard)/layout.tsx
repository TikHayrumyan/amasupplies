import { Suspense } from "react";
import Link from "next/link";
import { DashboardNav } from "@/app/(dashboard)/dashboard-nav";
import { InquiryUnreadBadge } from "@/app/(dashboard)/inquiry-unread-badge";
import { requireStaff } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = await requireStaff();

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="text-sm font-semibold tracking-[0.22em] uppercase"
          >
            AmaSupplies
          </Link>
          <DashboardNav
            isAdmin={role === "admin"}
            unreadBadge={
              <Suspense fallback={null}>
                <InquiryUnreadBadge />
              </Suspense>
            }
          />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
