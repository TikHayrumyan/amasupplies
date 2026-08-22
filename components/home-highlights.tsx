const ITEMS = [
  "24/7 customer support",
  "Wholesale pricing",
  "Fast worldwide shipping",
] as const;

export function HomeHighlights() {
  return (
    <section className="border-y border-border/80 bg-background">
      <div className="container mx-auto grid grid-cols-1 divide-y divide-border/80 md:grid-cols-3 md:divide-x md:divide-y-0">
        {ITEMS.map((item) => (
          <p
            key={item}
            className="px-4 py-5 text-center text-sm tracking-[0.12em] text-muted-foreground uppercase"
          >
            {item}
          </p>
        ))}
      </div>
    </section>
  );
}
