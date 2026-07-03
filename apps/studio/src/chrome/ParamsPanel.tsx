import { useStore } from 'zustand';
import { paramsStore, setParam } from '@declit/core';

const decimals = (step: number) => (step >= 1 ? 0 : step >= 0.1 ? 1 : 2);

export function ParamsPanel() {
  const params = useStore(paramsStore, (s) => s.params);
  const active = [...params.values()].filter((p) => p.refs > 0);
  if (active.length === 0) return null;

  return (
    <div className="card panel">
      <h2>Parameters</h2>
      {active.map(({ spec, value }) => (
        <div className="slider-row" key={spec.label}>
          <div className="labels">
            <span>{spec.label}</span>
            <span className="value">
              {value.toFixed(decimals(spec.step))}
              {spec.unit ? ` ${spec.unit}` : ''}
            </span>
          </div>
          <input
            type="range"
            min={spec.min}
            max={spec.max}
            step={spec.step}
            value={value}
            onChange={(e) => setParam(spec.label, Number(e.target.value))}
          />
        </div>
      ))}
    </div>
  );
}
