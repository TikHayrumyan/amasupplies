import { Fragment } from "react";

type JsonLdProps = {
  /** One schema object or an array of them. */
  data: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * Renders schema.org data as server-side <script type="application/ld+json">.
 *
 * The `<` escaping is the required XSS guard when embedding JSON in HTML.
 * Pass the output of any builder in schema.ts — a single object or an array.
 */
export function JsonLd({ data }: JsonLdProps) {
  const items = Array.isArray(data) ? data : [data];

  return (
    <>
      {items.map((item, index) => (
        <Fragment key={index}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(item).replace(/</g, "\\u003c"),
            }}
          />
        </Fragment>
      ))}
    </>
  );
}
