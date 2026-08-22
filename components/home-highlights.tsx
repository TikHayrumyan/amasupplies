const ITEMS = [
  ["24/7 customer", "support"],
  ["Wholesale", "pricing"],
  ["Fast worldwide", "shipping"],
] as const;

export function HomeHighlights() {
  return (
    <section className="border-y border-border/80 bg-background">
      <div className="container mx-auto grid grid-cols-3 divide-x divide-border/80">
        {ITEMS.map(([first, second]) => (
          <p
            key={first}
            className="px-2 py-3 text-center text-[11px] leading-4 tracking-widest text-muted-foreground uppercase md:px-4 md:py-5 md:text-sm md:leading-normal md:tracking-[0.12em]"
          >
            <span className="md:hidden">
              {first}
              <br />
              {second}
            </span>
            <span className="hidden md:inline">
              {first} {second}
            </span>
          </p>
        ))}
      </div>
    </section>
  );
}
