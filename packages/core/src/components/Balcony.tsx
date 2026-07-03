import { useId } from 'react';
import { useLayer } from '../layers';
import type { Vec2 } from '../model/types';
import { selectHandler, useSelected } from '../selection';
import type { Facing } from './facing';
import { useLevel } from './Level';

export interface BalconyProps {
  id?: string;
  /** south-west corner of the balcony floor */
  at: Vec2;
  /** extent along x */
  width: number;
  /** extent along z */
  depth: number;
  /** the side that meets the building — no parapet is drawn there */
  open: Facing;
  railHeight?: number;
  floorColor?: string;
  railColor?: string;
  layer?: string;
}

const RAIL_T = 0.09;
// the deck sits 15 mm proud of the interior floor so it never z-fights the
// building slab's overhang
const DECK_LIP = 0.015;

/**
 * A cantilevered balcony: a deck slab flush with the interior floor and a
 * parapet on every side except `open`, which is where the balcony door is.
 */
export function Balcony({
  id: idProp,
  at,
  width,
  depth,
  open,
  railHeight = 1.02,
  floorColor = '#cfc9bd',
  railColor = '#e3ddd0',
  layer = 'structure',
}: BalconyProps) {
  const autoId = useId();
  const id = idProp ?? `balcony${autoId}`;
  const level = useLevel();
  const visible = useLayer(layer);
  const selected = useSelected(id);
  if (!visible) return null;

  const emissive = selected ? 0.2 : 0;
  const railMat = <meshStandardMaterial color={railColor} roughness={0.9} emissive="#2563eb" emissiveIntensity={emissive} />;
  const railY = DECK_LIP + railHeight / 2;
  const rails: { key: Facing; pos: [number, number, number]; size: [number, number, number] }[] = [
    { key: 'south', pos: [width / 2, railY, RAIL_T / 2], size: [width, railHeight, RAIL_T] },
    { key: 'north', pos: [width / 2, railY, depth - RAIL_T / 2], size: [width, railHeight, RAIL_T] },
    { key: 'west', pos: [RAIL_T / 2, railY, depth / 2], size: [RAIL_T, railHeight, depth] },
    { key: 'east', pos: [width - RAIL_T / 2, railY, depth / 2], size: [RAIL_T, railHeight, depth] },
  ];

  return (
    <group position={[at[0], level.elevation, at[1]]} onClick={selectHandler(id)}>
      {/* deck */}
      <mesh castShadow receiveShadow position={[width / 2, DECK_LIP - 0.075, depth / 2]}>
        <boxGeometry args={[width, 0.15, depth]} />
        <meshStandardMaterial color={floorColor} roughness={0.9} emissive="#2563eb" emissiveIntensity={emissive} />
      </mesh>
      {rails
        .filter((r) => r.key !== open)
        .map((r) => (
          <mesh key={r.key} castShadow position={r.pos}>
            <boxGeometry args={r.size} />
            {railMat}
          </mesh>
        ))}
    </group>
  );
}
