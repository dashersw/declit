import { describe, expect, it } from 'vitest';
import { buildWallShape } from '../src/model/wallShape';
import type { ResolvedOpening } from '../src/model/types';

const resolvedOpening = (extra: Partial<ResolvedOpening> = {}): ResolvedOpening => ({
  id: 'o',
  kind: 'door',
  at: 2,
  width: 1,
  height: 2.1,
  sill: 0,
  valid: true,
  problems: [],
  ...extra,
});

describe('buildWallShape', () => {
  it('carves a ground-level opening into the outer boundary instead of a hole', () => {
    const door = resolvedOpening();
    const [shape] = buildWallShape({ length: 5, extStart: 0, extEnd: 0, openings: [door] }, 2.8, 0.2);

    expect(shape.holes).toHaveLength(0);
    const ys = shape.getPoints().map((p) => p.y);
    expect(Math.min(...ys)).toBe(0);
    expect(ys).toContain(door.height);
  });

  it('still punches a hole for openings above the floor', () => {
    const window = resolvedOpening({ kind: 'window', width: 1.6, height: 1.2, sill: 0.9 });
    const [shape] = buildWallShape({ length: 5, extStart: 0, extEnd: 0, openings: [window] }, 2.8, 0.2);

    expect(shape.holes).toHaveLength(1);
  });

  it('ignores invalid openings', () => {
    const door = resolvedOpening({ valid: false });
    const [shape] = buildWallShape({ length: 5, extStart: 0, extEnd: 0, openings: [door] }, 2.8, 0.2);

    expect(shape.holes).toHaveLength(0);
    expect(shape.getPoints().map((p) => p.y)).not.toContain(door.height);
  });
});
