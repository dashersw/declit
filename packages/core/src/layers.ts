import { useLayoutEffect } from 'react';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

export interface LayerEntry {
  visible: boolean;
  /** mounted components on this layer; entries stay at 0 refs so visibility survives recompiles */
  refs: number;
}

interface LayersState {
  layers: Map<string, LayerEntry>;
  declare(name: string): void;
  release(name: string): void;
  setVisible(name: string, visible: boolean): void;
}

export const layersStore = createStore<LayersState>()((set) => ({
  layers: new Map(),
  declare: (name) =>
    set((st) => {
      const layers = new Map(st.layers);
      const prev = layers.get(name);
      // a layer that mounts fresh (no live refs) resets to visible, so a toggle
      // left off in one example doesn't leak into the next; a layer already in
      // use keeps its current visibility
      const visible = prev && prev.refs > 0 ? prev.visible : true;
      layers.set(name, { visible, refs: (prev?.refs ?? 0) + 1 });
      return { layers };
    }),
  release: (name) =>
    set((st) => {
      const prev = st.layers.get(name);
      if (!prev) return st;
      const layers = new Map(st.layers);
      layers.set(name, { ...prev, refs: Math.max(0, prev.refs - 1) });
      return { layers };
    }),
  setVisible: (name, visible) =>
    set((st) => {
      const prev = st.layers.get(name);
      if (!prev || prev.visible === visible) return st;
      const layers = new Map(st.layers);
      layers.set(name, { ...prev, visible });
      return { layers };
    }),
}));

export const LAYER_ORDER = ['structure', 'openings', 'electrical', 'plumbing', 'furniture', 'annotations'];

/** register membership on a layer and return its current visibility */
export function useLayer(name: string): boolean {
  useLayoutEffect(() => {
    layersStore.getState().declare(name);
    return () => layersStore.getState().release(name);
  }, [name]);
  return useStore(layersStore, (s) => s.layers.get(name)?.visible ?? true);
}

export function setLayerVisible(name: string, visible: boolean): void {
  layersStore.getState().setVisible(name, visible);
}
