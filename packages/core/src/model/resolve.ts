import { dist } from './math';
import type {
  ElementSpec,
  ModelProblem,
  ResolvedModel,
  ResolvedOpening,
  ResolvedWall,
  WallSpec,
} from './types';

/** endpoints closer than this (per axis bucket) are considered the same corner node */
const NODE_TOL = 0.005;
const EPS = 1e-6;

function nodeKey(x: number, z: number, elevation: number): string {
  return `${Math.round(x / NODE_TOL)}|${Math.round(z / NODE_TOL)}|${Math.round(elevation / NODE_TOL)}`;
}

/**
 * Pure constraint pass over the raw element specs.
 *
 * Corner rule: at every node where 2+ wall endpoints meet, the first wall by id
 * ("primary") extends past the node by half the thickest other wall, and every
 * other wall shrinks back by half the primary's thickness. This produces clean
 * butt joints for L, T, X and straight junctions at any wall thickness.
 */
export function resolveModel(
  elements: Iterable<ElementSpec>,
  prev?: { elements: Map<string, ElementSpec>; model: ResolvedModel }
): ResolvedModel {
  const walls: WallSpec[] = [];
  for (const el of elements) if (el.type === 'wall') walls.push(el);

  const problems: ModelProblem[] = [];
  const ext = new Map<string, { start: number; end: number }>();
  for (const w of walls) ext.set(w.id, { start: 0, end: 0 });

  const nodes = new Map<string, { wall: WallSpec; end: 'start' | 'end' }[]>();
  for (const w of walls) {
    if (dist(w.from, w.to) < NODE_TOL * 2) {
      problems.push({ elementId: w.id, message: 'wall is degenerate (zero length)' });
      continue;
    }
    if (!w.join) continue;
    for (const end of ['start', 'end'] as const) {
      const p = end === 'start' ? w.from : w.to;
      const key = nodeKey(p[0], p[1], w.elevation);
      let list = nodes.get(key);
      if (!list) nodes.set(key, (list = []));
      list.push({ wall: w, end });
    }
  }

  for (const list of nodes.values()) {
    if (list.length < 2) continue;
    const sorted = [...list].sort((a, b) => (a.wall.id < b.wall.id ? -1 : 1));
    const [primary, ...rest] = sorted;
    const maxOther = Math.max(...rest.map((e) => e.wall.thickness));
    ext.get(primary.wall.id)![primary.end] += maxOther / 2;
    for (const e of rest) {
      ext.get(e.wall.id)![e.end] -= primary.wall.thickness / 2;
    }
  }

  const resolvedWalls = new Map<string, ResolvedWall>();
  for (const w of walls) {
    const length = dist(w.from, w.to);
    const e = ext.get(w.id)!;

    // spec identity + unchanged joint extents means the resolved wall is
    // provably identical, so reuse it instead of rebuilding openings/geometry
    const prevWall = prev?.elements.get(w.id) === w ? prev.model.walls.get(w.id) : undefined;
    if (prevWall && prevWall.extStart === e.start && prevWall.extEnd === e.end) {
      resolvedWalls.set(w.id, prevWall);
      for (const o of prevWall.openings) {
        for (const p of o.problems) problems.push({ elementId: o.id, message: p });
      }
      continue;
    }

    const openings: ResolvedOpening[] = [...w.openings]
      .sort((a, b) => a.at - b.at)
      .map((o) => ({ ...o, valid: true, problems: [] }));

    for (const o of openings) {
      if (o.width <= 0 || o.height <= 0) o.problems.push('opening has non-positive size');
      if (o.at - o.width / 2 < -EPS) o.problems.push('opening extends past wall start');
      if (o.at + o.width / 2 > length + EPS) o.problems.push('opening extends past wall end');
      if (o.sill < -EPS) o.problems.push('opening sill is below the wall base');
      if (o.sill + o.height > w.height + EPS) o.problems.push('opening exceeds wall height');
    }
    for (let i = 0; i < openings.length; i++) {
      for (let j = i + 1; j < openings.length; j++) {
        const a = openings[i];
        const b = openings[j];
        if (a.at + a.width / 2 > b.at - b.width / 2 + EPS) {
          a.problems.push(`overlaps opening "${b.id}"`);
          b.problems.push(`overlaps opening "${a.id}"`);
        }
      }
    }
    for (const o of openings) {
      o.valid = o.problems.length === 0;
      for (const p of o.problems) problems.push({ elementId: o.id, message: p });
    }

    resolvedWalls.set(w.id, {
      ...w,
      length,
      extStart: e.start,
      extEnd: e.end,
      openings,
    });
  }

  return { walls: resolvedWalls, problems };
}
