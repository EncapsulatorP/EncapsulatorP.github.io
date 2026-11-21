(function () {
  'use strict';
  var data = window.ATLAS_STRESS_TESTS;
  if (!data) return;
  var entries = new Map(data.entries.map(function (entry) { return [entry.id, entry]; }));
  function el(tag, className, text) { var n = document.createElement(tag); if (className) n.className = className; if (text) n.textContent = text; return n; }
  function towerCheck(output) {
    var y = 1 - 1 / Math.E, points = [100, 1000, 10000, 100000], lines = ['x₀ = 1 · stable gap recurrence · floating-point check'];
    for (var n = 1; n <= points[points.length - 1]; n++) {
      y = -Math.expm1(-y);
      if (points.indexOf(n) !== -1) {
        var u = 1 / (Math.E * y) - n / (2 * Math.E) - Math.log(n) / (6 * Math.E);
        lines.push('n = ' + n.toLocaleString('en-GB') + '  →  uₙ ≈ ' + u.toFixed(9));
      }
    }
    lines.push('The remainder approaches a constant. This finite run does not prove convergence.');
    output.textContent = lines.join('\n');
  }
  function rail(entry) {
    var detail = el('details', 'ev-rail'); detail.dataset.stressTest = entry.id;
    detail.append(el('summary', '', 'Stress-test · breakdown & next-order term'));
    var fields = el('dl', 'ev-fields');
    [['Claim class', entry.claimClass], ['Next-order obstruction / boundary', entry.obstruction], ['Falsification / verification hook', entry.hook]].forEach(function (field, index) {
      fields.append(el('dt', '', field[0])); var dd = el('dd', '', field[1]);
      if (index === 1) dd.append(el('span', 'ev-formula', entry.formula));
      if (index === 2) {
        if (entry.browserCheck === 'tower') {
          var button = el('button', 'ev-check', 'Run the finite remainder check'); button.type = 'button';
          var result = el('output', 'ev-result'); result.setAttribute('aria-live', 'polite');
          button.addEventListener('click', function () { towerCheck(result); }); dd.append(button, result);
        }
        var links = el('div', 'ev-links'), notes = el('a', '', 'Argument & boundaries ↗'), gate = el('a', '', 'Runnable check ↗');
        notes.href = entry.source; gate.href = 'https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/main/' + (entry.checkPath || (entry.id === 'mobius-counterexample' ? 'lemmas/verify_lemmas.py' : 'atlas/verify_stress_tests.py'));
        notes.setAttribute('data-evidence-open', ''); gate.setAttribute('data-evidence-open', '');
        links.append(notes, gate); dd.append(links, el('p', 'ev-credit', 'Lean status: formalization pending; no machine-checked proof claimed.'));
      }
      fields.append(dd);
    });
    fields.append(el('dt', '', 'Review contribution'), el('dd', 'ev-credit', data.credit)); detail.append(fields);
    return detail;
  }
  function mount(host, entry) { if (host && !host.querySelector('[data-stress-test="' + entry.id + '"]')) host.append(rail(entry)); }
  document.querySelectorAll('[data-evidence-entry]').forEach(function (host) { var entry = entries.get(host.dataset.evidenceEntry); if (entry) mount(host, entry); });
  data.entries.forEach(function (entry) {
    entry.storyIds.forEach(function (id) { var host = document.getElementById(id); if (host) mount(host.querySelector('.story-body') || host, entry); });
    entry.atlasIds.forEach(function (id) { var host = document.getElementById('atlas-entry-' + id); if (host) mount(host.querySelector('.at-entry-detail') || host, entry); });
  });
}());
