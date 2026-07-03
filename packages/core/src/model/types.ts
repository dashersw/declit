export type Vec2 = [number, number];

export type OpeningKind = 'door' | 'window' | 'custom';

export interface OpeningSpec {
  id: string;
  kind: OpeningKind;
  /** center of the opening, measured along the wall from its `from` point (meters) */
  at: number;
  width: number;
  height: number;
  /** bottom of the opening above the wall base (0 for doors) */
  sill: number;
}

export interface WallSpec {
  id: string;
  type: 'wall';
  from: Vec2;
  to: Vec2;
  thickness: number;
  height: number;
  elevation: number;
  /** participate in automatic corner joining (default true) */
  join: boolean;
  openings: OpeningSpec[];
}

export interface SlabSpec {
  id: string;
  type: 'slab';
  outline: Vec2[];
  thickness: number;
  elevation: number;
}

export type ElementSpec = WallSpec | SlabSpec;

export interface ResolvedOpening extends OpeningSpec {
  valid: boolean;
  problems: string[];
}

export interface ResolvedWall extends Omit<WallSpec, 'openings'> {
  /** centerline length, before join adjustments */
  length: number;
  /** join adjustment along the wall direction at the `from` end: + extends, - shrinks */
  extStart: number;
  /** join adjustment at the `to` end */
  extEnd: number;
  openings: ResolvedOpening[];
}

export interface ModelProblem {
  elementId: string;
  message: string;
}

export interface ResolvedModel {
  walls: Map<string, ResolvedWall>;
  problems: ModelProblem[];
}
