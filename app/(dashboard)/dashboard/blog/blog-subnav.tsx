import Link from "next/link";
import { cn } from "@/lib/utils";

export function BlogSubnav({
  current,
}: {
  current: "posts" | "categories";
}) {
  return (
    <nav
      aria-label="Blog"
      className="mt-8 flex gap-8 caption tracking-[0.16em] uppercase"
    >
      <Link
        href="/dashboard/blog"
        className={cn(
          current === "posts"
            ? "text-foreground"
            : "text-muted-foreground transition-colors hover:text-foreground",
        )}
      >
        Posts
      </Link>
      <Link
        href="/dashboard/blog/categories"
        className={cn(
          current === "categories"
            ? "text-foreground"
            : "text-muted-foreground transition-colors hover:text-foreground",
        )}
      >
        Categories
      </Link>
    </nav>
  );
}
