# Soul 2.0 prompt pack — key images

Higgsfield **Soul 2.0** replaces the Pexels placeholders only where it matters most. Everything else stays on Pexels (`docs/PHOTO_CREDITS.md`).

Prompting notes (from Higgsfield's guide and third-party write-ups):
- Prompt like a photographer: medium, lens, light, styling. Lead with the main direction.
- Keep each prompt under about 100 words and let the model's own aesthetic do the rest.
- A reference image disables the prompt field, so these use prompt mode. A preset and a Soul HEX palette can still be added in prompt mode.
- Test at lower quality, then render finals at high quality.

House look for every prompt: *dark, cinematic, editorial; deep navy shadows (#050912) with one warm or electric accent; negative space for UI text; no text, logos or watermarks.*

Output: `src/assets/photos/<key>.webp` (1400px) and `<key>-sm.webp` (480px). The keys already resolve in `src/data/photos.ts`, so a new file replaces the Pexels one with no code change.

## Priority 1 — heroes

| Key | Ratio | Prompt |
|---|---|---|
| `hero-space` | 21:9 | Wide cinematic shot of a lone astronaut standing on a Martian ridge at dusk, rust dunes below, a small bright Earth low in a deep indigo sky, thin dust haze catching rim light, figure at right third, vast calm negative space on the left half, anamorphic 35mm, Kodak Vision3 500T grain, low-key, editorial sci-fi |
| `explore-hero` | 21:9 | Night aerial of a vast city grid glowing amber and electric blue toward a curved horizon, faint data-like light trails between districts, deep navy sky fading to black at the top, quiet and expansive, top-left kept dark for a headline, 24mm, long exposure, cinematic editorial |

## Priority 2 — fictional people and events (no stock photo can show these)

| Key | Ratio | Prompt |
|---|---|---|
| `marlowe-election-2028` | 16:9 | Elena Marlowe, a confident woman in her late 40s, presidential candidate, navy suit, mid-speech at a podium on a night rally stage, warm key light on her face, blurred crowd and stage lights behind, shallow depth of field, 85mm, editorial political photography, no text on podium or signs |
| `music-tour-2027` | 16:9 | Aurora Vale, a pop artist in her late 20s with silver-platinum hair and a sculptural iridescent jacket, singing on a huge arena stage, magenta and cyan beams through haze, crowd silhouettes in the foreground, 50mm, concert photography, high contrast |
| `festival-2027` | 16:9 | Horizon Sound festival at blue hour: a monumental minimalist light-arch stage on a desert plain, thousands of silhouettes, lasers fanning into the sky, warm dust, wide 24mm, cinematic, no logos or banners |
| `film-award-2027` | 16:9 | Night red carpet at an elegant film awards gala, a woman in a dark velvet gown mid-step, photographers' flashes blooming as soft bokeh, golden light, 85mm, editorial glamour, no text or logos |
| `global-event-pending` | 16:9 | International summit plenary in a modern glass hall at night, delegates seated around a vast circular table, cool blue light with warm table lamps, wide 28mm from a high angle, documentary editorial, no flags or readable nameplates |
| `peace-talks-2027` | 16:9 | Two negotiators shaking hands across a long table in a dim wood-panelled room, window light raking across, papers and water glasses, faces partly in shadow, 50mm, documentary, muted palette |

## Priority 3 — category tiles (shown in portrait, 3:4)

| Key | Ratio | Prompt |
|---|---|---|
| `cat-politics` | 3:4 | Neoclassical columns at night lit from below in warm amber, a deep navy sky, a single figure walking up the steps, low angle, 35mm, cinematic |
| `cat-sports` | 3:4 | A floodlit stadium tunnel opening onto a glowing pitch, a player silhouette walking out, light flare, 35mm, cinematic sports editorial |
| `cat-crypto` | 3:4 | Macro of a dark matte metal coin with an abstract circuit engraving, a warm amber rim light, black background, 100mm macro, product editorial, no real currency symbols |
| `cat-tech` | 3:4 | A person's hand touching a glass panel of floating translucent interface light, electric blue and violet, dark room, 50mm, cinematic tech |
| `cat-economy` | 3:4 | A financial district at blue hour seen through rain-streaked glass, warm office windows, bokeh, 50mm, moody editorial |
| `cat-entertainment` | 3:4 | A single spotlight on an empty theatre stage with a red velvet curtain, haze, a dark auditorium, 35mm, cinematic |
| `cat-global` | 3:4 | Earth's night side from orbit, city lights tracing coastlines, a thin blue atmosphere line, the sun just cresting, cinematic, NASA-style realism |
| `cat-science` | 3:4 | A researcher silhouetted against a giant radio telescope dish under a star-filled sky with the Milky Way, 24mm, long exposure |

## Post-processing

Run the same pipeline used for the Pexels images: `convert <in> -strip -resize '1400x>' -quality 62 -define webp:method=6 <key>.webp` and `-resize 480x -quality 58` for `<key>-sm.webp`. Check every image by eye before committing it. Then update `docs/PHOTO_CREDITS.md` to read "Generated with Higgsfield Soul 2.0".
