import { absoluteUrl, schemaIds, seo } from "./config";

/**
 * JSON-LD (schema.org) builders.
 *
 * Each function returns a plain object ready to be passed to <JsonLd />.
 * The business and website nodes are rendered on every public page by the store
 * layout; page-level nodes reference them by @id instead of repeating the data.
 *
 * Product nodes do not include an Offer. Wholesale prices are shown only to
 * approved accounts, and a placeholder price would be invalid structured data.
 */

type Thing = Record<string, unknown>;

const inLanguage = "en-US";

function areaServed() {
  return seo.business.areaServed.map((area) => ({
    "@type": area.type,
    name: area.name,
  }));
}

/** Full business identity. Every other node references it by @id. */
export function localBusinessSchema(): Thing {
  const { business } = seo;

  return {
    "@context": "https://schema.org",
    "@type": "WholesaleStore",
    "@id": schemaIds.organization,
    name: business.legalName,
    url: seo.siteUrl,
    image: absoluteUrl(seo.ogImage.url),
    logo: { "@type": "ImageObject", url: absoluteUrl(business.logo) },
    description: seo.description,
    email: business.email,
    telephone: business.telephone,
    currenciesAccepted: business.currenciesAccepted,
    paymentAccepted: business.paymentAccepted,
    address: { "@type": "PostalAddress", ...business.address },
    areaServed: areaServed(),
    openingHoursSpecification: business.openingHours.map((hours) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [...hours.days],
      opens: hours.opens,
      closes: hours.closes,
    })),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: business.telephone,
      email: business.email,
      areaServed: "US",
      availableLanguage: "English",
    },
    sameAs: [...business.sameAs],
  };
}

/** Site-level WebSite node, published by the business. */
export function websiteSchema(): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": schemaIds.website,
    url: seo.siteUrl,
    name: seo.siteName,
    description: seo.description,
    inLanguage,
    publisher: { "@id": schemaIds.organization },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${seo.siteUrl}/search?query={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

type WebPageInput = {
  path: string;
  name: string;
  description: string;
  type?:
    | "WebPage"
    | "AboutPage"
    | "ContactPage"
    | "CollectionPage"
    | "SearchResultsPage";
  /** Only pass a real content date. */
  dateModified?: Date;
};

/** The page itself, tied to the website and the business it is about. */
export function webPageSchema({
  path,
  name,
  description,
  type = "WebPage",
  dateModified,
}: WebPageInput): Thing {
  const url = absoluteUrl(path);
  const business = { "@id": schemaIds.organization };
  const aboutBusiness = type === "AboutPage" || type === "ContactPage";

  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage,
    isPartOf: { "@id": schemaIds.website },
    ...(aboutBusiness ? { mainEntity: business } : { about: business }),
    ...(dateModified ? { dateModified: dateModified.toISOString() } : {}),
  };
}

type ProductSchemaInput = {
  path: string;
  name: string;
  description: string;
  images?: readonly string[];
  sku?: string;
  itemNumber?: string;
  brand?: string;
  category?: string;
};

/** A catalog product. Price is omitted because it is not public. */
export function productSchema({
  path,
  name,
  description,
  images = [],
  sku,
  itemNumber,
  brand,
  category,
}: ProductSchemaInput): Thing {
  const url = absoluteUrl(path);
  const image = images.filter(Boolean).map((item) => absoluteUrl(item));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${url}#webpage` },
    ...(image.length > 0 ? { image } : {}),
    ...(sku ? { sku } : {}),
    ...(itemNumber ? { mpn: itemNumber } : {}),
    ...(brand ? { brand: { "@type": "Brand", name: brand } } : {}),
    ...(category ? { category } : {}),
  };
}

type ItemListInput = {
  path: string;
  name: string;
  items: readonly { name: string; path: string }[];
};

/** Ordered list of the links the page actually renders. */
export function itemListSchema({ path, name, items }: ItemListInput): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: absoluteUrl(path),
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

/** FAQ rich result. Pass the same list the page renders visually. */
export function faqSchema(
  faqs: readonly { question: string; answer: string }[],
): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

const blogId = `${seo.siteUrl}/blog#blog`;

/** Blog index. Lists the posts shown on the page. */
export function blogSchema(
  posts: readonly { title: string; path: string }[],
): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": blogId,
    name: `${seo.siteName} Blog`,
    url: absoluteUrl("/blog"),
    inLanguage,
    publisher: { "@id": schemaIds.organization },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: absoluteUrl(post.path),
    })),
  };
}

type BlogPostingInput = {
  path: string;
  title: string;
  description: string;
  image?: string | null;
  publishedAt?: Date;
  updatedAt?: Date;
  author?: string | null;
  section?: string | null;
};

/** A single article, linked to the business as publisher. */
export function blogPostingSchema({
  path,
  title,
  description,
  image,
  publishedAt,
  updatedAt,
  author,
  section,
}: BlogPostingInput): Thing {
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: { "@id": blogId },
    ...(image ? { image: [absoluteUrl(image)] } : {}),
    ...(publishedAt ? { datePublished: publishedAt.toISOString() } : {}),
    ...(updatedAt ? { dateModified: updatedAt.toISOString() } : {}),
    author: author
      ? { "@type": "Person", name: author }
      : { "@id": schemaIds.organization },
    publisher: { "@id": schemaIds.organization },
    ...(section ? { articleSection: section } : {}),
    inLanguage,
  };
}

/** Breadcrumb trail. Items are ordered from the homepage down to the page. */
export function breadcrumbSchema(
  items: readonly { name: string; path: string }[],
): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
