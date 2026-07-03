import { useLayer } from '../layers';
import { selectHandler, useSelected } from '../selection';
import { useWall } from './Wall';

export interface OutletProps {
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

export function Outlet({ id, at, height = 0.3, face = 1, color = '#f5f5f3', layer = 'electrical' }: OutletProps) {
  const wall = useWall();
  const visible = useLayer(layer);
  const selected = useSelected(id ?? '');
  if (!visible) return null;

  const t = wall.thickness;
  const valid = at >= 0.05 && at <= wall.length - 0.05 && height + 0.05 < wall.height;
  const plateColor = valid ? color : '#e11d48';
  const emissiveIntensity = selected ? 0.35 : 0;

  return (
    <group
      position={[at, height, face * (t / 2 + 0.008)]}
      rotation={[0, face === 1 ? 0 : Math.PI, 0]}
      onClick={selectHandler(id)}
    >
      <mesh castShadow>
        <boxGeometry args={[0.086, 0.086, 0.014]} />
        <meshStandardMaterial color={plateColor} roughness={0.5} emissive="#2563eb" emissiveIntensity={emissiveIntensity} />
      </mesh>
      <mesh position={[0, 0, 0.006]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.031, 0.031, 0.012, 24]} />
        <meshStandardMaterial color={valid ? '#e3e3df' : '#b91c3c'} roughness={0.6} emissive="#2563eb" emissiveIntensity={emissiveIntensity} />
      </mesh>
      <mesh position={[-0.0095, 0, 0.013]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.0045, 0.0045, 0.008, 12]} />
        <meshStandardMaterial color="#33322f" />
      </mesh>
      <mesh position={[0.0095, 0, 0.013]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.0045, 0.0045, 0.008, 12]} />
        <meshStandardMaterial color="#33322f" />
      </mesh>
    </group>
  );
}

/** alias: an Outlet is a plug socket */
export const Plug = Outlet;
