import { Search } from "lucide-react";
import Form from "next/form";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  return (
    <div className="border-t border-border/80">
      <Form
        action="/search"
        className="container mx-auto flex h-12 items-center gap-3 px-4"
      >
        <Search
          className="size-4 shrink-0 text-muted-foreground"
          strokeWidth={1.5}
        />
        <Input
          type="search"
          name="query"
          placeholder="Search"
          aria-label="Search"
          variant="ghost"
        />
      </Form>
    </div>
  );
}
