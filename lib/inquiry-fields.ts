export const INQUIRY_SOURCES = ["contact", "product"] as const;
export type InquirySource = (typeof INQUIRY_SOURCES)[number];

export const INQUIRY_PAGE_SIZE = 20;

export type InquiryRecord = {
  id: number;
  source: InquirySource;
  name: string;
  email: string;
  phone: string;
  message: string;
  productId: number | null;
  productTitle: string;
  productItemNumber: string;
  productSku: string;
  emailSent: boolean;
  isRead: boolean;
  createdAt: Date;
};

export type InquiryFilter = "all" | InquirySource;

function one(value?: string | string[]) {
  return typeof value === "string" ? value : "";
}

export function parseInquirySource(value?: string | string[]): InquiryFilter {
  const source = one(value);
  if (source === "contact" || source === "product") {
    return source;
  }
  return "all";
}

export function parseInquiryPage(value?: string | string[]) {
  const page = Number(one(value));
  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }
  return Math.floor(page);
}

export function inquiryHref(input: { source: InquiryFilter; page?: number }) {
  const params = new URLSearchParams();
  if (input.source !== "all") {
    params.set("source", input.source);
  }
  if (input.page && input.page > 1) {
    params.set("page", String(input.page));
  }
  const query = params.toString();
  return query ? `/dashboard/inquiries?${query}` : "/dashboard/inquiries";
}
