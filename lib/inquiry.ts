import "server-only";

import { cache } from "react";
import { db } from "@/prisma/db";
import {
  INQUIRY_PAGE_SIZE,
  type InquiryFilter,
  type InquiryRecord,
  type InquirySource,
} from "@/lib/inquiry-fields";

export type { InquiryRecord, InquirySource } from "@/lib/inquiry-fields";

const INQUIRY_FIELDS = [
  "id",
  "source",
  "name",
  "email",
  "phone",
  "message",
  "productId",
  "productTitle",
  "productItemNumber",
  "productSku",
  "emailSent",
  "isRead",
  "createdAt",
] as const;

function isInquirySource(value: string): value is InquirySource {
  return value === "contact" || value === "product";
}

function toRecord(row: {
  id: number;
  source: string;
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
}): InquiryRecord {
  return {
    ...row,
    source: isInquirySource(row.source) ? row.source : "contact",
  };
}

async function countInquiries(source: InquiryFilter) {
  const query =
    source === "all"
      ? db.orm.public.Inquiry
      : db.orm.public.Inquiry.where({ source });
  const result = await query.aggregate((aggregate) => ({
    total: aggregate.count(),
  }));
  return Number(result.total ?? 0);
}

export async function listInquiriesPage(input: {
  source: InquiryFilter;
  page: number;
}) {
  const requested = Math.max(1, input.page);
  const query =
    input.source === "all"
      ? db.orm.public.Inquiry.select(...INQUIRY_FIELDS)
      : db.orm.public.Inquiry.select(...INQUIRY_FIELDS).where({
          source: input.source,
        });
  const [total, rows] = await Promise.all([
    countInquiries(input.source),
    query
      .orderBy((inquiry) => inquiry.createdAt.desc())
      .skip((requested - 1) * INQUIRY_PAGE_SIZE)
      .take(INQUIRY_PAGE_SIZE)
      .all(),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / INQUIRY_PAGE_SIZE));
  const page = Math.min(requested, pageCount);
  return {
    inquiries: page === requested ? rows.map(toRecord) : [],
    total,
    page,
    pageCount,
  };
}

export const countUnreadInquiries = cache(async () => {
  try {
    const result = await db.orm.public.Inquiry.where({ isRead: false }).aggregate(
      (aggregate) => ({ total: aggregate.count() }),
    );
    return Number(result.total ?? 0);
  } catch (error) {
    console.error("Could not count unread inquiries:", error);
    return 0;
  }
});

export async function countRecentInquiries(input: {
  email?: string;
  ip?: string;
  since: Date;
}) {
  if (input.email) {
    const result = await db.orm.public.Inquiry.where({ email: input.email })
      .where((inquiry) => inquiry.createdAt.gte(input.since))
      .aggregate((aggregate) => ({ total: aggregate.count() }));
    return Number(result.total ?? 0);
  }
  if (input.ip) {
    const result = await db.orm.public.Inquiry.where({ ip: input.ip })
      .where((inquiry) => inquiry.createdAt.gte(input.since))
      .aggregate((aggregate) => ({ total: aggregate.count() }));
    return Number(result.total ?? 0);
  }
  return 0;
}

export async function createInquiry(input: {
  source: InquirySource;
  name: string;
  email: string;
  phone?: string;
  message: string;
  ip?: string;
  productId?: number | null;
  productTitle?: string;
  productItemNumber?: string;
  productSku?: string;
}) {
  await db.orm.public.Inquiry.create({
    source: input.source,
    name: input.name,
    email: input.email,
    phone: input.phone ?? "",
    message: input.message,
    productId: input.productId ?? null,
    productTitle: input.productTitle ?? "",
    productItemNumber: input.productItemNumber ?? "",
    productSku: input.productSku ?? "",
    ip: input.ip ?? "",
    emailSent: false,
    isRead: false,
    createdAt: new Date(),
  });
  const created = await db.orm.public.Inquiry.select("id")
    .where({ email: input.email })
    .orderBy((inquiry) => inquiry.createdAt.desc())
    .first();
  if (!created) {
    throw new Error("Could not save inquiry.");
  }
  return created.id;
}

export async function setInquiryEmailSent(id: number, emailSent: boolean) {
  await db.orm.public.Inquiry.where({ id }).update({ emailSent });
}

export async function setInquiryRead(id: number, isRead: boolean) {
  await db.orm.public.Inquiry.where({ id }).update({ isRead });
}

export async function deleteInquiry(id: number) {
  await db.orm.public.Inquiry.where({ id }).delete();
}
