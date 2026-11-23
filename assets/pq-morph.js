/* Glyphs and transforms from Zolton’s supplied p q Transform Lab. */
(function(){
'use strict';
const PI=Math.PI,TAU=PI*2;
const lerp=(a,b,t)=>a+(b-a)*t;
const clamp=(x,a,b)=>x<a?a:x>b?b:x;
const sstep=(a,b,x)=>{x=clamp((x-a)/(b-a),0,1);return x*x*(3-2*x)};
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const plateau=(t,a,b)=>sstep(0,a,t)*(1-sstep(b,1,t));
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* ---------- stroke builders (y up, glyph fits roughly in [-1,1]) ---------- */
const L=(x0,y0,x1,y1)=>[[x0,y0],[x1,y1]];
function arc(cx,cy,r,d0,d1){const n=Math.max(8,Math.ceil(Math.abs(d1-d0)/6)),o=[];for(let k=0;k<=n;k++){const a=(d0+(d1-d0)*k/n)*PI/180;o.push([cx+r*Math.cos(a),cy+r*Math.sin(a)])}return o}
function spline(P,sub){sub=sub||12;const o=[];for(let i=0;i<P.length-1;i++){const p0=P[Math.max(i-1,0)],p1=P[i],p2=P[i+1],p3=P[Math.min(i+2,P.length-1)];for(let k=0;k<sub;k++){const t=k/sub,t2=t*t,t3=t2*t,c=[];for(let d=0;d<2;d++)c.push(.5*(2*p1[d]+(-p0[d]+p2[d])*t+(2*p0[d]-5*p1[d]+4*p2[d]-p3[d])*t2+(-p0[d]+3*p1[d]-3*p2[d]+p3[d])*t3));o.push(c)}}o.push(P[P.length-1]);return o}
const cat=function(){return [].concat.apply([],arguments)};

const GLYPHS={
  q:{label:'q',mean:'the other prime in p + q',strokes:[L(.3,.52,.3,-.95),arc(-.02,.2,.32,0,360)],gem:[.3,-.12]},
  qoppa:{label:'ϙ qoppa',mean:'the Greek letter Q grew from',strokes:[arc(0,.3,.34,-90,270),L(0,-.04,0,-.95)],gem:[0,-.04]},
  p:{label:'p',mean:'a prime; the p of p-adic',strokes:[L(-.3,.52,-.3,-.95),arc(.02,.2,.32,180,-180)],gem:[-.3,-.12]},
  rho:{label:'ρ rho',mean:'the zeros of ζ(s) are written ρ',strokes:[cat(spline([[-.37,-.95],[-.335,-.5],[-.305,-.1],[-.3,.2]]),arc(.02,.2,.32,180,-180))],gem:[-.31,-.1]},
  wp:{label:'℘',mean:'Weierstrass elliptic function',strokes:[spline([[-.1,.47],[-.27,.56],[-.41,.4],[-.38,.05],[-.3,-.4],[-.29,-.78],[-.39,-.94],[-.5,-.8],[-.42,-.48],[-.2,-.05],[.05,.35],[.26,.51],[.43,.37],[.43,.08],[.27,-.13],[.08,-.11],[.03,.06]])],gem:[-.33,-.22]},
  bbP:{label:'ℙ',mean:'the set of primes; projective space',strokes:[L(-.36,-.85,-.36,.85),L(-.17,-.85,-.17,.85),cat(L(-.36,.85,.08,.85),arc(.08,.42,.43,90,-90),L(.08,-.01,-.17,-.01)),L(-.45,-.85,-.08,-.85)],gem:[-.265,-.01]},
  P:{label:'P',mean:'solvable in polynomial time',strokes:[L(-.3,-.85,-.3,.85),cat(L(-.3,.85,.08,.85),arc(.08,.42,.43,90,-90),L(.08,-.01,-.3,-.01))],gem:[-.3,-.01]},
  NP:{label:'NP',mean:'checkable in polynomial time',strokes:[L(-.86,-.7,-.86,.7),L(-.86,.7,-.32,-.7),L(-.32,-.7,-.32,.7),L(.02,-.7,.02,.7),cat(L(.02,.7,.34,.7),arc(.34,.35,.35,90,-90),L(.34,0,.02,0))],gem:[.02,0]},
  qm:{label:'?',mean:'P ≟ NP, still open',strokes:[spline(cat(arc(0,.44,.36,165,-48),[[.1,.02],[.01,-.12],[0,-.36]]),6),arc(0,-.76,.055,0,360)],gem:[0,-.76]}
};
const CHAIN=['q','qoppa','p','rho','wp','bbP','P','NP','qm'];

/* ---------- arc-length parametrisation ---------- */
function buildPath(strokes){const segs=[];let total=0;strokes.forEach(function(st,sid){for(let i=0;i<st.length-1;i++){const a=st[i],b=st[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<1e-9)continue;segs.push({a:a,b:b,len:len,start:total,sid:sid});total+=len}});return{segs:segs,total:total}}
function pathAt(path,u,o){const segs=path.segs,d=u*path.total;let lo=0,hi=segs.length-1;while(lo<hi){const m=(lo+hi+1)>>1;if(segs[m].start<=d)lo=m;else hi=m-1}const s=segs[lo],f=clamp((d-s.start)/s.len,0,1),dx=(s.b[0]-s.a[0])/s.len,dy=(s.b[1]-s.a[1])/s.len;o[0]=s.a[0]+(s.b[0]-s.a[0])*f;o[1]=s.a[1]+(s.b[1]-s.a[1])*f;o[2]=-dy;o[3]=dx;o[4]=s.sid}

const M=256, COS=new Float32Array(M), SIN=new Float32Array(M);
for(let k=0;k<M;k++){COS[k]=Math.cos(TAU*k/M);SIN[k]=Math.sin(TAU*k/M)}
Object.keys(GLYPHS).forEach(function(key){
  const g=GLYPHS[key];g.path=buildPath(g.strokes);
  const cx=new Float32Array(M),cy=new Float32Array(M),o=[0,0,0,0,0];
  for(let j=0;j<M;j++){pathAt(g.path,(j+.5)/M,o);cx[j]=o[0];cy[j]=o[1]}
  const re=new Float32Array(M),im=new Float32Array(M);
  for(let k=0;k<M;k++){let a=0,b=0;for(let j=0;j<M;j++){const q=(j*k)%M;a+=cx[j]*COS[q]+cy[j]*SIN[q];b+=cy[j]*COS[q]-cx[j]*SIN[q]}re[k]=a/M;im[k]=b/M}
  g.re=re;g.im=im;
});

/* ---------- number-theory tables ---------- */
const SMAX=12000,COMP=new Uint8Array(SMAX+1);COMP[0]=COMP[1]=1;
for(let i=2;i*i<=SMAX;i++)if(!COMP[i])for(let j=i*i;j<=SMAX;j+=i)COMP[j]=1;
const isPrime=n=>n>=2&&n<=SMAX&&!COMP[n];
const gcd=(a,b)=>b?gcd(b,a%b):a;
const RES=[];for(let r=1;r<210;r++)if(gcd(r,210)===1)RES.push(r);          /* 48 admissible remainders */
const KEEP=new Uint8Array(M);for(let k=0;k<M;k++){const f=k<=M/2?k:M-k;KEEP[k]=(f<=1||(isPrime(f)&&f<=13))?1:0}
function collatz(n){const a=[Math.log2(n)];let peak=n;while(n!==1){n=n%2?3*n+1:n/2;if(n>peak)peak=n;a.push(Math.log2(n))}return{log:Float32Array.from(a),steps:a.length-1,peak:peak}}
const HN=400,HAIL=[];let HMAX=1;for(let n=3;n<3+HN;n++){const c=collatz(n);HAIL.push(c);if(c.steps>HMAX)HMAX=c.steps}
const C27=collatz(27);
function goldbach(E){let ways=0,first=null;for(let a=2;a<=E/2;a++)if(isPrime(a)&&isPrime(E-a)){ways++;if(!first)first=a}return{E:E,p:first,q:E-first,ways:ways}}
const EVENS=[210,128,98,68,992,30,1000],KNOTS=[[2,3],[3,5],[5,7],[2,5],[3,7]];

const TF_META=[
  {id:'flip',name:'Flip',base:true,d:'A rigid half-turn about the stem, swapping letters edge-on. p, q, b and d are one shape under these symmetries. This is what the clip does.'},
  {id:'sphere',name:'Riemann sphere',d:'Use stereographic coordinates to lift the stroke onto a sphere. Turn the sphere and view the moving outline on the page.'},
  {id:'knot',name:'(p, q) torus knot',d:'The stroke unwinds into a torus knot that goes p times around the axis and q times through the hole, for a coprime pair of primes, then rewinds as the next letter.'},
  {id:'ulam',name:'Ulam sieve',d:'Particle n walks to cell n of the square spiral. Composites fade out, primes stay lit along their diagonals, then everything reflows.'},
  {id:'goldbach',name:'Goldbach split',d:'The letter divides into a small p and a small q that fuse again: one even number written as a sum of two primes.'},
  {id:'wheel',name:'Wheel mod 210',d:'Particles settle on the 48 spokes coprime to 210 = 2·3·5·7. Every prime above 7 lives on one of them.'},
  {id:'fold',name:'Origami packet',d:'Three creases fold the letter into a packet eight layers deep. The packet is exchanged and unfolds as the next letter.'},
  {id:'hail',name:'Collatz hailstones',d:'Each particle carries an integer and rides its 3n + 1 orbit up and down. Integers with long stopping times land last.'},
  {id:'fourier',name:'Prime harmonics',d:'The stroke is a Fourier series. Mid-morph every harmonic is muted except the fundamental and the prime frequencies 2 to 13, leaving a prime-only skeleton.'}
];

function create(canvas,opt){
  opt=opt||{};
  let mode=opt.mode||'dots';
  const N=opt.count||2600, R=rng(11);
  const W=new Float32Array(N+1),Z=new Float32Array(N+1),RD=new Float32Array(N+1),U=new Float32Array(N+1);
  for(let i=0;i<N;i++){W[i]=R()*2-1;Z[i]=(R()*2-1)*.055;RD[i]=R();U[i]=(i+.5)/N}
  U[N]=.5;
  const col=new Array(N+1),STOPS=[[40,76,173],[20,128,197],[128,84,181],[205,72,140],[224,138,46]];
  for(let i=0;i<=N;i++){const x=U[i]*(STOPS.length-1),k=Math.min(STOPS.length-2,x|0),f=x-k,a=STOPS[k],b=STOPS[k+1];col[i]='rgb('+Math.round(lerp(a[0],b[0],f))+','+Math.round(lerp(a[1],b[1],f))+','+Math.round(lerp(a[2],b[2],f))+')'}

  /* glyph samples: thick (dots) and thin (line) versions cached separately */
  const cache={};
  function sample(key,half){
    const id=key+'|'+half;if(cache[id])return cache[id];
    const g=GLYPHS[key],x=new Float32Array(N+1),y=new Float32Array(N+1),cx=new Float32Array(N+1),cy=new Float32Array(N+1),sid=new Uint8Array(N+1),o=[0,0,0,0,0];
    for(let i=0;i<N;i++){pathAt(g.path,U[i],o);cx[i]=o[0];cy[i]=o[1];x[i]=o[0]+o[2]*W[i]*half;y[i]=o[1]+o[3]*W[i]*half;sid[i]=o[4]}
    x[N]=cx[N]=g.gem[0];y[N]=cy[N]=g.gem[1];
    return cache[id]={x:x,y:y,cx:cx,cy:cy,sid:sid};
  }
  /* Ulam spiral coordinates for n = 1..N+1 */
  const side=Math.ceil(Math.sqrt(N+1)),usc=1.72/side,UX=new Float32Array(N+1),UY=new Float32Array(N+1);
  (function(){let x=0,y=0,dx=1,dy=0,run=1,done=0,turns=0;for(let i=0;i<=N;i++){UX[i]=x*usc;UY[i]=y*usc;x+=dx;y+=dy;if(++done===run){done=0;const t=dx;dx=-dy;dy=t;if(++turns%2===0)run++}}})();
  let primeCount=0;for(let n=2;n<=N;n++)if(isPrime(n))primeCount++;
  const rings=Math.ceil(N/RES.length);

  const st={a:opt.from||'q',b:opt.to||'p',tf:(opt.tfs&&opt.tfs[0])||'sphere',t:0,playing:true,auto:true,cycle:true,run:0};
  const tfList=opt.tfs||TF_META.map(m=>m.id);
  st.playing=opt.playing??true; st.auto=opt.auto??true;
  const dur=opt.dur||3.6,hold=opt.hold||.9;
  let A,B,gp,gq,holdT=0;
  function refresh(){const h=mode==='line'?0:.07;A=sample(st.a,h);B=sample(st.b,h);gp=sample('p',h);gq=sample('q',h)}
  const rx=new Float32Array(M),ry=new Float32Array(M),cr=new Float32Array(M),ci=new Float32Array(M);

  /* ---------- transforms: write x,y,z,alpha,hot into o ---------- */
  const T={
    flip:{at(i,t,o){const th=PI*ease(t);if(th<PI/2){o[0]=A.x[i]*Math.cos(th);o[2]=A.x[i]*Math.sin(th)+Z[i];o[1]=A.y[i]}else{const h=th-PI;o[0]=B.x[i]*Math.cos(h);o[2]=B.x[i]*Math.sin(h)+Z[i];o[1]=B.y[i]}o[3]=1;o[4]=0},
      note(){return 'V₄ = {1, ↔, ↕, ↻}'}},
    sphere:{at(i,t,o){const s=plateau(t,.28,.72),e=sstep(.2,.8,t),x=lerp(A.x[i],B.x[i],e),y=lerp(A.y[i],B.y[i],e),X=x*1.15,Y=y*1.15,r2=X*X+Y*Y,d=1+r2;
        let sx=2*X/d*.84,sy=2*Y/d*.84,sz=(1-r2)/d*.84;
        const ang=TAU*sstep(.1,.9,t),c=Math.cos(ang),sn=Math.sin(ang),kx=.33,ky=.925,kz=.19,dot=kx*sx+ky*sy+kz*sz;
        const qx=sx*c+(ky*sz-kz*sy)*sn+kx*dot*(1-c),qy=sy*c+(kz*sx-kx*sz)*sn+ky*dot*(1-c),qz=sz*c+(kx*sy-ky*sx)*sn+kz*dot*(1-c);
        o[0]=lerp(x,qx,s);o[1]=lerp(y,qy,s);o[2]=lerp(Z[i],qz,s);o[3]=1;o[4]=0},
      deco(t,cx,cy,S){const s=plateau(t,.28,.72);if(s<.02)return;ctx.globalAlpha=.3*s;ctx.strokeStyle='#8a97b8';ctx.lineWidth=Math.max(1,S/260);const r=.84*S;
        for(let k=0;k<4;k++){ctx.beginPath();ctx.ellipse(cx,cy,r*Math.abs(Math.cos(k*PI/4+TAU*sstep(.1,.9,t)/2)),r,0,0,TAU);ctx.stroke()}
        ctx.beginPath();ctx.ellipse(cx,cy,r,r*.28,0,0,TAU);ctx.stroke()},
      note(){return 'z ↦ (az + b) / (cz + d)'}},
    knot:{at(i,t,o){const k=KNOTS[st.run%KNOTS.length],p=k[0],q=k[1],s=plateau(t,.34,.66),e=sstep(.3,.7,t),ph=TAU*(U[i]+.12*t),r=.24+W[i]*.028,rr=.66+r*Math.cos(q*ph);
        let x=rr*Math.cos(p*ph),y=rr*Math.sin(p*ph),z=r*Math.sin(q*ph);
        const tl=.5+.3*Math.sin(TAU*t),c1=Math.cos(tl),s1=Math.sin(tl);let y2=y*c1-z*s1,z2=y*s1+z*c1;
        const a2=.5*Math.sin(TAU*t),c2=Math.cos(a2),s2=Math.sin(a2),x3=x*c2+z2*s2,z3=-x*s2+z2*c2;
        o[0]=lerp(lerp(A.x[i],B.x[i],e),x3,s);o[1]=lerp(lerp(A.y[i],B.y[i],e),y2,s);o[2]=lerp(Z[i],z3,s);o[3]=1;o[4]=0},
      note(){const k=KNOTS[st.run%KNOTS.length];return 'T('+k[0]+', '+k[1]+')'+(k[0]===2&&k[1]===3?'  the trefoil':'')}},
    ulam:{at(i,t,o){const s=plateau(t,.32,.68),e=sstep(.3,.7,t),pr=isPrime(i+1);
        o[0]=lerp(lerp(A.x[i],B.x[i],e),UX[i],s);o[1]=lerp(lerp(A.y[i],B.y[i],e),UY[i],s);o[2]=lerp(Z[i],pr?.12:0,s);o[3]=pr?1:1-.9*s;o[4]=pr?s:0},
      note(){return 'π('+N+') = '+primeCount}},
    goldbach:{at(i,t,o){const s=plateau(t,.3,.7),e=sstep(.3,.7,t),g=(i&1)?gq:gp,off=(i&1)?.5:-.5;
        o[0]=lerp(lerp(A.x[i],B.x[i],e),g.x[i]*.56+off,s);o[1]=lerp(lerp(A.y[i],B.y[i],e),g.y[i]*.56+.12,s);o[2]=Z[i];o[3]=1;o[4]=0},
      note(){const g=goldbach(EVENS[st.run%EVENS.length]);return g.E+' = '+g.p+' + '+g.q+'   ('+g.ways+' ways)'}},
    wheel:{at(i,t,o){const s=plateau(t,.32,.68),e=sstep(.3,.7,t),j=i%RES.length,k=(i/RES.length)|0,a=TAU*RES[j]/210+TAU*.2*t,rad=.13+.83*k/rings;
        const x=rad*Math.cos(a),y0=rad*Math.sin(a),tl=.95*s,y=y0*Math.cos(tl),z=y0*Math.sin(tl);
        o[0]=lerp(lerp(A.x[i],B.x[i],e),x,s);o[1]=lerp(lerp(A.y[i],B.y[i],e),y,s);o[2]=lerp(Z[i],z,s);o[3]=1;o[4]=0},
      note(){return 'φ(210) = '+RES.length+' spokes'}},
    fold:{at(i,t,o){const f=t<.5?sstep(0,.42,t):1-sstep(.58,1,t),m=sstep(.42,.58,t);
        let x=lerp(A.x[i],B.x[i],m),y=lerp(A.y[i],B.y[i],m),z=Z[i]*.4;
        const t1=PI*.985*clamp(f*3,0,1),t2=PI*.985*clamp(f*3-1,0,1),t3=PI*.985*clamp(f*3-2,0,1);
        if(x>0){const c=Math.cos(t1),s=Math.sin(t1),nx=x*c-z*s;z=x*s+z*c;x=nx}
        if(y>0){const c=Math.cos(t2),s=Math.sin(t2),ny=y*c-z*s;z=y*s+z*c;y=ny}
        let yy=y+.5;if(yy<0){const c=Math.cos(t3),s=Math.sin(t3),ny=yy*c+z*s;z=-yy*s+z*c;yy=ny}
        o[0]=x+.25*f;o[1]=yy-.5+.25*f;o[2]=z;o[3]=1;o[4]=0},
      note(){return '3 creases → 2³ = 8 layers'}},
    hail:{at(i,t,o){const h=HAIL[(i*37)%HN],lag=.3*h.steps/HMAX,tt=clamp((t-lag)/(1-.3),0,1),e=ease(tt),p=tt*h.steps,k=Math.min(h.steps-1,p|0),v=lerp(h.log[k],h.log[k+1],p-k),dev=(v-lerp(h.log[0],0,tt))/9;
        o[0]=lerp(A.x[i],B.x[i],e)+(RD[i]-.5)*.5*dev*Math.sin(PI*tt);o[1]=lerp(A.y[i],B.y[i],e)+dev*.62*Math.sin(PI*tt);o[2]=Z[i];o[3]=1;o[4]=0},
      note(){return '27: '+C27.steps+' steps, peak '+C27.peak}},
    fourier:{begin(t){const e=ease(t),s=plateau(t,.34,.66),ga=GLYPHS[st.a],gb=GLYPHS[st.b];
        for(let k=0;k<M;k++){const g=KEEP[k]?1:1-s;cr[k]=lerp(ga.re[k],gb.re[k],e)*g;ci[k]=lerp(ga.im[k],gb.im[k],e)*g}
        for(let j=0;j<M;j++){let a=0,b=0;for(let k=0;k<M;k++){const q=(j*k)%M;a+=cr[k]*COS[q]-ci[k]*SIN[q];b+=cr[k]*SIN[q]+ci[k]*COS[q]}rx[j]=a;ry[j]=b}},
      at(i,t,o){const e=ease(t);let x,y;
        if(i===N){x=lerp(A.x[i],B.x[i],e);y=lerp(A.y[i],B.y[i],e)}
        else{const p=U[i]*M-.5,k=Math.floor(p),f=p-k,k0=(k+M)%M,k1=(k+1)%M;
          x=lerp(rx[k0],rx[k1],f)+lerp(A.x[i]-A.cx[i],B.x[i]-B.cx[i],e);y=lerp(ry[k0],ry[k1],f)+lerp(A.y[i]-A.cy[i],B.y[i]-B.cy[i],e)}
        o[0]=x;o[1]=y;o[2]=Z[i];o[3]=1;o[4]=0},
      note(){return 'k ∈ {1, 2, 3, 5, 7, 11, 13}'}}
  };

  /* ---------- drawing ---------- */
  const ctx=canvas.getContext('2d');let w=0,h=0,dpr=1;
  function size(){const r=canvas.getBoundingClientRect();dpr=Math.min(window.devicePixelRatio||1,2);w=Math.max(1,Math.round(r.width*dpr));h=Math.max(1,Math.round(r.height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}}
  const o=[0,0,0,1,0],D=5;
  function gem(px,py,rad){ctx.globalAlpha=1;ctx.beginPath();for(let k=0;k<6;k++){const a=TAU*k/6+PI/6;ctx[k?'lineTo':'moveTo'](px+rad*Math.cos(a),py+rad*Math.sin(a))}ctx.closePath();
    const g=ctx.createRadialGradient(px-rad*.3,py-rad*.35,rad*.1,px,py,rad);g.addColorStop(0,'#ffe2a6');g.addColorStop(.45,'#f58a1c');g.addColorStop(1,'#4e2397');ctx.fillStyle=g;ctx.fill();ctx.lineWidth=Math.max(1,rad*.22);ctx.strokeStyle='#c4cad6';ctx.stroke()}
  function draw(now){
    size();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);
    const tf=T[st.tf],t=st.t,S=Math.min(w,h)*(mode==='line'?.44:.4),cx0=w/2,cy0=h/2;
    if(tf.begin)tf.begin(t);
    const yaw=mode==='line'?0:.2*Math.sin(now/2600),cyw=Math.cos(yaw),syw=Math.sin(yaw);
    let gx=0,gy=0,gs=1;
    if(mode==='line'){
      const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#284cad');grad.addColorStop(1,'#8054b5');
      ctx.strokeStyle=grad;ctx.lineWidth=Math.max(1.4*dpr,Math.min(w,h)*.062);ctx.lineCap='round';ctx.lineJoin='round';ctx.globalAlpha=1;ctx.beginPath();
      const ref=t<.5?A.sid:B.sid;let pen=false;
      for(let i=0;i<=N;i++){tf.at(i,t,o);const ps=D/(D-o[2]),px=cx0+o[0]*ps*S,py=cy0-o[1]*ps*S;
        if(i===N){gx=px;gy=py;gs=ps;break}
        if(pen&&ref[i]===ref[i-1])ctx.lineTo(px,py);else{ctx.moveTo(px,py);ctx.lineTo(px+.01,py)}pen=true}
      ctx.stroke();gem(gx,gy,Math.min(w,h)*.075*gs);
    }else{
      const g=ctx.createRadialGradient(cx0,cy0+S*1.06,0,cx0,cy0+S*1.06,S*.9);g.addColorStop(0,'rgba(24,36,58,.11)');g.addColorStop(1,'rgba(24,36,58,0)');
      ctx.save();ctx.translate(0,cy0+S*1.06);ctx.scale(1,.16);ctx.translate(0,-(cy0+S*1.06));ctx.fillStyle=g;ctx.fillRect(0,0,w,h*8);ctx.restore();
      if(tf.deco)tf.deco(t,cx0,cy0,S);
      const unit=S/250;
      for(let i=0;i<=N;i++){tf.at(i,t,o);const x=o[0]*cyw+o[2]*syw,z=-o[0]*syw+o[2]*cyw,ps=D/(D-z),px=cx0+x*ps*S,py=cy0-o[1]*ps*S;
        if(i===N){gx=px;gy=py;gs=ps;break}
        const sz=(1.25+RD[i]*1.2)*ps*unit*(1+o[4]*.9);
        ctx.globalAlpha=o[3]*clamp(.62+z*.9,.25,1);ctx.fillStyle=o[4]>.5?'#6c33cf':col[i];
        if(sz<2.4)ctx.fillRect(px-sz/2,py-sz/2,sz,sz);else{ctx.beginPath();ctx.arc(px,py,sz/2,0,TAU);ctx.fill()}}
      gem(gx,gy,S*.04*gs);
    }
  }

  /* ---------- clock ---------- */
  const api={state:st,meta:TF_META,onstate:null,
    note(){return T[st.tf].note()},
    set(p){Object.assign(st,p);if('a' in p||'b' in p)refresh();if(p.t===0)holdT=0;if(api.onstate)api.onstate();requestDraw()},
    setMode(m){mode=m;refresh();requestDraw()},
    shown(){return st.t<.5?st.a:st.b},
    go(to){const from=api.shown();st.run++;api.set({a:from,b:to,t:0,playing:true});holdT=0}};
  function step(){const i=CHAIN.indexOf(st.b),next=CHAIN[(i+1)%CHAIN.length];st.run++;
    const p={a:st.b,b:next,t:0};if(st.cycle){p.tf=tfList[(tfList.indexOf(st.tf)+1)%tfList.length]}api.set(p)}
  let last=0, pending=0;
  function requestDraw(){if(!pending)pending=requestAnimationFrame(frame)}
  function frame(now){
    pending=0;
    const dt=last ? Math.min(.05,(now-last)/1000) : 0;
    last=now;
    if(st.playing){if(st.t<1){st.t=Math.min(1,st.t+dt/dur);if(api.onstate)api.onstate(true)}
      else{holdT+=dt;if(holdT>hold){holdT=0;if(st.auto)step();else{st.playing=false;if(api.onstate)api.onstate()}}}}
    draw(now);
    if(st.playing)requestDraw();else last=0;
  }
  refresh();
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){st.playing=false;st.a=st.b=opt.still||opt.from||'P';st.t=0;refresh()}
  requestDraw();
  if (typeof ResizeObserver === 'function') new ResizeObserver(requestDraw).observe(canvas);
  return api;
}
function still(canvas,key){return create(canvas,{mode:'line',count:220,from:key,to:key,tfs:['flip'],playing:false,auto:false})}
window.PQ={create:create,still:still,GLYPHS:GLYPHS,CHAIN:CHAIN,TF:TF_META};
})();
