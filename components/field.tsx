import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
  className,
  error,
  htmlFor,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  error?: string;
  htmlFor?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <label
        htmlFor={htmlFor}
        className="caption tracking-[0.16em] text-muted-foreground uppercase"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
