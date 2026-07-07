import { Door, Switch, Wall } from '@declit/core';

export default function Bathroom({ exteriorThickness = 0.24 }: { exteriorThickness?: number }) {
  const t = exteriorThickness;
  return (
    <>
      <Wall id="bath-a" from={[0, 3.2]} to={[2.6, 3.2]} thickness={0.1} color="#efe9dd">
        <Door id="bath-door" at={1.95} width={0.8} height={2.05} open={0.25} hinge="end" />
        <Switch at={1.35} face={-1} />
      </Wall>
      <Wall id="bath-b" from={[2.6, 3.2]} to={[2.6, 5]} thickness={0.1} color="#efe9dd" />
    </>
  );
}
