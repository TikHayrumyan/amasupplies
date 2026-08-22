export default function AuthLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <div className="min-h-full bg-surface text-foreground">{children}</div>
  );
}
