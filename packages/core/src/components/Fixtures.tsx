import { useId } from 'react';
import { useLayer } from '../layers';
import type { Vec2 } from '../model/types';
import { selectHandler, useSelected } from '../selection';
import { yawOf, type Facing } from './facing';
import { useLevel } from './Level';

const PORCELAIN = '#f4f4f2';

interface FixtureBaseProps {
  id?: string;
  /** plan-center of the fixture's footprint */
  at: Vec2;
  color?: string;
  layer?: string;
}

function useFixture(idProp: string | undefined, kind: string, layer: string) {
  const autoId = useId();
  const id = idProp ?? `${kind}${autoId}`;
  const level = useLevel();
  const visible = useLayer(layer);
  const selected = useSelected(id);
  return { id, elevation: level.elevation, visible, emissive: selected ? 0.25 : 0 };
}

export interface ToiletProps extends FixtureBaseProps {
  /** which way the bowl faces (the tank sits against the opposite wall) */
  facing?: Facing;
}

/** A WC: tank against the wall behind it, bowl facing `facing`. */
export function Toilet({ id: idProp, at, facing = 'north', color = PORCELAIN, layer = 'furniture' }: ToiletProps) {
  const { id, elevation, visible, emissive } = useFixture(idProp, 'toilet', layer);
  if (!visible) return null;
  const mat = <meshStandardMaterial color={color} roughness={0.35} emissive="#2563eb" emissiveIntensity={emissive} />;
  return (
    <group position={[at[0], elevation, at[1]]} rotation={[0, yawOf(facing), 0]} onClick={selectHandler(id)}>
      {/* bowl */}
      <mesh castShadow position={[0, 0.2, 0.07]}>
        <boxGeometry args={[0.38, 0.4, 0.48]} />
        {mat}
      </mesh>
      {/* tank */}
      <mesh castShadow position={[0, 0.5, -0.24]}>
        <boxGeometry args={[0.42, 0.45, 0.16]} />
        {mat}
      </mesh>
    </group>
  );
}

export interface BasinProps extends FixtureBaseProps {
  /** which way the user stands; the basin backs onto the opposite wall */
  facing?: Facing;
}

/** A washbasin on a pedestal. */
export function Basin({ id: idProp, at, facing = 'north', color = PORCELAIN, layer = 'furniture' }: BasinProps) {
  const { id, elevation, visible, emissive } = useFixture(idProp, 'basin', layer);
  if (!visible) return null;
  const mat = <meshStandardMaterial color={color} roughness={0.35} emissive="#2563eb" emissiveIntensity={emissive} />;
  return (
    <group position={[at[0], elevation, at[1]]} rotation={[0, yawOf(facing), 0]} onClick={selectHandler(id)}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[0.5, 0.16, 0.4]} />
        {mat}
      </mesh>
      <mesh castShadow position={[0, 0.21, -0.04]}>
        <cylinderGeometry args={[0.06, 0.08, 0.42, 12]} />
        {mat}
      </mesh>
    </group>
  );
}

export interface BathtubProps extends FixtureBaseProps {
  /** outer length along x (before rotation) */
  width?: number;
  /** outer width along z (before rotation) */
  depth?: number;
  facing?: Facing;
}

/** A bathtub: outer shell with a recessed tub. */
export function Bathtub({
  id: idProp,
  at,
  width = 1.7,
  depth = 0.75,
  facing = 'north',
  color = PORCELAIN,
  layer = 'furniture',
}: BathtubProps) {
  const { id, elevation, visible, emissive } = useFixture(idProp, 'bathtub', layer);
  if (!visible) return null;
  const mat = <meshStandardMaterial color={color} roughness={0.35} emissive="#2563eb" emissiveIntensity={emissive} />;
  return (
    <group position={[at[0], elevation, at[1]]} rotation={[0, yawOf(facing), 0]} onClick={selectHandler(id)}>
      <mesh castShadow position={[0, 0.28, 0]}>
        <boxGeometry args={[width, 0.55, depth]} />
        {mat}
      </mesh>
      {/* water line */}
      <mesh position={[0, 0.565, 0]}>
        <boxGeometry args={[width - 0.16, 0.01, depth - 0.16]} />
        <meshStandardMaterial color="#bfe0ea" roughness={0.1} emissive="#2563eb" emissiveIntensity={emissive} />
      </mesh>
    </group>
  );
}
