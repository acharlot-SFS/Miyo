// Static site build. No dependencies.
//   node scripts/build.mjs          -> dist/ (pages + css/js + a copy of assets/)
//   import { build } from './build.mjs'   (used by the dev server)
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const readJSON = (f) => JSON.parse(fs.readFileSync(path.join(SRC, 'data', f), 'utf8'));

/* ------------------------------------------------------------------ helpers */
const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tel = (phone) => 'tel:+1' + phone.replace(/\D/g, '');
const https = (url) => url.replace(/^http:\/\//, 'https://');
const SITE = 'Miyo’s';

const icons = {
  menu: '<svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true"><path d="M1 1.5h18M1 7h18M1 12.5h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  pause: '<svg class="i-pause" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor"/><rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor"/></svg>',
  play: '<svg class="i-play" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>',
  next: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 2.5 11 8l-5.5 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  soundOn: '<svg class="i-sound-on" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 7v4h3l4 3.5v-11L5 7z" fill="currentColor"/><path d="M12 6.2a4 4 0 0 1 0 5.6M14.2 4a7 7 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  soundOff: '<svg class="i-sound-off" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 7v4h3l4 3.5v-11L5 7z" fill="currentColor"/><path d="m12.5 6.5 4 5m0-5-4 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  chevron: '<svg class="chev" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="m2 3.5 3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

/* ------------------------------------------------------------------ chrome */
function navItems(locations) {
  return [
    { label: 'Home', href: '/', current: (p) => p === '/' },
    { label: 'Menu', href: '/menu/', current: (p) => p === '/menu/' },
    { label: 'Locations', href: '/#locations', current: (p) => p.startsWith('/location-'), sub: locations },
    { label: 'Catering', href: '/catering/', current: (p) => p === '/catering/' },
    { label: 'Careers', href: '/careers/', current: (p) => p === '/careers/' || p === '/application/' },
    { label: 'Our Story', href: '/our-story/', current: (p) => p === '/our-story/' },
    { label: 'Contact Us', href: '/contact-us/', current: (p) => p === '/contact-us/' },
  ];
}

function header(p, locations) {
  const items = navItems(locations)
    .map((it) => {
      const cur = it.current(p);
      if (it.sub) {
        const subs = it.sub
          .map((l) => `<li><a href="${l.path}"${p === l.path ? ' aria-current="page"' : ''}>${esc(l.name)}</a></li>`)
          .join('');
        return `<li class="has-sub${cur ? ' is-current' : ''}">
          <a class="nav-link" href="${it.href}" data-submenu-toggle aria-haspopup="true" aria-expanded="false" aria-controls="submenu-locations"${cur ? ' aria-current="true"' : ''}>${it.label} ${icons.chevron}</a>
          <ul class="submenu" id="submenu-locations">${subs}</ul>
        </li>`;
      }
      return `<li><a class="nav-link" href="${it.href}"${cur ? ' aria-current="page"' : ''}>${it.label}</a></li>`;
    })
    .join('\n');
  return `<header class="site-header" data-header>
  <div class="site-header__inner">
    <a class="brand" href="/"><img src="/assets/logo/logo.png" alt="${SITE} &amp; M — home" width="516" height="140"></a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-nav-toggle><span class="sr-only">Menu</span>${icons.menu}</button>
    <nav class="site-nav" id="site-nav" aria-label="Primary"><ul>
${items}
    </ul></nav>
  </div>
</header>`;
}

function footer(locations) {
  const links = navItems(locations)
    .filter((i) => !i.sub)
    .map((i) => `<li><a href="${i.href}">${i.label}</a></li>`)
    .join('');
  const locs = locations
    .map(
      (l) =>
        `<li><a href="${l.path}">${esc(l.name)}</a>${l.phone ? ` <a class="muted" href="${tel(l.phone)}">${esc(l.phone)}</a>` : ''}</li>`,
    )
    .join('');
  return `<footer class="site-footer">
  <div class="site-footer__inner">
    <a class="brand brand--footer" href="/"><img src="/assets/logo/logo.png" alt="${SITE} &amp; M" width="516" height="140" loading="lazy"></a>
    <nav aria-label="Footer"><h2>Explore</h2><ul>${links}</ul></nav>
    <nav aria-label="Locations"><h2>Locations</h2><ul class="footer-locs">${locs}</ul></nav>
  </div>
</footer>`;
}

function layout({ title, path: p, body, locations, bodyClass = '' }) {
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<script>document.documentElement.className = 'js';</script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="icon" href="/favicon.ico" sizes="16x16">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400..700&family=Newsreader:ital,opsz,wght@0,6..72,300..500;1,6..72,300..500&display=swap">
<link rel="stylesheet" href="/styles.css">
</head>
<body class="${bodyClass}">
<a class="skip-link" href="#main">Skip to content</a>
${header(p, locations)}
<main id="main">
${body}
</main>
${footer(locations)}
<script src="/site.js" defer></script>
</body>
</html>
`;
}

const pageHero = (title) =>
  `<section class="page-hero"><div class="container"><h1>${title}</h1></div></section>`;

/* ------------------------------------------------------------------ pages */
function homePage({ pages, locations }) {
  const h = pages.home;
  const slides = h.slides
    .map(
      (src, i) =>
        `<li${i === 0 ? ' class="is-active"' : ''}><img ${i === 0 ? `src="${src}"` : `data-src="${src}"`} alt="" width="640" height="480"${i === 0 ? ' fetchpriority="high"' : ''}></li>`,
    )
    .join('');
  const cards = locations.map(locationCard).join('');
  return `<section class="hero">
  <div class="hero__copy">
    <h1>${esc(h.banner).replace(/'/g, '’')}</h1>
    <div class="hero__actions">
      <a class="btn btn--light" href="/menu/">See the menu</a>
      <a class="btn btn--outline-light" href="#locations">Find a location</a>
    </div>
  </div>
  <div class="hero__media">
    <div class="slideshow" data-slideshow data-interval="4000" role="group" aria-roledescription="carousel" aria-label="Photos of Miyo’s food and dining rooms">
      <ul class="slideshow__slides">${slides}</ul>
      <div class="slideshow__controls">
        <button class="icon-btn" type="button" data-slideshow-toggle aria-pressed="false" aria-label="Pause slideshow">${icons.pause}${icons.play}</button>
        <button class="icon-btn" type="button" data-slideshow-next aria-label="Next photo">${icons.next}</button>
        <button class="icon-btn" type="button" data-sound-toggle aria-pressed="false" aria-label="Play music">${icons.soundOff}${icons.soundOn}</button>
      </div>
      <audio data-audio src="/assets/audio/intro.mp3" loop preload="none"></audio>
    </div>
  </div>
</section>
<section class="section" id="locations">
  <div class="container">
    <h2 class="section-title">Locations</h2>
    <div class="loc-cards">${cards}</div>
  </div>
</section>`;
}

function locationCard(l) {
  const a = l.address;
  return `<a class="loc-card" href="${l.path}">
  <span class="loc-card__name">${esc(l.name)}</span>
  ${a ? `<span class="loc-card__line">${esc(a.street)}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.zip)}</span>` : ''}
  ${l.phone ? `<span class="loc-card__phone">${esc(l.phone)}</span>` : ''}
  <span class="loc-card__more">Details <span aria-hidden="true">→</span></span>
</a>`;
}

function locationPage(l) {
  const a = l.address;
  const order = l.orderOnline
    ? `<a class="btn" href="${esc(l.orderOnline)}" target="_blank" rel="noopener">ORDER ONLINE</a>`
    : l.orderCatering
      ? `<a class="btn" href="${esc(l.orderCatering)}" target="_blank" rel="noopener">Order Catering</a>`
      : '';
  const cells = [];
  if (a)
    cells.push(
      `<section><h2>Address</h2><p>${esc(a.street)}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.zip)}</p></section>`,
    );
  if (l.hours) cells.push(`<section><h2>Hours</h2><p>${l.hours.map(esc).join('<br>')}</p></section>`);
  if (l.phone) cells.push(`<section><h2>Phone</h2><p><a href="${tel(l.phone)}">${esc(l.phone)}</a></p></section>`);
  if (l.mapUrl)
    cells.push(
      `<section><h2>Find Us</h2><p><a class="btn btn--outline" href="${esc(https(l.mapUrl))}" target="_blank" rel="noopener">Open in Google Maps</a></p></section>`,
    );
  return `${pageHero(esc(l.heading))}
<div class="container page-body">
  ${order ? `<p class="page-actions">${order}</p>` : ''}
  <div class="loc-detail">${cells.join('\n')}</div>
</div>`;
}

function prosePage(page, { signoff = 0 } = {}) {
  const ps = page.paragraphs;
  const html = ps
    .map((p, i) => `<p${i >= ps.length - signoff ? ' class="signoff"' : ''}>${p}</p>`)
    .join('\n');
  return `${pageHero(esc(page.title))}
<div class="container page-body"><div class="prose">
${html}
</div></div>`;
}

function cateringPage(page) {
  const intro = [];
  const contacts = [];
  for (const p of page.paragraphs) (/^For .* catering/.test(p) ? contacts : intro).push(p);
  return `${pageHero(esc(page.title))}
<div class="container page-body">
  <p class="page-actions"><a class="btn" href="${esc(page.order.url)}" target="_blank" rel="noopener noreferrer">${esc(page.order.label)}</a></p>
  <div class="prose">${intro.map((p) => `<p>${p}</p>`).join('\n')}</div>
  <div class="contact-cards">${contacts.map((p) => `<p class="contact-card">${p}</p>`).join('\n')}</div>
</div>`;
}

function careersPage(page) {
  const v = page.video;
  return `${pageHero(esc(page.title))}
<div class="container page-body">
  <div class="prose">${page.paragraphs.map((p) => `<p>${p}</p>`).join('\n')}</div>
  <div class="video-frame"><video controls preload="none" poster="${v.poster}" aria-label="${esc(v.alt)}"><source src="${v.src}" type="video/mp4">Your browser does not support the video tag.</video></div>
</div>`;
}

const autocomplete = { name: 'name', email: 'email', street: 'address-line1', city: 'address-level2', state: 'address-level1', zip: 'postal-code', phone: 'tel' };

function applicationPage(page) {
  const fields = page.fields
    .map((f) => {
      const req = f.required ? ' required' : '';
      const max = f.maxlength ? ` maxlength="${f.maxlength}"` : '';
      const ac = autocomplete[f.id] ? ` autocomplete="${autocomplete[f.id]}"` : '';
      let control;
      if (f.control === 'select')
        control = `<select id="${f.id}" name="${f.name}"${req}${ac}>${f.options.map((o) => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('')}</select>`;
      else if (f.control === 'textarea')
        control = `<textarea id="${f.id}" name="${f.name}" rows="${f.rows || 6}"${max}${req}></textarea>`;
      else control = `<input id="${f.id}" name="${f.name}" type="${f.type || 'text'}"${max}${req}${ac}>`;
      return `<div class="field${f.control === 'textarea' ? ' field--wide' : ''}"><label for="${f.id}">${esc(f.label)}</label>${control}</div>`;
    })
    .join('\n');
  return `${pageHero(esc(page.title))}
<div class="container page-body">
  <form class="app-form" method="post" data-needs-backend>
    <div class="form-grid">
${fields}
    </div>
    <button class="btn" type="submit">${esc(page.submitLabel)}</button>
    <p class="form-note" role="status" hidden>This form isn’t connected to anything yet: it needs a form service before launch.</p>
  </form>
</div>`;
}

/* ------------------------------------------------------------------ menu */
function menuBlocks(blocks, subLevel) {
  return blocks
    .map((b) => {
      if (b.type === 'item') {
        const price = b.price ? `<span class="menu-item__price">${b.price}</span>` : '';
        const desc = (b.desc || []).map((d) => `<p class="menu-item__desc">${d}</p>`).join('');
        return `<div class="menu-item"><div class="menu-item__head"><p class="menu-item__name">${b.name}</p>${price}</div>${desc}</div>`;
      }
      if (b.type === 'sub')
        return `<h${subLevel} class="menu-sub"><span>${b.html}</span>${b.note ? `<small>${b.note}</small>` : ''}</h${subLevel}>`;
      if (b.type === 'heading') return `<h${subLevel} class="menu-sub"><span>${b.html}</span></h${subLevel}>`;
      if (b.type === 'note') return `<p class="menu-note${b.center ? ' is-center' : ''}">${b.html}</p>`;
      return '';
    })
    .join('\n');
}

function menuBlock(image, blocks, subLevel) {
  const media = image
    ? `<div class="menu-block__media"><img src="${image}" alt="" width="260" height="186" loading="lazy"></div>`
    : '';
  return `<div class="menu-block${image ? ' has-media' : ''}">${media}<div class="menu-block__items">${menuBlocks(blocks, subLevel)}</div></div>`;
}

function menuPage(menu) {
  const chips = menu.nav.map((n) => `<li><a href="#${n.id}">${esc(n.label)}</a></li>`).join('');
  const sections = menu.sections
    .map((s) => {
      const body = s.groups
        ? s.groups
            .map(
              (g) =>
                `<div class="menu-group" id="${g.id}"><h3 class="menu-group__title">${esc(g.title)}</h3>${menuBlock(g.image, g.blocks, 4)}</div>`,
            )
            .join('\n')
        : s.blocks.length || s.image
          ? menuBlock(s.image, s.blocks, 3)
          : '';
      return `<section class="menu-section" id="${s.id}" aria-labelledby="${s.id}-h"><h2 class="menu-section__title" id="${s.id}-h">${esc(s.title)}</h2>${body}</section>`;
    })
    .join('\n');
  return `${pageHero('Menu')}
<nav class="menu-jump" aria-label="Menu sections" data-menu-jump><div class="container"><ul>${chips}</ul></div></nav>
<div class="container page-body menu-body">
${sections}
</div>`;
}

/* ------------------------------------------------------------------ build */
export function build({ assets = true } = {}) {
  const menu = readJSON('menu.json');
  const locations = readJSON('locations.json');
  const pages = readJSON('pages.json');
  const ctx = { pages, locations };

  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  const out = [];
  const add = (urlPath, title, body, bodyClass) => out.push({ urlPath, title, body, bodyClass });

  add('/', SITE, homePage(ctx), 'is-home');
  add('/menu/', `Menu | ${SITE}`, menuPage(menu));
  add('/catering/', `Catering | ${SITE}`, cateringPage(pages.catering));
  add('/careers/', `Careers | ${SITE}`, careersPage(pages.careers));
  add('/application/', `Application | ${SITE}`, applicationPage(pages.application));
  add('/our-story/', `Our Story | ${SITE}`, prosePage(pages['our-story'], { signoff: 2 }));
  add('/contact-us/', `Contact Us | ${SITE}`, prosePage(pages['contact-us']));
  for (const l of locations) add(l.path, `${l.heading} | ${SITE}`, locationPage(l));

  for (const p of out) {
    const dir = path.join(DIST, p.urlPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'index.html'),
      layout({ title: p.title, path: p.urlPath, body: p.body, locations, bodyClass: p.bodyClass }),
    );
  }

  fs.copyFileSync(path.join(SRC, 'styles.css'), path.join(DIST, 'styles.css'));
  fs.copyFileSync(path.join(SRC, 'site.js'), path.join(DIST, 'site.js'));
  fs.copyFileSync(path.join(ROOT, 'assets', 'favicon', 'favicon.ico'), path.join(DIST, 'favicon.ico'));
  if (assets) fs.cpSync(path.join(ROOT, 'assets'), path.join(DIST, 'assets'), { recursive: true });
  return out.map((p) => p.urlPath);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const urls = build();
  console.log(`Built ${urls.length} pages into dist/\n  ` + urls.join('\n  '));
}
