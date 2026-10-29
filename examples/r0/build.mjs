// Bundle examples/r0/r0-entry.js (React 19 + @paper-design/shaders-react 0.0.82) into r0.bundle.js.
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
export async function bundleR0() {
  await build({
    entryPoints: [`${here}r0-entry.js`],
    outfile: `${here}r0.bundle.js`,
    bundle: true,
    format: 'esm',
    target: 'es2022',
    minify: true,
    logLevel: 'error',
    define: { 'process.env.NODE_ENV': '"production"' },
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await bundleR0();
