/* eslint-disable @next/next/no-img-element */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { seo } from "@/lib/seo";

export const alt = seo.ogImage.alt;
export const size = {
  width: seo.ogImage.width,
  height: seo.ogImage.height,
};
export const contentType = "image/png";

const logo = await readFile(
  join(process.cwd(), "public/logo/ama-logo-bg.png"),
  "base64",
);
const logoUrl = `data:image/png;base64,${logo}`;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          background: "#ffffff",
          color: "#0f172a",
        }}
      >
        <div
          style={{
            width: 18,
            height: "100%",
            background: "#0057ff",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            width: "100%",
            padding: "52px 64px",
          }}
        >
          <img
            src={logoUrl}
            alt=""
            width={460}
            height={250}
            style={{ objectFit: "contain", objectPosition: "left center" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 58,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: -1,
              }}
            >
              Wholesale medical supplies
            </div>
            <div
              style={{
                marginTop: 16,
                fontSize: 32,
                fontWeight: 600,
                color: "#0057ff",
              }}
            >
              Glendale, California
            </div>
            <div
              style={{
                marginTop: 14,
                fontSize: 26,
                color: "#64748b",
              }}
            >
              Approved healthcare accounts. Nationwide shipping.
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
