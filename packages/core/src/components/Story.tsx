import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useLayer } from '../layers';
import { Level } from './Level';

export interface StoriesContextValue {
  /** floor-to-floor height */
  storyHeight: number;
  /** default clear wall height per story (storyHeight minus the slab) */
  wallHeight: number;
  /** elevation of story 0 */
  base: number;
}

const StoriesContext = createContext<StoriesContextValue>({
  storyHeight: 3,
  wallHeight: 2.7,
  base: 0,
});

export interface StoriesProps {
  /** floor-to-floor height */
  storyHeight?: number;
  /** clear wall height; defaults to storyHeight - 0.3 (0.3 = default slab thickness) */
  wallHeight?: number;
  /** elevation of story 0 */
  base?: number;
  children?: ReactNode;
}

export function Stories({ storyHeight = 3, wallHeight, base = 0, children }: StoriesProps) {
  const value = useMemo(
    () => ({ storyHeight, wallHeight: wallHeight ?? storyHeight - 0.3, base }),
    [storyHeight, wallHeight, base]
  );
  return <StoriesContext.Provider value={value}>{children}</StoriesContext.Provider>;
}

export const useStories = () => useContext(StoriesContext);

export interface StoryProps {
  /** story index; elevation = base + level * storyHeight */
  level: number;
  /** override the wall height for this story (e.g. attic knee walls) */
  height?: number;
  /** visibility-layer name; defaults to "ground floor" / "floor N" so each story can be toggled */
  layer?: string;
  children?: ReactNode;
}

/**
 * A Level whose elevation is computed from its story index. The whole story
 * is wrapped in a visibility group tied to a layer, so it can be toggled off
 * to inspect the floors below — the geometry hides but stays registered in the
 * model, so constraints keep resolving.
 */
export function Story({ level, height, layer, children }: StoryProps) {
  const ctx = useStories();
  const layerName = layer ?? (level === 0 ? 'ground floor' : `floor ${level}`);
  const visible = useLayer(layerName);
  return (
    <group visible={visible}>
      <Level elevation={ctx.base + level * ctx.storyHeight} height={height ?? ctx.wallHeight}>
        {children}
      </Level>
    </group>
  );
}
