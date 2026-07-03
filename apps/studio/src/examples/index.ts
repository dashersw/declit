import type { ExampleProject } from './types';
import { apartmentExample } from './apartment';
import { countryHouseExample } from './country-house';
import { hotelExample } from './hotel';

export type { ExampleProject } from './types';

export const EXAMPLES: ExampleProject[] = [apartmentExample, countryHouseExample, hotelExample];

export const DEFAULT_EXAMPLE_ID = apartmentExample.id;

export function getExample(id: string): ExampleProject {
  return EXAMPLES.find((e) => e.id === id) ?? apartmentExample;
}
