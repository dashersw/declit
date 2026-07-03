import type { ExampleProject } from '../types';
import countryHouse from './CountryHouse.tsx?raw';
import groundFloor from './GroundFloor.tsx?raw';
import firstFloor from './FirstFloor.tsx?raw';
import attic from './Attic.tsx?raw';
import services from './Services.tsx?raw';

export const countryHouseExample: ExampleProject = {
  id: 'country-house',
  label: 'Country house',
  blurb: 'Three stories stacked with <Stories>, a stair per floor, a gable roof',
  entry: 'CountryHouse.tsx',
  files: {
    'CountryHouse.tsx': countryHouse,
    'GroundFloor.tsx': groundFloor,
    'FirstFloor.tsx': firstFloor,
    'Attic.tsx': attic,
    'Services.tsx': services,
  },
};
