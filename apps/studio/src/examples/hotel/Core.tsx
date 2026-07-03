import { Elevator, Slab, Staircase, Story, Wall, Wire } from '@declit/core';

const T = 0.24;

// west circulation bay, attached to the room block at x = 0
const X0 = -5.2;
const X1 = 0;
const Z0 = 1.8;
const Z1 = 10.2;

// two elevators side by side against the south wall, doors opening north
const LIFT_A = { at: [-4.9, 2.04] as [number, number], width: 1.9, depth: 2.1 };
const LIFT_B = { at: [-2.7, 2.04] as [number, number], width: 1.9, depth: 2.1 };
// switchback stair on the north half; entry AND exit land at its south edge
const STAIR = { at: [-4.9, 5.5] as [number, number], width: 2.2, run: 4.4 };

const rect = (x0: number, z0: number, x1: number, z1: number): [number, number][] => [
  [x0, z0],
  [x1, z0],
  [x1, z1],
  [x0, z1],
];

/**
 * The vertical circulation core. The layout is a real path, not just parts in a
 * box: every floor's corridor door (z = 5.3–6.7 in the west wall) opens into an
 * elevator lobby (z = 4.14–5.5, plus the open strip east of the stair), the two
 * lift doors face north onto that lobby, and the switchback stair starts and
 * finishes at the lobby's north edge. Upper slabs cut shaft and stairwell
 * voids; the core slab stops at x = -0.5 where the room block's slab takes
 * over, so the two never overlap. On the top floor the stair is omitted — the
 * flight below arrives there, and there is no further storey to climb to.
 */
export default function Core({
  level,
  storyHeight,
  top = false,
  carA = false,
  carB = false,
}: {
  level: number;
  storyHeight: number;
  /** highest core level: renders the arrival landing but no onward flight */
  top?: boolean;
  carA?: boolean;
  carB?: boolean;
}) {
  const holes =
    level >= 1
      ? [
          rect(-4.95, 1.99, -2.95, 4.19), // lift A shaft
          rect(-2.75, 1.99, -0.75, 4.19), // lift B shaft
          rect(-4.95, 5.45, -2.65, 9.95), // stairwell
        ]
      : undefined;

  return (
    <Story level={level} layer={level === 0 ? 'ground floor' : `floor ${level}`}>
      <Slab id={`core${level}-floor`} outline={rect(X0, Z0, -0.5, Z1)} holes={holes} thickness={0.3} color="#d3cdc0" />

      {/* bay walls: west, south, north — the east side is the room block's west wall */}
      <Wall id={`core${level}-w`} from={[X0, Z1]} to={[X0, Z0]} thickness={T} />
      <Wall id={`core${level}-s`} from={[X0, Z0]} to={[X1, Z0]} thickness={T} />
      <Wall id={`core${level}-n`} from={[X1, Z1]} to={[X0, Z1]} thickness={T} />

      <Elevator
        id={`core${level}-lift-a`}
        at={LIFT_A.at}
        width={LIFT_A.width}
        depth={LIFT_A.depth}
        height={storyHeight}
        doorSide="north"
        car={carA}
      />
      <Elevator
        id={`core${level}-lift-b`}
        at={LIFT_B.at}
        width={LIFT_B.width}
        depth={LIFT_B.depth}
        height={storyHeight}
        doorSide="north"
        car={carB}
      />

      {!top && (
        <Staircase id={`core${level}-stair`} at={STAIR.at} rise={storyHeight} width={STAIR.width} run={STAIR.run} />
      )}

      {/* electrical riser climbing the core beside the corridor door; the ground
          floor's main panel feeds it and each guest floor taps it through the
          wall (see GroundFloor / GuestFloor) */}
      <Wire id={`core${level}-riser`} points={[[-0.18, 0, 6.9], [-0.18, storyHeight, 6.9]]} />
    </Story>
  );
}
