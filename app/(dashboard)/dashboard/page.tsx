import { getHero } from "@/lib/hero";
import { updateHero } from "./actions";
import { HeroForm } from "./hero-form";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const params = await searchParams;
  const forbidden = params.error === "forbidden";
  const hero = await getHero();

  return (
    <div className="container mx-auto px-4 py-12">
      <p className="text-sm tracking-[0.12em] text-muted-foreground uppercase">
        Homepage
      </p>
      <h1 className="mt-2">Hero</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Image, video, or both. Video plays in front; image is used as the
        poster and as fallback.
      </p>
      {forbidden ? (
        <p className="mt-6 text-sm text-danger">
          Only an admin can manage accounts.
        </p>
      ) : null}
      <HeroForm
        hero={
          hero
            ? {
                title: hero.title,
                description: hero.description,
                imageUrl: hero.imageUrl,
                videoUrl: hero.videoUrl,
              }
            : null
        }
        action={updateHero}
      />
    </div>
  );
}
