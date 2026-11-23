(function(){
  const $=id=>document.getElementById(id),G=PQ.GLYPHS;
  const lab=PQ.create($('stage'),{count:2600,from:'q',to:'qoppa',still:'P',tfs:PQ.TF.filter(m=>!m.base).map(m=>m.id)});

  const tfs=$('tfs');
  PQ.TF.forEach(function(m,i){const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.className='tf'+(m.base?' base':'');b.dataset.id=m.id;
    b.innerHTML='<span class="n">'+(i<9?'0':'')+(i+1)+'</span><span class="t"></span><span class="d"></span>';
    b.querySelector('.t').textContent=m.name;b.querySelector('.d').textContent=m.d;
    b.addEventListener('click',function(){lab.state.run++;lab.set({tf:m.id,t:0,playing:true})});li.appendChild(b);tfs.appendChild(li)});

  const rail=$('rail');
  PQ.CHAIN.forEach(function(key){const b=document.createElement('button');b.type='button';b.className='chip';b.dataset.key=key;
    const c=document.createElement('canvas');c.width=92;c.height=116;c.setAttribute('aria-hidden','true');
    const n=document.createElement('b');n.textContent=G[key].label;const s=document.createElement('span');s.textContent=G[key].mean;
    b.append(c,n,s);b.addEventListener('click',function(){lab.go(key)});rail.appendChild(b);PQ.still(c,key)});

  const play=$('play'),scrub=$('scrub'),route=$('route'),note=$('note');
  function sync(tick){const s=lab.state;
    if(document.activeElement!==scrub||tick)scrub.value=Math.round(s.t*1000);
    note.style.opacity=(.25+.75*Math.sin(Math.PI*s.t)).toFixed(2);
    if(tick)return;
    play.textContent=s.playing?'Pause':'Play';
    route.innerHTML='';const a=document.createElement('b');a.textContent=G[s.a].label;const b=document.createElement('b');b.textContent=G[s.b].label;
    const name=PQ.TF.find(m=>m.id===s.tf).name;route.append(a,' → ',b,'  ·  '+name);
    note.textContent=lab.note();
    tfs.querySelectorAll('.tf').forEach(el=>el.setAttribute('aria-pressed',el.dataset.id===s.tf));
    rail.querySelectorAll('.chip').forEach(el=>{el.dataset.role=el.dataset.key===s.b?'to':el.dataset.key===s.a?'from':''});
    $('auto').checked=s.auto;$('cycle').checked=s.cycle}
  lab.onstate=sync;sync();
  play.addEventListener('click',function(){const s=lab.state;if(!s.playing&&s.t>=1)lab.set({t:0,playing:true});else lab.set({playing:!s.playing})});
  scrub.addEventListener('input',function(){lab.set({t:scrub.value/1000,playing:false})});
  $('auto').addEventListener('change',e=>lab.set({auto:e.target.checked}));
  $('cycle').addEventListener('change',e=>lab.set({cycle:e.target.checked}));
  function mode(m){lab.setMode(m);$('mDots').setAttribute('aria-pressed',m==='dots');$('mLine').setAttribute('aria-pressed',m==='line')}
  $('mDots').addEventListener('click',()=>mode('dots'));$('mLine').addEventListener('click',()=>mode('line'));
})();
