import { Wire } from '@declit/core';

/**
 * Cable runs live on the electrical layer — toggle it in the Layers panel.
 * Drop positions match the outlets and switches placed in Apartment.tsx.
 */
export default function Electrical({
  wallThickness = 0.24,
  ceiling = 2.7,
}: {
  wallThickness?: number;
  ceiling?: number;
}) {
  const y = ceiling - 0.25;
  const t = wallThickness;
  const zs = t / 2 + 0.03;
  const xe = 8 - t / 2 - 0.03;
  const zn = 5 - t / 2 - 0.03;

  return (
    <>
      {/* feed from the breaker panel up to the ring main */}
      <Wire id="wire-feed" points={[[0.5, 1.78, zs], [0.5, y, zs]]} />

      {/* ring main below the ceiling, turning the SE and NE corners */}
      <Wire
        id="wire-main"
        points={[
          [0.5, y, zs],
          [xe, y, zs],
          [xe, y, zn],
          [2.5, y, zn],
        ]}
      />

      {/* drops to the switches and outlets */}
      <Wire id="wire-drop-switch" points={[[2.35, y, zs], [2.35, 1.2, zs]]} />
      <Wire id="wire-drop-living" points={[[3.4, y, zs], [3.4, 0.32, zs]]} />
      <Wire id="wire-drop-desk" points={[[xe, y, 0.9], [xe, 0.32, 0.9]]} />
      <Wire id="wire-drop-kitchen" points={[[xe, y, 4.2], [xe, 0.32, 4.2]]} />
      <Wire id="wire-drop-north" points={[[2.5, y, zn], [2.5, 0.32, zn]]} />
    </>
  );
}
