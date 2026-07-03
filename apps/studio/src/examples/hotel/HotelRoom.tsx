import { Basin, Bed, Door, Pipe, Toilet, Wall, type Vec2 } from '@declit/core';

const P = 0.1; // bathroom partition thickness

/**
 * A guest room: an ensuite bathroom in the corner by the entry (two partition
 * walls + door + WC and basin), plus a bed against the exterior wall. The
 * bathroom backs onto the corridor wall the risers and branches run along, so
 * every fixture gets a real connection: supply stubs rise through the slab
 * from the under-floor branches, and the drains drop to the collector that
 * runs beneath this room's bathroom line (see GuestFloor).
 */
export default function HotelRoom({
  tag,
  at,
  width,
  depth,
  facing,
}: {
  tag: string;
  at: Vec2;
  width: number;
  depth: number;
  facing: 'south' | 'north';
}) {
  const [x0, z0] = at;
  const cx = x0 + width / 2;

  // corridor-adjacent edge of the room, and the direction pointing into the room
  const dir = facing === 'south' ? -1 : 1;
  const cz = facing === 'south' ? z0 + depth : z0;
  const podRightX = x0 + 1.6;
  const podFrontZ = cz + dir * 1.8;
  const bathCz = cz + dir * 0.9;

  // fixture positions: WC against the party wall, basin against the wet wall
  const wcX = x0 + 0.4;
  const basinX = x0 + 1.25;
  const basinZ = cz + dir * 0.28;
  // under-slab supply branches run at these z lines (see GuestFloor)
  const coldZ = cz + dir * 0.1;
  const hotZ = cz;

  // bed sits against the exterior wall (opposite the corridor)
  const bedZ = facing === 'south' ? z0 + 1.06 : z0 + depth - 1.06;

  return (
    <>
      {/* bathroom pod: front wall (with door) + side wall; the other two sides
          are the room's party wall and the corridor wall */}
      <Wall id={`${tag}-bath-front`} from={[x0 + 0.06, podFrontZ]} to={[podRightX, podFrontZ]} thickness={P} height={2.4} color="#e4ddcf">
        <Door id={`${tag}-bath-door`} at={1.15} width={0.7} height={2.05} open={0.15} />
      </Wall>
      <Wall id={`${tag}-bath-side`} from={[podRightX, podFrontZ]} to={[podRightX, cz + dir * 0.02]} thickness={P} height={2.4} color="#e4ddcf" />

      {/* fixtures + furniture — WC against the party wall, basin against the
          wet wall, bed with its headboard on the exterior wall */}
      <Toilet id={`${tag}-wc`} at={[wcX, bathCz]} facing="east" />
      <Basin id={`${tag}-basin`} at={[basinX, basinZ]} facing={facing} />
      <Bed id={`${tag}-bed`} at={[cx, bedZ]} headTo={facing} />

      {/* supply stubs rising through the slab from the under-floor branches */}
      <Pipe
        id={`${tag}-wc-cold`}
        color="#3e7fb2"
        points={[[wcX, -0.42, coldZ], [wcX, 0.45, coldZ], [wcX, 0.45, bathCz - dir * 0.2]]}
      />
      <Pipe
        id={`${tag}-basin-cold`}
        color="#3e7fb2"
        points={[[basinX - 0.08, -0.42, coldZ], [basinX - 0.08, 0.5, coldZ], [basinX - 0.08, 0.5, basinZ - dir * 0.1]]}
      />
      <Pipe
        id={`${tag}-basin-hot`}
        color="#b87333"
        points={[[basinX + 0.08, -0.42, hotZ], [basinX + 0.08, 0.5, hotZ], [basinX + 0.08, 0.5, basinZ - dir * 0.1]]}
      />

      {/* drains dropping through the slab to the collector under the bathroom line */}
      <Pipe id={`${tag}-drain`} color="#8f969e" radius={0.04} points={[[wcX, 0.2, bathCz], [wcX, -0.42, bathCz]]} />
      <Pipe
        id={`${tag}-basin-drain`}
        color="#8f969e"
        radius={0.03}
        points={[[basinX, 0.42, basinZ], [basinX, -0.42, basinZ], [basinX, -0.42, bathCz]]}
      />
    </>
  );
}
