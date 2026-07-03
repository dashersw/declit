/** compass direction a fixture's front faces, in plan (+z = north) */
export type Facing = 'north' | 'south' | 'east' | 'west';

/** three.js Y-rotation that points a component's local +Z toward `facing` */
export const yawOf = (facing: Facing): number =>
  ({ north: 0, south: Math.PI, east: Math.PI / 2, west: -Math.PI / 2 })[facing];
