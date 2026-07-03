import { useStore } from 'zustand';
import { EXAMPLES } from '../examples';
import { studioStore } from '../studio/files';
import { CodeEditor } from './CodeEditor';

export function EditorPane({ error }: { error: string | null }) {
  const files = useStore(studioStore, (s) => s.files);
  const active = useStore(studioStore, (s) => s.active);
  const entry = useStore(studioStore, (s) => s.entry);
  const exampleId = useStore(studioStore, (s) => s.exampleId);
  const epoch = useStore(studioStore, (s) => s.editorEpoch);
  const reveal = useStore(studioStore, (s) => s.reveal);
  const { setCode, setActive, addFile, deleteFile, reset, switchExample } = studioStore.getState();

  return (
    <div className="editor-pane">
      <div className="example-bar">
        <span className="example-label">example</span>
        <select
          className="example-select"
          value={exampleId}
          onChange={(e) => switchExample(e.target.value)}
        >
          {EXAMPLES.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.label}
            </option>
          ))}
        </select>
        <span className="example-blurb">
          {EXAMPLES.find((e) => e.id === exampleId)?.blurb}
        </span>
        <div className="tabs-spacer" />
        <button
          className="tab-btn"
          title="Restore this example to its original files"
          onClick={() => {
            if (confirm('Restore this example? Your edits to it will be lost.')) reset();
          }}
        >
          reset
        </button>
      </div>
      <div className="tabs">
        {Object.keys(files).map((name) => (
          <div
            key={name}
            className={`tab${name === active ? ' active' : ''}`}
            onClick={() => setActive(name)}
          >
            {name}
            {name !== entry && (
              <span
                className="close"
                title={`Delete ${name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete ${name}?`)) deleteFile(name);
                }}
              >
                ×
              </span>
            )}
          </div>
        ))}
        <button
          className="tab-btn"
          title="New file"
          onClick={() => {
            const name = prompt('File name', 'Room.tsx');
            if (name) addFile(name);
          }}
        >
          +
        </button>
      </div>
      <CodeEditor
        key={`${exampleId}:${active}:${epoch}`}
        initialCode={files[active] ?? ''}
        onChange={(code) => setCode(active, code)}
        reveal={reveal && reveal.file === active ? reveal : null}
      />
      {error && <div className="error-banner">{error}</div>}
    </div>
  );
}
