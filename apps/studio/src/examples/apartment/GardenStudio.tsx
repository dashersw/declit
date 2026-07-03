import { RectRoom, type Vec2 } from '@declit/core';

export default function GardenStudio({ at = [9.6, 0.6] }: { at?: Vec2 }) {
  return (
    <RectRoom
      id="studio"
      at={at}
      width={3.2}
      depth={2.8}
      thickness={0.18}
      wallColor="#ddd6c8"
      door={{ side: 'west', at: 1.4, open: 0.35 }}
      windows={[{ side: 'east', at: 1.4, width: 1.4 }]}
    />
  );
}
