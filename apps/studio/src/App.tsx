import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { useStore } from 'zustand';
import { createModelStore, paramsStore, selectionStore } from '@declit/core';
import { EditorPane } from './chrome/EditorPane';
import { LayersPanel } from './chrome/LayersPanel';
import { ParamsPanel } from './chrome/ParamsPanel';
import { ProblemsPanel } from './chrome/ProblemsPanel';
import { Stage } from './chrome/Stage';
import { compileProject } from './studio/compiler';
import { studioStore } from './studio/files';
import { revealElement } from './studio/navigate';

interface Compiled {
  Component: ComponentType;
  version: number;
}

export function App() {
  const modelStore = useMemo(createModelStore, []);
  const files = useStore(studioStore, (s) => s.files);
  const entry = useStore(studioStore, (s) => s.entry);
  const exampleId = useStore(studioStore, (s) => s.exampleId);
  const [compiled, setCompiled] = useState<Compiled | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const versionRef = useRef(0);
  const [editorWidth, setEditorWidth] = useState(() =>
    Math.round(Math.min(720, Math.max(430, window.innerWidth * 0.4)))
  );

  useEffect(() => {
    const delay = versionRef.current === 0 ? 0 : 300;
    const timer = setTimeout(() => {
      try {
        const Component = compileProject(files, entry);
        versionRef.current += 1;
        setCompiled({ Component, version: versionRef.current });
        setCompileError(null);
        setRuntimeError(null);
      } catch (e) {
        console.error('[declit] compile failed:', e);
        setCompileError(e instanceof Error ? e.message : String(e));
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [files, entry]);

  useEffect(() => {
    return selectionStore.subscribe((s, prev) => {
      if (s.selected && s.selected !== prev.selected) revealElement(s.selected);
    });
  }, []);

  useEffect(() => {
    (window as unknown as Record<string, unknown>).__declit = {
      studioStore,
      paramsStore,
      modelStore,
      selectionStore,
      revealElement,
    };
  }, [modelStore]);

  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const start = editorWidth;
    const move = (ev: PointerEvent) =>
      setEditorWidth(Math.min(window.innerWidth - 420, Math.max(380, start + ev.clientX - startX)));
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const Design = compiled?.Component;

  return (
    <div className="studio" style={{ gridTemplateColumns: `${editorWidth}px 6px 1fr` }}>
      <EditorPane error={compileError ?? (runtimeError ? `Runtime error: ${runtimeError}` : null)} />
      <div className="divider" onPointerDown={startDrag} />
      <div className="viewport">
        <Stage
          store={modelStore}
          designKey={compiled?.version ?? 0}
          fitKey={exampleId}
          onRuntimeError={setRuntimeError}
        >
          {Design ? <Design /> : null}
        </Stage>
        <div className="card header">
          <h1>
            declit <span>· declarative buildings</span>
          </h1>
          <p>
            The building is the code on the left — edit it and the model rebuilds live. Scene,
            camera and panels are chrome; your design lives in the files.
          </p>
        </div>
        <ParamsPanel />
        <LayersPanel />
        <ProblemsPanel store={modelStore} />
      </div>
    </div>
  );
}
