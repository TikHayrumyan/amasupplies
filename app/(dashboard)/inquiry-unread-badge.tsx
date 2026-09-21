import { countUnreadInquiries } from "@/lib/inquiry";

export async function InquiryUnreadBadge() {
  const unread = await countUnreadInquiries();
  if (unread <= 0) {
    return null;
  }
  return <> ({unread})</>;
}
