import type { FloorPlan as Plan, Room, RoomKind } from "@/lib/floor-plans";
import { feetInches } from "@/lib/format";

const PX_PER_FT = 13;
const PAD = 52;
const WALL = 9; // exterior wall thickness, in px

const TINT: Record<RoomKind, number> = {
  living: 0.085,
  sleeping: 0.055,
  wet: 0.11,
  utility: 0.14,
  circulation: 0.025,
  storage: 0.14,
};

type Opening = { x: number; y: number; len: number; axis: "h" | "v" };

/** Windows are derived: any generously sized exterior room edge gets one. */
function windowsFor(plan: Plan): Opening[] {
  const out: Opening[] = [];
  const glazed = new Set<RoomKind>(["living", "sleeping", "wet"]);

  for (const r of plan.rooms) {
    if (!glazed.has(r.kind)) continue;
    const span = (n: number) => Math.min(Math.max(n * 0.45, 3), 9);

    if (r.y === 0 && r.w >= 7) out.push({ x: r.x + (r.w - span(r.w)) / 2, y: 0, len: span(r.w), axis: "h" });
    if (r.y + r.h === plan.length && r.w >= 7)
      out.push({ x: r.x + (r.w - span(r.w)) / 2, y: plan.length, len: span(r.w), axis: "h" });
    if (r.x === 0 && r.h >= 7) out.push({ x: 0, y: r.y + (r.h - span(r.h)) / 2, len: span(r.h), axis: "v" });
    if (r.x + r.w === plan.width && r.h >= 7)
      out.push({ x: plan.width, y: r.y + (r.h - span(r.h)) / 2, len: span(r.h), axis: "v" });
  }
  return out;
}

function RoomLabel({ room }: { room: Room }) {
  const cx = (room.x + room.w / 2) * PX_PER_FT;
  const cy = (room.y + room.h / 2) * PX_PER_FT;
  const tiny = room.w < 8 || room.h < 6;

  return (
    <g>
      <text
        x={cx}
        y={room.hideDims ? cy + 4 : cy - 3}
        textAnchor="middle"
        fill="currentColor"
        fontSize={tiny ? 9 : 11}
        letterSpacing="0.1em"
        style={{ textTransform: "uppercase", fontWeight: 600 }}
      >
        {room.name}
      </text>
      {!room.hideDims && (
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fill="currentColor"
          opacity="0.5"
          fontSize="9.5"
          fontFamily="var(--font-mono), monospace"
        >
          {feetInches(room.w)} × {feetInches(room.h)}
        </text>
      )}
    </g>
  );
}

export function FloorPlan({
  plan,
  className,
  label,
}: {
  plan: Plan;
  className?: string;
  label: string;
}) {
  const w = plan.width * PX_PER_FT;
  const h = plan.length * PX_PER_FT;
  const vbW = w + PAD * 2;
  const vbH = h + PAD * 2;
  const windows = windowsFor(plan);

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      className={className}
      role="img"
      aria-label={label}
      fontFamily="var(--font-sans), sans-serif"
    >
      <title>{label}</title>

      <g transform={`translate(${PAD} ${PAD})`}>
        {/* Room fills */}
        {plan.rooms.map((r) => (
          <rect
            key={r.name}
            x={r.x * PX_PER_FT}
            y={r.y * PX_PER_FT}
            width={r.w * PX_PER_FT}
            height={r.h * PX_PER_FT}
            fill="currentColor"
            opacity={TINT[r.kind]}
          />
        ))}

        {/* Interior partitions */}
        <g stroke="currentColor" strokeOpacity="0.42" strokeWidth="2" fill="none">
          {plan.rooms.map((r) => (
            <rect
              key={r.name}
              x={r.x * PX_PER_FT}
              y={r.y * PX_PER_FT}
              width={r.w * PX_PER_FT}
              height={r.h * PX_PER_FT}
            />
          ))}
        </g>

        {/* Exterior wall */}
        <rect
          x={-WALL / 2}
          y={-WALL / 2}
          width={w + WALL}
          height={h + WALL}
          fill="none"
          stroke="currentColor"
          strokeWidth={WALL}
        />

        {/* Windows punched through the exterior wall */}
        <g>
          {windows.map((o, i) =>
            o.axis === "h" ? (
              <g key={i}>
                <rect
                  x={o.x * PX_PER_FT}
                  y={o.y * PX_PER_FT - WALL / 2 - 0.5}
                  width={o.len * PX_PER_FT}
                  height={WALL + 1}
                  fill="var(--paper)"
                />
                <line
                  x1={o.x * PX_PER_FT}
                  y1={o.y * PX_PER_FT}
                  x2={(o.x + o.len) * PX_PER_FT}
                  y2={o.y * PX_PER_FT}
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </g>
            ) : (
              <g key={i}>
                <rect
                  x={o.x * PX_PER_FT - WALL / 2 - 0.5}
                  y={o.y * PX_PER_FT}
                  width={WALL + 1}
                  height={o.len * PX_PER_FT}
                  fill="var(--paper)"
                />
                <line
                  x1={o.x * PX_PER_FT}
                  y1={o.y * PX_PER_FT}
                  x2={o.x * PX_PER_FT}
                  y2={(o.y + o.len) * PX_PER_FT}
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </g>
            ),
          )}
        </g>

        {/* Doors: opening gap, leaf and swing arc */}
        <g>
          {plan.doors.map((d, i) => {
            const size = d.width ?? 3;
            const hx = d.x * PX_PER_FT;
            const hy = d.y * PX_PER_FT;
            const r = size * PX_PER_FT;
            const horizontalWall = d.facing === "n" || d.facing === "s";

            const openDx = horizontalWall ? (d.hand === "right" ? r : -r) : 0;
            const openDy = horizontalWall ? 0 : d.hand === "right" ? r : -r;
            const leafDx = horizontalWall ? 0 : d.facing === "e" ? r : -r;
            const leafDy = horizontalWall ? (d.facing === "n" ? -r : r) : 0;

            const cross = leafDx * openDy - leafDy * openDx;
            const sweep = cross > 0 ? 1 : 0;

            return (
              <g key={i}>
                <line
                  x1={hx}
                  y1={hy}
                  x2={hx + openDx}
                  y2={hy + openDy}
                  stroke="var(--paper)"
                  strokeWidth="4"
                />
                <path
                  d={`M${hx} ${hy} L${hx + leafDx} ${hy + leafDy} A ${r} ${r} 0 0 ${sweep} ${hx + openDx} ${hy + openDy}`}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.55"
                  strokeWidth="1.6"
                />
              </g>
            );
          })}
        </g>

        {plan.rooms.map((r) => (
          <RoomLabel key={r.name} room={r} />
        ))}

        {/* Entry marker */}
        <g>
          <circle
            cx={plan.entry.x * PX_PER_FT}
            cy={plan.entry.y * PX_PER_FT}
            r="9"
            fill="var(--ember)"
          />
          <text
            x={plan.entry.x * PX_PER_FT}
            y={plan.entry.y * PX_PER_FT + 3.5}
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill="var(--on-ember)"
          >
            E
          </text>
        </g>
      </g>

      {/* Overall dimensions */}
      <g stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" fill="none">
        <line x1={PAD} y1={PAD - 26} x2={PAD + w} y2={PAD - 26} />
        <line x1={PAD} y1={PAD - 32} x2={PAD} y2={PAD - 20} />
        <line x1={PAD + w} y1={PAD - 32} x2={PAD + w} y2={PAD - 20} />
        <line x1={PAD - 26} y1={PAD} x2={PAD - 26} y2={PAD + h} />
        <line x1={PAD - 32} y1={PAD} x2={PAD - 20} y2={PAD} />
        <line x1={PAD - 32} y1={PAD + h} x2={PAD - 20} y2={PAD + h} />
      </g>
      <rect x={PAD + w / 2 - 34} y={PAD - 36} width="68" height="20" fill="var(--paper)" />
      <text
        x={PAD + w / 2}
        y={PAD - 22}
        textAnchor="middle"
        fill="currentColor"
        opacity="0.75"
        fontSize="11"
        fontFamily="var(--font-mono), monospace"
      >
        {plan.width}&apos;-0&quot;
      </text>
      <rect x={PAD - 36} y={PAD + h / 2 - 10} width="20" height="68" fill="var(--paper)" transform={`rotate(-90 ${PAD - 26} ${PAD + h / 2})`} />
      <text
        x={PAD - 26}
        y={PAD + h / 2}
        textAnchor="middle"
        fill="currentColor"
        opacity="0.75"
        fontSize="11"
        fontFamily="var(--font-mono), monospace"
        transform={`rotate(-90 ${PAD - 26} ${PAD + h / 2})`}
        dy="4"
      >
        {plan.length}&apos;-0&quot;
      </text>

      {/* North arrow */}
      <g transform={`translate(${vbW - 30} ${vbH - 26})`}>
        <path d="M0 -16 L6 6 L0 1 L-6 6 Z" fill="currentColor" opacity="0.7" />
        <text x="0" y="20" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.55" letterSpacing="0.1em">
          N
        </text>
      </g>

      {/* Scale bar — 10 feet */}
      <g transform={`translate(${PAD} ${vbH - 26})`} stroke="currentColor" strokeOpacity="0.5">
        <line x1="0" y1="0" x2={10 * PX_PER_FT} y2="0" strokeWidth="1.5" />
        <line x1="0" y1="-4" x2="0" y2="4" strokeWidth="1.5" />
        <line x1={10 * PX_PER_FT} y1="-4" x2={10 * PX_PER_FT} y2="4" strokeWidth="1.5" />
        <text x={10 * PX_PER_FT + 10} y="4" fontSize="9.5" fill="currentColor" stroke="none" opacity="0.55" fontFamily="var(--font-mono), monospace">
          10 ft
        </text>
      </g>
    </svg>
  );
}
