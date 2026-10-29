# Demo photographs · credits and licences

Twelve product photographs for the VITRINE demo (phase R0, `docs/vitrine/KIERUNEK-v2.md`). They replace the NIWWTS
mockups on demo surfaces; the NIWWTS fixtures in `examples/spikes/fixtures/` stay only for the pixel-compatibility tests.

**Licence of every file below: [Unsplash License](https://unsplash.com/license).** Free to copy, modify and distribute,
also commercially, without asking. Not allowed: selling a photo without significant modification, and compiling Unsplash
photos into a similar or competing service. Attribution is not required; we give it anyway. The Unsplash License does
not grant trademark rights, so the set avoids visible brand logos (see "Checks").

Each photo was checked one by one on its Unsplash page on 29.10.2026: the page shows "Free to use under the Unsplash
License" (no Unsplash+ badge), and the page does not tag or list it as a 3D render or AI image. Downloaded on this Mac on
2026-10-29T21:49Z (`08-headphones`: 21:57Z, see "Checks") from `images.unsplash.com/photo-<id>?w=2400&q=90&fm=jpg`, encoded with `cwebp` (no metadata copied).

| File            | Product              | Photographer                                                                                                      | Unsplash page                                          | Published  | Camera (from the page) |
| --------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------- | ---------------------- |
| `01-vase`       | ceramic vase         | [Jocelyn Morales](https://unsplash.com/@molnj)                                                                    | [giRMqme_f-Q](https://unsplash.com/photos/giRMqme_f-Q) | 2022-01-30 | not shown              |
| `02-perfume`    | glass perfume bottle | [Benjamin Watterson](https://unsplash.com/@wattersonboi)                                                          | [r7TP25xDB-4](https://unsplash.com/photos/r7TP25xDB-4) | 2023-09-06 | Canon EOS 70D          |
| `03-sneaker`    | sneaker              | [Mojtaba Fahiminia](https://unsplash.com/@fahiminia)                                                              | [t4g1gctAaKk](https://unsplash.com/photos/t4g1gctAaKk) | 2020-10-27 | Canon EOS 5D Mark III  |
| `04-chair`      | chair (bar stool)    | [Eugene Chystiakov](https://unsplash.com/@eugenechystiakov)                                                       | [3neSwyntbQ8](https://unsplash.com/photos/3neSwyntbQ8) | 2020-02-12 | Sony ILCE-7M2          |
| `05-lamp`       | desk lamp            | [Oscar Ivan Esquivel Arteaga](https://unsplash.com/@oscaresquivel)                                                | [at5-1nW3UCY](https://unsplash.com/photos/at5-1nW3UCY) | 2021-05-19 | Canon EOS 6D Mark II   |
| `06-watch`      | wristwatch           | [Saif71.com](https://unsplash.com/@saif71)                                                                        | [bBTWoeep1vw](https://unsplash.com/photos/bBTWoeep1vw) | 2021-06-18 | Canon EOS 250D         |
| `07-bag`        | leather satchel      | [mostafa mahmoudi](https://unsplash.com/@mostafa_mahmoudi24)                                                      | [J4DnKxz_3sA](https://unsplash.com/photos/J4DnKxz_3sA) | 2020-11-18 | Canon EOS 80D          |
| `08-headphones` | headphones           | [Sam Grozyan](https://unsplash.com/@ijeunes)                                                                      | [P7KF3cTRKcE](https://unsplash.com/photos/P7KF3cTRKcE) | 2021-08-04 | SIGMA sd Quattro       |
| `09-mug`        | ceramic mug          | [Olena Bohovyk](https://unsplash.com/@olenkasergienko)                                                            | [InlMkMNlrhY](https://unsplash.com/photos/InlMkMNlrhY) | 2019-04-16 | Sony ILCE-7M2          |
| `10-sunglasses` | sunglasses           | [Anton Be](https://unsplash.com/@antonbe21)                                                                       | [ODhxNCO8XHY](https://unsplash.com/photos/ODhxNCO8XHY) | 2020-04-19 | not shown              |
| `11-candle`     | candle               | [Luma Candles](https://unsplash.com/@candlesbyluma), photo by Perry Graham Photography (per the page description) | [B0G8xzwTVWc](https://unsplash.com/photos/B0G8xzwTVWc) | 2020-10-13 | not shown              |
| `12-plant`      | potted plant         | [feey](https://unsplash.com/@feeypflanzen)                                                                        | [2cuzrhnuIeE](https://unsplash.com/photos/2cuzrhnuIeE) | 2023-11-17 | not shown              |

Suggested credit line (README, demo footer): "Product photographs from Unsplash: Jocelyn Morales, Benjamin Watterson,
Mojtaba Fahiminia, Eugene Chystiakov, Oscar Ivan Esquivel Arteaga, Saif71.com, mostafa mahmoudi, Sam Grozyan, Olena
Bohovyk, Anton Be, Luma Candles, feey."

## Files

- `products/NN-name.webp`: 1600 px wide (q 82), `products/w1000/`: 1000 px (q 80), `products/w640/`: 640 px (q 78).
- Command: `cwebp -q 82 -resize 1600 0 master.jpg -o products/NN-name.webp` (and 1000/80, 640/78).
- The 2400 px JPEG masters are not committed; they can be fetched again from the URLs above.

## Checks

- Rejected during selection: two lamp photos tagged "render" / "blender 3d" and listed under "3D Renders"
  (`MSUXmdgq8nc`, `LoD801xyx2A`), a watch listed under "3D Renders" (`2cFZ_FB08UM`), every Unsplash+ result, and photos
  with a dominant brand mark (perfume bottles with Dior and Loewe labels, Nike and Puma sneakers, a Fossil watch).
- Replaced after the first sheet: the first `08-headphones` (Luke Peterson, `lUMj2Zv5HUE`) shows the maker's name on
  both ear cups, readable at card size. The replacement has no visible mark; its Unsplash description names the model,
  the frame shows no logo.
- Left in with a small mark, checked on 2400 px crops: `06-watch` has a maker's wordmark on the dial, unreadable at
  card size (the R0 loupe is aimed at the date window and the bracelet, so it never magnifies it); `11-candle` has the
  plain label of the maker who uploaded the photo. Neither is the subject of the frame.
- No client store, no AI-generated image, no photo of an identifiable person.
- First choice sources tried and why not: Wikimedia Commons CC0 (official API) had almost no product shots on plain
  backgrounds; Pexels and the Unsplash API need an API key, which this session does not have.
