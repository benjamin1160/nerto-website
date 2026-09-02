import { ImageResponse } from "next/og";
import { money } from "@/lib/format";
import { AREAS, CHEAPEST, areaBySlug } from "@/lib/land/areas";
import { HQ, SERVICE_RADIUS_MI, starPath } from "@/lib/land/geo";
import { OG_PALETTE, pixelFor, serviceAreaDataUri } from "@/lib/land/static-map";
import { site } from "@/lib/site";

export const alt = `Map of ${AREAS.length} counties within ${SERVICE_RADIUS_MI} miles of ${HQ.city}, with starting monthly payments for land-and-home packages`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MAP_W = 600;
const MAP_H = size.height;

const { bone: BONE, ember: EMBER, gold: GOLD } = OG_PALETTE;
const MUTED = "#9c9285";
const PAPER = "#100e0c";

/** Counties called out by name on the preview, and where their label sits. */
const CALLOUTS: { slug: string; as?: string; place: "above" | "below"; dy?: number }[] = [
  { slug: "taylor", place: "above" },
  { slug: "suwannee", place: "above", dy: -28 },
  { slug: "dixie", place: "below" },
  { slug: "alachua", as: HQ.city, place: "above" },
  { slug: "marion", place: "above" },
  { slug: "citrus", place: "below" },
  { slug: "st-johns", place: "above" },
  { slug: "flagler", place: "below" },
];

const starMark = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="-11 -11 22 22"><path d="${starPath(
    0,
    0,
    10,
  )}" fill="${EMBER}"/></svg>`,
)}`;

/**
 * The social card for `/land-deals`: the pitch on the left, the service-area
 * map on the right. Satori has no CSS variables and no webfonts loaded here,
 * so the colours are literals from `lib/land/static-map.ts` and the type is
 * the same generic serif/sans pair the site-wide card uses.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: PAPER,
          fontFamily: "sans-serif",
          color: BONE,
        }}
      >
        {/* ── Left: the pitch ── */}
        <div
          style={{
            width: size.width - MAP_W,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "52px 48px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={starMark} width={26} height={26} alt="" />
            <div style={{ display: "flex", fontSize: 19, letterSpacing: 3 }}>
              {site.short.toUpperCase()}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontFamily: "serif",
                fontSize: 78,
                lineHeight: 1.0,
                letterSpacing: -2,
              }}
            >
              <div style={{ display: "flex" }}>Land + home.</div>
              <div style={{ display: "flex", color: EMBER }}>One loan.</div>
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 22,
                fontSize: 23,
                lineHeight: 1.35,
                color: MUTED,
                maxWidth: 480,
              }}
            >
              What it takes to get into a home on your own land — {AREAS.length} counties inside{" "}
              {SERVICE_RADIUS_MI} miles of {HQ.city}.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <div style={{ display: "flex", fontSize: 20, letterSpacing: 3, color: MUTED }}>
                FROM
              </div>
              <div style={{ display: "flex", fontFamily: "serif", fontSize: 72, color: GOLD }}>
                {money(CHEAPEST.startingPayment)}
              </div>
              <div style={{ display: "flex", fontSize: 26, color: MUTED }}>/mo</div>
            </div>
            <div style={{ display: "flex", fontSize: 20, color: MUTED }}>
              {CHEAPEST.county} County · land and home in one payment
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", width: 46, height: 4, backgroundColor: EMBER }} />
            <div style={{ display: "flex", fontSize: 17, letterSpacing: 2.4, color: BONE }}>
              SEE YOUR COUNTY. GET PRE-APPROVED.
            </div>
          </div>
        </div>

        {/* ── Right: the map ── */}
        <div style={{ position: "relative", display: "flex", width: MAP_W, height: MAP_H }}>
          <img src={serviceAreaDataUri(MAP_W, MAP_H)} width={MAP_W} height={MAP_H} alt="" />

          {CALLOUTS.map(({ slug, as, place, dy = 0 }) => {
            const a = areaBySlug(slug);
            if (!a) return null;
            const p = pixelFor(a.lat, a.lon, MAP_W, MAP_H);
            const isLot = a.seat === HQ.city;
            return (
              <div
                key={slug}
                style={{
                  position: "absolute",
                  left: p.left - 66,
                  top: p.top + (place === "above" ? -54 : 14) + dy,
                  width: 132,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontFamily: "serif",
                    fontSize: 27,
                    lineHeight: 1,
                    color: GOLD,
                  }}
                >
                  {money(a.startingPayment)}
                </div>
                <div
                  style={{
                    display: "flex",
                    marginTop: 3,
                    fontSize: 12,
                    letterSpacing: 1.4,
                    color: isLot ? GOLD : BONE,
                  }}
                >
                  {(as ?? a.county).toUpperCase()}
                </div>
              </div>
            );
          })}

          <div
            style={{
              position: "absolute",
              left: 26,
              top: MAP_H - 58,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", fontSize: 15, letterSpacing: 2, color: EMBER }}>
              {SERVICE_RADIUS_MI}-MILE DELIVERY RADIUS
            </div>
            <div style={{ display: "flex", fontSize: 14, color: MUTED }}>
              {HQ.city}, {HQ.state}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
