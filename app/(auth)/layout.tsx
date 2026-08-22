export default function AuthLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <div className="flex-1 min-h-screen bg-surface text-foreground">{children}</div>
  );
}
