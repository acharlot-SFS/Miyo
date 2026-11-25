// Miyo's — small progressive-enhancement script. Pages work without it.
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---- mobile nav ---- */
  const header = $('[data-header]');
  const navToggle = $('[data-nav-toggle]');
  const closeNav = () => {
    header.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  };
  navToggle?.addEventListener('click', () => {
    const open = header.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  /* ---- Locations submenu (the link still goes to /#locations without JS) ---- */
  const subToggle = $('[data-submenu-toggle]');
  const subItem = subToggle?.closest('.has-sub');
  const setSub = (open) => {
    if (!subItem) return;
    subItem.classList.toggle('is-open', open);
    subToggle.setAttribute('aria-expanded', String(open));
  };
  subToggle?.addEventListener('click', (e) => {
    e.preventDefault();
    setSub(!subItem.classList.contains('is-open'));
  });
  document.addEventListener('click', (e) => {
    if (subItem && !subItem.contains(e.target)) setSub(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    setSub(false);
    if (header.classList.contains('is-open')) {
      closeNav();
      navToggle.focus();
    }
  });

  /* ---- home slideshow: 4s per photo, 1s cross-fade (same as the old site) ---- */
  const show = $('[data-slideshow]');
  if (show) {
    const slides = $$('.slideshow__slides li', show);
    const interval = Number(show.dataset.interval) || 4000;
    const toggle = $('[data-slideshow-toggle]', show);
    const next = $('[data-slideshow-next]', show);
    const wrap = (n) => ((n % slides.length) + slides.length) % slides.length;
    let i = 0;
    let timer = null;
    let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const load = (n) => {
      const img = $('img', slides[wrap(n)]);
      if (img && !img.getAttribute('src') && img.dataset.src) img.src = img.dataset.src;
    };
    const go = (n) => {
      slides[i].classList.remove('is-active');
      i = wrap(n);
      load(i);
      slides[i].classList.add('is-active');
      load(i + 1);
    };
    const tick = () => {
      clearTimeout(timer);
      if (!paused) timer = setTimeout(() => { go(i + 1); tick(); }, interval);
    };
    const setPaused = (p) => {
      paused = p;
      toggle.setAttribute('aria-pressed', String(p));
      toggle.setAttribute('aria-label', p ? 'Play slideshow' : 'Pause slideshow');
      tick();
    };
    toggle.addEventListener('click', () => setPaused(!paused));
    next.addEventListener('click', () => { go(i + 1); tick(); });
    load(1);
    setPaused(paused);
  }

  /* ---- intro music (old site autoplayed it; browsers block that, so it is a toggle, off by default) ---- */
  const audio = $('[data-audio]');
  const soundBtn = $('[data-sound-toggle]');
  if (audio && soundBtn) {
    audio.volume = 0.4;
    soundBtn.addEventListener('click', async () => {
      if (audio.paused) {
        try { await audio.play(); } catch { return; }
      } else {
        audio.pause();
      }
      const on = !audio.paused;
      soundBtn.setAttribute('aria-pressed', String(on));
      soundBtn.setAttribute('aria-label', on ? 'Mute music' : 'Play music');
    });
  }

  /* ---- menu: highlight the section being read in the sticky jump bar ---- */
  const jump = $('[data-menu-jump]');
  if (jump && 'IntersectionObserver' in window) {
    const links = $$('a', jump);
    const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const list = $('ul', jump);
    const setCurrent = (id) => {
      links.forEach((a) => a.removeAttribute('aria-current'));
      const a = byId.get(id);
      if (!a) return;
      a.setAttribute('aria-current', 'true');
      list.scrollTo({ left: a.offsetLeft - list.clientWidth / 2 + a.clientWidth / 2, behavior: 'smooth' });
    };
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id)),
      { rootMargin: '-90px 0px -70% 0px' },
    );
    [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean).forEach((s) => io.observe(s));
  }

  /* ---- application form: no backend yet ---- */
  const form = $('[data-needs-backend]');
  form?.addEventListener('submit', (e) => {
    if (form.getAttribute('action')) return;
    e.preventDefault();
    $('.form-note', form).hidden = false;
  });
})();
