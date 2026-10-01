# rustcircle.com

Blog of **Pedro Jorge** — mathematician, programmer, chess player
(<pmrj@rustcircle.com>). Static site built with [Hugo](https://gohugo.io/)
(extended, pinned in `package.json`) and a few lines of TypeScript bundled by
Hugo's built-in esbuild. Light blue and white, 80s chrome, a slowly morphing
Julia set behind every page.

The layout borrows the idea of the book project `engano-nao-e-traicao`:
numbered Markdown files in one folder, a Makefile that builds everything,
HTML comments as private notes that never reach the output, and a `notes/`
folder that is not published.

## Quick start

```sh
make install                     # Hugo, TypeScript, fonts (pinned, local)
make new TITLE="O meu primeiro post" SUBTITLE="Opcional"
make dev                         # http://localhost:1313, live reload, drafts visible
make build                       # production site in public/ + size report
```

| target | does |
|---|---|
| `make build` | check + typecheck, then minified, fingerprinted site in `public/` |
| `make dev` | live-reload server with drafts and future posts |
| `make preview` | serve the production build |
| `make new TITLE="…" [SUBTITLE="…"] [SEP=_]` | next numbered post folder from `archetypes/post/` |
| `make check` | validate folder names, single `index.md`, front matter |
| `make assets` | regenerate icons/avatar (`imgs/`) and subset fonts |
| `make size` | bytes and gzip of every shipped asset |
| `make clean` | remove `public/` and caches |

## Posts: folders and files

```
content/posts/
├── 00001-hello-fractal-world/
│   ├── index.md          ← the post (exactly one .md file, named index.md)
│   └── assets/           ← images, video, audio, fonts, PDFs, data for this post
│       └── plasma.jpg
└── 00002_a-bell-state/   ← "_" works as well as "-"
    ├── index.md
    └── assets/
```

- Folder name: `NNNNN-title` or `NNNNN_title`. `NNNNN` is `00001` … `99999`,
  zero-padded, unique. Zero padding means alphabetical order = numeric order
  (no `p99`/`p100` problem). `title` is lowercase `a-z 0-9` joined by `-`/`_`.
- The number orders your folders; the public URL drops it:
  `content/posts/00001-hello-fractal-world/` → `https://rustcircle.com/posts/hello-fractal-world/`.
  The card and the post header show it as `#00001`.
- Only media you actually reference from `index.md` is published; JPEG/PNG
  images are re-encoded to responsive WebP (480/800/1200 px).

## Front matter (top of every `index.md`)

```yaml
---
title: "Título do post"                 # required
subtitle: "Uma linha que explica o post" # required key; may be ""
date: 2026-10-01T14:30:00+01:00         # required: date AND time AND UTC offset (ISO 8601)
author: "Pedro Jorge"                   # required
slug: "titulo-do-post"                  # required: folder name without NNNNN- (make new fills it)
description: "Resumo para SEO e partilhas."   # optional; falls back to subtitle
draft: true                             # optional; drafts are hidden by `make build`
---
```

- **Date and time are one field.** `2026-10-01T14:30:00+01:00` is 1 October 2026
  at 14:30 Lisbon summer time (`+00:00` in winter). The site shows
  "Oct 1, 2026 · 14:30". A date in the future keeps the post hidden until then.
- Body: CommonMark/GFM. Maths in LaTeX (KaTeX syntax), rendered to MathML at build time
  (no JS, no maths CSS, no maths fonts — typeset with the system maths font):
  inline `$…$` or `\(…\)`, display `$$…$$` or `\[…\]`. Write a literal dollar as `\$`.
- Images: `![alt text](assets/figure.png "optional caption")`.
- Video: `{{</* video src="assets/clip.mp4" poster="assets/poster.jpg" caption="…" */>}}`
  (add `autoplay="true"` for a muted loop).
- Private notes: `<!-- like this -->` — removed from the HTML.

## Design

- Palette: `#f4f9ff` background, white surfaces, ink `#0c2340`, links `#0b5fae`,
  sky accents `#7cc7ff`/`#b9defc`. All text tokens pass WCAG AA (≥ 4.5:1).
- Type (all SIL OFL 1.1, self-hosted, subset to Latin + PT accents + maths symbols):
  **Orbitron** (80s display, headings and brand), **IBM Plex Sans** (body — IBM's open
  typeface, a nod to IBM Quantum), **IBM Plex Mono** (code, dates, numbers); maths in the system maths font
  (STIX Two Math on Apple, Cambria Math on Windows) via MathML.
- Motion: cross-document View Transitions (post titles morph from card to page),
  scroll-driven reveal of cards and a reading-progress bar (pure CSS), the
  WebGL Julia-set background (30 fps, half resolution, paused in hidden tabs).
  `prefers-reduced-motion` turns all of it off (the background becomes one still frame).
- Easter egg: ↑ ↑ ↓ ↓ ← → ← → B A.
- No tags, no RSS feed, no sitemap (disabled in `hugo.toml` via `disableKinds`).
  The footer ends with a lemniscate ∞ (inline SVG) that traces itself on hover.

## Assets

`imgs/profile.png` and `imgs/icons.png` are the originals; `make icons` derives
exactly what the site uses:

| file | size | from |
|---|---|---|
| `static/favicon.ico` | 16 + 32 | icons.png |
| `static/favicon-16x16.png`, `favicon-32x32.png` | 16, 32 | icons.png |
| `static/apple-touch-icon.png` | 180 | icons.png |
| `static/img/icon-192.png`, `icon-512.webp` | 192, 512 (web manifest) | icons.png |
| `static/img/avatar-{56,112,168}.webp` | 56 CSS px at 1×/2×/3× | profile.png |
| `static/img/og-avatar.jpg` | 400 (link previews) | profile.png |

## Loading: nothing loads before it is needed

- **Critical path** = HTML with the core CSS inlined (no render-blocking stylesheet),
  two preloaded fonts, and `boot.js` (< 1 kB gzip, deferred module).
- **Per page type:** `post.css` only on posts/pages (not on lists), `syntax.css` only
  when the page has a code block, maths needs no download at all (MathML).
- **On demand (dynamic `import()`):** the WebGL fractal after `load` when the
  browser is idle (never with Save-Data); the copy-code button when a code
  block is about to scroll into view; the easter egg on the first ↑ key.
- **Media:** images `loading="lazy" decoding="async"` with `srcset`, video
  `preload="none"`, fonts fetched only when a style uses them, off-screen
  footer and archive years skipped by `content-visibility: auto`.
- **Next page:** Speculation Rules prefetch links on hover/press (Chromium); other
  browsers get a tiny `<link rel=prefetch>` fallback from `boot.js`. Navigation stays
  real page loads (works without JS) and animates with cross-document View Transitions.

## Layout of the repository

```
archetypes/post/   template for `make new` (index.md + assets/)
assets/css         fonts.css (template) + core.css (inlined), post.css, syntax.css
assets/fonts       subset woff2 + licences
assets/ts          boot.ts (always), fractal.ts, copy.ts, konami.ts (on demand)
content/           posts/, about.md
i18n/              en.yaml (active), pt.yaml (switch with locale = "pt-PT")
layouts/           Hugo templates, render hooks, shortcodes
notes/             private notes — never published
scripts/           check.ts, new-post.ts (Node ≥ 23.6 runs TS natively), icons.sh, fonts.sh
static/            icons, avatar, manifest
data/              mathvariants.yaml (\mathbb etc. → Unicode for MathML)
```

## Deploy

`make build` writes a self-contained `public/` for any static host (Cloudflare
Pages, Netlify, GitHub Pages, S3…). `baseURL` is `https://rustcircle.com/` in
`hugo.toml`. Serve `/fonts/*`, `/css/*`, `/js/*` with
`Cache-Control: public, max-age=31536000, immutable` (their names are fingerprinted).
