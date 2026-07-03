import type { ExampleProject } from '../types';
import apartment from './Apartment.tsx?raw';
import bathroom from './Bathroom.tsx?raw';
import electrical from './Electrical.tsx?raw';
import plumbing from './Plumbing.tsx?raw';
import gardenStudio from './GardenStudio.tsx?raw';

export const apartmentExample: ExampleProject = {
  id: 'apartment',
  label: 'Apartment',
  blurb: 'A single-story flat with wiring, plumbing and a garden studio',
  entry: 'Apartment.tsx',
  files: {
    'Apartment.tsx': apartment,
    'Bathroom.tsx': bathroom,
    'Electrical.tsx': electrical,
    'Plumbing.tsx': plumbing,
    'GardenStudio.tsx': gardenStudio,
  },
};
