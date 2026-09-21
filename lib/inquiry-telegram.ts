import "server-only";

import { escapeHtml } from "@/lib/inquiry-mail";
import type { InquirySource } from "@/lib/inquiry-fields";

const TEXT_MAX = 4096;

function dashboardUrl() {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  return `${origin}/dashboard/inquiries`;
}

function clip(value: string, max: number) {
  if (value.length <= max) {
    return value;
  }
  return `${value.slice(0, max - 1)}…`;
}

function line(label: string, value: string) {
  return `${label}: ${escapeHtml(value)}`;
}

export async function sendInquiryTelegram(input: {
  source: InquirySource;
  name: string;
  email: string;
  phone?: string;
  message: string;
  productTitle?: string;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return false;
  }

  const rows = [
    "<b>New inquiry</b>",
    line("Source", input.source === "product" ? "Product" : "Contact"),
    line("Name", input.name),
    line("Email", input.email),
  ];
  if (input.phone) {
    rows.push(line("Phone", input.phone));
  }
  if (input.productTitle) {
    rows.push(line("Product", input.productTitle));
  }
  rows.push("", escapeHtml(clip(input.message, 1500)));
  const href = escapeHtml(dashboardUrl());
  rows.push("", `<a href="${href}">Open dashboard</a>`);

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: clip(rows.join("\n"), TEXT_MAX),
          parse_mode: "HTML",
          link_preview_options: { is_disabled: true },
        }),
      },
    );
    const body = (await response.json()) as {
      ok?: boolean;
      description?: string;
    };
    if (!body.ok) {
      console.error("Inquiry telegram failed:", body.description);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Inquiry telegram failed:", error);
    return false;
  }
}
