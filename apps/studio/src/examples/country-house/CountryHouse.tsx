import { Stories, useParam } from '@declit/core';
import GroundFloor from './GroundFloor';
import FirstFloor from './FirstFloor';
import Attic from './Attic';

/**
 * A three-story country house. Each floor is its own file; `<Stories>`
 * stacks them by index so a single `storyHeight` slider moves every floor,
 * its stairwell and the roof together.
 *
 * Footprint: 10 × 8 m, south-west corner at the origin.
 */
export default function CountryHouse() {
  const storyHeight = useParam('Story height', { min: 2.6, max: 3.6, step: 0.05, default: 3.0, unit: 'm' });
  const roofRise = useParam('Roof pitch', { min: 1.2, max: 3.2, step: 0.1, default: 2.4, unit: 'm' });

  return (
    <Stories storyHeight={storyHeight} wallHeight={storyHeight - 0.3}>
      <GroundFloor />
      <FirstFloor />
      {/* the attic carries its own knee walls and the gable roof on top of them */}
      <Attic roofRise={roofRise} />
    </Stories>
  );
}
