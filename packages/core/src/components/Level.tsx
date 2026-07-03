import { createContext, useContext, useMemo, type ReactNode } from 'react';

export interface LevelContextValue {
  elevation: number;
  wallHeight: number;
}

const LevelContext = createContext<LevelContextValue>({ elevation: 0, wallHeight: 2.7 });

export interface LevelProps {
  elevation?: number;
  /** default height cascaded to all walls on this level */
  height?: number;
  children?: ReactNode;
}

export function Level({ elevation = 0, height = 2.7, children }: LevelProps) {
  const value = useMemo(() => ({ elevation, wallHeight: height }), [elevation, height]);
  return <LevelContext.Provider value={value}>{children}</LevelContext.Provider>;
}

export const useLevel = () => useContext(LevelContext);
