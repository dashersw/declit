import { Pipe, useLevel, useStories, Wire } from '@declit/core';

/**
 * Shared electrical + plumbing infrastructure for one floor. Electrical: a
 * perimeter ceiling ring main, fed by a riser that starts at the ground-floor
 * breaker panel (west wall, z = 1.5) and climbs floor to floor. Plumbing: the
 * wet stack — cold, hot and soil — hugs the west wall right beside the
 * first-floor bathroom (z ≈ 3.4–3.7), so the risers reach the fixtures they
 * serve (see FirstFloor). Every floor renders this same component, so the
 * services line up from floor to floor by construction. Pass `top` on the
 * attic: its ring is still fed, but the risers and the wet stack stop below —
 * there is nothing above left to serve.
 */
export default function Services({ tag, top = false }: { tag: string; top?: boolean }) {
  const { wallHeight } = useLevel();
  const { storyHeight } = useStories();
  const y = Math.max(0.6, wallHeight - 0.35); // ceiling height for this floor

  return (
    <>
      {/* perimeter ceiling ring main (footprint 10 × 8, inset 0.3) */}
      <Wire
        id={`${tag}-ring`}
        points={[
          [0.3, y, 0.3],
          [9.7, y, 0.3],
          [9.7, y, 7.7],
          [0.3, y, 7.7],
          [0.3, y, 0.3],
        ]}
      />
      {/* electrical riser above the panel, and the tap into this floor's ring */}
      <Wire id={`${tag}-riser`} points={[[0.19, 0, 1.5], [0.19, top ? y : storyHeight, 1.5]]} />
      <Wire id={`${tag}-ring-feed`} points={[[0.19, y, 1.5], [0.19, y, 0.3], [0.3, y, 0.3]]} />

      {/* wet stack against the west wall, beside the first-floor bathroom */}
      {!top && (
        <>
          <Pipe id={`${tag}-cold`} color="#3e7fb2" points={[[0.19, 0, 3.55], [0.19, storyHeight, 3.55]]} />
          <Pipe id={`${tag}-hot`} color="#b87333" points={[[0.19, 0, 3.4], [0.19, storyHeight, 3.4]]} />
          <Pipe id={`${tag}-soil`} color="#8f969e" radius={0.05} points={[[0.21, 0, 3.72], [0.21, storyHeight, 3.72]]} />
        </>
      )}
    </>
  );
}
