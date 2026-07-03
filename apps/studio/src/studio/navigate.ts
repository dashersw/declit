import { studioStore } from './files';

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const idPattern = (id: string) =>
  new RegExp(`id\\s*=\\s*(?:["']${escapeRegExp(id)}["']|\\{\\s*["']${escapeRegExp(id)}["']\\s*\\})`);

/**
 * Find the source location of an element id and reveal it in the editor.
 * Template-generated ids like "studio-west" fall back to their longest
 * declared prefix ("studio").
 */
export function revealElement(id: string): boolean {
  const { files, setActive, setReveal } = studioStore.getState();
  let candidate = id;
  for (;;) {
    const re = idPattern(candidate);
    for (const [file, code] of Object.entries(files)) {
      const m = re.exec(code);
      if (m) {
        setActive(file);
        setReveal({ file, from: m.index, to: m.index + m[0].length });
        return true;
      }
    }
    const i = candidate.lastIndexOf('-');
    if (i <= 0) return false;
    candidate = candidate.slice(0, i);
  }
}
