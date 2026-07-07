import { describe, expect, it } from 'vitest';
import { resolveModel } from '../src/model/resolve';
import type { OpeningSpec, Vec2, WallSpec } from '../src/model/types';

const wall = (id: string, from: Vec2, to: Vec2, extra: Partial<WallSpec> = {}): WallSpec => ({
  id,
  type: 'wall',
  from,
  to,
  thickness: 0.24,
  height: 2.7,
  elevation: 0,
  join: true,
  openings: [],
  ...extra,
});

const opening = (id: string, at: number, extra: Partial<OpeningSpec> = {}): OpeningSpec => ({
  id,
  kind: 'door',
  at,
  width: 0.9,
  height: 2.1,
  sill: 0,
  ...extra,
});

describe('corner joins', () => {
  it('L-corner: primary extends by half the other thickness, other shrinks by half the primary', () => {
    const r = resolveModel([wall('a', [0, 0], [5, 0]), wall('b', [0, 0], [0, 4])]);
    expect(r.walls.get('a')!.extStart).toBeCloseTo(0.12);
    expect(r.walls.get('a')!.extEnd).toBeCloseTo(0);
    expect(r.walls.get('b')!.extStart).toBeCloseTo(-0.12);
    expect(r.walls.get('b')!.extEnd).toBeCloseTo(0);
  });

  it('straight continuation stays flush', () => {
    const r = resolveModel([wall('a', [0, 0], [3, 0]), wall('b', [3, 0], [6, 0])]);
    expect(r.walls.get('a')!.extEnd).toBeCloseTo(0.12);
    expect(r.walls.get('b')!.extStart).toBeCloseTo(-0.12);
  });

  it('T-junction: primary passes through, both bars butt into it', () => {
    const r = resolveModel([
      wall('a', [2, 0], [2, 3]),
      wall('b', [0, 3], [2, 3]),
      wall('c', [2, 3], [4, 3]),
    ]);
    expect(r.walls.get('a')!.extEnd).toBeCloseTo(0.12);
    expect(r.walls.get('b')!.extEnd).toBeCloseTo(-0.12);
    expect(r.walls.get('c')!.extStart).toBeCloseTo(-0.12);
  });

  it('mixed thickness: extensions derive from the neighbor thickness', () => {
    const r = resolveModel([
      wall('a', [0, 0], [5, 0], { thickness: 0.3 }),
      wall('b', [0, 0], [0, 4], { thickness: 0.1 }),
    ]);
    expect(r.walls.get('a')!.extStart).toBeCloseTo(0.05);
    expect(r.walls.get('b')!.extStart).toBeCloseTo(-0.15);
  });

  it('endpoints within tolerance snap to the same node', () => {
    const r = resolveModel([wall('a', [0, 0], [5, 0]), wall('b', [0.002, 0.001], [0, 4])]);
    expect(r.walls.get('a')!.extStart).toBeCloseTo(0.12);
    expect(r.walls.get('b')!.extStart).toBeCloseTo(-0.12);
  });

  it('walls on different elevations do not join', () => {
    const r = resolveModel([wall('a', [0, 0], [5, 0]), wall('b', [0, 0], [0, 4], { elevation: 3 })]);
    expect(r.walls.get('a')!.extStart).toBeCloseTo(0);
    expect(r.walls.get('b')!.extStart).toBeCloseTo(0);
  });

  it('join: false opts a wall out of corner solving', () => {
    const r = resolveModel([wall('a', [0, 0], [5, 0]), wall('b', [0, 0], [0, 4], { join: false })]);
    expect(r.walls.get('a')!.extStart).toBeCloseTo(0);
    expect(r.walls.get('b')!.extStart).toBeCloseTo(0);
  });

  it('degenerate walls are reported', () => {
    const r = resolveModel([wall('a', [1, 1], [1, 1])]);
    expect(r.problems.some((p) => p.elementId === 'a' && /degenerate/.test(p.message))).toBe(true);
  });
});

describe('opening validation', () => {
  it('an opening that fits is valid', () => {
    const r = resolveModel([wall('a', [0, 0], [5, 0], { openings: [opening('d', 2)] })]);
    const o = r.walls.get('a')!.openings[0];
    expect(o.valid).toBe(true);
    expect(r.problems).toHaveLength(0);
  });

  it('an opening past the wall end is invalid', () => {
    const r = resolveModel([wall('a', [0, 0], [5, 0], { openings: [opening('d', 4.8)] })]);
    const o = r.walls.get('a')!.openings[0];
    expect(o.valid).toBe(false);
    expect(o.problems).toContain('opening extends past wall end');
  });

  it('a window exceeding the wall height is invalid', () => {
    const r = resolveModel([
      wall('a', [0, 0], [5, 0], {
        openings: [opening('w', 2, { kind: 'window', sill: 0.9, height: 2 })],
      }),
    ]);
    expect(r.walls.get('a')!.openings[0].problems).toContain('opening exceeds wall height');
  });

  it('overlapping openings invalidate each other', () => {
    const r = resolveModel([
      wall('a', [0, 0], [5, 0], { openings: [opening('d1', 2), opening('d2', 2.5)] }),
    ]);
    const [o1, o2] = r.walls.get('a')!.openings;
    expect(o1.valid).toBe(false);
    expect(o2.valid).toBe(false);
    expect(o1.problems[0]).toMatch(/overlaps/);
  });

  it('invalid openings appear in the model problem list with their id', () => {
    const r = resolveModel([wall('a', [0, 0], [5, 0], { openings: [opening('front-door', 4.9)] })]);
    expect(r.problems.some((p) => p.elementId === 'front-door')).toBe(true);
  });
});

describe('T-into-face joins', () => {
  it('shrinks a wall that ends on another wall face', () => {
    const main = wall('main', [0, 0], [5, 0]);
    const tee = wall('tee', [2.5, 0], [2.5, 3]);
    const r = resolveModel([main, tee]);
    expect(r.walls.get('tee')!.extStart).toBeCloseTo(-0.12);
    expect(r.walls.get('main')!.extStart).toBeCloseTo(0);
    expect(r.walls.get('main')!.extEnd).toBeCloseTo(0);
  });

  it('uses the landed-on wall thickness for the shrink amount', () => {
    const main = wall('main', [0, 0], [5, 0], { thickness: 0.3 });
    const tee = wall('tee', [2.5, 0], [2.5, 3]);
    const r = resolveModel([main, tee]);
    expect(r.walls.get('tee')!.extStart).toBeCloseTo(-0.15);
  });

  it('resolves bathroom-style walls without manual t/2 offset', () => {
    const t = 0.24;
    const exterior = wall('exterior', [0, 0], [0, 5], { thickness: t });
    const partition = wall('partition', [0, 3.2], [2.6, 3.2], { thickness: 0.1 });
    const r = resolveModel([exterior, partition]);
    expect(r.walls.get('partition')!.extStart).toBeCloseTo(-t / 2);
    expect(r.walls.get('exterior')!.extStart).toBeCloseTo(0);
  });

  it('uses the node path when an endpoint meets another endpoint', () => {
    const a = wall('a', [0, 0], [5, 0]);
    const b = wall('b', [5, 0], [5, 3]);
    const r = resolveModel([a, b]);
    expect(r.walls.get('a')!.extEnd).toBeCloseTo(0.12);
    expect(r.walls.get('b')!.extStart).toBeCloseTo(-0.12);
  });

  it('does not T-join when the projection is too close to the other wall endpoint', () => {
    const a = wall('a', [0, 0], [2, 0]);
    const b = wall('b', [1.997, 0], [1.997, 3]);
    const r = resolveModel([a, b]);
    expect(r.walls.get('b')!.extStart).toBeCloseTo(0);
  });

  it('does not join when the projection falls outside the other wall', () => {
    const a = wall('a', [0, 0], [2, 0]);
    const b = wall('b', [3, 0], [3, 3]);
    const r = resolveModel([a, b]);
    expect(r.walls.get('b')!.extStart).toBeCloseTo(0);
  });

  it('picks the closest wall face when several are near', () => {
    const a = wall('a', [0, 0], [5, 0]);
    const c = wall('c', [0, 2], [5, 2]);
    const tee = wall('tee', [2.5, -1], [2.5, 0.001]);
    const r = resolveModel([a, c, tee]);
    expect(r.walls.get('tee')!.extEnd).toBeCloseTo(-0.12);
  });

  it('can shrink both ends of a wall when each lands on a different face', () => {
    const a = wall('a', [0, 0], [5, 0]);
    const b = wall('b', [0, 3], [5, 3]);
    const bridge = wall('bridge', [1, 0], [1, 3]);
    const r = resolveModel([a, b, bridge]);
    expect(r.walls.get('bridge')!.extStart).toBeCloseTo(-0.12);
    expect(r.walls.get('bridge')!.extEnd).toBeCloseTo(-0.12);
  });

  it('walls on different elevations do not T-join', () => {
    const main = wall('main', [0, 0], [5, 0]);
    const tee = wall('tee', [2.5, 0], [2.5, 3], { elevation: 3 });
    const r = resolveModel([main, tee]);
    expect(r.walls.get('tee')!.extStart).toBeCloseTo(0);
  });

  it('join: false opts a wall out of T-joining', () => {
    const main = wall('main', [0, 0], [5, 0]);
    const tee = wall('tee', [2.5, 0], [2.5, 3], { join: false });
    const r = resolveModel([main, tee]);
    expect(r.walls.get('tee')!.extStart).toBeCloseTo(0);
  });

  it('does not land on a wall that has join: false', () => {
    const main = wall('main', [0, 0], [5, 0], { join: false });
    const tee = wall('tee', [2.5, 0], [2.5, 3]);
    const r = resolveModel([main, tee]);
    expect(r.walls.get('tee')!.extStart).toBeCloseTo(0);
  });

  it('shrinks multiple walls that land on the same face', () => {
    const main = wall('main', [0, 0], [5, 0]);
    const left = wall('left', [1, 0], [1, 2]);
    const right = wall('right', [4, 0], [4, 2]);
    const r = resolveModel([main, left, right]);
    expect(r.walls.get('left')!.extStart).toBeCloseTo(-0.12);
    expect(r.walls.get('right')!.extStart).toBeCloseTo(-0.12);
    expect(r.walls.get('main')!.extStart).toBeCloseTo(0);
  });
});
