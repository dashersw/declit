import { Slab, Stories, Story, useParam } from '@declit/core';
import Core from './Core';
import GroundFloor from './GroundFloor';
import GuestFloor from './GuestFloor';

const STORY_H = 3.2;

/**
 * A six-story hotel: a public ground floor (lobby, restaurant, pool), a stack of
 * identical guest floors, and a west circulation core (switchback stair + two
 * elevators behind a shared lobby) serving every level. The room count is pure
 * arithmetic —
 *
 *     rooms = guestFloors × roomsPerSide × 2
 *
 * so the two sliders below drive all 60 rooms. Drag "Guest floors" and watch
 * the tower — rooms, services and the stair/lift core — grow a story at a time.
 */
export default function Hotel() {
  const guestFloors = useParam('Guest floors', { min: 1, max: 6, step: 1, default: 5 });
  const roomsPerSide = useParam('Rooms per side', { min: 4, max: 8, step: 1, default: 6 });
  const roomW = 4.2;

  const L = roomsPerSide * roomW;
  const D = 12; // 5 m rooms + 2 m corridor + 5 m rooms
  const floors = Array.from({ length: guestFloors }, (_, i) => i + 1);
  const coreLevels = Array.from({ length: guestFloors + 1 }, (_, i) => i); // ground + every guest floor

  return (
    <Stories storyHeight={STORY_H} wallHeight={2.9}>
      <GroundFloor length={L} depth={D} />

      {floors.map((level) => (
        <GuestFloor key={level} level={level} roomsPerSide={roomsPerSide} roomW={roomW} />
      ))}

      {/* vertical circulation, one segment per storey; the top segment is the
          arrival landing (no onward stair), and one car parks in each shaft */}
      {coreLevels.map((level) => (
        <Core
          key={level}
          level={level}
          storyHeight={STORY_H}
          top={level === guestFloors}
          carA={level === 0}
          carB={level === Math.min(2, guestFloors)}
        />
      ))}

      {/* flat roof slab capping the top guest floor AND the circulation core
          (its own toggleable layer) */}
      <Story level={guestFloors + 1} layer="roof">
        <Slab id="hotel-roof" layer="roof" outline={[[-5.6, -0.6], [L + 0.6, -0.6], [L + 0.6, D + 0.6], [-5.6, D + 0.6]]} thickness={0.35} color="#b8b2a4" />
      </Story>
    </Stories>
  );
}
