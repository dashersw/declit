import { useLayoutEffect } from 'react';
import type { OpeningSpec, ResolvedOpening } from '../model/types';
import { useResolvedWall } from './Model';
import { useWall } from './Wall';

/** register an opening with the host wall and return its resolved (validated) state */
export function useOpeningRegistration(spec: OpeningSpec): ResolvedOpening | undefined {
  const wall = useWall();
  const { registerOpening, unregisterOpening } = wall;
  const key = JSON.stringify(spec);
  useLayoutEffect(() => {
    registerOpening(JSON.parse(key) as OpeningSpec);
  }, [key, registerOpening]);
  useLayoutEffect(() => () => unregisterOpening(spec.id), [spec.id, unregisterOpening]);
  const resolvedWall = useResolvedWall(wall.id);
  return resolvedWall?.openings.find((o) => o.id === spec.id);
}
