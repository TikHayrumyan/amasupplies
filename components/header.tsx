import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { SearchBar } from "@/components/search-bar";
import { listPublishedCategories } from "@/lib/category";

export async function Header() {
  const categories = (await listPublishedCategories()).map((category) => ({
    title: category.title,
    slug: category.slug,
  }));

  return (
    <header className="sticky top-0 z-50 overflow-visible border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center px-4 md:h-16">
        <MainNav categories={categories} />
        <MobileNav categories={categories} />
      </div>
      <div className="hidden md:block">
        <SearchBar />
      </div>
    </header>
  );
}
