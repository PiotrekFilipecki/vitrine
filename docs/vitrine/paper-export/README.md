# docs/vitrine/paper-export/

Plan B of P4 (PROMPTY X1): if the Paper MCP cannot read shader layer parameters, Piotrek exports the tuned shader
layers from Paper (layer → Export code → React) and pastes them here, one file per effect:

- `dither.tsx`, `halftone.tsx`, `mesh.tsx`, `paper.tsx`

The agent parses the `<ImageDithering … />`, `<HalftoneCmyk … />`, `<MeshGradient … />`, `<PaperTexture … />`
props (same names as `@paper-design/shaders-react` 0.0.82) into `presets/*.json`. Variants A/B/C in the Paper
file "VITRINE — presets" map to preset ids: A = the shipping default (`newsprint`, `riso`, `drop-night`,
`folded-lookbook`), B = the second look, C = Paper's default (kept 1:1 as `default`).
