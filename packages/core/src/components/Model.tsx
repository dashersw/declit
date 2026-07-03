import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { createModelStore, getResolved, type ModelStore } from '../model/store';
import type { ElementSpec, ModelProblem, ResolvedModel, ResolvedWall } from '../model/types';

const ModelContext = createContext<ModelStore | null>(null);

export interface ModelProps {
  /** pass an external store (from createModelStore) to read the model outside the canvas */
  store?: ModelStore;
  children?: ReactNode;
}

export function Model({ store, children }: ModelProps) {
  const [fallback] = useState(createModelStore);
  return <ModelContext.Provider value={store ?? fallback}>{children}</ModelContext.Provider>;
}

export function useModelApi(explicit?: ModelStore): ModelStore {
  const ctx = useContext(ModelContext);
  const api = explicit ?? ctx;
  if (!api) throw new Error('declit: hooks must be used inside <Model> (or be passed a store)');
  return api;
}

export function useResolvedModel(store?: ModelStore): ResolvedModel {
  const api = useModelApi(store);
  return useStore(api, (s) => getResolved(s.elements));
}

export function useModelProblems(store?: ModelStore): ModelProblem[] {
  return useResolvedModel(store).problems;
}

export function useResolvedWall(id: string, store?: ModelStore): ResolvedWall | undefined {
  const api = useModelApi(store);
  return useStore(api, (s) => getResolved(s.elements).walls.get(id));
}

/** declare an element: registers the spec into the model on commit, removes it on unmount */
export function useRegisterElement(spec: ElementSpec): void {
  const api = useModelApi();
  const key = JSON.stringify(spec);
  useLayoutEffect(() => {
    api.getState().register(JSON.parse(key) as ElementSpec);
  }, [api, key]);
  useLayoutEffect(() => () => api.getState().unregister(spec.id), [api, spec.id]);
}
