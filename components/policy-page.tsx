import type { Metadata } from "next";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { PolicyContent } from "@/components/policy-content";
import { getPolicy } from "@/components/policy-data";
import { crumbs } from "@/lib/breadcrumbs";
import type { PolicySlug } from "@/lib/policy-fields";

export function policyMetadata(slug: PolicySlug): Metadata {
  const policy = getPolicy(slug);

  return {
    title: `${policy.title} | AMA Supplies`,
    description: policy.description,
  };
}

export async function PolicyPage({ slug }: { slug: PolicySlug }) {
  const policy = getPolicy(slug);

  return (
    <div>
      <div className="container mx-auto px-4 pt-6 md:pt-8">
        <PageBreadcrumbs
          items={crumbs({ label: policy.navLabel, href: policy.href })}
        />
      </div>
      <PolicyContent policy={policy} />
    </div>
  );
}
