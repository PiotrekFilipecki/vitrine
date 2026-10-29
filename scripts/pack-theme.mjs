// Release asset: zip of shopify-theme/ (the folder a developer copies into a theme). Output: release/vitrine-shopify-theme-<version>.zip
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const { version } = JSON.parse(readFileSync(`${root}packages/element/package.json`, 'utf8'));
mkdirSync(`${root}release`, { recursive: true });
const out = `${root}release/vitrine-shopify-theme-${version}.zip`;
execFileSync('zip', ['-r', '-X', '-q', out, 'shopify-theme', '-x', 'shopify-theme/.theme-check.yml'], {
  cwd: root,
});
console.log(
  execFileSync('unzip', ['-l', out], { encoding: 'utf8' }).trim().split('\n').slice(-12).join('\n')
);
