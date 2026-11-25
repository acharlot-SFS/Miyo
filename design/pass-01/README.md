# Design pass 01 — miyos.com

Canvas (private, owner-only until shared): https://claude.ai/artifact/3UwXtm2C3q6aFdgxBWAW8W

## Brief, as it has evolved

1. Round 1: three bold from-scratch directions. Rejected: they dropped the brand.
2. Round 2: the current layout, only modernized. Too timid on layout.
3. **Round 3:** keep the **logo and the colors**, and make the **layout** modern.
4. **Decision: Layout B.** The real site is now built from it in `src/` (see the root `README.md`). Layout A and the previous rounds are kept here only as a record.

## Fixed brand constraints

- Logo is their real file, unchanged: `assets/logo/logo.png` (516x140). Its background is `#990000` baked in, so anything behind it must be exactly `#990000`.
- Colors: crimson `#990000`, olive `#4B6630`, grays. Text on crimson uses `#FFFFFF` / `#F4D9D9`.
- Photos are theirs (`assets/photos/`, 29 JPGs at 640x480). They are low-res, so no full-bleed use above about 640px wide.

## Boards (top row = current round)

| Board | File | Idea |
|---|---|---|
| A — Left rail | `project/Layout-A-Rail.dc.html` | Crimson rail holds logo, nav, locations and an Order button; content on the right: hero, menu photo cards, location cards, olive story band. |
| B — Top bar + split hero | `project/Layout-B-Topbar.dc.html` | Slim crimson top bar; crimson-left / photo-right hero; photo mosaic for the menu; image + olive story split. |

Lower row (previous round): `Main.dc.html`, `Home-Phone.dc.html`, `Our-Story.dc.html`.

`.dc.html` files only render inside the canvas; they are not the site build.

## Open items

- `M Grille` and `M Kitchen` location pages are empty on the live site, so address/phone/hours show as `[bracketed]` placeholders.
- Logo is a low-res PNG with a baked-in background; a vector from the owners would be better for retina.
- Photo captions/mapping (e.g. edamame = appetizers, berry sorbet = desserts) are my reading of the images; confirm with the owners.
- Story copy is condensed/reworded in mocks; the build should carry the exact copy.
- Phone layouts for A/B are not designed yet (only the previous round has one).
