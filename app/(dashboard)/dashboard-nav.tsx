"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active =
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

export function DashboardNav({ isAdmin }: { isAdmin: boolean }) {
  return (
    <nav className="flex items-center gap-6 text-[13px] tracking-[0.12em]">
      <NavLink href="/dashboard">Home</NavLink>
      {isAdmin ? <NavLink href="/dashboard/account">Account</NavLink> : null}
    </nav>
  );
}
