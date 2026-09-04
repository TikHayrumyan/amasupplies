import { ProductSearch } from "@/components/product-search";

export function SearchBar() {
  return (
    <div className="border-t border-border/80">
      <div className="container mx-auto px-4">
        <ProductSearch layout="panel" />
      </div>
    </div>
  );
}
