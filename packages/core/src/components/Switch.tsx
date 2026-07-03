import { useLayer } from '../layers';
import { selectHandler, useSelected } from '../selection';
import { useWall } from './Wall';

export interface SwitchProps {
  id?: string;
  /** position along the wall, from its `from` point */
  at: number;
  /** center height above the wall base */
  height?: number;
  /** which wall face: +1 = local +Z side */
  face?: 1 | -1;
  color?: string;
  layer?: string;
}

export function Switch({ id, at, height = 1.15, face = 1, color = '#f5f5f3', layer = 'electrical' }: SwitchProps) {
  const wall = useWall();
  const visible = useLayer(layer);
  const selected = useSelected(id ?? '');
  if (!visible) return null;

  const t = wall.thickness;
  const valid = at >= 0.05 && at <= wall.length - 0.05 && height + 0.05 < wall.height;
  const emissiveIntensity = selected ? 0.35 : 0;

  return (
    <group
      position={[at, height, face * (t / 2 + 0.008)]}
      rotation={[0, face === 1 ? 0 : Math.PI, 0]}
      onClick={selectHandler(id)}
    >
      <mesh castShadow>
        <boxGeometry args={[0.086, 0.086, 0.014]} />
        <meshStandardMaterial color={valid ? color : '#e11d48'} roughness={0.5} emissive="#2563eb" emissiveIntensity={emissiveIntensity} />
      </mesh>
      <mesh position={[0, 0, 0.01]} rotation={[-0.08, 0, 0]}>
        <boxGeometry args={[0.036, 0.056, 0.01]} />
        <meshStandardMaterial color={valid ? '#e8e8e4' : '#b91c3c'} roughness={0.55} emissive="#2563eb" emissiveIntensity={emissiveIntensity} />
      </mesh>
    </group>
  );
}
