# Brand guide: MediaPure

## Name

**MediaPure**, one word, capital M and capital P. The product grew from an image-only cleaner into a
platform covering images and video, and the descriptive old name ("AI Images Metadata Remover") no
longer describes it.

- In running text: **MediaPure**. Never "Media Pure", "mediapure" or "MEDIAPURE" outside a logo or an
  all-caps UI label.
- Positioning line: **The complete media metadata cleaning platform.**
- The two tools are the **image cleaner** and the **video cleaner**, lower case, not sub-brands.
- "Media Pure" as two words is registered as a schema `alternateName` because people will search it
  that way. Don't use it in copy.

**Descriptive keywords stay in page titles and H1s**, where they do the SEO work the old name used to
do: "Video Metadata Remover", "Remove Image Metadata Online", "EXIF remover", "AI metadata remover".
The brand owns the site; the descriptions own the pages.

**Company line:** Powered by The Vector.

## Logo

Assets live in `frontend/public/brand/` and `frontend/src/app/` (favicon, app icons), generated from the
supplied artwork in `new logos/` with the background flood-filled to transparency (the counters inside
the mark and the letterforms are preserved, not keyed out).

| Asset | File | Use |
|---|---|---|
| Lockup, light surfaces | `mediapure-lockup-96/192.webp` + `.png` | Header, footer, anywhere on white or `paper` |
| Lockup, dark surfaces | `mediapure-lockup-dark-96/192.webp` + `.png` | The `ink` bands, the OG card, dark decks |
| Icon mark | `mediapure-icon-512.png`, `mediapure-icon-256.webp` | Favicons, app icons, social avatars, product tiles |
| Open Graph card | `og.png` (1200×630) | Link previews |

- Use the **horizontal lockup** in the header and footer, the **icon** alone where the wordmark would
  fall below its minimum size.
- There is a proper reversed lockup now, so **never** drop the light lockup onto a dark band and hope.
- Minimum clear space: the height of the "M" on every side. Minimum size: lockup 120 px wide, icon 24 px.
- Don't recolour, stretch, add shadows or place on busy photos or video stills.
- Source files: ask the designer for vector (SVG/AI) originals. The supplied files are raster, which is
  fine for web but not for print or very large sizes.

**The previous mark is retained, deliberately.** The old pixel-dissolve icon (`brand/icon-256.webp`) is
still used as the **image cleaner's** product tile on the homepage, beside the MediaPure play mark for
the **video cleaner**. It gives the two tools distinct identities and keeps continuity with the original
product. It is not a logo any more: never use it in the header, the footer or as a favicon.

## Colour

The palette is unchanged — the new artwork was already built from it, which is why the rebrand needed
no design-system changes.

| Token | Hex | Use |
|---|---|---|
| ink | `#0a1433` | Headlines, body text, dark sections (matches the logo's navy) |
| ink-2 | `#2a3659` | Secondary text |
| muted | `#5b6784` | Captions, labels |
| signal | `#1463ff` | Primary buttons, links, focus rings (matches the logo blue) |
| signal-deep | `#0b45c7` | Hover state; small blue text on tinted backgrounds |
| cyan | `#12c2f2` | Gradients and accents (from the logo's pixel trail and the "Pure" gradient) |
| paper | `#f6f8fc` | Page tint, alternating sections |
| line | `#dce3f0` | Borders, dividers |
| clean | `#0b9e74` | "Clean", success, 100% privacy, frame-identical |
| alert / alert-ink | `#d9364a` / `#b01e33` | Location and identity findings (use alert-ink for small text) |
| amber / amber-ink | `#c77700` / `#8a5200` | AI data, device, warnings (use amber-ink for small text) |

All text colour pairs used on the site pass WCAG AA.

## Typography

- **Plus Jakarta Sans** (variable, 200–800) for everything: headlines at 800 with tight tracking,
  UI and body at 400–600. Geometric and friendly, close to the logo's letterforms.
- **JetBrains Mono** for metadata field names (`GPSLatitude`, `xmp:CreatorTool`, `handler_name`) so
  technical data reads as data.
- Both are self-hosted (no Google Fonts request), use `font-display: swap`; Jakarta is preloaded.

## Visual language

- **Pixel field:** a faint dot grid behind the hero, echoing the pixel trail in the logo.
- **File anatomy:** the signature interaction. A picture on one side, the hidden fields on the other,
  and a Before/After toggle that sweeps the fields away. Use this idea in ads and social posts.
- **Tool switcher:** images and video are peers, always presented as a pair — tabs in the hero, two
  buttons in the header, two cards on the homepage. Neither is "the other one".
- **Before → after:** every result shows two numbers and two rings. Never show a result without showing
  what it replaced.
- Generous white space, 20 px card radius, one soft shadow level. Motion is short (200–400 ms) and
  switches off for users who prefer reduced motion.

## Voice

Plain, specific and calm. Say exactly what is removed and what is kept. No fear-mongering, no
"undetectable AI" promises.

- Yes: "Your clip carried a GPS track logging the whole walk. It's gone; every frame is unchanged."
- No: "Hackers can see EVERYTHING! Protect yourself NOW!"
- Be concrete about mechanism — "container rewrite", "no re-encoding", "checksummed stream by stream" —
  because the claim is unusual and the detail is what makes it credible.
- Always be clear that the tool removes metadata, not pixel or frame watermarks, and does not replace AI
  disclosure where a platform or law requires it.
- Be equally clear that images never touch disk but videos must. Overclaiming on privacy is the one
  thing a privacy product cannot recover from.
