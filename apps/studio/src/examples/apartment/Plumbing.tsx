import { Pipe } from '@declit/core';

/**
 * Water supply and drainage for the bathroom (the NW room).
 * Pipes live on the plumbing layer — toggle it in the Layers panel.
 */
export default function Plumbing({ exteriorThickness = 0.24 }: { exteriorThickness?: number }) {
  const zf = 5 - exteriorThickness / 2 - 0.08;

  return (
    <>
      {/* cold riser from below the slab, run along the north wall, stub for the toilet */}
      <Pipe
        id="pipe-cold"
        color="#3e7fb2"
        points={[
          [0.9, -0.15, zf],
          [0.9, 0.55, zf],
          [2.2, 0.55, zf],
          [2.2, 0.35, zf],
        ]}
      />

      {/* hot supply to the sink */}
      <Pipe
        id="pipe-hot"
        points={[
          [1.05, -0.15, zf],
          [1.05, 0.68, zf],
          [1.62, 0.68, zf],
          [1.62, 0.45, zf],
        ]}
      />

      {/* drain drop from the sink into the slab */}
      <Pipe
        id="pipe-drain"
        color="#8f969e"
        radius={0.048}
        points={[
          [1.55, 0.42, zf - 0.12],
          [1.55, -0.15, zf - 0.12],
        ]}
      />
    </>
  );
}
