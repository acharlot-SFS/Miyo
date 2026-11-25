# Miyo's

Static website for Miyo's restaurants (Columbia, SC), rebuilt from the old WordPress site at https://miyos.com in the "Layout B" design chosen in `design/pass-01/`.

Every page, menu item, location, image, the intro music and the careers video from the old site is in here. Nothing new was written, except two navigation buttons on the home hero ("See the menu", "Find a location") and the small notes listed below.

## Run it

```powershell
npm run dev     # http://localhost:4173 — rebuilds when anything in src/ changes
npm run build   # writes the finished site to dist/ (upload dist/ to any static host)
```

Needs Node 20+. There are no dependencies to install.

## Where things are

| Path | What |
|---|---|
| `src/data/menu.json` | The whole menu: sections, each an ordered list of items / sub-headings / notes |
| `src/data/locations.json` | The six locations. A location with no address/hours/phone renders blank |
| `src/data/pages.json` | Home banner + slide list, Our Story, Catering, Careers, Contact, Application form fields |
| `src/styles.css`, `src/site.js` | Look and behavior (nav, slideshow, music toggle, menu section bar) |
| `scripts/build.mjs` | Page templates; `scripts/dev.mjs` is the preview server |
| `assets/` | Logo, slideshow photos, menu photos, audio, video, favicon |
| `design/pass-01/` | Design exploration and the decision record |

## URLs (same as the old site)

`/` `/menu/` `/catering/` `/careers/` `/our-story/` `/contact-us/` `/application/` and `/location-forest/` `/location-harbison/` `/location-lexington/` `/location-mgrille/` `/location-mkitchen/` `/location-mvista/`

## Brand constraints

- The logo (`assets/logo/logo.png`) has `#990000` baked into its background, so the header and footer must stay exactly `#990000`.
- Colors: crimson `#990000`, olive `#4B6630`, neutral grays. Fonts: Newsreader (headings), Hanken Grotesk (text).

## Carried over from the old site as-is (flagged, not fixed)

- **Contact page:** the visible email is `amy@miyos.com`, but the link opens `mw@miyos.com`.
- **Harbison:** the page says 340 Columbiana Drive, but its map link searches 1220 E-2 Bower Parkway.
- **M Vista:** the page says 530 Lady Street, but its map link searches 701 Lady Street.
- **Harbison's ORDER ONLINE** link goes to an ordering page named `m-kitchen-columbia-29212`.
- **M Grille and M Kitchen:** the old pages return 404, so they are blank here (heading only).
- **Samplers & Platters:** the section is empty on the old site, so it is a heading only.
- **Catering:** lists the same two phone contacts for Lexington, M Vista, Forest Drive and M Kitchen; none for Harbison or M Grille.
- **Slideshow photos** have no alt text (the old site had none).

## Changed because the old behavior no longer works

- **Home music** (`intro.mp3`) autoplayed through a Flash player. Browsers block autoplay, so it is now an opt-in toggle on the slideshow, off by default.
- **Careers video** used a Flash player. It is now a normal HTML5 video with controls, no autoplay.
- **"Find Us" maps** were Google Static Maps images, which return 403 today. Each location now has an "Open in Google Maps" link using the same address query.

## Needs a decision before launch

- **Application form** (`/application/`): all 14 fields are here, but there is no backend. The old form posted to WordPress (Contact Form 7). Submitting shows a "not connected yet" note.
- **`assets/video/careers.m4v` is 38 MB.** Consider Git LFS or external video hosting before committing.
- **Fonts** load from Google Fonts. Self-hosting would be faster and more private.
- **Hosting** is not chosen. `dist/` is plain static files.
