import { GableRoof, Outlet, Slab, Story, Wall, Window } from '@declit/core';
import Services from './Services';

const T = 0.3;
const KNEE = 1.4; // low attic knee walls the roof rests on

/**
 * The attic: low knee walls under a gable roof, lit by dormer-height gable
 * windows. The roof shares this story so it lands exactly on the wall tops.
 */
export default function Attic({ roofRise }: { roofRise: number }) {
  return (
    <Story level={2} height={KNEE}>
      {/* stairwell void over the switchback stair below */}
      <Slab
        id="a-floor"
        outline={[[-0.4, -0.4], [10.4, -0.4], [10.4, 8.4], [-0.4, 8.4]]}
        holes={[[[7.4, 0.7], [9.6, 0.7], [9.6, 4.3], [7.4, 4.3]]]}
        thickness={0.28}
      />

      <Wall id="a-south" from={[0, 0]} to={[10, 0]} thickness={T}>
        <Outlet id="a-out-s" at={5} height={0.3} />
      </Wall>
      <Wall id="a-east" from={[10, 0]} to={[10, 8]} thickness={T}>
        {/* gable-end window sits above the knee wall, in the roof triangle */}
        <Window id="a-win-e" at={4} width={1.2} sill={0.4} height={0.9} />
        <Outlet id="a-out-e" at={6} height={0.3} />
      </Wall>
      <Wall id="a-north" from={[10, 8]} to={[0, 8]} thickness={T} />
      <Wall id="a-west" from={[0, 8]} to={[0, 0]} thickness={T}>
        <Window id="a-win-w" at={4} width={1.2} sill={0.4} height={0.9} />
        <Outlet id="a-out-w" at={2} height={0.3} />
      </Wall>

      <Services tag="a" top />
      <GableRoof id="roof" at={[0, 0]} width={10} depth={8} rise={roofRise} overhang={0.5} />
    </Story>
  );
}
