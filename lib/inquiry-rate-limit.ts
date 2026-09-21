import "server-only";

import { headers } from "next/headers";
import { countRecentInquiries } from "@/lib/inquiry";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_EMAIL = 5;
const MAX_PER_IP = 8;
const BURST_WINDOW_MS = 60 * 1000;
const MAX_BURST = 4;

const bursts = new Map<string, number[]>();

export const RATE_LIMIT_MESSAGE =
  "Please wait a few minutes before sending another message.";

export async function getClientIp() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip")?.trim() ||
    "";
  return ip.slice(0, 45);
}

function allowBurst(key: string) {
  const now = Date.now();
  const recent = (bursts.get(key) ?? []).filter(
    (time) => now - time < BURST_WINDOW_MS,
  );
  if (recent.length >= MAX_BURST) {
    bursts.set(key, recent);
    return false;
  }
  recent.push(now);
  bursts.set(key, recent);
  return true;
}

export async function isInquiryRateLimited(email: string, ip: string) {
  if (!allowBurst(`email:${email}`) || (ip !== "" && !allowBurst(`ip:${ip}`))) {
    return true;
  }
  const since = new Date(Date.now() - WINDOW_MS);
  const [emailCount, ipCount] = await Promise.all([
    countRecentInquiries({ email, since }),
    ip ? countRecentInquiries({ ip, since }) : Promise.resolve(0),
  ]);
  return emailCount >= MAX_PER_EMAIL || ipCount >= MAX_PER_IP;
}
