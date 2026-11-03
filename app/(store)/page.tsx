import { BestSellingItems } from "@/components/best-selling-items";
import { FAQ_PREVIEW, faqSchemaItems } from "@/components/faq-data";
import { HeroBanner } from "@/components/hero-banner";
import { HomeHighlights } from "@/components/home-highlights";
import { HomeInfoBar } from "@/components/home-info-bar";
import { ShopByCategory } from "@/components/shop-by-category";
import { HomeFaq } from "@/components/home-faq";
import { TrustedBrands } from "@/components/trusted-brands";
import { WhoWeAre } from "@/components/who-we-are";
import { getHero } from "@/lib/hero";
import { createMetadata, faqSchema, JsonLd, seo, webPageSchema } from "@/lib/seo";

const title = "Wholesale Medical Supply Distributor";
const description = seo.description;

export const metadata = createMetadata({ title, description, path: "/" });

export const revalidate = 3600;

export default async function Home() {
  const hero = await getHero();

  return (
    <>
      <JsonLd
        data={[
          webPageSchema({ path: "/", name: title, description }),
          faqSchema(faqSchemaItems(FAQ_PREVIEW)),
        ]}
      />
      <section className="relative w-full">
        <HeroBanner
          title={hero?.title ?? ""}
          description={hero?.description ?? ""}
          imageUrl={hero?.imageUrl}
          videoUrl={hero?.videoUrl}
        />
      </section>
      <HomeHighlights />
      <ShopByCategory />
      <HomeInfoBar />
      <BestSellingItems />
      <WhoWeAre />
      <TrustedBrands />
      <HomeFaq />
    </>
  );
}
