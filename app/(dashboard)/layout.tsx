import Link from "next/link";
import { logout } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { requireStaff } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = await requireStaff();

  return (
    <div className="flex min-h-full flex-col ">
      <header className="border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="text-sm font-semibold tracking-[0.22em] uppercase"
          >
            AmaSupplies
          </Link>
          <nav className="flex items-center gap-6 text-[13px] tracking-[0.12em]">
            <Link href="/dashboard" className="transition-colors hover:text-primary">
              Hero
            </Link>
            {role === "admin" ? (
              <Link
                href="/dashboard/account"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Account
              </Link>
            ) : null}
            <form action={logout}>
              <Button
                type="submit"
                variant="ghost"
                className="h-8 px-2 text-[13px] tracking-[0.12em]"
              >
                Sign out
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
