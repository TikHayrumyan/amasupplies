"use client";

import { useRef, useState } from "react";
import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { suggestProducts } from "@/lib/search-actions";
import {
  SEARCH_MIN_LENGTH,
  SEARCH_OVERLAY_LIMIT,
  SEARCH_PANEL_LIMIT,
  normalizeSearchQuery,
  productSearchHref,
  type SearchHit,
} from "@/lib/search-fields";
import { cn } from "@/lib/utils";

export function ProductSearch({
  layout,
  autoFocus,
  trailing,
  onNavigate,
}: {
  layout: "panel" | "overlay";
  autoFocus?: boolean;
  trailing?: React.ReactNode;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [value, setValue] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(-1);

  const query = normalizeSearchQuery(value);
  const limit = layout === "panel" ? SEARCH_PANEL_LIMIT : SEARCH_OVERLAY_LIMIT;
  const resultsId =
    layout === "panel" ? "desktop-product-search" : "mobile-product-search";
  const showPanel = layout === "panel" && query.length >= SEARCH_MIN_LENGTH && open;

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function resetList() {
    seqRef.current += 1;
    clearTimer();
    setHits([]);
    setTotal(0);
    setOpen(false);
    setReady(false);
    setActive(-1);
  }

  function schedule(next: string) {
    clearTimer();
    const trimmed = normalizeSearchQuery(next);
    if (trimmed.length < SEARCH_MIN_LENGTH) {
      resetList();
      return;
    }
    setReady(false);
    timerRef.current = setTimeout(() => {
      void load(trimmed);
    }, 200);
  }

  async function load(next: string) {
    const id = ++seqRef.current;
    const result = await suggestProducts(next, limit);
    if (id !== seqRef.current) {
      return;
    }
    setHits(result.hits);
    setTotal(result.total);
    setOpen(true);
    setReady(true);
    setActive(-1);
  }

  function goToResults() {
    if (query.length < SEARCH_MIN_LENGTH) {
      return;
    }
    onNavigate?.();
    router.push(`/search?query=${encodeURIComponent(query)}`);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      if (layout === "panel" && open) {
        event.preventDefault();
        setOpen(false);
        setActive(-1);
      }
      return;
    }
    const list = showPanel || layout === "overlay" ? hits : [];
    if (list.length === 0) {
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => (current + 1) % list.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => (current <= 0 ? list.length - 1 : current - 1));
      return;
    }
    if (event.key === "Enter" && active >= 0) {
      const hit = list[active];
      if (hit) {
        event.preventDefault();
        onNavigate?.();
        router.push(productSearchHref(hit));
      }
    }
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        layout === "panel" && "relative",
        layout === "overlay" && "flex h-full min-h-0 flex-1 flex-col",
      )}
      onBlur={(event) => {
        if (layout === "overlay") {
          return;
        }
        if (!rootRef.current?.contains(event.relatedTarget as Node)) {
          setOpen(false);
          setActive(-1);
        }
      }}
    >
      <div
        className={cn(
          "flex items-center",
          layout === "overlay" && "border-b border-border/80 px-2",
        )}
      >
        <Form
          action="/search"
          className={cn(
            "flex min-w-0 flex-1 items-center gap-3",
            layout === "panel" ? "h-12" : "h-14 px-2",
          )}
          onSubmit={() => onNavigate?.()}
        >
          <Search
            className="size-4 shrink-0 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input
            type="search"
            name="query"
            value={value}
            autoFocus={autoFocus}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Search products"
            aria-label="Search products"
            aria-autocomplete="list"
            aria-expanded={showPanel || (layout === "overlay" && query.length >= SEARCH_MIN_LENGTH)}
            aria-controls={resultsId}
            aria-activedescendant={
              active >= 0 ? `${resultsId}-${hits[active]?.id}` : undefined
            }
            role="combobox"
            variant="ghost"
            className="px-0"
            onChange={(event) => {
              const next = event.target.value;
              setValue(next);
              schedule(next);
            }}
            onFocus={() => {
              if (layout === "panel" && query.length >= SEARCH_MIN_LENGTH && hits.length > 0) {
                setOpen(true);
              }
            }}
            onKeyDown={onKeyDown}
          />
        </Form>
        {trailing}
      </div>

      {layout === "overlay" ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-16">
          <SearchResults
            id={resultsId}
            query={query}
            hits={hits}
            total={total}
            active={active}
            layout={layout}
            onNavigate={onNavigate}
            onViewAll={goToResults}
            ready={ready}
          />
        </div>
      ) : showPanel ? (
        <div
          className="absolute top-full right-0 left-0 z-50 border border-t-0 border-border bg-background"
          onMouseDown={(event) => event.preventDefault()}
        >
          <SearchResults
            id={resultsId}
            query={query}
            hits={hits}
            total={total}
            active={active}
            layout={layout}
            onNavigate={onNavigate}
            onViewAll={goToResults}
            ready={ready}
          />
        </div>
      ) : null}
    </div>
  );
}

function SearchResults({
  id,
  query,
  hits,
  total,
  active,
  layout,
  ready,
  onNavigate,
  onViewAll,
}: {
  id: string;
  query: string;
  hits: SearchHit[];
  total: number;
  active: number;
  layout: "panel" | "overlay";
  ready: boolean;
  onNavigate?: () => void;
  onViewAll: () => void;
}) {
  if (query.length < SEARCH_MIN_LENGTH) {
    return layout === "overlay" ? (
      <p className="pt-8 text-sm text-muted-foreground">
        Search by name, brand, SKU, or item number.
      </p>
    ) : null;
  }

  if (hits.length > 0) {
    return (
      <div>
        <ul id={id} role="listbox" aria-label="Products">
          {hits.map((hit, index) => (
            <li key={hit.id} role="presentation">
              <Link
                id={`${id}-${hit.id}`}
                role="option"
                aria-selected={index === active}
                href={productSearchHref(hit)}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-4 py-3 transition-colors",
                  layout === "panel" && "px-4",
                  index === active ? "bg-surface" : "hover:bg-surface",
                )}
              >
                <span className="relative size-14 shrink-0 bg-surface">
                  <Image
                    src={hit.imageUrl}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-contain p-1"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium tracking-tight">
                    {hit.title}
                  </span>
                  <span className="mt-1 block truncate text-sm text-muted-foreground">
                    {hit.brandTitle} · {hit.itemNumber}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {total > hits.length ? (
          <button
            type="button"
            onClick={onViewAll}
            className={cn(
              "caption w-full border-t border-border/80 py-4 text-left tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-foreground",
              layout === "panel" && "px-4",
            )}
          >
            View all {total} results
          </button>
        ) : null}
      </div>
    );
  }

  if (!ready) {
    return null;
  }

  return (
    <p
      className={cn(
        "text-sm text-muted-foreground",
        layout === "overlay" ? "pt-8" : "px-4 py-5",
      )}
    >
      No products match “{query}”.
    </p>
  );
}
