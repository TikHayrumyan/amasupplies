import "server-only";

import { Resend } from "resend";
import { INQUIRY_EMAIL } from "@/lib/contact";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export { escapeHtml };

export async function sendInquiryEmail(input: {
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return false;
  }
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM ?? "AMA Supplies <onboarding@resend.dev>",
      to: process.env.CONTACT_FORM_TO ?? INQUIRY_EMAIL,
      replyTo: input.replyTo,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    if (error) {
      console.error("Inquiry email failed:", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Inquiry email failed:", error);
    return false;
  }
}
