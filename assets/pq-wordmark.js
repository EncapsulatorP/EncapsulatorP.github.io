/* Site lockup for the supplied p q Transform Lab. */
(function () {
  'use strict';

  const assetDirectory = new URL('.', document.currentScript.src);
  if (document.documentElement.dataset.pqMounted) return;
  document.documentElement.dataset.pqMounted = '1';
  const selector = '[data-pq-brand], .nav .lg, .top .brand, .site-nav .brand, .reader-header .reader-brand, .rx-route-brand';
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sequence = [
    { glyph: 'P', label: 'P', transform: 'fourier' },
    { glyph: 'q', label: 'q', transform: 'knot' },
    { glyph: 'p', label: 'p', transform: 'fold' },
    { glyph: 'qm', label: '?', transform: 'sphere' }
  ];

  function paintWord(canvas) {
    const width = 139, height = 34;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const context = canvas.getContext('2d');
    if (!context) return false;

    const font = '700 ' + 21 * scale + 'px Georgia, serif';
    context.font = font;
    context.fillText('Encapsulator', 2 * scale, 24 * scale);
    const mask = context.getImageData(0, 0, canvas.width, canvas.height);
    context.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = context.createLinearGradient(0, 4 * scale, canvas.width, canvas.height);
    gradient.addColorStop(0, '#284cad');
    gradient.addColorStop(1, '#8054b5');
    context.fillStyle = gradient;
    context.beginPath();

    for (let row = 0.5; row < height; row++) {
      for (let col = 0.5; col < width; col++) {
        const y = Math.floor(row * scale), x = Math.floor(col * scale);
        if (mask.data[(y * canvas.width + x) * 4 + 3] < 112) continue;
        const radius = (0.46 + ((x * 7 + y * 13) % 10) / 50) * scale;
        context.moveTo(col * scale + radius, row * scale);
        context.arc(col * scale, row * scale, radius, 0, 2 * Math.PI);
      }
    }
    context.fill();
    return true;
  }

  function mount(link) {
    const mark = document.createElement('canvas');
    const word = document.createElement('canvas');
    let canDrawWord;
    try {
      if (!mark.getContext('2d')) return;
      canDrawWord = paintWord(word);
    } catch {
      return;
    }

    const lockup = document.createElement('div');
    lockup.className = 'pq-lockup';
    if (link.hasAttribute('data-reader-chrome')) lockup.setAttribute('data-reader-chrome', '');

    const fallback = document.createElement('span');
    fallback.className = 'pq-word-text';
    fallback.textContent = 'Encapsulator';
    word.className = 'pq-word';
    word.setAttribute('aria-hidden', 'true');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pq-trigger';
    button.title = 'Transform the final letter';
    mark.className = 'pq-letter';
    mark.setAttribute('aria-hidden', 'true');
    button.append(mark);

    const logo = link.querySelector('img');
    const caption = link.querySelector('small');
    if (logo) logo.alt = '';
    if (caption) caption.classList.add('pq-caption');
    const wordAndCaption = document.createElement('span');
    if (canDrawWord) wordAndCaption.append(word);
    else wordAndCaption.append(fallback);
    if (caption) wordAndCaption.append(caption);
    link.setAttribute('aria-label', 'EncapsulatorP');
    link.classList.add('pq-brand');
    link.replaceChildren(...(logo ? [logo] : []), wordAndCaption);
    link.before(lockup);
    lockup.append(link, button);

    const animation = window.PQ.create(mark, {
      mode: 'line', count: 180, from: 'P', to: 'P', tfs: ['flip'],
      playing: false, auto: false, dur: 0.95, hold: 0.05
    });

    let index = 0;
    function label() {
      button.setAttribute('aria-label', 'Transform wordmark, ' + sequence[index].label + ' to ' +
        sequence[(index + 1) % sequence.length].label);
    }
    label();

    button.addEventListener('click', () => {
      const source = sequence[index];
      index = (index + 1) % sequence.length;
      const target = sequence[index];
      if (motion.matches) animation.set({ a: target.glyph, b: target.glyph, t: 0, playing: false });
      else animation.set({ a: source.glyph, b: target.glyph, tf: target.transform, t: 0, playing: true });
      label();
    });
    motion.addEventListener('change', event => {
      if (event.matches) {
        const current = sequence[index].glyph;
        animation.set({ a: current, b: current, t: 0, playing: false });
      }
    });
  }

  const standalone = document.currentScript.hasAttribute('data-pq-standalone');
  if (standalone && window.top !== window) return;
  const shared = import(new URL('site-shell.js?v=map-layout-1', assetDirectory))
    .then(({ mountSiteShell }) => mountSiteShell(assetDirectory))
    .catch(() => null);
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = new URL('pq-wordmark.css', assetDirectory);
  let stylesheetReady;
  const styled = new Promise(resolve => { stylesheetReady = resolve; });
  style.addEventListener('load', () => stylesheetReady(true), { once: true });
  style.addEventListener('error', () => stylesheetReady(false), { once: true });
  document.head.append(style);

  const engine = window.PQ ? Promise.resolve(true) : new Promise(resolve => {
    const script = document.createElement('script');
    script.src = new URL('pq-morph.js', assetDirectory);
    script.addEventListener('load', () => resolve(Boolean(window.PQ)), { once: true });
    script.addEventListener('error', () => resolve(false), { once: true });
    document.head.append(script);
  });
  Promise.all([styled, engine, shared]).then(([hasStyle, hasEngine, brand]) => {
    if (!hasStyle || !hasEngine) return;
    if (brand) mount(brand);
    else document.querySelectorAll(selector).forEach(mount);
  });
})();
