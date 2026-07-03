import { useMemo } from 'react';
import { Html, Line } from '@react-three/drei';
import { useLayer } from '../layers';
import { add, dist, normalize, scale, sub } from '../model/math';
import type { Vec2 } from '../model/types';

export interface DimensionProps {
  from: Vec2;
  to: Vec2;
  /** perpendicular offset of the dimension line from the measured edge */
  offset?: number;
  y?: number;
  color?: string;
  label?: string;
  layer?: string;
}

export function Dimension({ from, to, offset = 0.7, y = 0.02, color = '#64748b', label, layer = 'annotations' }: DimensionProps) {
  const visible = useLayer(layer);
  const { a, b, mid, n, d } = useMemo(() => {
    const dir = normalize(sub(to, from));
    const n: Vec2 = [dir[1], -dir[0]];
    const a = add(from, scale(n, offset));
    const b = add(to, scale(n, offset));
    const mid = scale(add(a, b), 0.5);
    return { a, b, mid, n, d: dist(from, to) };
  }, [from[0], from[1], to[0], to[1], offset]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  const tick = 0.07;
  const p3 = (p: Vec2): [number, number, number] => [p[0], y, p[1]];

  return (
    <group>
      <Line points={[p3(a), p3(b)]} color={color} lineWidth={1.2} />
      <Line points={[p3(from), p3(add(a, scale(n, tick)))]} color={color} lineWidth={0.8} transparent opacity={0.5} />
      <Line points={[p3(to), p3(add(b, scale(n, tick)))]} color={color} lineWidth={0.8} transparent opacity={0.5} />
      <Line points={[p3(add(a, scale(n, -tick))), p3(add(a, scale(n, tick)))]} color={color} lineWidth={1.2} />
      <Line points={[p3(add(b, scale(n, -tick))), p3(add(b, scale(n, tick)))]} color={color} lineWidth={1.2} />
      <Html center position={[mid[0] + n[0] * 0.02, y + 0.01, mid[1] + n[1] * 0.02]} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            font: '11px/1.4 system-ui, sans-serif',
            color: '#334155',
            background: 'rgba(255,255,255,0.88)',
            border: '1px solid #cbd5e1',
            borderRadius: 4,
            padding: '1px 6px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {label ?? `${d.toFixed(2)} m`}
        </div>
      </Html>
    </group>
  );
}
