import { Search } from "lucide-react";
import Form from "next/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  return (
    <div className="border-t border-border bg-background">
      <Form
        action="/search"
        className="container mx-auto flex gap-2 px-4 py-2"
      >
        <Input
          type="search"
          name="query"
          placeholder="Search products..."
          aria-label="Search"
          className="h-10"
        />
        <Button
          type="submit"
          size="icon"
          className="size-10 shrink-0 md:hidden"
          aria-label="Search"
        >
          <Search strokeWidth={1.75} />
        </Button>
        <Button type="submit" size="lg" className="hidden shrink-0 md:inline-flex">
          <Search strokeWidth={1.75} />
          Search
        </Button>
      </Form>
    </div>
  );
}
