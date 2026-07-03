import { useModelProblems, type ModelStore } from '@declit/core';

export function ProblemsPanel({ store }: { store: ModelStore }) {
  const problems = useModelProblems(store);
  return (
    <div className="card problems">
      <h2>Constraints</h2>
      {problems.length === 0 ? (
        <div className="ok">✓ all constraints satisfied</div>
      ) : (
        <ul>
          {problems.map((pr, i) => (
            <li key={i}>
              <code>{pr.elementId}</code>: {pr.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
