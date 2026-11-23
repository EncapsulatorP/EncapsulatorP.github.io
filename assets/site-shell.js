/* Shared navigation and layout for standalone pages and Atlas rooms. */
const sections = [
  ['home', 'Home', './'],
  ['map', 'Map', 'map/'],
  ['atlas', 'Atlas', '#atlas'],
  ['treasure', 'Treasure Hunt', 'treasure-hunt/'],
  ['evidence', 'Evidence', 'evidence/']
];

const rooms = [
  ['Explore the mathematics', [
    ['goldbach', 'Goldbach', '#goldbach'],
    ['collatz', 'Collatz', '#collatz'],
    ['towers', 'Towers', '#towers'],
    ['cabinet', 'Curious Cabinet', '#cabinet'],
    ['recaman', 'Recamán', 'recaman/'],
    ['interactive', 'Interactive exhibits', 'interactive/']
  ]],
  ['Read and follow the work', [
    ['atlas-contents', 'Atlas contents', 'atlas/README.html#contents'],
    ['buried-chat-stories', 'Pirate Chest', '#pirate-chest'],
    ['paper-table', 'Paper workbench', '#paper-table'],
    ['lemmas', 'Hibernating Lemmas', '#lemmas'],
    ['validatron', 'Validatron', '#validatron'],
    ['pirates-plan', 'Pirates Plan', '#pirates-plan'],
    ['archive', 'Subject map & repositories', '#archive'],
    ['map-credits', 'Map Credits', '#map-credits'],
    ['atlas-credits', 'Co-authors', '#atlas-credits']
  ]]
];

function currentLocation(root) {
  const path = location.pathname.slice(root.pathname.length).replace(/index\.html$/, '');
  if (path === 'map/' || path === 'evidence/') return { page: path.slice(0, -1) };
  if (path.startsWith('treasure-hunt/')) return { page: 'treasure' };
  if (path.startsWith('planning/')) return { room: 'pirates-plan' };
  if (path.startsWith('atlas/')) return { page: 'atlas' };
  if (path.startsWith('recaman/')) return { room: 'recaman' };
  if (path.startsWith('interactive/')) return { room: 'interactive' };
  if (path) return {};
  const fragment = location.hash.slice(1).split('?')[0];
  if (['paper-table', 'paper-atlas', 'atlas-credits'].includes(fragment)) {
    return { page: 'atlas', room: fragment === 'paper-atlas' ? 'paper-table' : fragment };
  }
  const active = document.querySelector('main > .page.on')?.dataset.page;
  if (!active || active === 'home' || active === 'atlas') return { page: active || 'home' };
  return { room: active };
}

function linkTo(root, [id, label, path]) {
  const link = document.createElement('a');
  link.href = new URL(path, root).href;
  link.dataset.destination = id;
  link.textContent = label;
  return link;
}

export async function mountSiteShell(assets) {
  if (window.top !== window) return null;

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('site-shell.css?v=blue-violet-1', assets);
  const styled = new Promise(resolve => {
    stylesheet.addEventListener('load', () => resolve(true), { once: true });
    stylesheet.addEventListener('error', () => resolve(false), { once: true });
  });
  document.head.append(stylesheet);
  if (!await styled) return null;

  const root = new URL('../', assets);
  const header = document.createElement('header');
  header.className = 'site-shell';
  header.setAttribute('data-reader-chrome', '');
  const inner = document.createElement('div');
  inner.className = 'site-shell-inner';
  const brand = document.createElement('a');
  brand.className = 'site-shell-brand';
  brand.setAttribute('data-pq-brand', '');
  brand.href = root.href;
  const logo = new Image(27, 27);
  logo.alt = '';
  logo.src = new URL('logo-encapsulatorp-96.png', assets);
  brand.append(logo, 'EncapsulatorP');

  const nav = document.createElement('nav');
  nav.className = 'site-shell-tabs';
  nav.setAttribute('aria-label', 'Main navigation');
  nav.append(...sections.map(section => linkTo(root, section)));

  const menu = document.createElement('details');
  menu.className = 'site-shell-rooms';
  const summary = document.createElement('summary');
  summary.textContent = 'Rooms';
  const panel = document.createElement('div');
  panel.className = 'site-shell-room-panel';
  for (const [title, links] of rooms) {
    const group = document.createElement('section');
    const heading = document.createElement('h2');
    heading.textContent = title;
    group.append(heading, ...links.map(link => linkTo(root, link)));
    panel.append(group);
  }
  panel.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.dataset.destination === 'paper-table' && link.href === location.href) {
      event.preventDefault();
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  });
  menu.append(summary, panel);
  inner.append(brand, nav, menu);
  header.append(inner);

  const legacy = [
    'body > .nav', 'body > .top', 'body > .site-nav', '.rx-route-nav',
    '.pq-page-brand', '.is-standalone-nav', '.ev-index-nav',
    '.reader-header > :is(.reader-brand, nav)', '#pick [data-pq-brand]',
    '.map-room-links'
  ];
  document.documentElement.classList.add('site-shell-ready');
  for (const element of document.querySelectorAll(legacy.join(','))) {
    element.classList.add('site-shell-legacy');
    element.hidden = true;
  }
  document.body.prepend(header);

  const main = document.querySelector('main, #pick');
  if (main && !document.querySelector('.tr-skip, .reader-skip, a.skip')) {
    if (!main.id) main.id = 'site-main-content';
    const skip = document.createElement('a');
    skip.className = 'site-shell-skip';
    skip.href = '#' + main.id;
    skip.textContent = 'Skip to content';
    skip.addEventListener('click', event => {
      event.preventDefault();
      if (!main.hasAttribute('tabindex')) main.tabIndex = -1;
      main.focus({ preventScroll: true });
      main.scrollIntoView();
    });
    header.before(skip);
  }
  function syncLocation() {
    const current = currentLocation(root);
    for (const link of header.querySelectorAll('a[data-destination]')) {
      const id = link.dataset.destination;
      if (id === current.page || id === current.room) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    if (current.room && !current.page) summary.setAttribute('aria-current', 'location');
    else summary.removeAttribute('aria-current');
  }
  syncLocation();
  window.addEventListener('hashchange', () => {
    syncLocation();
    menu.open = false;
  });
  document.addEventListener('click', event => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) {
      event.preventDefault();
      menu.open = false;
      summary.focus();
    }
  });
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(() => {
      document.documentElement.style.setProperty('--site-header-height', header.offsetHeight + 'px');
    }).observe(header);
  }
  return brand;
}
