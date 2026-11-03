import {
  ADDRESS_STREET,
  EMAIL_DISPLAY,
  FACEBOOK_HREF,
  GOOGLE_BUSINESS_HREF,
  INSTAGRAM_HREF,
  PHONE_HREF,
} from "@/lib/contact";

/**
 * Single source of truth for all SEO data.
 *
 * Everything that search engines read — canonical domain, business NAP
 * (name / address / phone), opening hours, social profiles and the default
 * social-share image — lives here. Metadata and JSON-LD builders read from
 * this object, so there is never more than one place to update.
 *
 * `NEXT_PUBLIC_SITE_URL` overrides the canonical origin when it is an https
 * origin with no path. Otherwise the production domain is used, including in
 * local development, so canonicals never point at localhost.
 */
const DEFAULT_SITE_URL = "https://amasupplies.com";

function resolveSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(
    /\/+$/,
    "",
  );
  if (configured && /^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(configured)) {
    return configured;
  }
  return DEFAULT_SITE_URL;
}

export const seo = {
  siteUrl: resolveSiteUrl(),
  siteName: "AMA Supplies",
  locale: "en_US",
  description:
    "AMA Supplies is a nationwide distributor of medical and facility supplies, built exclusively for approved business customers across the United States.",

  /** Default Open Graph / Twitter share image (served by app/opengraph-image). */
  ogImage: {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: "AMA Supplies wholesale medical supplies in Glendale, California",
  },

  /** Business NAP + profile. Mirrors the public contact details. */
  business: {
    legalName: "AMA Supplies",
    email: EMAIL_DISPLAY,
    /** E.164 phone, derived from the single tel: href in lib/contact. */
    telephone: PHONE_HREF.replace("tel:", ""),
    logo: "/logo/ama-logo-bg.png",
    address: {
      streetAddress: ADDRESS_STREET,
      addressLocality: "Glendale",
      addressRegion: "CA",
      postalCode: "91204",
      addressCountry: "US",
    },
    /** Pin coordinates from the Google Business Profile. */
    geo: { latitude: 34.1322291, longitude: -118.2611207 },
    map: GOOGLE_BUSINESS_HREF,
    openingHours: [
      {
        days: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "09:00",
        closes: "18:00",
      },
      {
        days: ["Saturday"],
        opens: "10:00",
        closes: "16:00",
      },
    ],
    areaServed: [
      { type: "Country", name: "United States" },
      { type: "State", name: "California" },
      { type: "City", name: "Glendale" },
      { type: "City", name: "Los Angeles" },
    ],
    paymentAccepted: "Bank transfer, Zelle, check, and credit card",
    currenciesAccepted: "USD",
    sameAs: [GOOGLE_BUSINESS_HREF, FACEBOOK_HREF, INSTAGRAM_HREF],
  },
} as const;

/** Stable @id anchors used to cross-link nodes in the JSON-LD graph. */
export const schemaIds = {
  organization: `${seo.siteUrl}/#organization`,
  website: `${seo.siteUrl}/#website`,
} as const;

/** Joins a relative path with the canonical origin. `absoluteUrl("/x") → https://.../x`. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${seo.siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Parses a database date. Returns undefined when the value is missing or invalid. */
export function asDate(
  value: Date | string | null | undefined,
): Date | undefined {
  if (value == null || value === "") return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
