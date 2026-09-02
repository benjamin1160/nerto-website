/**
 * Map furniture that is not a county boundary.
 *
 * Coastlines and the state line used to be hand-traced here; they now come for
 * free from the real county polygons in `county-shapes.generated.ts`, which
 * outline the coast far more accurately than a hand trace could. What is left is
 * the road network, traced roughly through its major exits — enough for a
 * local to orient themselves, not survey data.
 *
 * These are the three roads a buyer in Central Maine actually navigates by:
 * I-95 up the spine from Portland through Augusta to Bangor, I-295 along the
 * coast from Portland to Gardiner, and US 1 up the Midcoast. Retrace them if
 * the map ever moves.
 */

type Coord = readonly [number, number];

export const HIGHWAYS: readonly {
  id: string;
  label: string;
  labelAt: Coord;
  path: readonly Coord[];
}[] = [
  {
    id: "i95",
    label: "95",
    labelAt: [44.62, -69.55],
    path: [
      [43.09, -70.83],
      [43.36, -70.72],
      [43.55, -70.53],
      [43.7, -70.32],
      [43.9, -70.06],
      [44.09, -69.94],
      [44.31, -69.78],
      [44.55, -69.62],
      [44.79, -69.28],
      [44.93, -68.96],
      [45.19, -68.6],
    ],
  },
  {
    id: "i295",
    label: "295",
    labelAt: [43.95, -69.98],
    path: [
      [43.63, -70.29],
      [43.75, -70.19],
      [43.88, -70.08],
      [43.99, -69.94],
      [44.09, -69.79],
      [44.19, -69.76],
    ],
  },
  {
    id: "us1",
    label: "1",
    labelAt: [44.06, -69.35],
    path: [
      [43.55, -70.35],
      [43.79, -70.09],
      [43.91, -69.82],
      [43.98, -69.53],
      [44.1, -69.11],
      [44.31, -68.81],
      [44.55, -68.77],
      [44.8, -68.77],
    ],
  },
];
