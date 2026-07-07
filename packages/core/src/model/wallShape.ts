import * as THREE from 'three';
import type { ResolvedOpening } from './types';

export interface WallShapeInput {
  length: number;
  extStart: number;
  extEnd: number;
  openings: ResolvedOpening[];
}

/**
 * Builds the extrudable outline for a wall's solid, including its openings.
 *
 * Openings flush with the floor (sill 0, e.g. doors) are carved into the outer
 * boundary instead of punched as a hole — a hole's reveal loop includes a
 * bottom "sill" face, which at sill 0 sits exactly on the floor slab's top
 * face and z-fights with it.
 */
export function buildWallShape(
  { length, extStart, extEnd, openings }: WallShapeInput,
  height: number,
  thickness: number
): readonly [THREE.Shape, THREE.ExtrudeGeometryOptions] {
  const valid = openings.filter((o) => o.valid);
  const groundCuts = valid.filter((o) => o.sill <= 1e-6).sort((a, b) => a.at - b.at);
  const holes = valid.filter((o) => o.sill > 1e-6);

  const shape = new THREE.Shape();
  shape.moveTo(-extStart, 0);
  for (const o of groundCuts) {
    const x0 = o.at - o.width / 2;
    const x1 = o.at + o.width / 2;
    shape.lineTo(x0, 0);
    shape.lineTo(x0, o.height);
    shape.lineTo(x1, o.height);
    shape.lineTo(x1, 0);
  }
  shape.lineTo(length + extEnd, 0);
  shape.lineTo(length + extEnd, height);
  shape.lineTo(-extStart, height);
  shape.closePath();
  for (const o of holes) {
    const x0 = o.at - o.width / 2;
    const x1 = o.at + o.width / 2;
    const hole = new THREE.Path();
    hole.moveTo(x0, o.sill);
    hole.lineTo(x0, o.sill + o.height);
    hole.lineTo(x1, o.sill + o.height);
    hole.lineTo(x1, o.sill);
    hole.closePath();
    shape.holes.push(hole);
  }
  return [shape, { depth: thickness, bevelEnabled: false }] as const;
}
