export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}
