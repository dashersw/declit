import { BreakerPanel, Door, Outlet, Slab, Staircase, Story, Switch, useStories, Wall, Window } from '@declit/core';
import Services from './Services';

const T = 0.3; // exterior wall thickness

/** Living room, kitchen and entry, with the first flight of stairs. */
export default function GroundFloor() {
  const { storyHeight } = useStories();

  return (
    <Story level={0}>
      <Slab id="g-floor" outline={[[-0.4, -0.4], [10.4, -0.4], [10.4, 8.4], [-0.4, 8.4]]} thickness={0.35} />

      {/* exterior shell */}
      <Wall id="g-south" from={[0, 0]} to={[10, 0]} thickness={T}>
        <Door id="g-front-door" at={3} width={1.1} height={2.2} open={0.35} />
        <Window id="g-win-s1" at={6} width={1.6} sill={0.9} height={1.4} />
        <Window id="g-win-s2" at={8.3} width={1.2} sill={0.9} height={1.4} />
        <Switch id="g-sw-entry" at={4.0} />
        <Outlet id="g-out-s" at={7.2} />
      </Wall>
      <Wall id="g-east" from={[10, 0]} to={[10, 8]} thickness={T}>
        <Window id="g-win-e" at={5.5} width={1.6} sill={0.9} height={1.4} />
        <Outlet id="g-out-e" at={2.0} />
      </Wall>
      <Wall id="g-north" from={[10, 8]} to={[0, 8]} thickness={T}>
        <Window id="g-win-n" at={3.5} width={2.0} sill={0.9} height={1.4} />
        <Outlet id="g-out-n" at={7.5} />
      </Wall>
      <Wall id="g-west" from={[0, 8]} to={[0, 0]} thickness={T}>
        <Window id="g-win-w" at={4} width={1.6} sill={0.9} height={1.4} />
        <Outlet id="g-out-w" at={2.0} />
        {/* the house's breaker panel, at the foot of the electrical riser */}
        <BreakerPanel id="g-panel" at={6.5} height={1.5} face={1} />
      </Wall>

      {/* partition: kitchen (east) from living (west) */}
      <Wall id="g-part" from={[6, 0.15]} to={[6, 5]} thickness={0.12} color="#efe9dd">
        <Door id="g-kitchen-door" at={4.2} width={0.9} height={2.05} open={0.2} hinge="end" />
      </Wall>

      {/* switchback stair in the NE corner, climbing to the first floor */}
      <Staircase id="g-stair" at={[7.5, 0.8]} rise={storyHeight} width={2.0} run={3.4} />

      <Services tag="g" />
    </Story>
  );
}
