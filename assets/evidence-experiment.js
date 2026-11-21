(function (root) {
  'use strict';
  var KEY = 'atlas.evidence-order.v2';
  function chooseVariant(random) { return random < 0.5 ? 'a' : 'b'; }
  function validState(value) {
    return !!value && (value.variant === 'a' || value.variant === 'b') && value.version === 2 &&
      ['exposed', 'engaged', 'stress', 'interactive'].every(function (flag) { return typeof value[flag] === 'boolean'; }) &&
      (value.exposed || !(value.engaged || value.stress || value.interactive)) && (!value.interactive || value.engaged);
  }
  function eventName(variant, outcome) { return 'atlas_ev_v2_' + variant + '_' + outcome; }
  var api = { chooseVariant: chooseVariant, validState: validState, eventName: eventName };
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }
  var doc = root.document, comparison = doc.getElementById('evidence-comparison');
  if (!comparison) return;
  var params = new URLSearchParams(root.location.search);
  var forced = params.get('evidence'), qa = params.get('atlas_qa') === '1';
  var preview = params.has('atlas_preview') || qa || forced === 'elementary' || forced === 'asymptotics';
  var privacy = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || root.doNotTrack === '1';
  var stored = null, storageAvailable = false;
  if (!preview && !privacy) {
    try { sessionStorage.setItem(KEY + '.probe', '1'); sessionStorage.removeItem(KEY + '.probe'); storageAvailable = true; } catch (_) {}
    if (storageAvailable) {
      var raw = null;
      try { raw = sessionStorage.getItem(KEY); } catch (_) { storageAvailable = false; }
      if (storageAvailable) { try { stored = JSON.parse(raw); } catch (_) { stored = null; } }
    }
  }
  var state = validState(stored) ? stored : { version: 2, variant: 'b', exposed: false, engaged: false, stress: false, interactive: false };
  if (forced === 'elementary') state.variant = 'a';
  else if (forced === 'asymptotics') state.variant = 'b';
  else if (!validState(stored) && storageAvailable) { var bits = new Uint32Array(1); crypto.getRandomValues(bits); state.variant = chooseVariant(bits[0] / 4294967296); }
  var eligible = !preview && !privacy && storageAvailable;
  var receipt = [], sentinel = doc.getElementById('evidence-start'), page = comparison.closest('.page');
  var primer = doc.getElementById('coordinate-primer'), advanced = doc.getElementById('home-mathematics');
  comparison.append.apply(comparison, state.variant === 'a' ? [primer, advanced] : [advanced, primer]);
  comparison.dataset.evidenceVariant = state.variant;
  comparison.dataset.evidenceMode = preview ? 'preview-excluded' : privacy ? 'privacy-excluded' : storageAvailable ? 'assigned-collection-unverified' : 'storage-unavailable-excluded';
  function save() { if (eligible) { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { eligible = false; comparison.dataset.evidenceMode = 'storage-unavailable-excluded'; } } }
  save();
  var receiptNode = null;
  if (qa) {
    var panel = doc.createElement('details'); panel.className = 'ev-rail'; panel.open = true;
    var heading = doc.createElement('summary'); heading.textContent = 'Preview diagnostics · excluded from experiment';
    receiptNode = doc.createElement('pre'); receiptNode.className = 'ev-receipt'; receiptNode.setAttribute('data-evidence-receipt', '');
    panel.append(heading, receiptNode); sentinel.append(panel);
  }
  function updateReceipt() {
    comparison.dataset.evidenceExposed = String(state.exposed);
    comparison.dataset.evidenceEngaged = String(state.engaged);
    if (receiptNode) receiptNode.textContent = 'Variant ' + state.variant.toUpperCase() + ': ' + (state.variant === 'a' ? 'Coordinate Primer first' : 'Identities, asymptotics and kernels first') + '\nMode: ' + comparison.dataset.evidenceMode + '\nCollector: dedicated Atlas study stream; see the QA page for delivery status\n' + receipt.join('\n');
  }
  function record(outcome) {
    var flag = { exposed: 'exposed', engaged: 'engaged', stress: 'stress', interactive: 'interactive' }[outcome];
    if (!flag || state[flag] || (outcome !== 'exposed' && !state.exposed)) return;
    state[flag] = true; save();
    var name = eventName(state.variant, outcome), delivery = 'excluded';
    if (eligible && root.AtlasStudyAnalytics) {
      var queued = root.AtlasStudyAnalytics.send(name, { experiment_id: 'evidence_order_v2', evidence_variant: state.variant });
      delivery = queued ? 'queued to the study stream' : 'collector excluded';
    } else if (eligible) delivery = 'collector unavailable';
    receipt.push(name + ' — ' + delivery); updateReceipt();
  }
  updateReceipt();
  var inView = false, timer = null;
  function roomReady() { return !doc.hidden && page.classList.contains('on') && !doc.querySelector('dialog[open]'); }
  function visible() { return inView && roomReady(); }
  function checkExposure() {
    if (!visible()) { if (timer) clearTimeout(timer); timer = null; return; }
    if (state.exposed || timer) return;
    timer = setTimeout(function () { timer = null; if (visible()) record('exposed'); }, 1000);
  }
  var observer = new IntersectionObserver(function (changes) { inView = changes[0].isIntersecting && changes[0].intersectionRatio >= 0.5; checkExposure(); }, { threshold: 0.5 });
  observer.observe(sentinel);
  doc.addEventListener('visibilitychange', checkExposure);
  root.addEventListener('hashchange', checkExposure);
  var modal = doc.getElementById('pirate-map');
  if (modal) new MutationObserver(checkExposure).observe(modal, { attributes: true, attributeFilter: ['open'] });
  comparison.addEventListener('click', function (event) {
    if (!roomReady() || !state.exposed) return;
    var link = event.target.closest('a[data-evidence-open]');
    if (link && event.isTrusted) record('engaged');
    var button = event.target.closest('.ev-check');
    if (button && event.isTrusted) { record('engaged'); record('interactive'); }
  });
  comparison.addEventListener('toggle', function (event) {
    if (event.target.matches('details.ev-rail') && event.target.open && state.exposed && roomReady()) record('stress');
  }, true);
}(typeof window !== 'undefined' ? window : globalThis));
