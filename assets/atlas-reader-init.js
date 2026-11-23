/* Readable without JavaScript; enhance only a complete, matching source record. */
(function () {
  'use strict';
  var data = document.getElementById('reader-config');
  if (data && window.AtlasReveal) {
    try {
      var config = JSON.parse(data.textContent);
      window.atlasReader = window.AtlasReveal.mount(config);
    } catch (error) {
      console.warn('The English reading edition remains available.', error);
    }
  }
  var filter = document.getElementById('contents-filter');
  if (filter) {
    filter.parentElement.hidden = false;
    var items = Array.from(document.querySelectorAll('[data-contents-item]'));
    var empty = document.getElementById('contents-empty');
    filter.addEventListener('input', function () {
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
