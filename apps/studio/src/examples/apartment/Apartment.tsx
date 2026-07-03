import { BreakerPanel, Dimension, Door, Level, Outlet, Slab, Switch, useParam, Wall, Window } from '@declit/core';
import Bathroom from './Bathroom';
import Electrical from './Electrical';
import GardenStudio from './GardenStudio';
import Plumbing from './Plumbing';

export default function Apartment() {
  const height = useParam('Wall height', { min: 2.2, max: 3.6, step: 0.05, default: 2.7, unit: 'm' });
  const t = useParam('Exterior wall thickness', { min: 0.1, max: 0.5, step: 0.01, default: 0.24, unit: 'm' });
  const doorAt = useParam('Front door position', { min: 0.6, max: 9, step: 0.05, default: 1.6, unit: 'm' });
  const doorOpen = useParam('Front door open', { min: 0, max: 1, step: 0.01, default: 0.4 });

  return (
    <Level elevation={0} height={height}>
      <Slab
        id="floor"
        outline={[
          [-0.35, -0.35],
          [8.35, -0.35],
          [8.35, 5.35],
          [-0.35, 5.35],
        ]}
        thickness={0.25}
      />

      <Wall id="ext-south" from={[0, 0]} to={[8, 0]} thickness={t}>
        <Door id="front-door" at={doorAt} width={1.0} height={2.15} open={doorOpen} />
        <Window id="win-s1" at={4.6} width={1.8} sill={0.85} height={1.3} />
        <Window id="win-s2" at={6.9} width={1.2} sill={0.85} height={1.3} />
        <Switch id="switch-entry" at={2.35} />
        <Outlet id="outlet-living" at={3.4} />
        <BreakerPanel id="breaker" at={0.5} />
      </Wall>

      <Wall id="ext-east" from={[8, 0]} to={[8, 5]} thickness={t}>
        <Window id="win-e1" at={2.5} width={2.2} sill={0.85} height={1.3} />
        <Outlet id="outlet-desk" at={0.9} />
        <Outlet id="outlet-kitchen" at={4.2} />
      </Wall>

      <Wall id="ext-north" from={[8, 5]} to={[0, 5]} thickness={t}>
        <Window id="win-n1" at={2.2} width={1.4} sill={0.85} height={1.3} />
        <Outlet id="outlet-north" at={5.5} />
      </Wall>

      <Wall id="ext-west" from={[0, 5]} to={[0, 0]} thickness={t}>
        <Outlet id="outlet-west" at={1.2} />
      </Wall>

      <Bathroom exteriorThickness={t} />
      <Electrical wallThickness={t} ceiling={height} />
      <Plumbing exteriorThickness={t} />

      <Dimension from={[0, 0]} to={[8, 0]} offset={0.9} />
      <Dimension from={[0, 5]} to={[0, 0]} offset={0.9} />

      <GardenStudio at={[9.6, 0.6]} />
    </Level>
  );
}
