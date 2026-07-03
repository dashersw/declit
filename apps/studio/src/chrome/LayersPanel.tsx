import { useStore } from 'zustand';
import { LAYER_ORDER, layersStore, setLayerVisible, type LayerEntry } from '@declit/core';

/** ordering for spatial layers: ground floor, then upper floors, then roof */
function spatialRank(name: string): number {
  if (name === 'ground floor') return 0;
  const m = /^floor\s+(\d+)$/.exec(name);
  if (m) return 1 + Number(m[1]);
  if (name === 'roof') return 1000;
  return 500;
}

function Row({ name, entry }: { name: string; entry: LayerEntry }) {
  return (
    <label className="layer-row">
      <input
        type="checkbox"
        checked={entry.visible}
        onChange={(e) => setLayerVisible(name, e.target.checked)}
      />
      <span>{name}</span>
    </label>
  );
}

export function LayersPanel() {
  const layers = useStore(layersStore, (s) => s.layers);
  const active = [...layers.entries()].filter(([, e]) => e.refs > 0);
  if (active.length === 0) return null;

  const systems = active
    .filter(([name]) => LAYER_ORDER.includes(name))
    .sort((a, b) => LAYER_ORDER.indexOf(a[0]) - LAYER_ORDER.indexOf(b[0]));
  const stories = active
    .filter(([name]) => !LAYER_ORDER.includes(name))
    .sort((a, b) => spatialRank(a[0]) - spatialRank(b[0]) || a[0].localeCompare(b[0]));

  return (
    <div className="card layers">
      <h2>Layers</h2>
      {systems.map(([name, entry]) => (
        <Row key={name} name={name} entry={entry} />
      ))}
      {stories.length > 0 && (
        <>
          <div className="layer-subhead">stories</div>
          {stories.map(([name, entry]) => (
            <Row key={name} name={name} entry={entry} />
          ))}
        </>
      )}
    </div>
  );
}
