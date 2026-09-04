"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function FieldSelect({
  name,
  value,
  placeholder,
  options,
  onChange,
  variant = "box",
}: {
  name?: string;
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  variant?: "box" | "line";
}) {
  return (
    <>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            "w-full rounded-none shadow-none focus-visible:border-foreground focus-visible:ring-0 dark:hover:bg-transparent",
            variant === "box"
              ? "h-12 border-border bg-surface px-4 data-[placeholder]:text-muted-foreground/60"
              : "h-11 border-0 border-b border-border bg-transparent px-0",
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          align="start"
          position="popper"
          className="rounded-none border-border bg-background shadow-none"
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="rounded-none focus:bg-surface focus:text-foreground"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
