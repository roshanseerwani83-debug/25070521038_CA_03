import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * IS src/App.tsx STILL THE STARTER PLACEHOLDER? (production 2026-10-15/16: game builds copied a
 * recipe's files but never its App.tsx; `pnpm verify` passed four times on one of them while the
 * preview showed only the placeholder's dot.)
 *
 * The marker alone is not proof: an agent kept it around its real site (dev 2026-10-06, the publish
 * guard's `isStarterApp`). The placeholder imports nothing and holds only an empty span in its marked
 * element; an import, a word or any other tag is a site. No App.tsx at all (a game drawn without
 * React) is not the starter either.
 */
export function starterStillMounted(root) {
  const file = path.join(root, 'src', 'App.tsx');
  if (!existsSync(file)) return false;
  const source = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
  const at = source.indexOf('data-wb-initial');
  if (at < 0 || /^\s*import\b/m.test(source)) return false;
  const inside = source.slice(at);
  const rest = inside
    .slice(inside.indexOf('>') + 1)
    .replace(/<span\b[^>]*\/>|<span\b[^>]*>\s*<\/span>|<\/[a-z]+>/g, '');
  return !rest.includes('<') && !/\w/.test(rest);
}

/**
 * The type check's errors for a name nothing defines, in the page's own code: it builds cleanly and
 * crashes the page when it is reached (`frameAt`, `deleteRow`; production 2026-10-14..16). "Cannot
 * find name" (2304, 2552, 2580, 2591), `React.useState` with no import (2686) and a shorthand
 * property with no such name (18004). Every other type complaint leaves the page running, so it is
 * not reported. Tests are not the page. `output` is `tsc --pretty false` output.
 */
export function cannotFindName(output) {
  return output
    .split(/\r?\n/)
    .filter((line) => /^src[\\/][^(]+\(\d+,\d+\): error TS(2304|2552|2580|2591|2686|18004): /.test(line))
    .filter((line) => !/\.(test|spec)\.[jt]sx?\(/.test(line));
}
