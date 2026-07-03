import { useLayoutEffect } from 'react';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

export interface ParamSpec {
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit?: string;
}

export interface ParamEntry {
  spec: ParamSpec;
  value: number;
  /** number of mounted useParam() hooks; entries with 0 refs are kept so values survive recompiles */
  refs: number;
}

interface ParamsState {
  params: Map<string, ParamEntry>;
  declare(spec: ParamSpec): void;
  release(label: string): void;
  set(label: string, value: number): void;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const paramsStore = createStore<ParamsState>()((set) => ({
  params: new Map(),
  declare: (spec) =>
    set((st) => {
      const params = new Map(st.params);
      const prev = params.get(spec.label);
      const value = clamp(prev?.value ?? spec.defaultValue, spec.min, spec.max);
      params.set(spec.label, { spec, value, refs: (prev?.refs ?? 0) + 1 });
      return { params };
    }),
  release: (label) =>
    set((st) => {
      const prev = st.params.get(label);
      if (!prev) return st;
      const params = new Map(st.params);
      params.set(label, { ...prev, refs: Math.max(0, prev.refs - 1) });
      return { params };
    }),
  set: (label, value) =>
    set((st) => {
      const prev = st.params.get(label);
      if (!prev || prev.value === value) return st;
      const params = new Map(st.params);
      params.set(label, { ...prev, value });
      return { params };
    }),
}));

export interface UseParamOptions {
  min?: number;
  max?: number;
  step?: number;
  default?: number;
  unit?: string;
}

/**
 * Declare a live design parameter. The hosting app (studio chrome) renders a
 * control for every active parameter; the component just consumes the value.
 */
export function useParam(label: string, opts: UseParamOptions = {}): number {
  const min = opts.min ?? 0;
  const max = opts.max ?? Math.max(1, (opts.default ?? 1) * 2);
  const step = opts.step ?? (max - min) / 100;
  const defaultValue = opts.default ?? min;
  const unit = opts.unit;

  useLayoutEffect(() => {
    paramsStore.getState().declare({ label, min, max, step, defaultValue, unit });
    return () => paramsStore.getState().release(label);
  }, [label, min, max, step, defaultValue, unit]);

  const value = useStore(paramsStore, (s) => s.params.get(label)?.value);
  return value ?? defaultValue;
}

export function setParam(label: string, value: number): void {
  paramsStore.getState().set(label, value);
}
