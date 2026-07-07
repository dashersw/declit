import type { Vec2 } from './types';

export const sub = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]];
export const add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]];
export const scale = (a: Vec2, s: number): Vec2 => [a[0] * s, a[1] * s];
export const len = (a: Vec2): number => Math.hypot(a[0], a[1]);
export const dist = (a: Vec2, b: Vec2): number => len(sub(a, b));
export const normalize = (a: Vec2): Vec2 => {
  const l = len(a);
  return l === 0 ? [0, 0] : [a[0] / l, a[1] / l];
};

/** perpendicular distance from p to segment a-b, plus the clamped projection */
export function pointToSegment(
  p: Vec2,
  a: Vec2,
  b: Vec2
): { distance: number; t: number; point: Vec2 } {
  const ab = sub(b, a);
  const abLenSq = ab[0] * ab[0] + ab[1] * ab[1];
  if (abLenSq === 0) return { distance: dist(p, a), t: 0, point: a };
  let t = ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / abLenSq;
  t = Math.max(0, Math.min(1, t));
  const point = add(a, scale(ab, t));
  return { distance: dist(p, point), t, point };
}

/** three.js Y-rotation that points local +X along the wall direction in the XZ plane */
export const angleOfWall = (from: Vec2, to: Vec2): number =>
  -Math.atan2(to[1] - from[1], to[0] - from[0]);
