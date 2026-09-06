"use server";

import { z } from "zod";
import { Resend } from "resend";
import { INQUIRY_EMAIL } from "@/lib/contact";
import {
  INITIAL_CONTACT_STATE,
  type ContactFields,
  type ContactState,
} from "@/lib/contact-fields";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80, "Name is too long."),
  email: z
    .email("Enter a valid email.")
    .max(120, "Email is too long."),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number.")
    .max(40, "Phone is too long."),
  message: z
    .string()
    .trim()
    .min(1, "Message is required.")
    .max(2000, "Message is too long."),
});

function readFields(formData: FormData): ContactFields {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
}

function firstFieldErrors(error: z.ZodError): ContactState["fieldErrors"] {
  const next: ContactState["fieldErrors"] = {};

  for (const [field, messages] of Object.entries(
    z.flattenError(error).fieldErrors,
  )) {
    const message = Array.isArray(messages) ? messages[0] : undefined;
    if (message) {
      next[field as keyof ContactFields] = message;
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

export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const values = readFields(formData);

  if (String(formData.get("_gotcha") ?? "").trim()) {
    return { ok: false, error: null, fieldErrors: {}, values };
  }

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: firstFieldErrors(parsed.error),
      values,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "The contact form is not configured yet. Please call or email us.",
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
      subject: `Website inquiry from ${parsed.data.name}`,
      text: [
        `Name: ${parsed.data.name}`,
        `Email: ${parsed.data.email}`,
        `Phone: ${parsed.data.phone}`,
        "",
        parsed.data.message,
      ].join("\n"),
      html: `
        <p><strong>Name:</strong> ${escapeHtml(parsed.data.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(parsed.data.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(parsed.data.phone)}</p>
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
    values: INITIAL_CONTACT_STATE.values,
  };
}
