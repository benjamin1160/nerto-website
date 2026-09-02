/**
 * Floor plan geometry.
 *
 * All coordinates are in feet, origin at the top-left of the home's footprint.
 * Rooms tile the footprint exactly, which lets <FloorPlan> derive interior
 * partitions, exterior walls and window placement without hand-authored walls.
 */

export type RoomKind =
  | "living"
  | "sleeping"
  | "wet"
  | "utility"
  | "circulation"
  | "storage";

export type Room = {
  name: string;
  /** Left edge, in feet. */
  x: number;
  /** Top edge, in feet. */
  y: number;
  w: number;
  h: number;
  kind: RoomKind;
  /** Hide the "12'-0" × 14'-0"" caption on rooms too small to fit it. */
  hideDims?: boolean;
};

export type Door = {
  /** Hinge point, in feet. */
  x: number;
  y: number;
  /** Direction the door swings open. */
  facing: "n" | "s" | "e" | "w";
  /** Swing handedness. */
  hand: "left" | "right";
  width?: number;
};

export type FloorPlan = {
  id: string;
  /** Footprint width (across the home), in feet. */
  width: number;
  /** Footprint length (front to back), in feet. */
  length: number;
  rooms: Room[];
  doors: Door[];
  /** Entry door position along an exterior wall. */
  entry: { x: number; y: number; facing: "n" | "s" | "e" | "w" };
};

export const floorPlans: Record<string, FloorPlan> = {
  /* ---------------------------------------------------------------- *
   * 28' × 60' double-section · 3 bed / 2 bath · 1,680 sq ft
   * Classic split-bedroom plan: primary suite forward, secondary
   * bedrooms aft, living core in the middle.
   * ---------------------------------------------------------------- */
  "double-28x60": {
    id: "double-28x60",
    width: 28,
    length: 60,
    rooms: [
      { name: "Primary Suite", x: 0, y: 0, w: 17, h: 17, kind: "sleeping" },
      { name: "Primary Bath", x: 17, y: 0, w: 11, h: 11, kind: "wet" },
      { name: "Walk-In", x: 17, y: 11, w: 11, h: 6, kind: "storage" },
      { name: "Hall", x: 0, y: 17, w: 19, h: 5, kind: "circulation", hideDims: true },
      { name: "Laundry", x: 19, y: 17, w: 9, h: 5, kind: "utility", hideDims: true },
      { name: "Great Room", x: 0, y: 22, w: 17, h: 19, kind: "living" },
      { name: "Kitchen", x: 17, y: 22, w: 11, h: 11, kind: "living" },
      { name: "Dining", x: 17, y: 33, w: 11, h: 8, kind: "living" },
      { name: "Foyer", x: 0, y: 41, w: 10, h: 6, kind: "circulation", hideDims: true },
      { name: "Bath 2", x: 10, y: 41, w: 9, h: 6, kind: "wet", hideDims: true },
      { name: "Pantry", x: 19, y: 41, w: 9, h: 6, kind: "storage", hideDims: true },
      { name: "Bedroom 2", x: 0, y: 47, w: 14, h: 13, kind: "sleeping" },
      { name: "Bedroom 3", x: 14, y: 47, w: 14, h: 13, kind: "sleeping" },
    ],
    doors: [
      { x: 14, y: 17, facing: "n", hand: "left" },
      { x: 17, y: 4, facing: "e", hand: "left" },
      { x: 17, y: 13, facing: "e", hand: "right" },
      { x: 19, y: 19, facing: "e", hand: "left" },
      { x: 12, y: 41, facing: "n", hand: "right" },
      { x: 5, y: 47, facing: "s", hand: "left" },
      { x: 21, y: 47, facing: "s", hand: "right" },
      { x: 19, y: 43, facing: "e", hand: "left" },
    ],
    entry: { x: 5, y: 47, facing: "n" },
  },

  /* ---------------------------------------------------------------- *
   * 30' × 68' double-section · 4 bed / 2 bath · 2,040 sq ft
   * ---------------------------------------------------------------- */
  "double-30x68": {
    id: "double-30x68",
    width: 30,
    length: 68,
    rooms: [
      { name: "Primary Suite", x: 0, y: 0, w: 18, h: 18, kind: "sleeping" },
      { name: "Primary Bath", x: 18, y: 0, w: 12, h: 12, kind: "wet" },
      { name: "Walk-In", x: 18, y: 12, w: 12, h: 6, kind: "storage" },
      { name: "Hall", x: 0, y: 18, w: 20, h: 6, kind: "circulation", hideDims: true },
      { name: "Laundry", x: 20, y: 18, w: 10, h: 6, kind: "utility", hideDims: true },
      { name: "Great Room", x: 0, y: 24, w: 18, h: 20, kind: "living" },
      { name: "Kitchen", x: 18, y: 24, w: 12, h: 12, kind: "living" },
      { name: "Pantry", x: 18, y: 36, w: 12, h: 8, kind: "storage" },
      { name: "Dining", x: 0, y: 44, w: 12, h: 10, kind: "living" },
      { name: "Bath 2", x: 12, y: 44, w: 9, h: 10, kind: "wet" },
      { name: "Study", x: 21, y: 44, w: 9, h: 10, kind: "living" },
      { name: "Bedroom 2", x: 0, y: 54, w: 10, h: 14, kind: "sleeping" },
      { name: "Bedroom 3", x: 10, y: 54, w: 10, h: 14, kind: "sleeping" },
      { name: "Bedroom 4", x: 20, y: 54, w: 10, h: 14, kind: "sleeping" },
    ],
    doors: [
      { x: 15, y: 18, facing: "n", hand: "left" },
      { x: 18, y: 4, facing: "e", hand: "left" },
      { x: 18, y: 14, facing: "e", hand: "right" },
      { x: 20, y: 20, facing: "e", hand: "left" },
      { x: 14, y: 44, facing: "n", hand: "right" },
      { x: 4, y: 54, facing: "s", hand: "left" },
      { x: 14, y: 54, facing: "s", hand: "left" },
      { x: 24, y: 54, facing: "s", hand: "right" },
    ],
    entry: { x: 4, y: 44, facing: "n" },
  },

  /* ---------------------------------------------------------------- *
   * 42' × 64' triple-section · 4 bed / 3 bath · 2,688 sq ft
   * ---------------------------------------------------------------- */
  "triple-42x64": {
    id: "triple-42x64",
    width: 42,
    length: 64,
    rooms: [
      { name: "Primary Suite", x: 0, y: 0, w: 20, h: 18, kind: "sleeping" },
      { name: "Primary Bath", x: 20, y: 0, w: 12, h: 18, kind: "wet" },
      { name: "Walk-In", x: 32, y: 0, w: 10, h: 18, kind: "storage" },
      { name: "Hall", x: 0, y: 18, w: 26, h: 6, kind: "circulation", hideDims: true },
      { name: "Laundry", x: 26, y: 18, w: 8, h: 6, kind: "utility", hideDims: true },
      { name: "Mud", x: 34, y: 18, w: 8, h: 6, kind: "utility", hideDims: true },
      { name: "Great Room", x: 0, y: 24, w: 22, h: 22, kind: "living" },
      { name: "Kitchen", x: 22, y: 24, w: 12, h: 22, kind: "living" },
      { name: "Dining", x: 34, y: 24, w: 8, h: 22, kind: "living" },
      { name: "Gallery", x: 0, y: 46, w: 14, h: 6, kind: "circulation", hideDims: true },
      { name: "Bath 2", x: 14, y: 46, w: 12, h: 6, kind: "wet", hideDims: true },
      { name: "Office", x: 26, y: 46, w: 16, h: 6, kind: "living", hideDims: true },
      { name: "Bedroom 2", x: 0, y: 52, w: 14, h: 12, kind: "sleeping" },
      { name: "Bedroom 3", x: 14, y: 52, w: 14, h: 12, kind: "sleeping" },
      { name: "Bedroom 4", x: 28, y: 52, w: 14, h: 12, kind: "sleeping" },
    ],
    doors: [
      { x: 17, y: 18, facing: "n", hand: "left" },
      { x: 20, y: 4, facing: "e", hand: "left" },
      { x: 32, y: 4, facing: "e", hand: "right" },
      { x: 26, y: 20, facing: "e", hand: "left" },
      { x: 18, y: 46, facing: "n", hand: "right" },
      { x: 5, y: 52, facing: "s", hand: "left" },
      { x: 19, y: 52, facing: "s", hand: "left" },
      { x: 33, y: 52, facing: "s", hand: "right" },
    ],
    entry: { x: 6, y: 46, facing: "n" },
  },

  /* ---------------------------------------------------------------- *
   * 16' × 66' single-section · 2 bed / 2 bath · 1,056 sq ft
   * ---------------------------------------------------------------- */
  "single-16x66": {
    id: "single-16x66",
    width: 16,
    length: 66,
    rooms: [
      { name: "Primary Suite", x: 0, y: 0, w: 16, h: 14, kind: "sleeping" },
      { name: "Primary Bath", x: 0, y: 14, w: 9, h: 8, kind: "wet" },
      { name: "Walk-In", x: 9, y: 14, w: 7, h: 8, kind: "storage" },
      { name: "Great Room", x: 0, y: 22, w: 16, h: 14, kind: "living" },
      { name: "Kitchen", x: 0, y: 36, w: 10, h: 12, kind: "living" },
      { name: "Dining", x: 10, y: 36, w: 6, h: 12, kind: "living" },
      { name: "Hall", x: 0, y: 48, w: 10, h: 6, kind: "circulation", hideDims: true },
      { name: "Bath 2", x: 10, y: 48, w: 6, h: 6, kind: "wet", hideDims: true },
      { name: "Bedroom 2", x: 0, y: 54, w: 16, h: 12, kind: "sleeping" },
    ],
    doors: [
      { x: 4, y: 14, facing: "s", hand: "left" },
      { x: 12, y: 14, facing: "s", hand: "right" },
      { x: 4, y: 22, facing: "s", hand: "left" },
      { x: 12, y: 48, facing: "n", hand: "right" },
      { x: 5, y: 54, facing: "s", hand: "left" },
    ],
    entry: { x: 3, y: 36, facing: "w" },
  },

  /* ---------------------------------------------------------------- *
   * 24' × 44' double-section · 2 bed / 2 bath · 1,056 sq ft
   * ---------------------------------------------------------------- */
  "double-24x44": {
    id: "double-24x44",
    width: 24,
    length: 44,
    rooms: [
      { name: "Primary Suite", x: 0, y: 0, w: 14, h: 15, kind: "sleeping" },
      { name: "Primary Bath", x: 14, y: 0, w: 10, h: 15, kind: "wet" },
      { name: "Hall", x: 0, y: 15, w: 16, h: 5, kind: "circulation", hideDims: true },
      { name: "Laundry", x: 16, y: 15, w: 8, h: 5, kind: "utility", hideDims: true },
      { name: "Great Room", x: 0, y: 20, w: 14, h: 14, kind: "living" },
      { name: "Kitchen", x: 14, y: 20, w: 10, h: 14, kind: "living" },
      { name: "Bedroom 2", x: 0, y: 34, w: 14, h: 10, kind: "sleeping" },
      { name: "Bath 2", x: 14, y: 34, w: 10, h: 10, kind: "wet" },
    ],
    doors: [
      { x: 11, y: 15, facing: "n", hand: "left" },
      { x: 14, y: 4, facing: "e", hand: "left" },
      { x: 16, y: 17, facing: "e", hand: "left" },
      { x: 5, y: 34, facing: "s", hand: "left" },
      { x: 19, y: 34, facing: "s", hand: "right" },
    ],
    entry: { x: 4, y: 20, facing: "w" },
  },
};
