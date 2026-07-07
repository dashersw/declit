import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as THREE from 'three';
import { useLayer } from '../layers';
import { angleOfWall, dist } from '../model/math';
import type { OpeningSpec, Vec2 } from '../model/types';
import { buildWallShape } from '../model/wallShape';
import { selectHandler, useSelected } from '../selection';
import { useRegisterElement, useResolvedWall } from './Model';
import { useLevel } from './Level';

export interface WallContextValue {
  id: string;
  length: number;
  thickness: number;
  height: number;
  registerOpening(o: OpeningSpec): void;
  unregisterOpening(id: string): void;
}

const WallContext = createContext<WallContextValue | null>(null);

export const useWall = (): WallContextValue => {
  const ctx = useContext(WallContext);
  if (!ctx) throw new Error('declit: this component must be placed inside a <Wall>');
  return ctx;
};

export interface WallProps {
  id?: string;
  from: Vec2;
  to: Vec2;
  thickness?: number;
  /** defaults to the enclosing <Level> wall height */
  height?: number;
  color?: string;
  /** set false to opt out of automatic corner joining */
  join?: boolean;
  layer?: string;
  children?: ReactNode;
}

export function Wall({
  id: idProp,
  from,
  to,
  thickness = 0.24,
  height: heightProp,
  color = '#eae5da',
  join = true,
  layer = 'structure',
  children,
}: WallProps) {
  const autoId = useId();
  const id = idProp ?? `wall${autoId}`;
  const level = useLevel();
  const height = heightProp ?? level.wallHeight;
  const visible = useLayer(layer);
  const selected = useSelected(id);

  const [openings, setOpenings] = useState<ReadonlyMap<string, OpeningSpec>>(new Map());

  const registerOpening = useCallback((o: OpeningSpec) => {
    setOpenings((prev) => {
      const cur = prev.get(o.id);
      if (cur && JSON.stringify(cur) === JSON.stringify(o)) return prev;
      const next = new Map(prev);
      next.set(o.id, o);
      return next;
    });
  }, []);

  const unregisterOpening = useCallback((oid: string) => {
    setOpenings((prev) => {
      if (!prev.has(oid)) return prev;
      const next = new Map(prev);
      next.delete(oid);
      return next;
    });
  }, []);

  useRegisterElement({
    id,
    type: 'wall',
    from,
    to,
    thickness,
    height,
    elevation: level.elevation,
    join,
    openings: [...openings.values()],
  });

  const resolved = useResolvedWall(id);

  const geometryArgs = useMemo(() => {
    if (!resolved) return null;
    return buildWallShape(resolved, height, thickness);
  }, [resolved, height, thickness]);

  const ctxValue = useMemo<WallContextValue>(
    () => ({
      id,
      length: dist(from, to),
      thickness,
      height,
      registerOpening,
      unregisterOpening,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, from[0], from[1], to[0], to[1], thickness, height, registerOpening, unregisterOpening]
  );

  const angle = angleOfWall(from, to);

  return (
    <group
      position={[from[0], level.elevation, from[1]]}
      rotation={[0, angle, 0]}
      visible={visible}
      onClick={visible ? selectHandler(id) : undefined}
    >
      {geometryArgs && (
        <mesh castShadow receiveShadow position={[0, 0, -thickness / 2]}>
          <extrudeGeometry args={geometryArgs as unknown as [THREE.Shape, THREE.ExtrudeGeometryOptions]} />
          <meshStandardMaterial
            color={color}
            roughness={0.95}
            metalness={0}
            emissive="#2563eb"
            emissiveIntensity={selected ? 0.22 : 0}
          />
        </mesh>
      )}
      <WallContext.Provider value={ctxValue}>{children}</WallContext.Provider>
    </group>
  );
}
