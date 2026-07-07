import { dist } from './math';
import type {
  ElementSpec,
  ModelProblem,
  ResolvedModel,
  ResolvedOpening,
  ResolvedWall,
  WallSpec,
} from './types';

/** endpoints within this radius (x, z, and elevation) are considered the same corner node */
const NODE_TOL = 0.005;
const EPS = 1e-6;

function bucketKey(bx: number, bz: number, be: number): string {
  return `${bx}|${bz}|${be}`;
}

function nodeKey(x: number, z: number, elevation: number): string {
  return bucketKey(Math.round(x / NODE_TOL), Math.round(z / NODE_TOL), Math.round(elevation / NODE_TOL));
}

class UnionFind {
  private parent: number[] = [];
  makeSet(x: number) {
    this.parent[x] = x;
  }
  find(x: number): number {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(a: number, b: number) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent[rb] = ra;
  }
}

type Endpoint = { wall: WallSpec; end: 'start' | 'end'; index: number };

/**
 * Pure constraint pass over the raw element specs.
 *
 * Corner rule: at every node where 2+ wall endpoints meet, the first wall by id
 * ("primary") extends past the node by half the thickest other wall, and every
 * other wall shrinks back by half the primary's thickness. This produces clean
 * butt joints for L, T, X and straight junctions at any wall thickness.
 */
export function resolveModel(elements: Iterable<ElementSpec>): ResolvedModel {
  const walls: WallSpec[] = [];
  for (const el of elements) if (el.type === 'wall') walls.push(el);

  const problems: ModelProblem[] = [];
  const ext = new Map<string, { start: number; end: number }>();
  for (const w of walls) ext.set(w.id, { start: 0, end: 0 });

  // collect joinable endpoints and bucket them for fast neighbor lookup
  const endpoints: Endpoint[] = [];
  const buckets = new Map<string, number[]>();
  for (const w of walls) {
    if (dist(w.from, w.to) < NODE_TOL * 2) {
      problems.push({ elementId: w.id, message: 'wall is degenerate (zero length)' });
      continue;
    }
    if (!w.join) continue;
    for (const end of ['start', 'end'] as const) {
      const ep: Endpoint = { wall: w, end, index: endpoints.length };
      endpoints.push(ep);
      const p = end === 'start' ? w.from : w.to;
      const key = nodeKey(p[0], p[1], w.elevation);
      let list = buckets.get(key);
      if (!list) buckets.set(key, (list = []));
      list.push(ep.index);
    }
  }

  // cluster endpoints whose true 3D distance is within NODE_TOL
  const uf = new UnionFind();
  for (let i = 0; i < endpoints.length; i++) uf.makeSet(i);

  for (const ep of endpoints) {
    const p = ep.end === 'start' ? ep.wall.from : ep.wall.to;
    const bx = Math.round(p[0] / NODE_TOL);
    const bz = Math.round(p[1] / NODE_TOL);
    const be = Math.round(ep.wall.elevation / NODE_TOL);

    for (const dx of [-1, 0, 1]) {
      for (const dz of [-1, 0, 1]) {
        for (const de of [-1, 0, 1]) {
          const list = buckets.get(bucketKey(bx + dx, bz + dz, be + de));
          if (!list) continue;
          for (const otherIdx of list) {
            if (otherIdx === ep.index) continue;
            const other = endpoints[otherIdx];
            const op = other.end === 'start' ? other.wall.from : other.wall.to;
            if (Math.hypot(p[0] - op[0], p[1] - op[1], ep.wall.elevation - other.wall.elevation) < NODE_TOL) {
              uf.union(ep.index, otherIdx);
            }
          }
        }
      }
    }
  }

  const clusters = new Map<number, Endpoint[]>();
  for (let i = 0; i < endpoints.length; i++) {
    const root = uf.find(i);
    let list = clusters.get(root);
    if (!list) clusters.set(root, (list = []));
    list.push(endpoints[i]);
  }

  for (const list of clusters.values()) {
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

    const e = ext.get(w.id)!;
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
