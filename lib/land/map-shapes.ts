/**
 * Map furniture that is not a county boundary.
 *
 * Coastlines and the state line used to be hand-traced here; they now come for
 * free from the real county polygons in `county-shapes.generated.ts`, which
 * outline the coast far more accurately than a hand trace could. What is left is
 * the interstate network, traced roughly through its major exits — enough for a
 * local to orient themselves, not survey data.
 */

type Coord = readonly [number, number];

export const HIGHWAYS: readonly {
  id: string;
  label: string;
  labelAt: Coord;
  path: readonly Coord[];
}[] = [
  {
    id: "i75",
    label: "75",
    labelAt: [29.95, -82.48],
    path: [
      [28.36, -82.19],
      [28.66, -82.11],
      [29.05, -82.16],
      [29.19, -82.19],
      [29.4, -82.28],
      [29.65, -82.38],
      [29.9, -82.5],
      [30.19, -82.66],
      [30.5, -83.0],
      [30.75, -83.28],
    ],
  },
  {
    id: "i10",
    label: "10",
    labelAt: [30.24, -82.15],
    path: [
      [30.5, -84.3],
      [30.44, -83.6],
      [30.4, -83.2],
      [30.19, -82.64],
      [30.22, -82.35],
      [30.28, -81.9],
      [30.33, -81.66],
    ],
  },
  {
    id: "i95",
    label: "95",
    labelAt: [29.75, -81.45],
    path: [
      [30.79, -81.6],
      [30.5, -81.66],
      [30.33, -81.66],
      [30.05, -81.45],
      [29.9, -81.4],
      [29.66, -81.28],
      [29.47, -81.2],
      [29.2, -81.05],
      [28.8, -80.85],
    ],
  },
];
