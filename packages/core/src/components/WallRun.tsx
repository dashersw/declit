import { useId } from 'react';
import type { Vec2 } from '../model/types';
import { Wall } from './Wall';

export interface WallRunProps {
  id?: string;
  /** consecutive corner points; segments share corners and get joined automatically */
  points: Vec2[];
  /** connect the last point back to the first */
  closed?: boolean;
  thickness?: number;
  height?: number;
  color?: string;
}

export function WallRun({ id: idProp, points, closed = false, thickness, height, color }: WallRunProps) {
  const autoId = useId();
  const id = idProp ?? `run${autoId}`;
  const pts = closed && points.length > 1 ? [...points, points[0]] : points;
  return (
    <>
      {pts.slice(0, -1).map((p, i) => (
        <Wall
          key={i}
          id={`${id}-${i}`}
          from={p}
          to={pts[i + 1]}
          thickness={thickness}
          height={height}
          color={color}
        />
      ))}
    </>
  );
}
