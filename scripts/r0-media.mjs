// R0 · committed copies of the proof media. Full-size PNG/GIF stay local (gitignored, ADR-0002 bramka R0: no 51 MB
// in history); git gets a WebP of each PNG, at most 400 KB, plus the .json params and the small MP4 clips.
// Needs cwebp (libwebp) on PATH.
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';

export const WEBP_LIMIT = 400_000; // bytes: 400 kB, also under 400 KiB

/** Encode `png` to a sibling .webp ≤ 400 KB: quality 82 → 50 first, then 85 % smaller steps. Returns the result. */
export function toWebp(png) {
  const out = png.replace(/\.png$/, '.webp');
  const width = Number(execFileSync('magick', ['identify', '-format', '%w', png]).toString());
  for (let scale = 1; scale > 0.2; scale *= 0.85) {
    for (const q of [82, 74, 66, 58, 50]) {
      const args = ['-quiet', '-q', String(q), '-m', '6', '-af'];
      if (scale < 1) args.push('-resize', String(Math.round(width * scale)), '0');
      execFileSync('cwebp', [...args, png, '-o', out]);
      const size = statSync(out).size;
      if (size <= WEBP_LIMIT) return { out, size, q, width: Math.round(width * scale) };
    }
  }
  throw new Error(`${png}: could not get under ${WEBP_LIMIT} bytes`);
}

export const describe = ({ out, size, q, width }) =>
  `${out.split('/').pop()} ${(size / 1000).toFixed(0)} kB (q ${q}, ${width} px)`;
