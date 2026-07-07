import { createStore, type StoreApi } from 'zustand/vanilla';
import { resolveModel } from './resolve';
import type { ElementSpec, ResolvedModel } from './types';

export interface ModelState {
  elements: Map<string, ElementSpec>;
  register(spec: ElementSpec): void;
  unregister(id: string): void;
}

export type ModelStore = StoreApi<ModelState>;

// each elements Map is a shallow copy of the one before it within the same
// store; recording that lineage lets getResolved find the right `prev` to
// diff against without mixing up snapshots from unrelated stores
const parentOf = new WeakMap<Map<string, ElementSpec>, Map<string, ElementSpec>>();

export function createModelStore(): ModelStore {
  return createStore<ModelState>()((set) => ({
    elements: new Map(),
    register: (spec) =>
      set((st) => {
        const prev = st.elements.get(spec.id);
        if (prev && JSON.stringify(prev) === JSON.stringify(spec)) return st;
        const elements = new Map(st.elements);
        elements.set(spec.id, spec);
        parentOf.set(elements, st.elements);
        return { elements };
      }),
    unregister: (id) =>
      set((st) => {
        if (!st.elements.has(id)) return st;
        const elements = new Map(st.elements);
        elements.delete(id);
        parentOf.set(elements, st.elements);
        return { elements };
      }),
  }));
}

const resolveCache = new WeakMap<Map<string, ElementSpec>, ResolvedModel>();

/** memoized by the immutable elements map, so selectors get stable references */
export function getResolved(elements: Map<string, ElementSpec>): ResolvedModel {
  let r = resolveCache.get(elements);
  if (!r) {
    const parent = parentOf.get(elements);
    const parentModel = parent && resolveCache.get(parent);
    r = resolveModel(elements.values(), parentModel ? { elements: parent, model: parentModel } : undefined);
    resolveCache.set(elements, r);
  }
  return r;
}
