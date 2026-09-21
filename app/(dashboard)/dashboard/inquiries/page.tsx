import { redirect } from "next/navigation";
import { countUnreadInquiries, listInquiriesPage } from "@/lib/inquiry";
import {
  inquiryHref,
  parseInquiryPage,
  parseInquirySource,
} from "@/lib/inquiry-fields";
import { InquiryManager } from "./inquiry-manager";

export const dynamic = "force-dynamic";

export default async function InquiriesPage({
  searchParams,
}: PageProps<"/dashboard/inquiries">) {
  const params = await searchParams;
  const source = parseInquirySource(params.source);
  const requestedPage = parseInquiryPage(params.page);
  const [{ inquiries, total, page, pageCount }, unread] = await Promise.all([
    listInquiriesPage({
      source,
      page: requestedPage,
    }),
    countUnreadInquiries(),
  ]);

  if (requestedPage !== page) {
    redirect(inquiryHref({ source, page }));
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="font-medium tracking-tight">Inquiries</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Messages from the contact form and product quote requests.
        {unread > 0 ? ` ${unread} unread.` : ""}
      </p>
      <InquiryManager
        key={`${source}-${page}`}
        inquiries={inquiries}
        source={source}
        page={page}
        pageCount={pageCount}
        total={total}
      />
    </div>
  );
}
