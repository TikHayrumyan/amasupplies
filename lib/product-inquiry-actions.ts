"use server";

import { z } from "zod";
import { Resend } from "resend";
import { INQUIRY_EMAIL } from "@/lib/contact";
import { getProductById } from "@/lib/product";
import {
  INITIAL_PRODUCT_INQUIRY_STATE,
  type ProductInquiryFields,
  type ProductInquiryState,
} from "@/lib/product-inquiry-fields";

const inquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80, "Name is too long."),
  email: z.email("Enter a valid email.").max(120, "Email is too long."),
  message: z
    .string()
    .trim()
    .min(1, "Message is required.")
    .max(2000, "Message is too long."),
});

function readFields(formData: FormData): ProductInquiryFields {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
}

function firstFieldErrors(error: z.ZodError): ProductInquiryState["fieldErrors"] {
  const next: ProductInquiryState["fieldErrors"] = {};

  for (const [field, messages] of Object.entries(
    z.flattenError(error).fieldErrors,
  )) {
    const message = Array.isArray(messages) ? messages[0] : undefined;
    if (message) {
      next[field as keyof ProductInquiryFields] = message;
    }
  }

  return next;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendProductInquiry(
  _prev: ProductInquiryState,
  formData: FormData,
): Promise<ProductInquiryState> {
  const values = readFields(formData);

  if (String(formData.get("_gotcha") ?? "").trim()) {
    return { ok: false, error: null, fieldErrors: {}, values };
  }

  const parsed = inquirySchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: firstFieldErrors(parsed.error),
      values,
    };
  }

  const productId = Number(formData.get("productId") ?? 0);
  const product = productId ? await getProductById(productId) : null;
  if (!product || !product.isPublished) {
    return {
      ok: false,
      error: "This product is no longer available. Please try another item.",
      fieldErrors: {},
      values,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "The inquiry form is not configured yet. Please call or email us.",
      fieldErrors: {},
      values,
    };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM ?? "AMA Supplies <onboarding@resend.dev>",
      to: process.env.CONTACT_FORM_TO ?? INQUIRY_EMAIL,
      replyTo: parsed.data.email,
      subject: `Product inquiry: ${product.title}`,
      text: [
        `Product: ${product.title}`,
        `Item number: ${product.itemNumber}`,
        `SKU: ${product.sku}`,
        "",
        `Name: ${parsed.data.name}`,
        `Email: ${parsed.data.email}`,
        "",
        parsed.data.message,
      ].join("\n"),
      html: `
        <p><strong>Product:</strong> ${escapeHtml(product.title)}</p>
        <p><strong>Item number:</strong> ${escapeHtml(product.itemNumber)}</p>
        <p><strong>SKU:</strong> ${escapeHtml(product.sku)}</p>
        <p><strong>Name:</strong> ${escapeHtml(parsed.data.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(parsed.data.email)}</p>
        <p>${escapeHtml(parsed.data.message).replaceAll("\n", "<br />")}</p>
      `,
    });

    if (error) {
      return {
        ok: false,
        error: "We could not send your message. Please try again or call us.",
        fieldErrors: {},
        values,
      };
    }
  } catch {
    return {
      ok: false,
      error: "We could not send your message. Please try again or call us.",
      fieldErrors: {},
      values,
    };
  }

  return {
    ok: true,
    error: null,
    fieldErrors: {},
    values: INITIAL_PRODUCT_INQUIRY_STATE.values,
  };
}
