import { AREAS, tierOf } from "./areas";
import { COUNTY_SHAPES } from "./county-shapes.generated";
import { SERVICE_RADIUS_MI, project, starPath, windowFor } from "./geo";

/**
 * The service-area map as a flat SVG string, for the social preview image.
 *
 * `next/og` rasterises through satori, which knows nothing of the document's
 * custom properties and has no fonts loaded for an embedded SVG. So this
 * carries literal colours rather than the `--land-*` tokens, and deliberately
 * contains **no `<text>`** — labels are composed on top of it as elements.
 *
 * The values below are the dark half of the palette in `app/globals.css`,
 * because the preview card is dark whatever theme the visitor is in. Change a
 * token there and change its twin here, or the card drifts from the site.
 */
const OG = {
  water: "#0a100e",
  unserved: "#221e19",
  outside: "#1b1815",
  stroke: "#100e0c",
  ember: "#e9853f",
  gold: "#d8ac5f",
  bone: "#f4efe7",
  /** `--land-tier-1` … `--land-tier-5`, cheapest band first. */
  tiers: ["#8fbca2", "#6d9d82", "#4f7f66", "#3a634f", "#2a4a3b"],
} as const;

export const OG_PALETTE = OG;

export function serviceAreaSvg(width: number, height: number): string {
  const win = windowFor(width, height);
  const priceOf = (slug: string | null) =>
    slug ? AREAS.find((a) => a.slug === slug)?.startingPayment : undefined;

  const counties = COUNTY_SHAPES.map((c) => {
    const payment = priceOf(c.slug);
    const fill =
      payment !== undefined
        ? OG.tiers[tierOf(payment)]
        : c.state === "GA"
          ? OG.outside
          : OG.unserved;
    return `<path d="${c.d}" fill="${fill}" stroke="${OG.stroke}" stroke-width="0.35"/>`;
  }).join("");

  const stars = AREAS.map((a) => {
    const p = project(a.lat, a.lon);
    return `<path d="${starPath(p.x, p.y, 4.6)}" fill="${OG.ember}" stroke="${OG.stroke}" stroke-width="0.6"/>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${win.minX} ${win.minY} ${win.width} ${win.height}" preserveAspectRatio="none">
  <rect x="${win.minX}" y="${win.minY}" width="${win.width}" height="${win.height}" fill="${OG.water}"/>
  ${counties}
  <circle cx="0" cy="0" r="50" fill="none" stroke="${OG.bone}" stroke-opacity="0.12" stroke-width="0.6" stroke-dasharray="2 3"/>
  <circle cx="0" cy="0" r="${SERVICE_RADIUS_MI}" fill="none" stroke="${OG.ember}" stroke-opacity="0.75" stroke-width="1.4" stroke-dasharray="7 4"/>
  ${stars}
  <circle cx="0" cy="0" r="8" fill="${OG.gold}" fill-opacity="0.18"/>
  <circle cx="0" cy="0" r="3.4" fill="${OG.gold}"/>
</svg>`;
}

/** The same SVG as an inline data URI. */
export function serviceAreaDataUri(width: number, height: number): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(serviceAreaSvg(width, height))}`;
}

/** Where an area lands, in pixels, inside a `width × height` render of the map. */
export function pixelFor(
  lat: number,
  lon: number,
  width: number,
  height: number,
): { left: number; top: number } {
  const p = project(lat, lon);
  const win = windowFor(width, height);
  return {
    left: ((p.x - win.minX) / win.width) * width,
    top: ((p.y - win.minY) / win.height) * height,
  };
}
