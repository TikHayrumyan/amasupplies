import "server-only";

import {
  createInquiry,
  setInquiryEmailSent,
  type InquirySource,
} from "@/lib/inquiry";
import { sendInquiryEmail } from "@/lib/inquiry-mail";
import {
  RATE_LIMIT_MESSAGE,
  getClientIp,
  isInquiryRateLimited,
} from "@/lib/inquiry-rate-limit";

export { RATE_LIMIT_MESSAGE };

export async function savePublicInquiry(input: {
  source: InquirySource;
  name: string;
  email: string;
  phone?: string;
  message: string;
  productId?: number | null;
  productTitle?: string;
  productItemNumber?: string;
  productSku?: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  const ip = await getClientIp();
  if (await isInquiryRateLimited(email, ip)) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  let id = 0;
  try {
    id = await createInquiry({
      source: input.source,
      name: input.name,
      email,
      phone: input.phone,
      message: input.message,
      ip,
      productId: input.productId,
      productTitle: input.productTitle,
      productItemNumber: input.productItemNumber,
      productSku: input.productSku,
    });
  } catch {
    return {
      ok: false,
      error: "We could not send your message. Please try again or call us.",
    };
  }

  const emailSent = await sendInquiryEmail({
    replyTo: email,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
  try {
    await setInquiryEmailSent(id, emailSent);
  } catch (error) {
    console.error("Could not update inquiry emailSent:", error);
  }
  return { ok: true };
}
