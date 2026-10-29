// Release step (ADR-0001 §5): copy packages/react/dist into packages/element/dist/react so the published package
// `vitrine-shaders` exposes the `./react` subpath. The wrappers import the element by package name; inside the
// package that becomes a relative import so bundlers never have to resolve a self-reference.
import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const src = `${root}packages/react/dist/`;
const dst = `${root}packages/element/dist/react/`;
mkdirSync(dst, { recursive: true });
for (const f of readdirSync(src)) {
  if (f.endsWith('.js') || f.endsWith('.d.ts')) {
    const text = readFileSync(src + f, 'utf8')
      .replace(/(["'])vitrine-shaders\1/g, (_, q) => `${q}../index.js${q}`)
      .replace(/from "vitrine-shaders"/g, 'from "../index.js"');
    writeFileSync(dst + f, text);
  } else {
    copyFileSync(src + f, dst + f);
  }
}
console.log(`assemble-react: ${readdirSync(dst).join(', ')} → packages/element/dist/react/`);
