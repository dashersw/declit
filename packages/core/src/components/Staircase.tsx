import { useId, useMemo } from 'react';
import { useLayer } from '../layers';
import type { Vec2 } from '../model/types';
import { selectHandler, useSelected } from '../selection';
import { useLevel } from './Level';

export interface StaircaseProps {
  id?: string;
  /** south-west corner of the stairwell footprint */
  at: Vec2;
  /** total height climbed in one storey (usually the storey height) */
  rise: number;
  /** stairwell width across both flights (x) */
  width?: number;
  /** stairwell depth along the flights (z), landing included */
  run?: number;
  color?: string;
  railColor?: string;
  layer?: string;
}

const RISER = 0.18; // target riser height
const TREAD_T = 0.06;

/**
 * A switchback (dog-leg) stair: two half-flights climbing rise/2 each, joined by
 * a half-landing where you turn 180°. You arrive directly above where you
 * started, so the flight stacks in the same footprint on every storey and a
 * person can climb continuously — which a single repeated flight cannot do.
 *
 * Footprint: `at` … `at + [width, run]`. Cut a matching `<Slab holes>` void in
 * the floor above.
 */
export function Staircase({
  id: idProp,
  at,
  rise,
  width = 2.4,
  run = 4.2,
  color = '#c3bcae',
  railColor = '#8a8378',
  layer = 'structure',
}: StaircaseProps) {
  const autoId = useId();
  const id = idProp ?? `stair${autoId}`;
  const level = useLevel();
  const visible = useLayer(layer);
  const selected = useSelected(id);

  const geom = useMemo(() => {
    const landingDepth = Math.min(run * 0.32, 1.1);
    const flightRun = run - landingDepth;
    const halfRise = rise / 2;
    const n = Math.max(3, Math.round(halfRise / RISER));
    const stepRise = halfRise / n;
    const stepRun = flightRun / n;
    const flightW = width / 2 - 0.04;
    const cxL = width / 4;
    const cxR = (3 * width) / 4;

    const treads: { pos: [number, number, number]; size: [number, number, number] }[] = [];
    // flight 1: left half, climbs +z from the floor to the landing
    for (let i = 0; i < n; i++) {
      const h = (i + 1) * stepRise;
      treads.push({ pos: [cxL, h - TREAD_T / 2, (i + 0.5) * stepRun], size: [flightW, TREAD_T, stepRun + 0.04] });
    }
    // flight 2: right half, climbs from the landing back -z to the next floor
    for (let i = 0; i < n; i++) {
      const h = halfRise + (i + 1) * stepRise;
      treads.push({ pos: [cxR, h - TREAD_T / 2, flightRun - (i + 0.5) * stepRun], size: [flightW, TREAD_T, stepRun + 0.04] });
    }
    const landing: { pos: [number, number, number]; size: [number, number, number] } = {
      pos: [width / 2, halfRise - TREAD_T / 2, flightRun + landingDepth / 2],
      size: [width, TREAD_T, landingDepth],
    };
    return { treads, landing, halfRise };
  }, [rise, width, run]);

  if (!visible) return null;

  const emissive = selected ? 0.2 : 0;
  const mat = (
    <meshStandardMaterial color={color} roughness={0.9} emissive="#2563eb" emissiveIntensity={emissive} />
  );

  return (
    <group position={[at[0], level.elevation, at[1]]} onClick={selectHandler(id)}>
      {geom.treads.map((t, i) => (
        <mesh key={i} castShadow receiveShadow position={t.pos}>
          <boxGeometry args={t.size} />
          {mat}
        </mesh>
      ))}
      <mesh castShadow receiveShadow position={geom.landing.pos}>
        <boxGeometry args={geom.landing.size} />
        <meshStandardMaterial color={railColor} roughness={0.9} emissive="#2563eb" emissiveIntensity={emissive} />
      </mesh>
    </group>
  );
}
