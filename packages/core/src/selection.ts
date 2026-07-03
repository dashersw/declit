import type { ThreeEvent } from '@react-three/fiber';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

interface SelectionState {
  selected: string | null;
}

export const selectionStore = createStore<SelectionState>(() => ({ selected: null }));

export function selectElement(id: string | null): void {
  if (selectionStore.getState().selected !== id) selectionStore.setState({ selected: id });
}

export function useSelection(): string | null {
  return useStore(selectionStore, (s) => s.selected);
}

export function useSelected(id: string): boolean {
  return useStore(selectionStore, (s) => s.selected === id);
}

/** click handler for selectable elements; undefined when the element has no id */
export function selectHandler(
  id: string | undefined
): ((e: ThreeEvent<MouseEvent>) => void) | undefined {
  if (!id) return undefined;
  return (e) => {
    // ignore clicks at the end of an orbit drag
    if (e.delta > 5) return;
    e.stopPropagation();
    selectElement(id);
  };
}
