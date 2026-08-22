import { getHero } from "@/lib/hero";

export const dynamic = "force-dynamic";

export default async function Home() {
  const hero = await getHero();
  const hasMedia = Boolean(hero?.videoUrl || hero?.imageUrl);

  return (
    <section className="relative w-full">
      <div
        className={`relative min-h-[70vh] overflow-hidden ${
          hasMedia ? "bg-foreground" : "bg-surface"
        }`}
      >
        {hero?.videoUrl ? (
          <video
            className="absolute inset-0 size-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={hero.imageUrl ?? undefined}
          >
            <source src={hero.videoUrl} />
          </video>
        ) : hero?.imageUrl ? (
          <img
            src={hero.imageUrl}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        ) : null}

        {hasMedia ? (
          <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/15 to-transparent" />
        ) : null}

        <div
          className={`relative z-10 flex min-h-[70vh] items-end ${
            hasMedia ? "text-white" : "text-foreground"
          }`}
        >
          <div className="container mx-auto px-4 py-16 md:py-24">
            <h1 className="max-w-2xl text-4xl font-medium tracking-tight md:text-5xl">
              {hero?.title || "AmaSupplies"}
            </h1>
            {hero?.description ? (
              <p
                className={`mt-5 max-w-lg text-base leading-relaxed md:text-lg ${
                  hasMedia ? "text-white/80" : "text-muted-foreground"
                }`}
              >
                {hero.description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
