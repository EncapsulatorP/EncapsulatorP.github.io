(function () {
  'use strict';

  const dialog = document.getElementById('pirate-map');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const finds = {
    treasure: { label: 'Treasure', mark: '✦' },
    trap: { label: 'Trap', mark: '×' },
    wildcard: { label: 'Wildcard', mark: '?' }
  };

  const trail = [
    {
      date: 'Nov 2025', kind: 'treasure', name: 'Shuffle the signal',
      question: 'If you move every tile to a new place, can you still get the old picture back?',
      clue: 'Yes, if every place is used exactly once. The inverse permutation undoes the move. In the Fourier construction, this is the step that keeps the transformed basis intact.',
      href: '#atlas?entry=tower-hadamard'
    }, {
      date: 'Dec 2025', kind: 'treasure', name: 'The forty-eight lanes',
      question: 'Cross out multiples of 2, 3, 5 and 7 on a wheel marked 0 to 209. How many lanes stay open?',
      clue: 'Exactly 48. Every prime above 7 lands in one of them. So does 121, which is 11². An open lane gets you past four tests.',
      href: '#atlas?entry=wheel-210'
    }, {
      date: 'Feb 2026', kind: 'wildcard', name: 'The impossible coastline',
      question: 'Can two maps take the same steps at every integer and still draw different worlds between the integers?',
      clue: 'Add a sine term that vanishes at every integer. The integer steps stay put, while the complex picture can change. The picture’s features depend on which extension you choose.',
      href: '#scape'
    }, {
      date: 'Apr 2026', kind: 'trap', name: 'The missing term',
      question: 'One orbit drops out of a sum. Does that single missing term have to blow a hole in the function?',
      clue: 'Changing one weight adds or removes a constant times n⁻ˢ. That function is entire, so this single change supplies no singularity. The whole sequence of weights is where the harder question lives.',
      href: '#buried-collatz-riemann-reversal'
    }, {
      date: 'May 2026', kind: 'treasure', name: 'The repeating current',
      question: 'A current is stuck in the loop 1 → 4 → 2 → 1. What average do its reciprocal readings leave behind?',
      clue: 'The readings repeat as 1, ¼ and ½. Their mean is 7/12. The same number comes out of the Abel limit of the orbit series after normalization.',
      href: '#atlas?entry=abel-orbit-signature'
    }, {
      date: 'Jun 2026', kind: 'trap', name: 'Brun’s glittering crossing',
      question: 'A tower matches a famous constant after you turn a knob. What would you try before calling it a discovery?',
      clue: 'Choose the knob setting before you look at the target. The crossing moves when you tune the base, so measure how often the same method can match other numbers.',
      href: '#buried-brun-crossing'
    }, {
      date: 'Jun 2026', kind: 'trap', name: 'The impostor prime',
      question: 'Every prime passes the Perrin test. Can a square walk straight through it too?',
      clue: 'Yes. The test accepts 271441, which equals 521². The proof for primes gives a necessary condition, while this example breaks its converse.',
      href: '#buried-perrin-pseudoprime'
    }, {
      date: 'Nov 2026', kind: 'wildcard', name: 'XO₂, the two-sheet cave',
      question: 'At the same input, square root gives you two doors. What happens if you feed each door into the zeta kernel?',
      clue: 'At z = ¼ the two branches give roughly 0.140269 and 2.817643. The flip is measurable in the model. Its larger shapes and outliers are still open to investigation.',
      href: '#buried-xo2'
    }, {
      date: 'Nov 2026', kind: 'treasure', name: 'The hidden second beat',
      question: 'Reverse two prime layers with the same fixed point and slope. Where can you hear the order?',
      clue: 'The curvature changes with the order. A small sine drive then leaves a leading signal at twice the frequency. Swapping the layers flips its sign.',
      href: '#buried-omega-order'
    }
  ];

  const charts = [
    {
      name: 'Riemann sphere', description: 'A chart of the complex plane with one point at infinity.',
      draw: drawSphere, points: [[196,388],[245,236],[367,135],[524,113],[673,162],[796,284],[761,424],[628,488],[453,455]]
    }, {
      name: 'Rupert body', description: 'A faceted sketch with an oblique passage.',
      draw: drawRupert, points: [[171,306],[264,159],[438,114],[616,135],[773,220],[846,358],[718,453],[527,500],[346,457]]
    }, {
      name: 'Origami chart', description: 'A folded chart that opens along its creases.',
      draw: drawOrigami, points: [[154,274],[258,187],[398,234],[525,128],[674,195],[830,167],[806,378],[618,486],[415,432]]
    }
  ];

  const reveal = document.getElementById('pm-reveal');
  const canvas = document.getElementById('pm-canvas');
  const stage = canvas.closest('.pm-stage');
  const context = canvas.getContext('2d');
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compact = window.matchMedia('(max-width: 780px)');
  const pins = document.getElementById('pm-pins');
  const timeline = document.getElementById('pm-timeline');
  const journal = document.getElementById('pm-journal');
  const legend = document.getElementById('pm-legend');
  const nextMap = document.getElementById('pm-next-map');
  const find = document.getElementById('pm-find');
  const clue = document.getElementById('pm-clue');
  const jump = document.getElementById('pm-story-link');
  const closeButton = document.getElementById('pm-close');
  const closeCaption = document.getElementById('pm-close-caption');
  const shapeName = document.getElementById('pm-shape');
  const shapeDescription = document.getElementById('pm-description');
  const stopKind = document.getElementById('pm-stop-kind');
  const stopTitle = document.getElementById('pm-stop-title');
  const stopPrompt = document.getElementById('pm-stop-prompt');
  const stopClue = document.getElementById('pm-stop-clue');
  const progress = document.getElementById('pm-progress');
  const storageKey = 'encapsulatorp.pirateMap';
  const visited = new Set();
  let mapIndex = -1;
  let chosen = 0;
  let opener = null;
  let leavingForStory = false;

  function nextChart() {
    if (mapIndex === -1) {
      try {
        const stored = window.localStorage.getItem(storageKey);
        const last = Number(stored);
        if (stored !== null && Number.isInteger(last) && last >= 0 && last < charts.length) mapIndex = last;
      } catch {}
      if (mapIndex === -1) mapIndex = Math.floor(Math.random() * charts.length);
    }
    mapIndex = (mapIndex + 1) % charts.length;
    try { window.localStorage.setItem(storageKey, String(mapIndex)); } catch {}
    const chart = charts[mapIndex];
    shapeName.textContent = chart.name;
    shapeDescription.textContent = chart.description;
    chart.points.forEach(([x, y], i) => {
      const marker = pins.children[i];
      marker.style.setProperty('--pm-x', x / 10 + '%');
      marker.style.setProperty('--pm-y', y / 6 + '%');
    });
    paint();
  }

  function stopButton(stop, i, isPin) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    const symbol = document.createElement('span');
    const info = document.createElement('span');
    const date = document.createElement('b');
    const kind = finds[stop.kind];
    button.type = 'button';
    button.dataset.kind = stop.kind;
    button.setAttribute('aria-label', stop.date + ' · ' + kind.label + ' · ' + stop.name);
    button.setAttribute('aria-pressed', 'false');
    symbol.textContent = kind.mark;
    symbol.setAttribute('aria-hidden', 'true');
    if (isPin) {
      button.className = 'pm-pin';
      button.title = stop.name;
      button.append(symbol);
    } else {
      date.textContent = stop.date;
      info.append(date, stop.name);
      button.append(symbol, info);
    }
    button.addEventListener('click', () => {
      selectStop(i);
      if (isPin && compact.matches) {
        stopTitle.focus({ preventScroll: true });
        journal.scrollIntoView({ block: 'nearest', behavior: media.matches ? 'auto' : 'smooth' });
      }
    });
    item.append(button);
    return item;
  }

  function selectStop(index) {
    chosen = index;
    const stop = trail[index];
    const kind = finds[stop.kind];
    find.dataset.kind = stop.kind;
    stopKind.textContent = kind.label + ' · ' + stop.date;
    stopTitle.textContent = stop.name;
    stopPrompt.textContent = stop.question;
    stopClue.textContent = stop.clue;
    clue.open = false;
    jump.href = stop.href;
    [pins, timeline].forEach(list => Array.from(list.children).forEach((item, i) => {
      item.firstElementChild.setAttribute('aria-pressed', String(i === index));
    }));
    paint();
  }

  function markClue() {
    if (!clue.open || visited.has(chosen)) return;
    visited.add(chosen);
    [pins, timeline].forEach(list => {
      const button = list.children[chosen].firstElementChild;
      button.classList.add('pm-visited');
      button.setAttribute('aria-label', button.getAttribute('aria-label') + ' · clue opened');
    });
    progress.textContent = visited.size + ' of ' + trail.length + ' clues opened';
  }

  function openMap(trigger) {
    if (dialog.open) return;
    opener = trigger || null;
    leavingForStory = false;
    closeCaption.textContent = opener ? 'Close map' : 'Skip to the atlas';
    dialog.dataset.mapState = 'landing';
    stage.classList.remove('pm-revealing');
    reveal.hidden = false;
    [pins, journal, legend, nextMap].forEach(element => { element.hidden = true; });
    dialog.showModal();
    document.documentElement.classList.add('pm-open');
    nextChart();
  }

  function uncover() {
    dialog.dataset.mapState = 'explored';
    reveal.hidden = true;
    [pins, journal, legend, nextMap].forEach(element => { element.hidden = false; });
    stage.classList.add('pm-revealing');
    selectStop(0);
    pins.firstElementChild.firstElementChild.focus({ preventScroll: true });
  }

  function outline(points, fill, stroke, width = 1.4) {
    const ctx = context;
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.lineWidth = width; ctx.strokeStyle = stroke; ctx.stroke(); }
  }

  function strokePath(points, color, width = 1) {
    const ctx = context;
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.lineWidth = width; ctx.strokeStyle = color; ctx.stroke();
  }

  function drawSphere() {
    const ctx = context;
    const radius = 238, cx = 500, cy = 296;
    const fade = ctx.createRadialGradient(422, 222, 15, cx, cy, 290);
    fade.addColorStop(0, '#254f64'); fade.addColorStop(1, '#0b1f36');
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.fillStyle = fade; ctx.fill(); ctx.strokeStyle = '#88bac7'; ctx.lineWidth = 2; ctx.stroke();
    const tilt = 0.45;
    const project = (latitude, longitude) => {
      const x = Math.cos(latitude) * Math.sin(longitude);
      const y = Math.sin(latitude), z = Math.cos(latitude) * Math.cos(longitude);
      return [cx + radius * x, cy - radius * (y * Math.cos(tilt) - z * Math.sin(tilt)), y * Math.sin(tilt) + z * Math.cos(tilt)];
    };
    const latitudeLines = Array.from({ length: 7 }, (_, i) => (i - 3) * Math.PI / 9);
    const longitudeLines = Array.from({ length: 12 }, (_, i) => i * Math.PI / 6);
    function line(sampler) {
      let previous = sampler(0);
      for (let i = 1; i <= 100; i++) {
        const point = sampler(i / 100);
        if (previous[2] >= 0 && point[2] >= 0) strokePath([previous, point], '#6ea6b880', 1.15);
        previous = point;
      }
    }
    latitudeLines.forEach(latitude => line(t => project(latitude, 2 * Math.PI * t)));
    longitudeLines.forEach(longitude => line(t => project(Math.PI * (t - 0.5), longitude)));
    const [northX, northY] = project(Math.PI / 2, 0);
    ctx.fillStyle = '#a4d3da'; ctx.font = '28px Georgia'; ctx.fillText('∞', northX + 10, northY - 8);
  }

  function drawRupert() {
    const ctx = context;
    const edge = '#94a9bd';
    outline([[235,193],[520,68],[779,176],[488,309]], '#274c63', edge, 2);
    outline([[235,193],[488,309],[488,529],[235,412]], '#183149', edge, 2);
    outline([[488,309],[779,176],[779,396],[488,529]], '#203d55', edge, 2);
    outline([[293,260],[429,321],[429,411],[293,348]], '#0a1729', '#afc1cf', 1.6);
    outline([[548,329],[701,259],[701,344],[548,415]], '#14283a', '#88a5bd', 1.6);
    ctx.setLineDash([9, 8]);
    strokePath([[360,335],[618,339],[833,250]], '#e4c885a6', 2);
    ctx.setLineDash([]);
    strokePath([[488,309],[520,68]], '#b1c7d17a', 1.25);
    strokePath([[235,369],[488,485],[779,352]], '#7190a97a', 1.25);
  }

  function drawOrigami(open) {
    if (!open) {
      outline([[260,224],[515,115],[745,233],[523,485],[284,402]], '#1c4052', '#85a5ae', 2);
      outline([[260,224],[515,115],[528,323],[284,402]], '#2d6270', '#91b8b9', 1.7);
      outline([[528,323],[745,233],[523,485]], '#3b7180', '#96bbbd', 1.7);
      return;
    }
    const outlineColor = '#9ebcbe';
    const a = [130,200], b = [290,124], c = [470,180], d = [670,96], e = [858,157];
    const f = [176,388], g = [344,295], h = [534,349], i = [700,271], j = [851,348];
    const k = [326,520], l = [551,472], m = [712,524];
    const faces = [
      [[a,b,g,f],'#2c6370'], [[b,c,h,g],'#214e60'], [[c,d,i,h],'#397280'],
      [[d,e,j,i],'#234e63'], [[f,g,k],'#183b54'], [[g,h,l,k],'#3a5e64'],
      [[h,i,m,l],'#29576c'], [[i,j,m],'#293e59']
    ];
    faces.forEach(([face, color]) => outline(face, color, outlineColor, 1.6));
    context.setLineDash([6, 9]);
    strokePath([a, g, c, i, e], '#d6ddbf9c', 1.45);
    strokePath([f, h, j], '#d6ddbf9c', 1.45);
    context.setLineDash([]);
  }

  function paint() {
    if (!context || !dialog.open || mapIndex < 0) return;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(stage.clientWidth * scale));
    const height = Math.max(1, Math.round(stage.clientHeight * scale));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    const ctx = context;
    ctx.setTransform(width / 1000, 0, 0, height / 600, 0, 0);
    const sea = ctx.createLinearGradient(70, 0, 995, 590);
    sea.addColorStop(0, '#142944'); sea.addColorStop(1, '#08182a');
    ctx.fillStyle = sea; ctx.fillRect(0, 0, 1000, 600);
    for (let x = 24; x < 1000; x += 54) {
      strokePath([[x, 0], [x, 600]], '#a0b3c015', 1);
      for (let y = 20; y < 600; y += 54) {
        const twinkle = (x * 31 + y * 19) % 11;
        ctx.fillStyle = twinkle < 2 ? '#e9d2a58a' : '#b2c9d453';
        ctx.fillRect(x, y, twinkle < 2 ? 3 : 1.4, twinkle < 2 ? 3 : 1.4);
      }
    }
    for (let y = 20; y < 600; y += 54) strokePath([[0, y], [1000, y]], '#a0b3c014');
    outline([[74,45],[90,83],[74,121],[58,83]], '#c3a46570', '#e2c284ad');
    outline([[39,83],[74,72],[109,83],[74,93]], '#17334d', '#e2c284ad');
    const chart = charts[mapIndex];
    const open = dialog.dataset.mapState === 'explored';
    chart.draw(open);
    if (!open) return;
    ctx.beginPath();
    chart.points.forEach(([x, y], index) => {
      if (!index) { ctx.moveTo(x, y); return; }
      const [px, py] = chart.points[index - 1];
      ctx.quadraticCurveTo((px + x) / 2, (py + y) / 2 + (index % 2 ? -25 : 25), x, y);
    });
    ctx.setLineDash([8, 10]); ctx.lineWidth = 2.8; ctx.strokeStyle = '#f1d799b6'; ctx.stroke(); ctx.setLineDash([]);
    const [x, y] = chart.points[chosen];
    ctx.beginPath(); ctx.arc(x, y, 31, 0, Math.PI * 2);
    ctx.lineWidth = 1.2; ctx.strokeStyle = '#fff0c18c'; ctx.stroke();
  }

  trail.forEach((stop, i) => {
    pins.append(stopButton(stop, i, true));
    timeline.append(stopButton(stop, i, false));
  });
  progress.textContent = '0 of ' + trail.length + ' clues opened';
  document.querySelectorAll('[data-open-pirate-map]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => openMap(button));
  });
  reveal.addEventListener('click', uncover);
  clue.addEventListener('toggle', markClue);
  nextMap.addEventListener('click', nextChart);
  closeButton.addEventListener('click', () => dialog.close());
  jump.addEventListener('click', () => { leavingForStory = true; dialog.close(); });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('pm-open');
    if (leavingForStory) return;
    const target = opener || document.querySelector('[data-open-pirate-map]');
    if (target) target.focus({ preventScroll: true });
  });
  window.addEventListener('resize', paint);
  if (typeof ResizeObserver === 'function') new ResizeObserver(paint).observe(stage);
  if (!location.hash) openMap();
})();
