import { useId } from 'react';
import { useLayer } from '../layers';
import type { Vec2 } from '../model/types';
import { selectHandler, useSelected } from '../selection';
import { yawOf, type Facing } from './facing';
import { useLevel } from './Level';

interface FurnitureBaseProps {
  id?: string;
  /** plan-center of the footprint */
  at: Vec2;
  layer?: string;
}

function useFurniture(idProp: string | undefined, kind: string, layer: string) {
  const autoId = useId();
  const id = idProp ?? `${kind}${autoId}`;
  const level = useLevel();
  const visible = useLayer(layer);
  const selected = useSelected(id);
  return { id, elevation: level.elevation, visible, emissive: selected ? 0.25 : 0 };
}

export interface BedProps extends FurnitureBaseProps {
  width?: number;
  length?: number;
  /** which side the headboard is on — usually the wall the bed backs onto */
  headTo?: Facing;
  mattressColor?: string;
  headboardColor?: string;
}

/** A bed: mattress plus a headboard slab on the `headTo` side. */
export function Bed({
  id: idProp,
  at,
  width = 1.5,
  length = 2.0,
  headTo = 'north',
  mattressColor = '#e9e3d6',
  headboardColor = '#6d5844',
  layer = 'furniture',
}: BedProps) {
  const { id, elevation, visible, emissive } = useFurniture(idProp, 'bed', layer);
  if (!visible) return null;
  // local -z is the head end; rotate so it points at `headTo`
  const yaw = yawOf(headTo) + Math.PI;
  return (
    <group position={[at[0], elevation, at[1]]} rotation={[0, yaw, 0]} onClick={selectHandler(id)}>
      <mesh castShadow position={[0, 0.32, 0]}>
        <boxGeometry args={[width, 0.28, length]} />
        <meshStandardMaterial color={mattressColor} roughness={0.9} emissive="#2563eb" emissiveIntensity={emissive} />
      </mesh>
      <mesh castShadow position={[0, 0.55, -length / 2]}>
        <boxGeometry args={[width + 0.1, 1.0, 0.1]} />
        <meshStandardMaterial color={headboardColor} roughness={0.7} emissive="#2563eb" emissiveIntensity={emissive} />
      </mesh>
    </group>
  );
}

export interface LoungerProps extends FurnitureBaseProps {
  /** which way the foot end points — where the sun (or the pool) is */
  facing?: Facing;
  frameColor?: string;
  padColor?: string;
}

/** A sun lounger (şezlong): frame, cushion, and a tilted backrest at the head end. */
export function Lounger({
  id: idProp,
  at,
  facing = 'south',
  frameColor = '#8a7a63',
  padColor = '#efe7d6',
  layer = 'furniture',
}: LoungerProps) {
  const { id, elevation, visible, emissive } = useFurniture(idProp, 'lounger', layer);
  if (!visible) return null;
  const frame = <meshStandardMaterial color={frameColor} roughness={0.8} emissive="#2563eb" emissiveIntensity={emissive} />;
  const pad = <meshStandardMaterial color={padColor} roughness={0.9} emissive="#2563eb" emissiveIntensity={emissive} />;
  return (
    <group position={[at[0], elevation, at[1]]} rotation={[0, yawOf(facing), 0]} onClick={selectHandler(id)}>
      {[[-0.26, -0.55], [0.26, -0.55], [-0.26, 0.55], [0.26, 0.55]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0.08, z]}>
          <boxGeometry args={[0.05, 0.16, 0.05]} />
          {frame}
        </mesh>
      ))}
      <mesh castShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[0.6, 0.07, 1.3]} />
        {frame}
      </mesh>
      <mesh castShadow position={[0, 0.25, 0.05]}>
        <boxGeometry args={[0.56, 0.07, 1.2]} />
        {pad}
      </mesh>
      {/* backrest, tilted over the head end */}
      <mesh castShadow position={[0, 0.52, -0.72]} rotation={[-0.6, 0, 0]}>
        <boxGeometry args={[0.56, 0.6, 0.07]} />
        {pad}
      </mesh>
    </group>
  );
}

export interface ParasolProps extends FurnitureBaseProps {
  canopyColor?: string;
  poleColor?: string;
  height?: number;
}

/** A sun umbrella: weighted base, pole, and a cone canopy. */
export function Parasol({
  id: idProp,
  at,
  canopyColor = '#d9714e',
  poleColor = '#8a8a86',
  height = 2.15,
  layer = 'furniture',
}: ParasolProps) {
  const { id, elevation, visible, emissive } = useFurniture(idProp, 'parasol', layer);
  if (!visible) return null;
  return (
    <group position={[at[0], elevation, at[1]]} onClick={selectHandler(id)}>
      <mesh castShadow position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 0.06, 16]} />
        <meshStandardMaterial color="#6b6b67" roughness={0.6} emissive="#2563eb" emissiveIntensity={emissive} />
      </mesh>
      <mesh castShadow position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.022, 0.022, height - 0.3, 10]} />
        <meshStandardMaterial color={poleColor} roughness={0.4} metalness={0.5} emissive="#2563eb" emissiveIntensity={emissive} />
      </mesh>
      <mesh castShadow position={[0, height - 0.18, 0]}>
        <coneGeometry args={[0.95, 0.38, 10]} />
        <meshStandardMaterial color={canopyColor} roughness={0.85} side={2} emissive="#2563eb" emissiveIntensity={emissive} />
      </mesh>
    </group>
  );
}
