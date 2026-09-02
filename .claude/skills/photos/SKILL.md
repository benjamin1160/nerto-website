---
name: photos
description: Replace, add, or remove pictures anywhere on the site — a home's gallery, a community image, a page hero, the homepage hero — one image at a time. Use for any request about a photo, image, picture, gallery, or hero image.
---

# Changing pictures

Every image on the site renders through one component, `<Scene>`
(`components/artwork/scene.tsx`), and every photograph is registered in one
file, `lib/photos.ts`. To change a picture you add or edit one line in that
file and drop the file under `public/photos/`. Nothing else changes.

The site shows photographs and nothing else. If a key is absent, that image
renders as an empty plate saying a photograph is to come — never as a drawing
of a home. Photography can therefore arrive one image at a time, but a
listing should declare only the scenes it actually has pictures of, or its
gallery will show that plate.

## The key shapes

    "<home-slug>/<scene-kind>"     one scene on one home
                                   kinds: exterior living kitchen
                                          bedroom bath porch
    "community/<community-slug>"   a community's image
    "page/<name>"                  a page hero or one-off

Page keys currently wired up: `page/homes` (the `/listings` hero — the key
kept its old name), `page/faq`, `page/promotions`, `page/prequalify`,
`page/address`, `page/blog`, `blog/<slug>`, `page/communities`,
`page/start-here`, `page/why-manufactured`, `page/financing`, `page/about`,
`page/contact`, `page/saved`, `page/not-found`, `page/home-closing` (the
closing band on the homepage), and `page/about-team-1` … `page/about-team-4`.

## Recipes

**Replace one picture.** Save the file to
`public/photos/homes/<slug>/<kind>.jpg`, then add to `photos` in
`lib/photos.ts`:

```ts
"the-alder/kitchen": "/photos/homes/the-alder/kitchen.jpg",
```

**Give a home a full photo gallery.** Add all six kinds for that slug. The
gallery, its thumbnails, the lightbox and the listing card all pick them up.
Only the kinds listed in that home's `scenes` array are shown, and every kind
listed there should have a photograph here.

**Take a picture down.** Delete the key, and drop the matching entry from
that home's `scenes` array in `lib/homes.ts` so the gallery does not show an
empty plate where it was. The file under `public/` can stay or go.

**The homepage hero** is the one exception: it is imported directly in
`components/landing.tsx` so it can carry a blur placeholder and a fetch
priority.
Replace `public/photos/hero-home.jpg` in place, keeping the name, and update
the `alt` text in `components/landing.tsx` to describe the new photograph. Its framing
is deliberately different on mobile and desktop — see the comment above it
before changing `object-position`.

**Import a manufacturer's photography.** Every listing carries the
`sourceUrl` it was read from, so `node scripts/import-clayton.mjs sheets`
builds a numbered contact sheet per home from that page; record the indices
in `scripts/clayton-selection.json`, then `photos` downloads them and
`register` rewrites `lib/photos.ts` from disk. `register` alone wires up
images that arrived any other way — drop them at
`public/photos/homes/<slug>/<kind>.webp` and run it. Check the retail
agreement covers using a manufacturer's photographs before publishing them.

**A picture in a place that has none yet.** Pass `photoKey="page/<name>"` to
that `<Scene>` (or to `<PageHero>`, which forwards it), then register the
key. For a genuinely one-off image, `<Scene photo="/photos/x.jpg" ...>`
bypasses the manifest.

## File conventions

- `public/photos/homes/<slug>/<kind>.jpg`,
  `public/photos/communities/<slug>.jpg`, `public/photos/pages/<name>.jpg`
- `.jpg` or `.webp`, about 2000px on the long edge, under ~500 KB
- Landscape. Scenes render into wide boxes with `object-cover`, so a
  portrait crop loses its top and bottom.
- `alt` text comes from the `label` prop already passed at each call site —
  it describes the home, so it stays correct after a swap. Only the
  homepage hero has hand-written `alt`.

## Before finishing

`npm run build`. A `photos` value pointing at a file that does not exist
under `public/` builds fine and 404s in the browser, so confirm the file is
actually there — `ls public/photos/...` — rather than trusting the build.
