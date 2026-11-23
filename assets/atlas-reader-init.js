/* Readable without JavaScript; enhance only a complete, matching source record. */
(function () {
  'use strict';
  var data = document.getElementById('reader-config');
  if (data && window.AtlasReveal) {
    try {
      var config = JSON.parse(data.textContent);
      window.atlasReader = window.AtlasReveal.mount(config);
    } catch (error) {
      window.AtlasReveal.restorePlainDOM(document);
      console.warn('The English reading edition remains available.', error);
    }
  } else {
    document.documentElement.classList.remove('ar-reveal-pending');
  }

  // Refuted claims are folded; the exact correction (often a counterexample) stays open as plain text.
  function foldTraps() {
    var TRAP = /^(false|trap|refuted|disproved)$/i;
    var docs = document.querySelectorAll('.trap-document');
    Array.prototype.forEach.call(docs, function (doc) {
      var claim = doc.querySelector('#trap-claim');
      if (claim && !claim.closest('.trap-fold')) {
        var d = document.createElement('details');
        d.className = 'trap-fold';
        d.innerHTML = '<summary><span class="trap-fold-tag">Trap</span> Rejected claim, minimized: open to read it</summary>';
        claim.parentNode.insertBefore(d, claim);
        d.appendChild(claim);
      }
      var corr = doc.querySelector('[data-trap-correction]');
      if (corr) { corr.hidden = false; corr.open = true; }
      var origin = doc.querySelector('.reader-origin');
      if (origin) origin.textContent = 'The false statement is folded below. Its exact correction is shown in full.';
    });
    var parts = document.querySelectorAll('[data-source-status],[data-evidence],.reader-callout[data-status]');
    Array.prototype.forEach.call(parts, function (el) {
      var s = el.getAttribute('data-source-status') || el.getAttribute('data-evidence') || el.getAttribute('data-status');
      if (!TRAP.test(s || '') || el.classList.contains('trap-document') || el.closest('.trap-fold')) return;
      var d = document.createElement('details');
      d.className = 'trap-fold';
      d.innerHTML = '<summary><span class="trap-fold-tag">Trap</span> Refuted statement, minimized: open to read it</summary>';
      el.parentNode.insertBefore(d, el);
      d.appendChild(el);
    });
  }
  try { foldTraps(); } catch (e) { console.warn('Trap folding skipped.', e); }
  document.documentElement.classList.remove('ar-reveal-pending');

  var filter = document.getElementById('contents-filter');
  if (filter) {
    filter.parentElement.hidden = false;
    var items = Array.from(document.querySelectorAll('[data-contents-item]'));
    var empty = document.getElementById('contents-empty');
    filter.addEventListener('input', function () {
      var fullIndex = document.querySelector('.atlas-full-index');
      if (fullIndex && filter.value.trim()) fullIndex.open = true;
      var terms = filter.value.normalize('NFKD').toLowerCase().trim().split(/\s+/).filter(Boolean);
      var visible = 0;
      items.forEach(function (item) {
        var matches = terms.every(function (term) { return item.dataset.search.normalize('NFKD').includes(term); });
        item.hidden = !matches;
        if (matches) visible++;
      });
      if (empty) empty.hidden = visible !== 0;
    });
  }
}());
