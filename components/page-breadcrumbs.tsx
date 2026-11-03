import Link from "next/link";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Crumb } from "@/lib/breadcrumbs";

export function PageBreadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length < 2) {
    return null;
  }

  const lastIndex = items.length - 1;

  return (
    <Breadcrumb>
      <BreadcrumbList className="caption tracking-[0.12em]">
        {items.map((item, index) => {
          const isLast = index === lastIndex;
          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 ? (
                <BreadcrumbSeparator className="text-muted-foreground/70">
                  /
                </BreadcrumbSeparator>
              ) : null}
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
