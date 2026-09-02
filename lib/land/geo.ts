/**
 * Map projection helpers for the land-and-home map on `/land-deals`.
 *
 * The map is drawn in a flat projection where **1 SVG unit = 1 statute mile**
 * on the ground. That makes the service-area ring literally `r={100}` and keeps
 * every marker geographically honest relative to the dealership.
 *
 * Over the ~115 mile field we draw, the error between this flat projection and
 * true great-circle distance is under half a mile, so it is accurate enough to
 * publish mileage next to it.
 */

/**
 * The dealership's lot. Everything on the map is measured from here, so this
 * has to be the address in `lib/site.ts` — a map centred on a town the
 * business does not trade from is worse than no map. Moving it means
 * regenerating the county boundaries; see `scripts/generate-county-shapes.py`.
 */
export const HQ = {
  lat: 29.6516,
  lon: -82.3248,
  city: "Gainesville",
  state: "FL",
} as const;

/** Radius of the service area, in miles. */
export const SERVICE_RADIUS_MI = 100;

const MI_PER_DEG_LAT = 69.0;
const MI_PER_DEG_LON = 69.172 * Math.cos((HQ.lat * Math.PI) / 180); // ≈ 60.11 at HQ

export type Point = { x: number; y: number };

/** Project a lat/lon to map units (miles east / miles south of the dealership). */
export function project(lat: number, lon: number): Point {
  return {
    x: (lon - HQ.lon) * MI_PER_DEG_LON,
    y: -(lat - HQ.lat) * MI_PER_DEG_LAT,
  };
}

/** Great-circle distance in miles between two coordinates. */
export function milesFromHQ(lat: number, lon: number): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat - HQ.lat);
  const dLon = toRad(lon - HQ.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(HQ.lat)) * Math.cos(toRad(lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** `[lat, lon]` pairs → an SVG path. */
export function toPath(coords: readonly (readonly [number, number])[], close = false): string {
  const d = coords
    .map(([lat, lon], i) => {
      const p = project(lat, lon);
      return `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
    })
    .join(" ");
  return close ? `${d} Z` : d;
}

/** A five-pointed star centred on (cx, cy). */
export function starPath(cx: number, cy: number, outer: number, inner = outer * 0.4): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (-90 + i * 36) * (Math.PI / 180);
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join(" L")} Z`;
}

/** The drawn field: everything worth showing around the dealership, in miles. */
export const VIEW = {
  minX: -118,
  minY: -108,
  width: 236,
  height: 216,
  get viewBox() {
    return `${this.minX} ${this.minY} ${this.width} ${this.height}`;
  },
} as const;

/**
 * The map window to use for a given pixel box, grown (never cropped) on one
 * axis so the field is never distorted. Renderers that stretch the SVG to fill
 * their box — the social image does — must project through this same window.
 */
export function windowFor(width: number, height: number) {
  const want = width / height;
  const have = VIEW.width / VIEW.height;
  let w = VIEW.width;
  let h = VIEW.height;
  if (want > have) w = VIEW.height * want;
  else h = VIEW.width / want;
  return { minX: -w / 2, minY: VIEW.minY + (VIEW.height - h) / 2, width: w, height: h };
}
