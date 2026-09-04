import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { crumbs } from "@/lib/breadcrumbs";

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <PageBreadcrumbs items={crumbs({ label: "Blog", href: "/blog" })} />
      <h1 className="mt-8 font-medium tracking-tight">Blog</h1>
    </div>
  );
}
