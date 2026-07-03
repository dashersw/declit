import type { ExampleProject } from '../types';
import hotel from './Hotel.tsx?raw';
import guestFloor from './GuestFloor.tsx?raw';
import hotelRoom from './HotelRoom.tsx?raw';
import groundFloor from './GroundFloor.tsx?raw';
import core from './Core.tsx?raw';

export const hotelExample: ExampleProject = {
  id: 'hotel',
  label: 'Hotel',
  blurb: 'Six stories, 60 rooms + ensuites, a stair/lift core, lobby, restaurant and pool',
  entry: 'Hotel.tsx',
  files: {
    'Hotel.tsx': hotel,
    'GuestFloor.tsx': guestFloor,
    'HotelRoom.tsx': hotelRoom,
    'Core.tsx': core,
    'GroundFloor.tsx': groundFloor,
  },
};
