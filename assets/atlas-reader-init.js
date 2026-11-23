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

  // Canonical site tabs: every Atlas reading page exposes the same five top-level routes.
  (function canonicalSiteTabs(){
    var nav = document.querySelector('.reader-header nav');
    if (!nav) return;
    var tabs = [
      ['Home','/'],['Map','/map/'],['Atlas','/atlas/README.html'],
      ['Treasure Hunt','/treasure-hunt/'],['Evidence','/evidence/']
    ];
    nav.innerHTML = tabs.map(function(t){
      var current = location.pathname === t[1] || (t[1] !== '/' && location.pathname.indexOf(t[1].replace(/README\\.html$/,'')) === 0);
      return '<a href="'+t[1]+'"'+(current?' aria-current="page"':'')+'>'+t[0]+'</a>';
    }).join('');
  }());

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
