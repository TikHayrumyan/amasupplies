/**
 * SEO toolkit — single entry point.
 *
 *   import { createMetadata, JsonLd, productSchema } from "@/lib/seo"
 *
 * - config:   seo, schemaIds, absoluteUrl, asDate  (one source of truth)
 * - metadata: createMetadata                        (per-page <head> metadata)
 * - schema:   *Schema builders                      (JSON-LD objects)
 * - json-ld:  <JsonLd />                            (renders schema safely)
 */
export { seo, schemaIds, absoluteUrl, asDate } from "./config";
export { createMetadata } from "./metadata";
export {
  localBusinessSchema,
  websiteSchema,
  webPageSchema,
  productSchema,
  itemListSchema,
  faqSchema,
  blogSchema,
  blogPostingSchema,
  breadcrumbSchema,
} from "./schema";
export { JsonLd } from "./json-ld";
