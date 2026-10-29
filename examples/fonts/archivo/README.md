# Archivo (variable, latin subset)

`archivo-latin-wdth-wght.woff2`: Archivo by Omnibus-Type, variable on `wdth` 62–125 % and `wght` 400–700, latin
subset (U+0000-00FF, U+0131, U+0152-0153, U+2000-206F, U+20AC, U+2122 and a few more), 90 096 bytes,
SHA-256 `4c98b9d490d1698ec95f2ff17a6c7d0e72691864c0c5d7bc2a2c161b45afe5ad`.

Source: the file Google Fonts serves for
`https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..700` (latin block, `v25`), downloaded
29.10.2026. Licence: SIL Open Font License 1.1, full text in [`OFL.txt`](OFL.txt) (from `google/fonts`,
`ofl/archivo/OFL.txt`).

Why it is in the repo: `examples/next-headless` builds without network access (`next/font/local` instead of
`next/font/google`) and `examples/static` stops shifting its layout when a web font arrives from a third-party
origin (Q0 devlog, CLS 0.329 before).
