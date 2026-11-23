(function () {
  'use strict';
  function factors(n) {
    var result = [];
    for (var p = 2; p * p <= n; p++) while (n % p === 0) { result.push(p); n /= p; }
    if (n > 1) result.push(n);
    return result;
  }
  function squareNeighbour(m) {
    var a = factors(m - 1), b = factors(m + 1), f = factors(m * m - 1);
    return { m: m, a: a, b: b, factors: f, product: m * m - 1, omega: f.length,
      mu: new Set(f).size < f.length ? 0 : (f.length % 2 ? -1 : 1), twin: a.length === 1 && b.length === 1 };
  }
  function collatz(seed) {
    if (!Number.isSafeInteger(seed) || seed < 1 || seed > 1000000) throw new RangeError('Choose a whole-number seed from 1 through 1,000,000.');
    var path = [seed], n = seed, limit = 1500;
    while (n !== 1 && path.length <= limit) {
      n = n % 2 === 0 ? n / 2 : 3 * n + 1;
      if (!Number.isSafeInteger(n)) return { path: path, complete: false, reason: 'Integer precision limit reached.' };
      path.push(n);
    }
    return { path: path, complete: n === 1, reason: n === 1 ? '' : 'Finite limit of 1,500 updates reached.' };
  }
  function shapiro(depth, theta) {
    var p = [1, 0], q = [1, 0];
    for (var j = 0; j < depth; j++) {
      var angle = Math.pow(2, j) * theta, c = Math.cos(angle), s = Math.sin(angle);
      var r = c * q[0] - s * q[1], i = s * q[0] + c * q[1];
      q = [p[0] - r, p[1] - i]; p = [p[0] + r, p[1] + i];
    }
    return { p: p[0] * p[0] + p[1] * p[1], q: q[0] * q[0] + q[1] * q[1], total: Math.pow(2, depth + 1) };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { factors: factors, squareNeighbour: squareNeighbour, collatz: collatz, shapiro: shapiro };
  if (typeof document === 'undefined') return;
  var ns = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, text) { var n = document.createElementNS(ns, tag); Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); }); if (text !== undefined) n.textContent = text; return n; }
  function add(svg, tag, attrs, text) { var n = el(tag, attrs, text); svg.appendChild(n); return n; }
  function text(svg, x, y, str, color, size, anchor) { add(svg, 'text', {x:x, y:y, fill:color || '#c5d9ee', 'font-size':size || 12, 'text-anchor':anchor || 'middle'}, str); }
  function put(id, value) { var n = document.getElementById(id); if (n) n.textContent = value; }
  function init() {
    var nav = document.getElementById('tr-all-rooms'), menu = document.querySelector('.tr-nav-more');
    function syncNav() { var active = document.querySelector('.nav a[aria-current=page]'); if (nav && active) nav.value = active.getAttribute('href'); }
    if (nav) nav.addEventListener('change', function () { if (nav.value.charAt(0) === '#') location.hash = nav.value; else location.href = nav.value; });
    window.addEventListener('hashchange', function () { syncNav(); if (menu) menu.open = false; }); syncNav();
    if (menu) {
      document.addEventListener('click', function(e) { if (!menu.contains(e.target)) menu.open = false; });
      menu.addEventListener('keydown', function(e) { if (e.key === 'Escape') { menu.open = false; menu.querySelector('summary').focus(); } });
    }
    var skip = document.querySelector('.tr-skip');
    if (skip) skip.addEventListener('click', function(e) { e.preventDefault(); var main = document.getElementById('main-content'); main.focus(); main.scrollIntoView(); });

    var centre = document.getElementById('tr-lemma-m');
    if (centre) {
      function drawLemma() {
        var v = squareNeighbour(+centre.value), svg = document.getElementById('tr-lemma-plot'); svg.replaceChildren();
        add(svg,'title',{},'Centre '+v.m+': '+(v.m-1)+' times '+(v.m+1)+' equals '+v.product+'. '+(v.twin?'Twin primes.':'Composite neighbour present.'));
        add(svg,'path',{d:'M130 112 Q130 207 310 214 M490 112 Q490 207 310 214',fill:'none',stroke:'#476684','stroke-width':2});
        add(svg,'line',{x1:130,y1:91,x2:490,y2:91,stroke:'#4f6b85','stroke-dasharray':'3 7'});
        [[130,v.m-1,v.a],[490,v.m+1,v.b]].forEach(function(item) {
          add(svg,'circle',{cx:item[0],cy:90,r:48,fill:'#1b354a',stroke:item[2].length===1?'#aee9a7':'#c4a8f2','stroke-width':2});
          text(svg,item[0],99,String(item[1]),'#e7f5ff',27); text(svg,item[0],163,item[2].join(' × '),'#abc9de',12);
        });
        add(svg,'circle',{cx:310,cy:91,r:5,fill:'#c7aefa'}); text(svg,310,67,'centre '+v.m,'#bea9ef',12);
        add(svg,'rect',{x:204,y:210,width:212,height:66,rx:12,fill:'#1c3b4c',stroke:'#6acbbf'});
        text(svg,310,237,v.product+' = '+v.m+'² − 1','#d9f4ed',17);
        text(svg,310,260,'Ω = '+v.omega+'    μ = '+(v.mu>0?'+':'')+v.mu,'#b8edd7',12);
        text(svg,310,315,v.twin?'Two factors. Two primes.':'The factor count distinguishes the pattern.',v.twin?'#c9f29c':'#cfb6ed',13);
        put('tr-lemma-m-value',v.m); put('tr-lemma-result',v.twin?'Twin centre: both neighbours are prime. The product has exactly two prime factors.':'Ω = '+v.omega+'. '+(v.mu===1?'The positive Möbius value survives, but the neighbours are not both prime.':'This centre has a composite neighbour.'));
        put('tr-lemma-factorization',v.product+' = '+v.factors.join(' × '));
      }
      centre.addEventListener('input',drawLemma);
      document.querySelectorAll('[data-tr-centre]').forEach(function(b) { b.addEventListener('click',function(){centre.value=b.dataset.trCentre;drawLemma();}); }); drawLemma();
    }

    var seedInput = document.getElementById('tr-collatz-seed');
    if (seedInput) {
      var stepInput = document.getElementById('tr-collatz-step'), result, path;
      function drawFlight() {
        if (!path) return;
        var svg = document.getElementById('tr-collatz-plot'), step = +stepInput.value, peak = Math.max.apply(null,path), maxLog = Math.max(1,Math.log2(peak)); svg.replaceChildren();
        var X = function(i) { return 48+ i/Math.max(1,path.length-1)*624; }, Y = function(n) { return 254-Math.log2(n)/maxLog*210; };
        add(svg,'title',{},'Collatz orbit from '+path[0]+', '+(path.length-1)+' computed updates. Vertical axis: log base 2 of value.');
        [0,.25,.5,.75,1].forEach(function(t){var yy=254-t*210;add(svg,'line',{x1:48,y1:yy,x2:672,y2:yy,stroke:'#2d465f','stroke-dasharray':'3 6'});text(svg,36,yy+4,(maxLog*t).toFixed(1),'#8ca9c8',10,'end');});
        text(svg,48,25,'log₂ value','#9bbdd4',11,'start');text(svg,672,291,'update →','#9bbdd4',11,'end');
        var d=path.map(function(n,i){return(i?'L':'M')+X(i).toFixed(2)+' '+Y(n).toFixed(2);}).join(' ');
        add(svg,'path',{d:d,fill:'none',stroke:'#73ddd3','stroke-width':2.2,'stroke-linejoin':'round'});
        add(svg,'line',{x1:X(step),y1:32,x2:X(step),y2:254,stroke:'#c6b0f0','stroke-dasharray':'4 5'});
        add(svg,'circle',{cx:X(step),cy:Y(path[step]),r:6,fill:'#c2f29c',stroke:'#0c2133','stroke-width':2});
        var labelX=Math.max(82,Math.min(638,X(step))), labelY=Math.max(48,Y(path[step])-17);
        text(svg,labelX,labelY,path[step].toLocaleString('en-US'),'#e2ffc5',13);
        text(svg,48,276,'0','#91abc9',10);text(svg,672,276,String(path.length-1),'#91abc9',10);
        put('tr-collatz-step-value',step);put('tr-collatz-updates',path.length-1);put('tr-collatz-peak',peak.toLocaleString('en-US'));put('tr-collatz-now',path[step].toLocaleString('en-US'));
        var n=path[step], next=step+1<path.length?path[step+1]:null;
        put('tr-collatz-readout',next===null?(result.complete?'Reached 1 after '+(path.length-1)+' updates in this finite orbit.':result.reason):'Update '+step+': '+n.toLocaleString('en-US')+(n%2?' × 3 + 1 = ':' ÷ 2 = ')+next.toLocaleString('en-US')+'.');
      }
      function chooseSeed() {
        try { result=collatz(Number(seedInput.value));path=result.path;stepInput.max=path.length-1;stepInput.value=0;put('tr-collatz-values',path.join(' → '));put('tr-collatz-error','');drawFlight(); }
        catch(e){put('tr-collatz-error',e.message);}
      }
      document.getElementById('tr-collatz-form').addEventListener('submit',function(e){e.preventDefault();chooseSeed();});
      stepInput.addEventListener('input',drawFlight);
      document.querySelectorAll('[data-tr-seed]').forEach(function(b){b.addEventListener('click',function(){seedInput.value=b.dataset.trSeed;chooseSeed();});}); chooseSeed();
    }

    var depth = document.getElementById('tr-shapiro-depth');
    if (depth) {
      var angleInput=document.getElementById('tr-shapiro-angle');
      function drawShapiro(){
        var j=+depth.value,theta=+angleInput.value*Math.PI/180,v=shapiro(j,theta),svg=document.getElementById('tr-shapiro-plot'); svg.replaceChildren();
        add(svg,'title',{},'Rudin–Shapiro circle at depth '+j+'. Teal shows P energy, violet Q energy. Their sum is '+v.total+'.');
        [45,98,150].forEach(function(r){add(svg,'circle',{cx:215,cy:180,r:r,fill:'none',stroke:'#35506b','stroke-dasharray':'3 7'});});
        add(svg,'line',{x1:48,y1:180,x2:382,y2:180,stroke:'#2f4862'});add(svg,'line',{x1:215,y1:18,x2:215,y2:342,stroke:'#2f4862'});
        ['p','q'].forEach(function(k){var d='';for(var a=0;a<=640;a++){var t=a/640*2*Math.PI,z=shapiro(j,t),r=45+105*z[k]/z.total;d+=(a?' L':'M')+(215+r*Math.cos(t)).toFixed(2)+' '+(180-r*Math.sin(t)).toFixed(2);}add(svg,'path',{d:d,fill:'none',stroke:k==='p'?'#72e1d6':'#c1a6f5','stroke-width':1.8});});
        add(svg,'line',{x1:215,y1:180,x2:215+160*Math.cos(theta),y2:180-160*Math.sin(theta),stroke:'#d3edab','stroke-width':1.2});
        ['p','q'].forEach(function(k){var r=45+105*v[k]/v.total;add(svg,'circle',{cx:215+r*Math.cos(theta),cy:180-r*Math.sin(theta),r:4.5,fill:k==='p'?'#7af1d9':'#d2b5ff'});});
        text(svg,455,113,'ENERGY SHARES','#9fc4d6',10,'start');text(svg,455,150,'P  '+(v.p/v.total*100).toFixed(1)+'%','#7ce4d5',18,'start');text(svg,455,188,'Q  '+(v.q/v.total*100).toFixed(1)+'%','#c6b2f5',18,'start');
        text(svg,455,235,'sum  100%','#c8f2a0',15,'start');text(svg,215,363,'θ = '+angleInput.value+'°','#a7bfd7',11);
        put('tr-shapiro-depth-value',j);put('tr-shapiro-angle-value',angleInput.value+'°');put('tr-shapiro-energy',v.p.toFixed(6)+' + '+v.q.toFixed(6)+' = '+v.total);
        put('tr-shapiro-result','Depth '+j+' · |P|² + |Q|² = 2^'+(j+1)+' = '+v.total+'. Floating-point error in this sample: '+Math.abs(v.p+v.q-v.total).toExponential(1)+'.');
      }
      depth.addEventListener('input',drawShapiro);angleInput.addEventListener('input',drawShapiro);drawShapiro();
    }
    var repoFilter=document.getElementById('tr-repo-family');
    if(repoFilter){var cards=Array.from(document.querySelectorAll('[data-repo-family]'));function filter(){var count=0;cards.forEach(function(c){var show=!repoFilter.value||c.dataset.repoFamily.split(' ').includes(repoFilter.value);c.hidden=!show;if(show)count++;});put('tr-repo-count',count+' repositories shown');}repoFilter.addEventListener('change',filter);filter();}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
