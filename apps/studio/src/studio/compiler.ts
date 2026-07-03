import type { ComponentType } from 'react';
import { transform } from 'sucrase';
import * as React from 'react';
import * as ReactJSXRuntime from 'react/jsx-runtime';
import * as ReactJSXDevRuntime from 'react/jsx-dev-runtime';
import * as DeclitCore from '@declit/core';
import * as Fiber from '@react-three/fiber';
import * as Drei from '@react-three/drei';
import * as THREE from 'three';

/**
 * Bare imports in user code resolve to the app's own module instances —
 * one React, one three.js, one model store, no duplicate-instance problems.
 */
const RUNTIME_MODULES: Record<string, unknown> = {
  react: React,
  'react/jsx-runtime': ReactJSXRuntime,
  'react/jsx-dev-runtime': ReactJSXDevRuntime,
  '@declit/core': DeclitCore,
  '@react-three/fiber': Fiber,
  '@react-three/drei': Drei,
  three: THREE,
};

export function compileProject(files: Record<string, string>, entry: string): ComponentType {
  const cache = new Map<string, { exports: Record<string, unknown> }>();

  const resolveFile = (spec: string, from: string): string => {
    const base = spec.replace(/^\.\//, '');
    for (const cand of [base, `${base}.tsx`, `${base}.ts`]) {
      if (files[cand] !== undefined) return cand;
    }
    throw new Error(`${from}: cannot resolve import "${spec}"`);
  };

  const loadFile = (name: string): Record<string, unknown> => {
    const cached = cache.get(name);
    if (cached) return cached.exports;

    let code: string;
    try {
      code = transform(files[name]!, {
        transforms: ['typescript', 'jsx', 'imports'],
        jsxRuntime: 'automatic',
        production: true,
        filePath: name,
      }).code;
    } catch (e) {
      throw new Error(`${name}: ${e instanceof Error ? e.message : String(e)}`);
    }

    const module = { exports: {} as Record<string, unknown> };
    // cache before executing so import cycles get partial exports (CJS semantics)
    cache.set(name, module);

    const requireFn = (spec: string): unknown => {
      if (spec.startsWith('.')) return loadFile(resolveFile(spec, name));
      const m = RUNTIME_MODULES[spec];
      if (!m) {
        throw new Error(
          `${name}: unknown module "${spec}" (available: ${Object.keys(RUNTIME_MODULES).join(', ')})`
        );
      }
      return m;
    };

    const fn = new Function('require', 'module', 'exports', code);
    fn(requireFn, module, module.exports);
    return module.exports;
  };

  if (files[entry] === undefined) throw new Error(`missing entry file ${entry}`);
  const exports = loadFile(entry);
  const Component = (exports.default ?? null) as ComponentType | null;
  if (typeof Component !== 'function') {
    throw new Error(`${entry} must export a default component`);
  }
  return Component;
}
