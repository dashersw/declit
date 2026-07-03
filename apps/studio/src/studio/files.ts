import { createStore } from 'zustand/vanilla';
import { DEFAULT_EXAMPLE_ID, getExample } from '../examples';

const lsKey = (exampleId: string) => `declit-studio-${exampleId}-v8`;
const ACTIVE_KEY = 'declit-studio-active-v8';

/** load an example's files, preferring the user's saved edits for that example */
function loadFiles(exampleId: string): Record<string, string> {
  const example = getExample(exampleId);
  try {
    const raw = localStorage.getItem(lsKey(exampleId));
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, string>;
      if (parsed && typeof parsed === 'object' && typeof parsed[example.entry] === 'string') {
        return parsed;
      }
    }
  } catch {
    // corrupted storage falls back to the pristine example
  }
  return { ...example.files };
}

function loadActiveId(): string {
  try {
    const id = localStorage.getItem(ACTIVE_KEY);
    if (id && getExample(id).id === id) return id;
  } catch {
    // ignore
  }
  return DEFAULT_EXAMPLE_ID;
}

function componentNameFor(file: string): string {
  const base = file.replace(/\.(tsx|ts)$/, '').replace(/[^A-Za-z0-9]/g, '');
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : 'Component';
}

export interface RevealState {
  file: string;
  from: number;
  to: number;
  nonce: number;
}

export interface StudioState {
  exampleId: string;
  entry: string;
  files: Record<string, string>;
  active: string;
  /** bumped when files are replaced wholesale (switch/reset) so the editor remounts */
  editorEpoch: number;
  /** pending "jump to this source range" request for the editor */
  reveal: RevealState | null;
  setCode(name: string, code: string): void;
  setActive(name: string): void;
  addFile(name: string): void;
  deleteFile(name: string): void;
  setReveal(r: Omit<RevealState, 'nonce'>): void;
  switchExample(id: string): void;
  reset(): void;
}

const initialId = loadActiveId();

export const studioStore = createStore<StudioState>()((set, get) => ({
  exampleId: initialId,
  entry: getExample(initialId).entry,
  files: loadFiles(initialId),
  active: getExample(initialId).entry,
  editorEpoch: 0,
  reveal: null,
  setCode: (name, code) => set((st) => ({ files: { ...st.files, [name]: code } })),
  setReveal: (r) => set((st) => ({ reveal: { ...r, nonce: (st.reveal?.nonce ?? 0) + 1 } })),
  setActive: (name) => set({ active: name }),
  addFile: (name) =>
    set((st) => {
      let file = name.trim().replace(/[^A-Za-z0-9_.-]/g, '');
      if (!file) return st;
      if (!/\.(tsx|ts)$/.test(file)) file += '.tsx';
      if (st.files[file] !== undefined) return { active: file };
      const stub = `import { Wall } from '@declit/core';\n\nexport default function ${componentNameFor(file)}() {\n  return null;\n}\n`;
      return { files: { ...st.files, [file]: stub }, active: file };
    }),
  deleteFile: (name) =>
    set((st) => {
      if (name === st.entry || st.files[name] === undefined) return st;
      const files = { ...st.files };
      delete files[name];
      return { files, active: st.active === name ? st.entry : st.active };
    }),
  switchExample: (id) => {
    if (id === get().exampleId) return;
    const example = getExample(id);
    set((st) => ({
      exampleId: example.id,
      entry: example.entry,
      files: loadFiles(example.id),
      active: example.entry,
      editorEpoch: st.editorEpoch + 1,
      reveal: null,
    }));
  },
  reset: () =>
    set((st) => {
      const example = getExample(st.exampleId);
      return {
        files: { ...example.files },
        active: example.entry,
        editorEpoch: st.editorEpoch + 1,
        reveal: null,
      };
    }),
}));

studioStore.subscribe((s, prev) => {
  try {
    if (s.files !== prev.files) localStorage.setItem(lsKey(s.exampleId), JSON.stringify(s.files));
    if (s.exampleId !== prev.exampleId) localStorage.setItem(ACTIVE_KEY, s.exampleId);
  } catch {
    // storage unavailable is non-fatal
  }
});
