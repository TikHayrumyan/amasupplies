import { HeroBanner } from "@/components/hero-banner";
import { HomeHighlights } from "@/components/home-highlights";
import { getHero } from "@/lib/hero";

export const dynamic = "force-dynamic";

export default async function Home() {
  const hero = await getHero();

  return (
    <>
      <section className="relative w-full">
        <HeroBanner
          title={hero?.title ?? ""}
          description={hero?.description ?? ""}
          imageUrl={hero?.imageUrl}
          videoUrl={hero?.videoUrl}
        />
      </section>
      <HomeHighlights />
    </>
  );
}
