import { useLayer } from '../layers';
import { selectHandler, useSelected } from '../selection';
import { useWall } from './Wall';

export interface BreakerPanelProps {
  id?: string;
  /** position along the wall, from its `from` point */
  at: number;
  /** center height above the wall base */
  height?: number;
  /** which wall face: +1 = local +Z side */
  face?: 1 | -1;
  layer?: string;
}

export function BreakerPanel({ id, at, height = 1.5, face = 1, layer = 'electrical' }: BreakerPanelProps) {
  const wall = useWall();
  const visible = useLayer(layer);
  const selected = useSelected(id ?? '');
  if (!visible) return null;

  const t = wall.thickness;
  const emissiveIntensity = selected ? 0.35 : 0;

  return (
    <group
      position={[at, height, face * (t / 2 + 0.045)]}
      rotation={[0, face === 1 ? 0 : Math.PI, 0]}
      onClick={selectHandler(id)}
    >
      <mesh castShadow>
        <boxGeometry args={[0.34, 0.5, 0.09]} />
        <meshStandardMaterial color="#e9ebee" roughness={0.4} metalness={0.2} emissive="#2563eb" emissiveIntensity={emissiveIntensity} />
      </mesh>
      <mesh position={[0, 0, 0.047]}>
        <boxGeometry args={[0.29, 0.44, 0.012]} />
        <meshStandardMaterial color="#dcdfe3" roughness={0.5} emissive="#2563eb" emissiveIntensity={emissiveIntensity} />
      </mesh>
      <mesh position={[0.11, 0, 0.058]}>
        <boxGeometry args={[0.018, 0.07, 0.012]} />
        <meshStandardMaterial color="#7d848c" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  );
}
