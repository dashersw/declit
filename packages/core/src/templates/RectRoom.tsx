import { useId, type ReactNode } from 'react';
import type { Vec2 } from '../model/types';
import { Door, type DoorProps } from '../components/Door';
import { Window, type WindowProps } from '../components/Window';
import { Slab } from '../components/Slab';
import { Wall } from '../components/Wall';

export type RoomSide = 'south' | 'north' | 'east' | 'west';

export interface RectRoomProps {
  id?: string;
  /** south-west corner of the room (wall centerlines) */
  at?: Vec2;
  width: number;
  depth: number;
  thickness?: number;
  height?: number;
  wallColor?: string;
  floor?: boolean;
  floorThickness?: number;
  floorColor?: string;
  /**
   * openings are addressed by side; `at` runs along the wall direction:
   * south west→east, east south→north, north east→west, west north→south
   */
  door?: { side: RoomSide; at: number } & Partial<Omit<DoorProps, 'at'>>;
  windows?: ({ side: RoomSide; at: number } & Partial<Omit<WindowProps, 'at'>>)[];
  children?: ReactNode;
}

export function RectRoom({
  id: idProp,
  at = [0, 0],
  width,
  depth,
  thickness = 0.24,
  height,
  wallColor,
  floor = true,
  floorThickness = 0.25,
  floorColor,
  door,
  windows = [],
  children,
}: RectRoomProps) {
  const autoId = useId();
  const id = idProp ?? `room${autoId}`;
  const [x, z] = at;
  const t2 = thickness / 2;

  const sides: Record<RoomSide, { from: Vec2; to: Vec2 }> = {
    south: { from: [x, z], to: [x + width, z] },
    east: { from: [x + width, z], to: [x + width, z + depth] },
    north: { from: [x + width, z + depth], to: [x, z + depth] },
    west: { from: [x, z + depth], to: [x, z] },
  };

  return (
    <>
      {(Object.keys(sides) as RoomSide[]).map((side) => {
        const seg = sides[side];
        return (
          <Wall
            key={side}
            id={`${id}-${side}`}
            from={seg.from}
            to={seg.to}
            thickness={thickness}
            height={height}
            color={wallColor}
          >
            {door?.side === side && <Door {...door} id={`${id}-door`} />}
            {windows
              .filter((w) => w.side === side)
              .map((w, i) => (
                <Window {...w} key={i} id={`${id}-win-${side}-${i}`} />
              ))}
          </Wall>
        );
      })}
      {floor && (
        <Slab
          id={`${id}-floor`}
          outline={[
            [x - t2, z - t2],
            [x + width + t2, z - t2],
            [x + width + t2, z + depth + t2],
            [x - t2, z + depth + t2],
          ]}
          thickness={floorThickness}
          color={floorColor}
        />
      )}
      {children}
    </>
  );
}
