/* Exact formulas drive the exhibits; sampled curves illustrate the written arguments. */
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const ROOT = '../atlas/proofs/';
  const trails = {
    logistic: {
      name: 'The logistic trail · a local statement grows one step at a time',
      caption: 'The first two lines are proved implications for the defined map. The last line asks for a new geometric model.',
      edges: ['exact', 'exact', 'open'],
      nodes: [
        {title:'Find the two-cycle', short:'The starting points', status:'exact', label:'Exact calculation', equation:'r* = 1 + √6;  f(x₋) = x₊', text:'The nontrivial cycle consists of two explicitly defined points. The product of their derivatives is −1 at this parameter.', pdf:'logistic-quarter-turn', next:'Carry the two derivatives into the paired matrix. Keep the original nonlinear map and the linear response distinct.', source:['Logistic entry in the atlas','../#atlas?entry=logistic-quarter-turn']},
        {title:'Turn the response', short:'A matrix identity', status:'exact', label:'Exact local result', equation:'C² = −I;  C⁴ = I', text:'In suitable coordinates, the paired derivative acts like a clockwise quarter-turn. The original matrix is similar to a rotation, rather than Euclidean orthogonal.', pdf:'logistic-quarter-turn', next:'Compose the nonlinear map itself and subtract the starting point. Which Taylor term survives?', source:['The complete local proof',ROOT+'logistic-quarter-turn.md']},
        {title:'Find what vanishes', short:'The cubic survives', status:'exact', label:'Exact local lemma', equation:'G(0) = G′(0) = G″(0) = 0', text:'The fourth-return displacement has a nonzero cubic leading term. It is flat at the cycle point and still has a restoring local shape.', pdf:'logistic-collapse-vanishing', next:'Define a space and a collapse quantity before transferring this local conclusion to a surface.', source:['Recovered definitions and derivation','../atlas/logistic-collapse-vanishing.md']},
        {title:'Define the brane bridge', short:'An open destination', status:'open', label:'Proposed connection', equation:'Space → map → quantity → theorem', text:'“Vanishing branes” is a working title. A geometric object, its evolution and a precise meaning of vanishing must be supplied before this becomes a theorem about that object.', pdf:'logistic-collapse-vanishing', next:'Finish a one-page definition sheet and test one explicit example. T₀–T₃ remain undefined in the recovered material.', source:['Potential destination: Obstruction-Theory','https://github.com/EncapsulatorP/Obstruction-Theory']}
      ]
    },
    towers: {
      name: 'The tower trail · from a two-phase rule to a sharp ceiling',
      caption: 'Solid connections belong to this explicitly defined alternating-sign system. The last bound uses its fixed-point equation.',
      edges: ['exact','exact','exact'],
      nodes: [
        {title:'Define both phases', short:'Choose c > 1', status:'exact', label:'Defined real system', equation:'u = c⁻ᵛ;  v = cᵘ', text:'Write L = log c. Eliminating the lower phase gives F(v) = exp(L exp(−Lv)), with v initially at least 1.', pdf:'alternating-towers', next:'Show that every iterate enters the same bounded interval.', source:['Alternating towers in the atlas','../#atlas?entry=tower-envelope']},
        {title:'Bound the squeeze', short:'A uniform contraction', status:'exact', label:'Proved estimate', equation:'|F′(v)| ≤ q ≈ 0.782058 < 1', text:'F sends the starting domain into [1, exp(1/e)]. A single contraction constant works for every real base c > 1.', pdf:'alternating-towers', next:'Apply the contraction theorem on the closed invariant interval.', source:['Full bound and hypotheses',ROOT+'alternating-towers.md']},
        {title:'Reach one limit', short:'Every allowed start', status:'exact', label:'Proved convergence', equation:'vₙ → v*;  u* = exp(−Lv*)', text:'There is exactly one phase pair in 0 < u < 1 < v. The specified iteration converges from every v₀ ≥ 1.', pdf:'alternating-towers', next:'At the fixed point, substitute t = Lv into the equation to locate the sharp upper envelope.', source:['Tower research repository','https://github.com/EncapsulatorP/Some_playful_boundary_paths_and_brun_twin_prime_sign_flipping_towers']},
        {title:'Find the ceiling', short:'And the two bases', status:'exact', label:'Proved classification', equation:'v log v = t e⁻ᵗ ≤ 1/e', text:'The maximum upper phase is about 1.321099762. Every strictly interior upper phase is achieved by exactly two bases c > 1.', pdf:'alternating-towers', next:'Check the literature and seek a second reader’s review of the complete theorem.', source:['Scope and proof review',ROOT+'proof-review.pdf']}
      ]
    },
    remainders: {
      name: 'The remainder trail · separate what is proved from the comparison',
      caption: 'The two estimates prove the displayed leading-scale comparison. The final dashed line asks for a shared structure beyond that limit.',
      edges: ['exact','exact','open'],
      nodes: [
        {title:'Follow the dyadic path', short:'A functional equation', status:'exact', label:'Exact series identity', equation:'f(x) = x + f(x²)', text:'For f(x) = Σ x^(2ⁿ), choose xₖ = exp(−2⁻ᵏ). Squaring xₖ moves exactly one level back along this path.', pdf:'dyadic-remainder', next:'Unroll the identity and subtract k and the explicitly convergent constant C.', source:['Dyadic argument',ROOT+'dyadic-remainder.md']},
        {title:'Catch the small tail', short:'A bound at every k', status:'exact', label:'Proved pathwise bound', equation:'2⁻ᵏ − 4⁻ᵏ/6 ≤ Rₖ ≤ 2⁻ᵏ', text:'The remainder is a sum of positive terms 1 − exp(−2⁻ʲ). Elementary exponential bounds control the entire tail.', pdf:'dyadic-remainder', next:'Write the zeta remainder separately before comparing its size with this one.', source:['Full remainder proof',ROOT+'dyadic-remainder.pdf']},
        {title:'Compare the leading tails', short:'One precise bridge', status:'exact', label:'Proved asymptotic comparison', equation:'Rₖ / (ζ(k) − 1) → 1', text:'The dyadic bound gives Rₖ ∼ 2⁻ᵏ. Independently, the zeta tail satisfies ζ(k) − 1 ∼ 2⁻ᵏ. Dividing these positive estimates proves this exact limit as k grows.', pdf:'logistic-collapse-vanishing', next:'Sharpen the finite-k relative error. This leading-scale comparison does not identify the functions or their dynamics.', source:['Asymptotics and exact corollary','../atlas/logistic-collapse-vanishing.md']},
        {title:'Test a common rule', short:'The bridge to build', status:'open', label:'Proposed structural connection', equation:'Define a map + name what it preserves', text:'The leading ratio is now established. A common dynamical or arithmetic structure needs a further definition and argument.', pdf:'dyadic-remainder', next:'Propose one explicit map or invariant and prove it works, or find a counterexample.', source:['Prime-polarity experiments','https://github.com/EncapsulatorP/prime-polarity']}
      ]
    },
    schanuel: {
      name: 'The Schanuel crossing · the assumption is visible on the map',
      caption: 'The coefficient formula is unconditional. Algebraic independence on the far side uses full complex Schanuel.',
      edges: ['exact','conditional','conditional'],
      nodes: [
        {title:'Choose odd indices', short:'p ≥ 3', status:'exact', label:'Defined number family', equation:'Z(p) = 1 + exp(πζ(p−1)/p)', text:'The reduction applies to every odd integer p ≥ 3. The index does not have to be prime.', pdf:'schanuel-zeta-family', next:'Use the exact even-zeta formula to isolate a rational coefficient.', source:['Z(p) in the atlas','../#atlas?entry=zp-even-zeta']},
        {title:'Expose the coefficient', short:'A rational cₚ', status:'exact', label:'Exact identity', equation:'Z(p) = 1 + exp(cₚπᵖ)', text:'Here cₚ = 2^(p−2)|Bₚ₋₁|/p!, a nonzero rational number. This identity does not require Schanuel.', pdf:'schanuel-zeta-family', next:'Keep the inputs iπ and the distinct cₚπᵖ linearly independent over the rationals.', source:['Euler’s even-zeta formula','https://dlmf.nist.gov/25.6.E2']},
        {title:'State the assumption', short:'Complex Schanuel', status:'conditional', label:'Unproved assumption', equation:'Schanuel gives a transcendence-degree bound', text:'The argument invokes the full complex version of Schanuel. The Euler identity exp(iπ) = −1 is included in the field calculation.', pdf:'schanuel-zeta-family', next:'Track exactly which field contains the inputs and outputs; do not replace containment by equality.', source:['Conditional proof and source',ROOT+'schanuel-zeta-family.md']},
        {title:'Read the conclusion', short:'Conditional independence', status:'conditional', label:'Conditional theorem', equation:'π, Z(p₁), …, Z(pₖ) are independent', text:'Under that assumption, the listed numbers are algebraically independent for any finite list of distinct odd indices. This does not prove Schanuel.', pdf:'schanuel-zeta-family', next:'Check this specific consequence against the literature; investigate unconditional claims separately.', source:['Evidence scope review',ROOT+'proof-review.pdf']}
      ]
    }
  };
  let selectedTrail = 'logistic';
  function selectStation(index) {
    const note = trails[selectedTrail].nodes[index];
    byId('trail-stations').querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
    const detail=byId('trail-detail'); detail.replaceChildren();
    function add(tag,text,className){const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;detail.append(el);return el;}
    add('span',note.label,'status '+note.status);
    add('h3',note.title);
    add('p',note.equation,'formula');
    add('p',note.text);
    const next=add('p','','next-task');const strong=document.createElement('strong');strong.textContent='Next sound step';next.append(strong,document.createTextNode(note.next));
    const pdf=add('a','Open this reading note · PDF →');pdf.href=ROOT+note.pdf+'.pdf';
    const source=add('a',note.source[0]+' →','trail-source');source.href=note.source[1];
  }
  function selectTrail(key){
    selectedTrail=key;const trail=trails[key];
    document.querySelectorAll('[data-trail]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.trail===key)));
    byId('trail-name').textContent=trail.name;byId('trail-caption').textContent=trail.caption;
    const stations=byId('trail-stations');stations.replaceChildren();
    trail.nodes.forEach((note,i)=>{
      const b=document.createElement('button');b.type='button';b.className='station '+note.status+(trail.edges[i]?' next-'+trail.edges[i]:'');
      b.setAttribute('aria-pressed','false');b.setAttribute('aria-controls','trail-detail');
      const n=document.createElement('span');n.className='station-index';n.textContent=String(i+1).padStart(2,'0');
      const content=document.createElement('span'),title=document.createElement('strong'),sub=document.createElement('small');title.textContent=note.title;sub.textContent=note.short;content.append(title,sub);b.append(n,content);b.addEventListener('click',()=>selectStation(i));stations.append(b);
    });selectStation(0);
  }
  document.querySelectorAll('[data-trail]').forEach(b=>b.addEventListener('click',()=>selectTrail(b.dataset.trail)));
  selectTrail(selectedTrail);

  const SVG_NS='http://www.w3.org/2000/svg';
  function svg(tag,attrs={},text=''){const el=document.createElementNS(SVG_NS,tag);for(const [key,value]of Object.entries(attrs))el.setAttribute(key,String(value));if(text)el.textContent=text;return el;}
  const ORANGE='#ff5a00',INK='#172235',VIOLET='#6c46ad',MUTED='#a5aebd';
  const r=1+Math.sqrt(6),radical=Math.sqrt((r-3)*(r+1));
  const xm=(r+1-radical)/(2*r),xp=(r+1+radical)/(2*r);
  function f(x){return r*x*(1-x);}
  const cycle=byId('cycle-chart');
  const cx=x=>58+x*398,cy=y=>285-y*240;
  for(let k=0;k<=4;k++){
    const x=k/4;cycle.append(svg('line',{x1:cx(x),y1:cy(0),x2:cx(x),y2:cy(1),class:'chart-grid'}),svg('line',{x1:cx(0),y1:cy(x),x2:cx(1),y2:cy(x),class:'chart-grid'}));
    if(k%2===0)cycle.append(svg('text',{x:cx(x),y:309,'text-anchor':'middle'},x.toFixed(1)));
  }
  cycle.append(svg('line',{x1:cx(0),y1:cy(0),x2:cx(1),y2:cy(0),class:'chart-axis'}),svg('line',{x1:cx(0),y1:cy(0),x2:cx(0),y2:cy(1),class:'chart-axis'}));
  const parabola=Array.from({length:181},(_,i)=>{const x=i/180;return (i?'L':'M')+cx(x).toFixed(2)+','+cy(f(x)).toFixed(2);}).join(' ');
  cycle.append(svg('path',{d:parabola,fill:'none',stroke:ORANGE,'stroke-width':3}),svg('line',{x1:cx(0),y1:cy(0),x2:cx(1),y2:cy(1),stroke:MUTED,'stroke-dasharray':'5 6','stroke-width':1.5}));
  const cobweb=[[xm,xm],[xm,xp],[xp,xp],[xp,xm],[xm,xm]].map(p=>cx(p[0])+','+cy(p[1])).join(' ');
  cycle.append(svg('polyline',{points:cobweb,fill:'none',stroke:'#d69b75','stroke-width':2}));
  for(const [x,y,label,dy]of [[xm,xp,'(x₋, x₊)',-16],[xp,xm,'(x₊, x₋)',25]])cycle.append(svg('circle',{cx:cx(x),cy:cy(y),r:4,fill:ORANGE}),svg('text',{x:cx(x)-8,y:cy(y)+dy,'text-anchor':'middle',class:'plot-label'},label));
  cycle.append(svg('text',{x:64,y:27,class:'plot-label'},'next value f(x)'),svg('text',{x:440,y:333,'text-anchor':'end',class:'plot-label'},'starting value x'),svg('text',{x:390,y:48,class:'plot-muted'},'y = x'));
  const cycleMarker=svg('circle',{cx:cx(xm),cy:cy(xp),r:9,fill:ORANGE,stroke:'white','stroke-width':3});cycle.append(cycleMarker);
  const turn=byId('turn-chart'),ox=260,oy=164,radius=105;
  turn.append(svg('circle',{cx:ox,cy:oy,r:radius,fill:'#fff8f1',stroke:'#ffdec7','stroke-width':1.5}),svg('line',{x1:ox-135,y1:oy,x2:ox+135,y2:oy,class:'chart-axis'}),svg('line',{x1:ox,y1:oy-135,x2:ox,y2:oy+135,class:'chart-axis'}));
  const turnDirs=[[1,0],[0,-1],[-1,0],[0,1]];
  turnDirs.forEach(([x,y],i)=>{turn.append(svg('circle',{cx:ox+x*radius,cy:oy-y*radius,r:5,fill:'#f4cdb5'}));const labels=['right','down','left','up'];turn.append(svg('text',{x:ox+x*(radius+40),y:oy-y*(radius+32)+5,'text-anchor':'middle'},labels[i]));});
  const arrow=svg('path',{fill:ORANGE});turn.append(arrow,svg('circle',{cx:ox,cy:oy,r:5,fill:INK}),svg('text',{x:260,y:321,'text-anchor':'middle',class:'plot-label'},'J sends (x, y) to (y, −x)'));
  let step=0,timer=null;
  function drawStep(){
    const odd=step%2===1,x=odd?xp:xm,y=odd?xm:xp;
    cycleMarker.setAttribute('cx',cx(x));cycleMarker.setAttribute('cy',cy(y));
    byId('cycle-state').textContent=(odd?'x₊':'x₋')+' ≈ '+x.toFixed(6);
    const [vx,vy]=turnDirs[step%4],ex=ox+vx*radius,ey=oy-vy*radius,px=-vy,py=-vx;
    const tail1=[ox+px*4,oy+py*4],tail2=[ox-px*4,oy-py*4];
    const baseX=ex-vx*20,baseY=ey+vy*20;
    const pts=[tail1,[baseX+px*4,baseY+py*4],[baseX+px*13,baseY+py*13],[ex,ey],[baseX-px*13,baseY-py*13],[baseX-px*4,baseY-py*4],tail2];
    arrow.setAttribute('d','M'+pts.map(p=>p.join(',')).join(' L')+' Z');
    byId('turn-state').textContent='J^'+step+' e₁ = ('+vx+', '+vy+')';
    byId('step-status').textContent='Step '+step+' · '+(step===0?'start at the lower cycle point.':step%4===0?'both the phase and arrow have returned.':step%2===0?'the phase has returned; the arrow points the other way.':'the phase swaps; the response takes a quarter-turn.');
  }
  function stop(){if(timer){clearInterval(timer);timer=null;}byId('play-button').textContent='Play the steps';byId('play-button').setAttribute('aria-pressed','false');}
  byId('step-button').addEventListener('click',()=>{stop();step++;drawStep();});
  byId('reset-button').addEventListener('click',()=>{stop();step=0;drawStep();});
  byId('play-button').addEventListener('click',()=>{if(timer){stop();return;}byId('play-button').textContent='Pause the steps';byId('play-button').setAttribute('aria-pressed','true');timer=setInterval(()=>{step++;drawStep();},1200);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop();},{threshold:0}).observe(byId('logistic-lab'));
  drawStep();

  const seed=byId('seed-slider');
  function drawSeed(){const x=Number(seed.value);byId('seed-left').textContent=x.toFixed(2);byId('seed-right').textContent=(1-x).toFixed(2);byId('seed-merged').textContent=f(x).toFixed(6);byId('seed-output').textContent=x.toFixed(2);}
  seed.addEventListener('input',drawSeed);drawSeed();

  // Evaluate the shifted exact degree-16 polynomial by composition.
  // The first three coefficients are zero by the symbolic derivation in the note.
  const a=-r*(2-3*Math.sqrt(2)),b=-2*r*r*(1-Math.sqrt(2));
  const q=[0,-1,a,b,-r*r*r];
  function multiply(p,s){const out=Array(p.length+s.length-1).fill(0);p.forEach((pv,i)=>s.forEach((sv,j)=>{out[i+j]+=pv*sv;}));return out;}
  const composed=Array(17).fill(0);let power=[1];for(let j=0;j<q.length;j++){power.forEach((v,i)=>{composed[i]+=q[j]*v;});power=multiply(power,q);}
  composed[0]=0;composed[1]=0;composed[2]=0;
  const cubic=-20*r*r*(2-Math.sqrt(2));
  function remainder(h){let v=0;for(let i=composed.length-1;i>=3;i--)v=v*h+composed[i];return v*h*h*h;}
  const rem=byId('remainder-chart'),rx=h=>221+h/.04*163,ry=g=>130-g/.011*91;
  rem.append(svg('line',{x1:40,y1:130,x2:403,y2:130,class:'chart-axis'}),svg('line',{x1:221,y1:30,x2:221,y2:226,class:'chart-axis'}));
  for(const h of[-.04,.04])rem.append(svg('text',{x:rx(h),y:246,'text-anchor':'middle'},h.toFixed(2)));
  const curve=fn=>Array.from({length:161},(_,i)=>{const h=-.04+i*.08/160;return(i?'L':'M')+rx(h).toFixed(2)+','+ry(fn(h)).toFixed(2);}).join(' ');
  rem.append(svg('path',{d:curve(h=>cubic*h*h*h),stroke:VIOLET,'stroke-width':1.6,'stroke-dasharray':'5 5',fill:'none'}),svg('path',{d:curve(remainder),stroke:ORANGE,'stroke-width':3,fill:'none'}),svg('circle',{cx:221,cy:130,r:5,fill:ORANGE}),svg('text',{x:236,y:119,class:'plot-label'},'flat here'),svg('text',{x:45,y:22,class:'plot-muted'},'return displacement G(h)'),svg('text',{x:407,y:261,'text-anchor':'end',class:'plot-muted'},'offset h'));

  // The product model is explicitly new: angle transport times the scalar return.
  const aPlus=-r*(2+3*Math.sqrt(2)),bPlus=-2*r*r*(1+Math.sqrt(2));
  const localF=h=>-h+aPlus*h*h+bPlus*h*h*h-r*r*r*h*h*h*h;
  const transportValues=[0.006];
  for(let n=0;n<240;n++)transportValues.push(localF(localF(transportValues[n])));
  const transport=byId('transport-chart'),slider=byId('transport-step');
  const project=(theta,h)=>[280+180*Math.cos(theta),285+64*Math.sin(theta)-150*Math.sqrt(180**2-64**2)*h];
  const pathPoints=(steps,offset=0)=>steps.map((h,i)=>project((i+offset)*Math.PI/12,h).join(',')).join(' ');
  const basePoints=Array.from({length:121},(_,i)=>project(i*Math.PI/60,0).join(',')).join(' ');
  transport.append(svg('ellipse',{cx:280,cy:285,rx:180,ry:64,fill:'#fff2e6',stroke:'#e9b98f','stroke-width':1.5}),svg('polyline',{points:basePoints,fill:'none',stroke:ORANGE,'stroke-width':2}),svg('text',{x:280,y:391,'text-anchor':'middle',class:'plot-label'},'the invariant circle · h = 0'),svg('text',{x:44,y:30,class:'plot-muted'},'angular motion continues'));
  const trailPath=svg('polyline',{fill:'none',stroke:ORANGE,'stroke-width':2.5,'stroke-linejoin':'round'}),drop=svg('line',{stroke:VIOLET,'stroke-dasharray':'4 5','stroke-width':1.5}),transportPoint=svg('circle',{r:7,fill:ORANGE,stroke:'white','stroke-width':2.5});
  transport.append(trailPath,drop,transportPoint);
  function drawTransport(){const n=Number(slider.value),h=transportValues[n],point=project(n*Math.PI/12,h),floor=project(n*Math.PI/12,0);trailPath.setAttribute('points',pathPoints(transportValues.slice(0,n+1)));transportPoint.setAttribute('cx',point[0]);transportPoint.setAttribute('cy',point[1]);drop.setAttribute('x1',point[0]);drop.setAttribute('y1',point[1]);drop.setAttribute('x2',floor[0]);drop.setAttribute('y2',floor[1]);byId('transport-output').textContent=n;byId('transport-readout').textContent='transverse error '+h.toFixed(6)+' · '+(n*4)+' original logistic updates';}
  slider.addEventListener('input',drawTransport);drawTransport();

  const cards=Array.from(document.querySelectorAll('.proof-card'));
  function filterNotes(){const term=byId('proof-search').value.toLocaleLowerCase().trim(),kind=byId('proof-filter').value;let visible=0;cards.forEach(card=>{const category=kind==='all'||(kind==='foundations'?card.dataset.kind==='foundations':card.dataset.status===kind);const match=!term||card.dataset.search.includes(term);card.hidden=!(category&&match);if(!card.hidden)visible++;});byId('library-count').textContent=visible+' of '+cards.length+' notes';byId('no-notes').hidden=visible!==0;}
  byId('proof-search').addEventListener('input',filterNotes);byId('proof-filter').addEventListener('change',filterNotes);filterNotes();
})();
