import { Basin, Bathtub, Door, Outlet, Pipe, Slab, Staircase, Story, Toilet, useStories, Wall, Window } from '@declit/core';
import Services from './Services';

const T = 0.3;

/** Three bedrooms and a bathroom off a small landing, plus the upper stair flight. */
export default function FirstFloor() {
  const { storyHeight } = useStories();

  return (
    <Story level={1}>
      {/* stairwell void over the switchback stair below */}
      <Slab
        id="f-floor"
        outline={[[-0.4, -0.4], [10.4, -0.4], [10.4, 8.4], [-0.4, 8.4]]}
        holes={[[[7.4, 0.7], [9.6, 0.7], [9.6, 4.3], [7.4, 4.3]]]}
        thickness={0.28}
      />

      {/* exterior shell */}
      <Wall id="f-south" from={[0, 0]} to={[10, 0]} thickness={T}>
        <Window id="f-win-s1" at={2} width={1.3} sill={0.9} height={1.3} />
        <Window id="f-win-s2" at={6} width={1.3} sill={0.9} height={1.3} />
        <Outlet id="f-out-s" at={4} />
      </Wall>
      <Wall id="f-east" from={[10, 0]} to={[10, 8]} thickness={T}>
        <Window id="f-win-e" at={5.5} width={1.3} sill={0.9} height={1.3} />
        <Outlet id="f-out-e" at={2.0} />
      </Wall>
      <Wall id="f-north" from={[10, 8]} to={[0, 8]} thickness={T}>
        <Window id="f-win-n1" at={2.5} width={1.3} sill={0.9} height={1.3} />
        <Window id="f-win-n2" at={7} width={1.3} sill={0.9} height={1.3} />
        <Outlet id="f-out-n" at={5} />
      </Wall>
      <Wall id="f-west" from={[0, 8]} to={[0, 0]} thickness={T}>
        <Window id="f-win-w" at={4} width={1.3} sill={0.9} height={1.3} />
        <Outlet id="f-out-w" at={2.0} />
      </Wall>

      {/* cross partition splitting front bedrooms from rear ones */}
      <Wall id="f-corridor-s" from={[0, 4]} to={[7.6, 4]} thickness={0.12} color="#efe9dd">
        <Door id="f-bed1-door" at={1.6} width={0.8} height={2.05} open={0.15} />
        <Door id="f-bed2-door" at={5.4} width={0.8} height={2.05} open={0.15} hinge="end" />
      </Wall>
      {/* master / bath split on the south side */}
      <Wall id="f-part-v" from={[4, 0]} to={[4, 4]} thickness={0.12} color="#efe9dd">
        <Door id="f-bath-door" at={3.2} width={0.7} height={2.0} open={0.1} />
      </Wall>

      <Staircase id="f-stair" at={[7.5, 0.8]} rise={storyHeight} width={2.0} run={3.4} />

      {/* bathroom fixtures (SW room): WC + basin + tub, right beside the wet
          stack on the west wall so every supply and drain is a short run */}
      <Toilet id="f-wc" at={[0.5, 3.3]} facing="east" />
      <Basin id="f-basin" at={[0.95, 3.7]} facing="south" />
      <Bathtub id="f-tub" at={[1.7, 0.62]} />

      {/* supplies teed off the wet stack, hugging the west and north walls */}
      <Pipe id="f-cold-run" color="#3e7fb2" points={[[0.19, 0.45, 3.55], [0.19, 0.45, 0.62], [0.85, 0.45, 0.62]]} />
      <Pipe id="f-hot-run" color="#b87333" points={[[0.19, 0.55, 3.4], [0.19, 0.55, 0.7], [0.85, 0.55, 0.7]]} />
      <Pipe id="f-wc-cold" color="#3e7fb2" points={[[0.19, 0.45, 3.3], [0.42, 0.45, 3.3]]} />
      <Pipe id="f-basin-cold" color="#3e7fb2" points={[[0.19, 0.5, 3.55], [0.19, 0.5, 3.74], [0.7, 0.5, 3.74]]} />
      <Pipe id="f-basin-hot" color="#b87333" points={[[0.19, 0.56, 3.4], [0.19, 0.56, 3.74], [0.7, 0.56, 3.74]]} />

      {/* drains falling to the soil stack */}
      <Pipe id="f-wc-drain" color="#8f969e" radius={0.04} points={[[0.42, 0.12, 3.3], [0.21, 0.12, 3.3], [0.21, 0.12, 3.72]]} />
      <Pipe id="f-basin-drain" color="#8f969e" radius={0.03} points={[[0.95, 0.4, 3.72], [0.95, 0.12, 3.72], [0.21, 0.12, 3.72]]} />
      <Pipe id="f-tub-drain" color="#8f969e" radius={0.04} points={[[0.85, 0.1, 0.62], [0.21, 0.1, 0.62], [0.21, 0.1, 3.72]]} />

      <Services tag="f" />
    </Story>
  );
}
