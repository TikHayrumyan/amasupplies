import Link from "next/link";
import { Fragment } from "react";
import { headers } from "next/headers";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Crumb } from "@/lib/breadcrumbs";

async function siteOrigin() {
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) {
    return "";
  }
  const protocol =
    headerList.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

function toAbsolute(origin: string, href: string) {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return href;
  }
  return `${origin}${href.startsWith("/") ? href : `/${href}`}`;
}

export async function PageBreadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length < 2) {
    return null;
  }

  const origin = await siteOrigin();
  const lastIndex = items.length - 1;
  const jsonLd = origin
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            ...(item.href
              ? { item: toAbsolute(origin, item.href) }
              : {}),
          })),
      }
    : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
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
    </>
  );
}
