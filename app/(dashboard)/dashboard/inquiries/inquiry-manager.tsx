"use client";

import { useActionState, useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { markInquiryOpened, removeInquiry } from "./actions";
import {
  inquiryHref,
  type InquiryFilter,
  type InquiryRecord,
  type InquirySource,
} from "@/lib/inquiry-fields";
import { IconButton } from "@/components/icon-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Result = { error: string | null; done?: boolean };
type Panel =
  | { type: "view"; inquiry: InquiryRecord }
  | { type: "delete"; inquiry: InquiryRecord }
  | null;

const FILTERS: { value: InquiryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "contact", label: "Contact" },
  { value: "product", label: "Product" },
];

function sourceLabel(source: InquirySource) {
  return source === "product" ? "Product" : "Contact";
}

function formatReceivedAt(value: Date | string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function InquiryManager({
  inquiries,
  source,
  page,
  pageCount,
  total,
}: {
  inquiries: InquiryRecord[];
  source: InquiryFilter;
  page: number;
  pageCount: number;
  total: number;
}) {
  const router = useRouter();
  const [items, setItems] = useState(inquiries);
  const [prevInquiries, setPrevInquiries] = useState(inquiries);
  const [panel, setPanel] = useState<Panel>(null);
  const close = useCallback(() => setPanel(null), []);

  if (inquiries !== prevInquiries) {
    setPrevInquiries(inquiries);
    setItems(inquiries);
  }

  async function openInquiry(inquiry: InquiryRecord) {
    setPanel({ type: "view", inquiry: { ...inquiry, isRead: true } });
    if (!inquiry.isRead) {
      setItems((current) =>
        current.map((item) =>
          item.id === inquiry.id ? { ...item, isRead: true } : item,
        ),
      );
      await markInquiryOpened(inquiry.id);
      router.refresh();
    }
  }

  return (
    <div className="mt-10">
      <div className="flex flex-wrap gap-6">
        {FILTERS.map((option) => (
          <Link
            key={option.value}
            href={inquiryHref({ source: option.value })}
            className={cn(
              "caption tracking-[0.16em] uppercase transition-colors",
              source === option.value
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No inquiries yet.</p>
      ) : (
        <div className="mt-6">
          {items.map((inquiry) => (
            <div
              key={inquiry.id}
              className="flex items-center gap-4 border-b border-border/80 py-4"
            >
              <button
                type="button"
                onClick={() => void openInquiry(inquiry)}
                className="flex min-w-0 flex-1 items-start gap-4 text-left"
              >
                <span
                  className={cn(
                    "mt-2 size-2 shrink-0 rounded-full",
                    inquiry.isRead ? "bg-transparent" : "bg-foreground",
                  )}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span
                      className={cn(
                        "truncate",
                        inquiry.isRead ? "font-normal" : "font-medium",
                      )}
                    >
                      {inquiry.name}
                    </span>
                    <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
                      {sourceLabel(inquiry.source)}
                    </span>
                    {!inquiry.emailSent ? (
                      <span className="caption tracking-[0.16em] text-danger uppercase">
                        Email failed
                      </span>
                    ) : null}
                    <span className="text-sm text-muted-foreground">
                      {formatReceivedAt(inquiry.createdAt)}
                    </span>
                  </span>
                  <span className="mt-1 block truncate text-sm text-muted-foreground">
                    {inquiry.source === "product" && inquiry.productTitle
                      ? `${inquiry.productTitle} · ${inquiry.message}`
                      : inquiry.message}
                  </span>
                </span>
              </button>
              <IconButton
                aria-label={`Delete inquiry from ${inquiry.name}`}
                danger
                onClick={() => setPanel({ type: "delete", inquiry })}
              >
                <Trash2 className="size-4" />
              </IconButton>
            </div>
          ))}
        </div>
      )}

      {pageCount > 1 ? (
        <div className="mt-8 flex items-center justify-between gap-4 text-sm text-muted-foreground">
          {page > 1 ? (
            <Link
              href={inquiryHref({ source, page: page - 1 })}
              className="caption tracking-[0.16em] uppercase hover:text-foreground"
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span>
            Page {page} of {pageCount}
            {total ? ` · ${total}` : ""}
          </span>
          {page < pageCount ? (
            <Link
              href={inquiryHref({ source, page: page + 1 })}
              className="caption tracking-[0.16em] uppercase hover:text-foreground"
            >
              Next
            </Link>
          ) : (
            <span />
          )}
        </div>
      ) : null}

      <Sheet open={panel !== null} onOpenChange={(open) => !open && close()}>
        <SheetContent
          side="right"
          className="w-full gap-0 overflow-y-auto bg-background sm:max-w-md"
        >
          {panel?.type === "view" ? (
            <InquiryDetail inquiry={panel.inquiry} />
          ) : null}
          {panel?.type === "delete" ? (
            <>
              <SheetHeader className="px-6 pt-8">
                <SheetTitle className="font-medium">Delete inquiry</SheetTitle>
                <SheetDescription>
                  {panel.inquiry.name} will be removed from the dashboard. The
                  email copy is unchanged.
                </SheetDescription>
              </SheetHeader>
              <DeleteForm
                inquiry={panel.inquiry}
                onDone={() => {
                  setItems((current) =>
                    current.filter((item) => item.id !== panel.inquiry.id),
                  );
                  close();
                  router.refresh();
                }}
              />
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-2 text-sm">{children}</div>
    </div>
  );
}

function InquiryDetail({ inquiry }: { inquiry: InquiryRecord }) {
  return (
    <>
      <SheetHeader className="px-6 pt-8">
        <SheetTitle className="font-medium">{inquiry.name}</SheetTitle>
        <SheetDescription>
          {sourceLabel(inquiry.source)} · {formatReceivedAt(inquiry.createdAt)}
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-6 px-6 pb-8">
        <DetailRow label="Email">
          <a href={`mailto:${inquiry.email}`} className="underline">
            {inquiry.email}
          </a>
        </DetailRow>
        {inquiry.phone ? (
          <DetailRow label="Phone">
            <a href={`tel:${inquiry.phone}`} className="underline">
              {inquiry.phone}
            </a>
          </DetailRow>
        ) : null}
        {inquiry.productTitle ? (
          <DetailRow label="Product">
            {inquiry.productId ? (
              <Link
                href={`/dashboard/products/${inquiry.productId}`}
                className="underline"
              >
                {inquiry.productTitle}
              </Link>
            ) : (
              inquiry.productTitle
            )}
            {inquiry.productItemNumber ? (
              <p className="mt-1 text-muted-foreground">
                {inquiry.productItemNumber}
                {inquiry.productSku ? ` · ${inquiry.productSku}` : ""}
              </p>
            ) : null}
          </DetailRow>
        ) : null}
        <DetailRow label="Email status">
          {inquiry.emailSent ? "Sent" : "Not sent — check Resend"}
        </DetailRow>
        <DetailRow label="Message">
          <p className="whitespace-pre-wrap">{inquiry.message}</p>
        </DetailRow>
      </div>
    </>
  );
}

function DeleteForm({
  inquiry,
  onDone,
}: {
  inquiry: InquiryRecord;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: Result, formData: FormData) => {
      const result = await removeInquiry(formData);
      if (result.done) {
        onDone();
      }
      return result;
    },
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-col gap-8 px-6 pb-8">
      <input type="hidden" name="id" value={inquiry.id} />
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <div className="flex gap-6">
        <Button type="button" variant="ghost" className="h-11 px-0" onClick={onDone}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={pending}
          variant="ghost"
          className="h-11 px-0 text-danger hover:text-danger"
        >
          {pending ? "Deleting…" : "Delete"}
        </Button>
      </div>
    </form>
  );
}
