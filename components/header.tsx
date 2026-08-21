import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { SearchBar } from "@/components/search-bar";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background shadow-sm">
      <div className="container mx-auto flex h-14 items-center px-4">
        <MainNav />
        <MobileNav />
      </div>
      <SearchBar />
    </header>
  );
}
