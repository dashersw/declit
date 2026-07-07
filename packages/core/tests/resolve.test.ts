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

describe('resolver memoization', () => {
  it('reuses ResolvedWall identity when the spec and joints are unchanged', () => {
    const a = wall('a', [0, 0], [5, 0]);
    const b = wall('b', [0, 0], [0, 4]);
    const elements = new Map([
      [a.id, a],
      [b.id, b],
    ]);
    const first = resolveModel(elements.values());

    // a fresh Map with the same (===) spec objects, as store.ts produces on an
    // unrelated register/unregister elsewhere in the model
    const elements2 = new Map([
      [a.id, a],
      [b.id, b],
    ]);
    const second = resolveModel(elements2.values(), { elements, model: first });
    expect(second.walls.get('a')).toBe(first.walls.get('a'));
    expect(second.walls.get('b')).toBe(first.walls.get('b'));
  });

  it('keeps reporting a degenerate wall problem across reuse', () => {
    const bad = wall('bad', [1, 1], [1, 1]);
    const ok = wall('ok', [0, 0], [5, 0]);
    const elements = new Map([
      [bad.id, bad],
      [ok.id, ok],
    ]);
    const first = resolveModel(elements.values());
    expect(first.problems.some((p) => p.elementId === 'bad')).toBe(true);

    const second = resolveModel(elements.values(), { elements, model: first });
    expect(second.problems.some((p) => p.elementId === 'bad')).toBe(true);
  });

  it('rebuilds only the wall whose spec changed, keeping an unaffected neighbor identical', () => {
    const a = wall('a', [0, 0], [5, 0]);
    const b = wall('b', [0, 0], [0, 4]);
    const elements = new Map([
      [a.id, a],
      [b.id, b],
    ]);
    const first = resolveModel(elements.values());

    const a2 = { ...a, openings: [opening('d', 2)] };
    const elements2 = new Map([
      [a2.id, a2],
      [b.id, b],
    ]);
    const second = resolveModel(elements2.values(), { elements, model: first });

    expect(second.walls.get('a')).not.toBe(first.walls.get('a'));
    expect(second.walls.get('b')).toBe(first.walls.get('b'));
  });

  it('defeats reuse when a new neighbor changes a wall corner extension', () => {
    const c = wall('c', [10, 10], [15, 10]);
    const elements = new Map([[c.id, c]]);
    const first = resolveModel(elements.values());
    expect(first.walls.get('c')!.extStart).toBeCloseTo(0);

    const d = wall('d', [10, 10], [10, 14]);
    const elements2 = new Map([
      [c.id, c],
      [d.id, d],
    ]);
    const second = resolveModel(elements2.values(), { elements, model: first });

    expect(second.walls.get('c')).not.toBe(first.walls.get('c'));
    expect(second.walls.get('c')!.extStart).toBeCloseTo(0.12);
  });
});
