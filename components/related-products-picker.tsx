"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  RELATED_PRODUCT_MAX,
  type RelatedProductOption,
} from "@/lib/product-fields";

export function RelatedProductsPicker({
  catalog,
  productId,
  selectedIds,
  onChange,
  legend = "You may also like",
  hint,
  max = RELATED_PRODUCT_MAX,
}: {
  catalog: RelatedProductOption[];
  productId: number | null;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  legend?: string;
  hint?: string;
  max?: number;
}) {
  const [query, setQuery] = useState("");
  const selectedSet = new Set(selectedIds);
  const options = catalog.filter((row) => row.id !== productId);
  const byId = new Map(options.map((row) => [row.id, row]));
  const selected = selectedIds.flatMap((id) => {
    const row = byId.get(id);
    return row ? [row] : [];
  });
  const needle = query.trim().toLowerCase();
  const available = options.filter((row) => {
    if (selectedSet.has(row.id)) {
      return false;
    }
    if (!needle) {
      return true;
    }
    return (
      row.title.toLowerCase().includes(needle) ||
      row.itemNumber.toLowerCase().includes(needle) ||
      row.categoryTitle.toLowerCase().includes(needle)
    );
  });
  const atLimit = selectedIds.length >= max;

  function add(id: number) {
    if (atLimit || selectedSet.has(id)) {
      return;
    }
    onChange([...selectedIds, id]);
  }

  function remove(id: number) {
    onChange(selectedIds.filter((current) => current !== id));
  }

  return (
    <fieldset>
      <legend className="caption tracking-[0.16em] text-muted-foreground uppercase">
        {legend}
      </legend>
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="relatedProductId" value={id} />
      ))}
      {options.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Add a product first, then pick it here. Any category or type is fine.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            {hint ??
              `Choose up to ${max} products to show on this product page. They can be from any category or type.`}
          </p>
          {selected.length > 0 ? (
            <ul className="space-y-2">
              {selected.map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-4 border border-border bg-surface px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm">{row.title}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {row.categoryTitle} · {row.itemNumber}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${row.title}`}
                    onClick={() => remove(row.id)}
                    className="inline-flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products"
            variant="box"
          />
          {atLimit ? (
            <p className="text-sm text-muted-foreground">
              Maximum of {max} products selected.
            </p>
          ) : available.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {query.trim()
                ? "No matching products."
                : "All other products are already selected."}
            </p>
          ) : (
            <ul className="max-h-64 overflow-y-auto border border-border">
              {available.map((row) => (
                <li key={row.id} className="border-b border-border last:border-b-0">
                  <button
                    type="button"
                    onClick={() => add(row.id)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-surface"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm">{row.title}</span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">
                        {row.categoryTitle} · {row.itemNumber}
                      </span>
                    </span>
                    <span className="caption shrink-0 tracking-[0.16em] text-muted-foreground uppercase">
                      Add
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </fieldset>
  );
}
