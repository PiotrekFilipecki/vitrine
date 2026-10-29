# presets/

One JSON file per effect (`dither`, `halftone`, `mesh`, `paper`). Same data is read by the `<vitrine-shader>` element
(bundled at build time), by the Liquid section schemas (P2) and by the React wrappers (P3).

Format:

```json
{
  "effect": "dither",
  "shader": "image-dithering",
  "paperShaders": "0.0.82",
  "presets": {
    "default": { "name": "Default", "source": "where it comes from", "params": { "...": "param → value" } }
  }
}
```

- `params` use the parameter names of `@paper-design/shaders-react` (not uniform names) and never include `image`.
- `default` is the upstream "Default" preset copied 1:1 and is the base every other preset and every `params`
  attribute is merged onto.
- Presets marked "VITRINE P1 draft" are placeholders until P4 tunes them in Paper.
