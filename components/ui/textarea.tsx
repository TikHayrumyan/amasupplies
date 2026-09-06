import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-36 w-full resize-y rounded-none border border-border bg-surface px-4 py-3 text-base outline-none transition-[color,background-color,border-color] placeholder:text-muted-foreground/60 focus-visible:border-foreground focus-visible:bg-background disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
