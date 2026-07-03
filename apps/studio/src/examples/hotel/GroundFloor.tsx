import { BreakerPanel, Door, Lounger, Outlet, Parasol, Pipe, Pool, Slab, Story, useStories, Wall, Wire, Window } from '@declit/core';

const T = 0.3;

/**
 * The public ground floor: a lobby with a reception desk, a restaurant with
 * tables, and a pool on the east terrace. The west wall has the door into the
 * elevator lobby of the circulation core, the building's main breaker panel
 * (feeding the core's electrical riser), and two boxed service ducts where the
 * water risers and soil stacks enter the building and climb to the guest
 * floors.
 */
export default function GroundFloor({ length: L, depth: D }: { length: number; depth: number }) {
  const { storyHeight } = useStories();
  const tables = [];
  for (let tx = 0; tx < 3; tx++) {
    for (let tz = 0; tz < 3; tz++) {
      tables.push([L * 0.58 + tx * 2.4, 2.2 + tz * 3.0] as const);
    }
  }

  return (
    <Story level={0}>
      <Slab id="lobby-floor" outline={[[-0.5, -0.5], [L + 0.5, -0.5], [L + 0.5, D + 0.5], [-0.5, D + 0.5]]} thickness={0.35} />

      {/* shell with a wide glazed entrance on the south */}
      <Wall id="l-south" from={[0, 0]} to={[L, 0]} thickness={T}>
        <Door id="l-entrance-a" at={L / 2 - 0.7} width={1.3} height={2.6} open={0.5} hinge="end" />
        <Door id="l-entrance-b" at={L / 2 + 0.7} width={1.3} height={2.6} open={0.5} />
        <Window id="l-win-s1" at={3} width={2.4} sill={0.4} height={2.0} />
        <Window id="l-win-s2" at={L - 3} width={2.4} sill={0.4} height={2.0} />
      </Wall>
      <Wall id="l-north" from={[L, D]} to={[0, D]} thickness={T}>
        <Window id="l-win-n" at={L / 2} width={3.0} sill={0.9} height={1.4} />
      </Wall>
      <Wall id="l-west" from={[0, D]} to={[0, 0]} thickness={T}>
        {/* into the core's elevator lobby — lines up with the corridor door above */}
        <Door id="l-core-door" at={D / 2} width={1.4} height={2.2} open={0.3} />
        {/* the building's main electrical panel, on the lobby side */}
        <BreakerPanel id="l-main-panel" at={1.2} height={1.5} face={1} />
        <Outlet id="l-out-w1" at={3.5} />
        <Outlet id="l-out-w2" at={D - 2.5} />
      </Wall>
      <Wall id="l-east" from={[L, 0]} to={[L, D]} thickness={T}>
        <Door id="l-pool-door" at={D / 2} width={1.2} height={2.2} open={0.3} />
        <Outlet id="l-out-e1" at={2} />
        <Outlet id="l-out-e2" at={D - 2} />
      </Wall>

      {/* lobby / restaurant divider with a wide opening */}
      <Wall id="l-divider" from={[L * 0.5, 0.15]} to={[L * 0.5, D - 0.15]} thickness={0.15} color="#e7e1d4">
        <Door id="l-div-door" at={D / 2} width={2.0} height={2.4} open={1} />
      </Wall>

      {/* boxed service ducts for the risers, against the west wall */}
      <Wall id="l-duct-s-a" from={[0.14, 4.4]} to={[0.66, 4.4]} thickness={0.1} color="#e7e1d4" />
      <Wall id="l-duct-s-b" from={[0.66, 4.4]} to={[0.66, 5.06]} thickness={0.1} color="#e7e1d4" />
      <Wall id="l-duct-s-c" from={[0.66, 5.06]} to={[0.14, 5.06]} thickness={0.1} color="#e7e1d4" />
      <Wall id="l-duct-n-a" from={[0.14, 6.94]} to={[0.66, 6.94]} thickness={0.1} color="#e7e1d4" />
      <Wall id="l-duct-n-b" from={[0.66, 6.94]} to={[0.66, 7.6]} thickness={0.1} color="#e7e1d4" />
      <Wall id="l-duct-n-c" from={[0.66, 7.6]} to={[0.14, 7.6]} thickness={0.1} color="#e7e1d4" />

      {/* riser + soil stack segments rising from below grade through the ducts,
          continuous with the guest-floor segments above */}
      {[
        { tag: 's', wall: 5, sgn: -1 },
        { tag: 'n', wall: 7, sgn: 1 },
      ].map(({ tag, wall, sgn }) => (
        <group key={tag}>
          <Pipe id={`l-${tag}-riser-cold`} color="#3e7fb2" points={[[0.24, -0.6, wall + sgn * 0.1], [0.24, storyHeight, wall + sgn * 0.1]]} />
          <Pipe id={`l-${tag}-riser-hot`} color="#b87333" points={[[0.38, -0.6, wall], [0.38, storyHeight, wall]]} />
          <Pipe id={`l-${tag}-soil-stack`} color="#8f969e" radius={0.05} points={[[0.52, -0.6, wall + sgn * 0.45], [0.52, storyHeight, wall + sgn * 0.45]]} />
        </group>
      ))}

      {/* reception desk — an L of two blocks in the lobby */}
      <mesh castShadow position={[2.4, 0.55, D - 2.2]}>
        <boxGeometry args={[3.0, 1.1, 0.7]} />
        <meshStandardMaterial color="#5b4a39" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[4.05, 0.55, D - 3.4]}>
        <boxGeometry args={[0.7, 1.1, 2.0]} />
        <meshStandardMaterial color="#5b4a39" roughness={0.6} />
      </mesh>

      {/* restaurant tables (pedestal + round top) */}
      {tables.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow position={[0, 0.37, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 0.74, 12]} />
            <meshStandardMaterial color="#8a8a86" roughness={0.5} metalness={0.3} />
          </mesh>
          <mesh castShadow position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.05, 24]} />
            <meshStandardMaterial color="#d9cdb8" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* lobby wiring: main panel up to a perimeter run at ceiling height that
          hugs the west, south and east walls, with drops to each outlet; a stub
          punches through the west wall to feed the core's electrical riser */}
      <Wire
        id="l-perimeter"
        points={[
          [0.18, 1.78, D - 1.2],
          [0.18, 2.7, D - 1.2],
          [0.18, 2.7, 0.19],
          [L - 0.19, 2.7, 0.19],
          [L - 0.19, 2.7, D - 2],
        ]}
      />
      <Wire id="l-riser-feed" points={[[0.18, 2.7, 6.9], [-0.18, 2.7, 6.9]]} />
      <Wire id="l-drop-w1" points={[[0.18, 2.7, D - 3.5], [0.18, 0.3, D - 3.5]]} />
      <Wire id="l-drop-w2" points={[[0.18, 2.7, 2.5], [0.18, 0.3, 2.5]]} />
      <Wire id="l-drop-e1" points={[[L - 0.19, 2.7, 2], [L - 0.19, 0.3, 2]]} />
      <Wire id="l-drop-e2" points={[[L - 0.19, 2.7, D - 2], [L - 0.19, 0.3, D - 2]]} />

      {/* pool on the east terrace: supply and return lines from the plant room
          behind the east wall to the pool's west edge */}
      <Slab id="terrace" outline={[[L + 0.5, 0], [L + 11, 0], [L + 11, D], [L + 0.5, D]]} thickness={0.3} color="#c9c3b6" />
      <Pipe id="pool-supply" color="#3e7fb2" points={[[L + 0.19, 0.3, 5], [L + 2.5, 0.3, 5]]} />
      <Pipe id="pool-return" color="#8f969e" points={[[L + 2.5, 0.3, 7], [L + 0.19, 0.3, 7]]} />
      <Pool id="pool" at={[L + 2.5, 3]} width={6} depth={6} />

      {/* şezlongs and parasols along the pool's north edge */}
      <Lounger id="pool-lounger-1" at={[L + 3.6, 9.7]} facing="south" />
      <Lounger id="pool-lounger-2" at={[L + 5.1, 9.7]} facing="south" />
      <Lounger id="pool-lounger-3" at={[L + 6.6, 9.7]} facing="south" />
      <Parasol id="pool-parasol-1" at={[L + 4.35, 10.1]} />
      <Parasol id="pool-parasol-2" at={[L + 5.85, 10.1]} />
    </Story>
  );
}
