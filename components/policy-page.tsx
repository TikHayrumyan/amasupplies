import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { PolicyContent } from "@/components/policy-content";
import { getPolicy } from "@/components/policy-data";
import { crumbs } from "@/lib/breadcrumbs";
import type { PolicySlug } from "@/lib/policy-fields";
import {
  breadcrumbSchema,
  createMetadata,
  JsonLd,
  webPageSchema,
} from "@/lib/seo";

export function policyMetadata(slug: PolicySlug) {
  const policy = getPolicy(slug);

  return createMetadata({
    title: policy.title,
    description: policy.description,
    path: policy.href,
  });
}

export async function PolicyPage({ slug }: { slug: PolicySlug }) {
  const policy = getPolicy(slug);

  return (
    <div>
      <JsonLd
        data={[
          webPageSchema({
            path: policy.href,
            name: policy.title,
            description: policy.description,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: policy.navLabel, path: policy.href },
          ]),
        ]}
      />
      <div className="container mx-auto px-4 pt-6 md:pt-8">
        <PageBreadcrumbs
          items={crumbs({ label: policy.navLabel, href: policy.href })}
        />
      </div>
      <PolicyContent policy={policy} />
    </div>
  );
}
