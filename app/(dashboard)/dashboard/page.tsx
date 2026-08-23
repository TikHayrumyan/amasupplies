import Link from "next/link";
import { listBrands } from "@/lib/brand";
import { getHero } from "@/lib/hero";
import { updateHero } from "./actions";
import { BrandManager } from "./brand-manager";
import { HeroEditor } from "./hero-editor";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const params = await searchParams;
  const forbidden = params.error === "forbidden";
  const [hero, brands] = await Promise.all([getHero(), listBrands()]);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="mt-2 font-medium tracking-tight">Home</h1>
          <p className="text-sm tracking-[0.12em] text-muted-foreground uppercase">
          Edit the Homepage sections
          </p>
          
        </div>
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="caption tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:text-foreground"
        >
          View site
        </Link>
      </div>

      {forbidden ? (
        <p className="mt-8 text-sm text-danger">
          Only an admin can manage accounts.
        </p>
      ) : null}

      <section className="mt-14 border-t border-border/80 pt-12">
        <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
          01 · Hero banner
        </p>
        <p className="mt-3 max-w-xl text-muted-foreground">
          One background — image or video — plus the title and line of copy
          over it.
        </p>
        <div className="mt-10">
          <HeroEditor
            hero={
              hero
                ? {
                    title: hero.title,
                    description: hero.description,
                    imageUrl: hero.imageUrl,
                    videoUrl: hero.videoUrl,
                    updatedAt: hero.updatedAt,
                  }
                : null
            }
            action={updateHero}
          />
        </div>
      </section>

      <section className="mt-14 border-t border-border/80 pt-12">
        <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
          02 · Trusted brands
        </p>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Logos in the homepage marquee. Drag to set the order shoppers see.
        </p>
        <BrandManager
          key={brands.map((brand) => `${brand.id}-${brand.sortOrder}-${brand.updatedAt}`).join()}
          brands={brands}
        />
      </section>
    </div>
  );
}
