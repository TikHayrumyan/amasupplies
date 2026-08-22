export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const { query } = await searchParams;
  const q = typeof query === "string" ? query : "";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1>Search</h1>
      <p className="mt-2 text-muted-foreground">
        {q ? `Results for “${q}”` : "Enter a search query."}
      </p>
    </div>
  );
}
