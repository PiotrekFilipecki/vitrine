# docs/vitrine/paper-export/

Plan B of P4 (PROMPTY X1): if the Paper MCP cannot read shader layer parameters, Piotrek exports the shader layers he
set up in Paper (layer → Export code → React) and pastes them here, one file per effect. Not used so far: in P4 the
presets were picked on renders of the element and no shader layers were built in Paper (`process.md` §1). Kept for the
Q2 round, where Piotr tunes the new presets on the canvas.

- `dither.tsx`, `halftone.tsx`, `mesh.tsx`, `paper.tsx`

The agent parses the `<ImageDithering … />`, `<HalftoneCmyk … />`, `<MeshGradient … />`, `<PaperTexture … />`
props (same names as `@paper-design/shaders-react` 0.0.82) into `presets/*.json`. Variants A/B/C in the Paper
file "VITRINE — presets" map to preset ids: A = the shipping default (`newsprint`, `riso`, `drop-night`,
`folded-lookbook`), B = the second look, C = Paper's default (kept 1:1 as `default`).
