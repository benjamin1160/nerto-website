import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  /* The same mark the header wears, read from `public/` because the OG
     route renders at build time with no origin to fetch it from. */
  const logo = await readFile(join(process.cwd(), "public", "logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(140deg, #17140f 0%, #2b2118 55%, #6d3a1c 100%)",
          padding: 72,
          color: "#f7f4ef",
          fontFamily: "serif",
        }}
      >
        {/* The logo's wordmark is black, so it sits on its white plate here
            as it does on a dark header. */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              background: "#ffffff",
              borderRadius: 16,
              padding: "12px 20px",
            }}
          >
            <img src={logoSrc} alt="" width={260} height={129} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 84, lineHeight: 1.02, letterSpacing: -3, maxWidth: 900 }}>
            Built indoors. Better because of it.
          </span>
          <span
            style={{
              marginTop: 28,
              fontSize: 28,
              color: "rgba(247,244,239,0.72)",
              fontFamily: "sans-serif",
              maxWidth: 820,
            }}
          >
            Manufactured homes — {site.address.city}, {site.address.region}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 40,
            fontFamily: "monospace",
            fontSize: 20,
            color: "rgba(247,244,239,0.55)",
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          <span>2×6 walls</span>
          <span>·</span>
          <span>HERS 36—52</span>
          <span>·</span>
          <span>11 weeks plant to keys</span>
        </div>
      </div>
    ),
    size,
  );
}
