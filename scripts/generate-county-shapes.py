"""Turn the US county GeoJSON into projected SVG paths for the service-area map.

Everything is baked at generation time: projection, simplification, rounding.
The app ships path strings in map units (1 unit = 1 mile) and never sees GeoJSON.
"""
import json, math, pathlib, sys

# Download once:
#   curl -o counties.json \
#     https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json
SRC = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "counties.json")
OUT = pathlib.Path(__file__).parent.parent / "lib/land/county-shapes.generated.ts"

HQ_LAT, HQ_LON = 44.2896, -69.7736
MI_PER_DEG_LAT = 69.0
MI_PER_DEG_LON = 69.172 * math.cos(math.radians(HQ_LAT))

# Generous window: a little beyond what the map ever shows.
X_MIN, X_MAX = -150, 150
Y_MIN, Y_MAX = -140, 140

HOME_STATE = "ME"
STATES = {"23": "ME", "33": "NH", "50": "VT", "25": "MA"}

# Counties that carry pricing, keyed by the slug used in lib/land/areas.ts.
# Empty: NERTO publishes no county pricing, so `areas.ts` carries none and
# `/land-deals` is switched off in lib/page-config.ts. Fill this in at the
# same time as areas.ts and regenerate.
PRICED = {}


def project(lon, lat):
    return ((lon - HQ_LON) * MI_PER_DEG_LON, -(lat - HQ_LAT) * MI_PER_DEG_LAT)


def simplify(pts, tol):
    """Douglas-Peucker."""
    if len(pts) < 3:
        return pts
    ax, ay = pts[0]
    bx, by = pts[-1]
    dx, dy = bx - ax, by - ay
    span = math.hypot(dx, dy)
    worst, idx = 0.0, 0
    for i in range(1, len(pts) - 1):
        px, py = pts[i]
        if span == 0:
            d = math.hypot(px - ax, py - ay)
        else:
            d = abs(dy * px - dx * py + bx * ay - by * ax) / span
        if d > worst:
            worst, idx = d, i
    if worst <= tol:
        return [pts[0], pts[-1]]
    return simplify(pts[: idx + 1], tol)[:-1] + simplify(pts[idx:], tol)


def ring_area(pts):
    a = 0.0
    for i in range(len(pts)):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % len(pts)]
        a += x1 * y2 - x2 * y1
    return abs(a) / 2


def rings_of(geom):
    if geom["type"] == "Polygon":
        return geom["coordinates"]
    return [ring for poly in geom["coordinates"] for ring in poly]


data = json.loads(SRC.read_text())
print("features:", len(data["features"]))
print("sample props:", data["features"][0]["properties"])

TOL = 0.3       # miles of allowed deviation
MIN_AREA = 1.0  # drop islands smaller than this, in square miles

out = []
for f in data["features"]:
    props = f["properties"]
    state = STATES.get(props.get("STATE"))
    if not state:
        continue
    name = props["NAME"]

    paths, pts_kept = [], 0
    for ring in rings_of(f["geometry"]):
        pts = [project(lon, lat) for lon, lat in ring]
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        if max(xs) < X_MIN or min(xs) > X_MAX or max(ys) < Y_MIN or min(ys) > Y_MAX:
            continue
        if ring_area(pts) < MIN_AREA:
            continue
        pts = simplify(pts, TOL)
        if len(pts) < 3:
            continue
        pts_kept += len(pts)
        d = "M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + "Z"
        paths.append(d)

    if not paths:
        continue
    out.append(
        {
            "name": name,
            "state": state,
            "slug": PRICED.get(name) if state == HOME_STATE else None,
            "d": "".join(paths),
            "pts": pts_kept,
        }
    )

out.sort(key=lambda c: (c["state"], c["name"]))
priced = [c for c in out if c["slug"]]
by_state = {st: sum(1 for c in out if c["state"] == st) for st in sorted(STATES.values())}
print("counties in frame:", len(out), by_state)
print(f"priced matched: {len(priced)} / {len(PRICED)}")
missing = set(PRICED) - {c["name"] for c in priced}
if missing:
    print("!! MISSING:", missing)
print("total points:", sum(c["pts"] for c in out))

body = ",\n".join(
    "  { name: %s, state: %s, slug: %s, d: %s }"
    % (
        json.dumps(c["name"]),
        json.dumps(c["state"]),
        json.dumps(c["slug"]) if c["slug"] else "null",
        json.dumps(c["d"]),
    )
    for c in out
)

OUT.write_text(
    """// GENERATED FILE — do not edit by hand.
//
// Source: US Census county boundaries (via the public geojson-counties-fips
// dataset), filtered to the counties that fall inside the service-area map,
// projected into map units (1 unit = 1 mile from the dealership, see geo.ts),
// simplified to %s mile of tolerance, and rounded to one decimal.
//
// Regenerate with scripts/generate-county-shapes.py when the map window or the
// list of priced counties changes.

export type CountyShape = {
  name: string;
  state: "ME" | "NH" | "VT" | "MA";
  /** Set when this county has pricing in areas.ts. */
  slug: string | null;
  /** SVG path in map units. */
  d: string;
};

export const COUNTY_SHAPES: CountyShape[] = [
%s,
];
"""
    % (TOL, body)
)
print("wrote", OUT, OUT.stat().st_size, "bytes")
