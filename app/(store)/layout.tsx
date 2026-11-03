import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd, localBusinessSchema, websiteSchema } from "@/lib/seo";

export const revalidate = 3600;

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <JsonLd data={[localBusinessSchema(), websiteSchema()]} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
