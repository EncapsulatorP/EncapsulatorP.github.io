'use strict';
// Behavioral tests with a minimal DOM/event/timer model. This is not a browser
// render test and makes no claim about delivery to an analytics property.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../assets/evidence-experiment.js'), 'utf8');
const KEY = 'atlas.evidence-order.v1';

function fixture(options = {}) {
  let clock = 0, nextTimer = 1, callsToRandom = 0;
  const timers = new Map(), events = [], intersections = [], mutations = [];
  const storage = new Map(), storageCalls = { read: 0, write: 0, remove: 0 };
  if (options.stored !== undefined) storage.set(KEY, typeof options.stored === 'string' ? options.stored : JSON.stringify(options.stored));
  class Element {
    constructor(id) {
      this.id = id; this.dataset = {}; this.listeners = {}; this.children = []; this.open = false;
      this.className = ''; this.textContent = ''; this.on = true;
      this.classList = { contains: name => name === 'on' && this.on };
    }
    append(...nodes) { this.children.push(...nodes); }
    setAttribute(name, value) { this[name] = value; }
    addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
    emit(type, event = {}) { for (const fn of this.listeners[type] || []) fn(event); }
    closest(selector) { return selector === '.page' ? page : null; }
    matches(selector) { return selector === 'details.ev-rail' && this.className.includes('ev-rail'); }
  }
  const page = new Element('home'), comparison = new Element('evidence-comparison');
  const sentinel = new Element('evidence-start'), primer = new Element('coordinate-primer');
  const advanced = new Element('home-mathematics'), modal = new Element('pirate-map');
  const ids = new Map([comparison,sentinel,primer,advanced,modal].map(node => [node.id,node]));
  const doc = new Element('document'); doc.hidden = false;
  doc.getElementById = id => ids.get(id) || null;
  doc.createElement = tag => new Element(tag);
  doc.querySelector = selector => selector === 'dialog[open]' && modal.open ? modal : null;
  const sessionStorage = {
    getItem(key) { storageCalls.read++; if (options.storageThrows || options.readThrows) throw new Error('Storage denied'); return storage.get(key) ?? null; },
    setItem(key,value) { storageCalls.write++; if (options.storageThrows || options.writeThrows) throw new Error('Storage denied'); storage.set(key,String(value)); },
    removeItem(key) { storageCalls.remove++; if (options.storageThrows) throw new Error('Storage denied'); storage.delete(key); }
  };
  const win = new Element('window'); win.document = doc;
  win.location = { search: options.search || '' };
  win.navigator = { globalPrivacyControl: !!options.gpc, doNotTrack: options.dnt ? '1' : '0' };
  win.sessionStorage = sessionStorage;
  win.crypto = { getRandomValues(array) { callsToRandom++; array[0] = options.randomBits ?? 0; return array; } };
  win.gtag = (...args) => events.push(args);
  function timeout(fn, delay) { const id = nextTimer++; timers.set(id, { fn, due: clock + delay }); return id; }
  function advance(ms) {
    const target = clock + ms;
    while (true) {
      const ready = [...timers.entries()].filter(([,t]) => t.due <= target).sort((a,b) => a[1].due - b[1].due)[0];
      if (!ready) break;
      clock = ready[1].due; timers.delete(ready[0]); ready[1].fn();
    }
    clock = target;
  }
  class IntersectionObserver {
    constructor(callback, opts) { this.callback = callback; this.options = opts; intersections.push(this); }
    observe(target) { this.target = target; }
  }
  class MutationObserver {
    constructor(callback) { this.callback = callback; this.nodes = []; mutations.push(this); }
    observe(target) { this.nodes.push(target); }
  }
  const context = vm.createContext({ window: win, document: doc, navigator: win.navigator,
    sessionStorage, crypto: win.crypto, URLSearchParams, Uint32Array,
    setTimeout: timeout, clearTimeout: id => timers.delete(id), IntersectionObserver, MutationObserver, console });
  vm.runInContext(source, context, { filename: 'evidence-experiment.js' });
  function intersect(ratio) { intersections[0].callback([{ target: sentinel, isIntersecting: ratio > 0, intersectionRatio: ratio }]); }
  function mutate(node) { mutations.filter(observer => observer.nodes.includes(node)).forEach(observer => observer.callback([{target:node}])); }
  function setModal(open) { modal.open = open; mutate(modal); }
  function setPage(on) { page.on = on; mutate(page); win.emit('hashchange'); }
  function setHidden(hidden) { doc.hidden = hidden; doc.emit('visibilitychange'); }
  function click(kind = 'link', trusted = true) {
    const target = { closest(selector) { return (kind === 'link' && selector === 'a[data-evidence-open]') || (kind === 'button' && selector === '.ev-check') ? target : null; } };
    comparison.emit('click', { target, isTrusted: trusted });
  }
  function toggle(open = true) { const target = new Element('rail'); target.className = 'ev-rail'; target.open = open; comparison.emit('toggle', { target, isTrusted: true }); }
  return { win, doc, page, modal, comparison, sentinel, storage, storageCalls, events, advance,
    intersect, setModal, setPage, setHidden, click, toggle,
    randomCalls: () => callsToRandom,
    state: () => JSON.parse(storage.get(KEY) || 'null'),
    names: () => events.map(event => event[1]),
    expose() { intersect(1); advance(1000); }
  };
}

const fresh = variant => ({ version:1, variant, exposed:false, engaged:false, stress:false, interactive:false });
const results = [];
function test(name, callback) {
  try { callback(); results.push({name,pass:true}); }
  catch (error) { results.push({name,pass:false,error:error.message}); }
}

test('fresh tabs randomize at the 50% boundary and keep content in the assigned order', () => {
  for (const [randomBits,variant] of [[0,'a'],[0x7fffffff,'a'],[0x80000000,'b'],[0xffffffff,'b']]) {
    const f = fixture({randomBits}); assert.equal(f.randomCalls(),1); assert.equal(f.state().variant,variant);
    assert.deepEqual(f.comparison.children.map(node => node.id), variant === 'a' ? ['coordinate-primer','home-mathematics'] : ['home-mathematics','coordinate-primer']);
  }
});
test('valid saved assignment survives reload without rerandomization', () => {
  const f = fixture({stored:fresh('a'),randomBits:0xffffffff}); assert.equal(f.state().variant,'a'); assert.equal(f.randomCalls(),0);
});
test('obsolete truthy saved state gets a new random assignment', () => {
  const f = fixture({stored:{version:0,variant:'b'},randomBits:0}); assert.equal(f.randomCalls(),1); assert.equal(f.state().variant,'a');
});
test('malformed stored JSON does not masquerade as unavailable storage', () => {
  const f = fixture({stored:'{bad json',randomBits:0}); assert.equal(f.randomCalls(),1); assert.equal(f.state().variant,'a');
  f.expose(); assert.deepEqual(f.names(),['atlas_ev_v1_a_exposed']);
});
test('nonboolean flags are discarded instead of suppressing events', () => {
  const f = fixture({stored:{...fresh('b'),exposed:'false'},randomBits:0}); assert.equal(f.state().exposed,false); assert.equal(f.state().variant,'a');
  f.expose(); assert.deepEqual(f.names(),['atlas_ev_v1_a_exposed']);
});
test('impossible engagement before exposure is discarded', () => {
  const f = fixture({stored:{...fresh('b'),engaged:true},randomBits:0}); assert.equal(f.state().engaged,false); assert.equal(f.state().variant,'a');
});
test('one full uninterrupted second is required, and exposure is deduplicated', () => {
  const f = fixture(); f.intersect(1); f.advance(999); assert.equal(f.events.length,0);
  f.advance(1); assert.deepEqual(f.names(),['atlas_ev_v1_a_exposed']);
  f.intersect(0); f.intersect(1); f.advance(2000); assert.equal(f.events.length,1);
});
test('less than 50% of the introduction does not start exposure', () => {
  const f = fixture(); f.intersect(0.01); f.advance(2000); assert.equal(f.events.length,0);
  f.intersect(0.5); f.advance(1000); assert.equal(f.events.length,1);
});
test('falling below the visibility threshold resets continuous dwell', () => {
  const f = fixture(); f.intersect(1); f.advance(600); f.intersect(0.4); f.advance(100);
  f.intersect(0.9); f.advance(999); assert.equal(f.events.length,0); f.advance(1); assert.equal(f.events.length,1);
});
test('a document visibility interruption resets dwell', () => {
  const f = fixture(); f.intersect(1); f.advance(600); f.setHidden(true); f.advance(100);
  f.setHidden(false); f.advance(999); assert.equal(f.events.length,0); f.advance(1); assert.equal(f.events.length,1);
});
test('a modal interruption resets dwell', () => {
  const f = fixture(); f.intersect(1); f.advance(600); f.setModal(true); f.advance(100);
  f.setModal(false); f.advance(999); assert.equal(f.events.length,0); f.advance(1); assert.equal(f.events.length,1);
});
test('inactive room interruption resets dwell', () => {
  const f = fixture(); f.intersect(1); f.advance(600); f.setPage(false); f.advance(100);
  f.setPage(true); f.advance(999); assert.equal(f.events.length,0); f.advance(1); assert.equal(f.events.length,1);
});
test('clicks before exposure and synthetic clicks do not count', () => {
  const f = fixture(); f.intersect(1); f.click(); assert.equal(f.events.length,0);
  f.advance(1000); f.click('link',false); assert.equal(f.events.length,1);
});
test('one intentional open counts once even after the introduction scrolls away', () => {
  const f = fixture(); f.expose(); f.intersect(0); f.click(); f.click();
  assert.deepEqual(f.names(),['atlas_ev_v1_a_exposed','atlas_ev_v1_a_engaged']);
});
test('hidden document cannot record engagement after a previous exposure', () => {
  const f = fixture(); f.expose(); f.setHidden(true); f.click(); assert.equal(f.events.length,1);
});
test('inactive room cannot record engagement after a previous exposure', () => {
  const f = fixture(); f.expose(); f.setPage(false); f.click(); assert.equal(f.events.length,1);
});
test('modal overlay cannot record underlying engagement after a previous exposure', () => {
  const f = fixture(); f.expose(); f.setModal(true); f.click(); assert.equal(f.events.length,1);
});
test('stress rail expansion is suppressed behind a modal', () => {
  const f = fixture(); f.expose(); f.setModal(true); f.toggle(); assert.equal(f.events.length,1);
});
test('valid stress rail and finite-check events are deduplicated', () => {
  const f = fixture(); f.expose(); f.toggle(); f.toggle(); f.click('button'); f.click('button');
  assert.deepEqual(f.names(),['atlas_ev_v1_a_exposed','atlas_ev_v1_a_stress','atlas_ev_v1_a_engaged','atlas_ev_v1_a_interactive']);
});
test('persisted outcomes do not emit again on reload', () => {
  const first = fixture(); first.expose(); first.click('button'); first.toggle();
  const next = fixture({stored:first.state()}); next.expose(); next.click('button'); next.toggle(); assert.equal(next.events.length,0);
});
test('forced previews, QA, and preview parameter perform no storage or telemetry', () => {
  for (const search of ['?evidence=elementary','?evidence=asymptotics','?atlas_qa=1','?atlas_preview=1']) {
    const f = fixture({search}); f.expose(); f.click('button'); f.toggle();
    assert.equal(f.events.length,0); assert.deepEqual(f.storageCalls,{read:0,write:0,remove:0});
    assert.equal(f.comparison.dataset.evidenceMode,'preview-excluded');
  }
});
test('privacy signals suppress both storage access and telemetry', () => {
  for (const privacy of [{gpc:true},{dnt:true}]) {
    const f = fixture(privacy); f.expose(); f.click('button'); f.toggle();
    assert.equal(f.events.length,0); assert.deepEqual(f.storageCalls,{read:0,write:0,remove:0});
    assert.equal(f.comparison.dataset.evidenceMode,'privacy-excluded');
  }
});
test('unavailable storage safely excludes the tab', () => {
  const f = fixture({storageThrows:true}); f.expose(); f.click();
  assert.equal(f.events.length,0); assert.equal(f.comparison.dataset.evidenceMode,'storage-unavailable-excluded');
});
test('write failure excludes even when reading storage succeeded', () => {
  const f = fixture({writeThrows:true}); f.expose(); f.click();
  assert.equal(f.events.length,0); assert.equal(f.comparison.dataset.evidenceMode,'storage-unavailable-excluded');
});
test('read failure excludes even when the write probe succeeds', () => {
  const f = fixture({readThrows:true}); f.expose(); f.click();
  assert.equal(f.events.length,0); assert.equal(f.comparison.dataset.evidenceMode,'storage-unavailable-excluded');
});

for (const result of results) {
  console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.name}${result.error ? '\n  ' + result.error.replace(/\n/g,'\n  ') : ''}`);
}
const failures = results.filter(result => !result.pass);
console.log(`Evidence-order behavior: ${results.length-failures.length}/${results.length} checks passed. No browser rendering or collector delivery tested.`);
if (failures.length) process.exitCode = 1;
