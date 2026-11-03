import type { Metadata } from "next";

import { absoluteUrl, seo } from "./config";

type CreateMetadataInput = {
  /** Page title without the brand. The site name is appended automatically. */
  title: string;
  description: string;
  /** Canonical path, e.g. "/products". Defaults to the homepage. */
  path?: string;
  /**
   * Optional page-specific share image. Falls back to the site default. Leave
   * width and height out unless they are the real pixel size.
   */
  image?: { url: string; width?: number; height?: number; alt?: string };
  /** Set true for pages that must stay out of the search index. */
  noIndex?: boolean;
  /** Use the title exactly as given, e.g. a hand-written product SEO title. */
  omitBrand?: boolean;
};

/** Longest title Google shows in full on desktop results. */
const maxTitleLength = 60;

function pageTitle(title: string, omitBrand: boolean): string {
  if (omitBrand || title.includes(seo.siteName)) return title;
  const branded = `${title} | ${seo.siteName}`;
  return branded.length > maxTitleLength ? title : branded;
}

/**
 * Builds a complete, per-page {@link Metadata} object (title, canonical, Open
 * Graph, Twitter, robots) from a handful of fields.
 *
 * The brand suffix is applied here rather than via the layout's `title.template`
 * on purpose: the template is NOT applied to the homepage (it shares the root
 * segment with the layout), so baking the suffix here keeps every page — home
 * and nested alike — perfectly consistent. Keeping canonical here, never in the
 * layout, guarantees each page points at its own URL.
 */
export function createMetadata({
  title,
  description,
  path = "/",
  image,
  noIndex = false,
  omitBrand = false,
}: CreateMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const ogImage = image ?? seo.ogImage;
  const fullTitle = pageTitle(title, omitBrand);

  return {
    title: fullTitle,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: seo.siteName,
      locale: seo.locale,
      title: fullTitle,
      description,
      images: [
        {
          url: ogImage.url,
          width: ogImage.width,
          height: ogImage.height,
          alt: ogImage.alt ?? seo.ogImage.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [{ url: ogImage.url, alt: ogImage.alt ?? seo.ogImage.alt }],
    },
    robots: noIndex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}
