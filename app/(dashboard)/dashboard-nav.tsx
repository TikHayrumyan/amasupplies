"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
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
      <NavLink href="/dashboard/categories">Categories</NavLink>
      {isAdmin ? <NavLink href="/dashboard/account">Account</NavLink> : null}
      {!isAdmin ? (
        <form action={logout}>
          <Button
            type="submit"
            variant="destructive"
            className="h-8 px-2 text-[13px] tracking-[0.12em]"
          >
            Sign out
          </Button>
        </form>
      ) : null}
    </nav>
  );
}
