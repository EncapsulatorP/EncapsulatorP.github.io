'use strict';
// Independent finite checks of the arithmetic behind the interactive rooms.
const assert = require('node:assert/strict');
const rooms = require('../assets/treasure-rooms.js');
const goldbach = require('../assets/goldbach-lab.js');
const cabinet = require('../assets/curious-cabinet.js');
const isPrime = n => { if (n < 2) return false; for (let d=2; d*d<=n; d++) if(n%d===0) return false; return true; };
const near = (a,b,t=1e-10) => assert.ok(Math.abs(a-b)<=t, `${a} differs from ${b}`);
let count=0;
for(let n=4;n<=2600;n+=2){
  const expected=[];for(let p=2;p<=n/2;p++)if(isPrime(p)&&isPrime(n-p))expected.push([p,n-p]);
  const pairs=goldbach.pairsFor(n);count+=pairs.length;
  assert.deepEqual(pairs.map(p=>[p.p,p.q]),expected);
  for(const p of pairs){assert.equal(p.product,p.m*p.m-p.d*p.d);assert.equal(p.mu,p.p===p.q?0:1);}
}
assert.equal(count,41501);
assert.deepEqual(goldbach.pairsFor(4).map(p=>[p.p,p.q,p.mu]),[[2,2,0]]);
assert.deepEqual(goldbach.pairsFor(10).map(p=>[p.p,p.q,p.mu]),[[3,7,1],[5,5,0]]);
for(const n of [0,3,5,2602,NaN,100.5])assert.throws(()=>goldbach.pairsFor(n),RangeError);
console.log('Goldbach: 1,299 sums and 41,501 pairs match independent trial division.');
for(let m=3;m<=200;m++){
  const v=rooms.squareNeighbour(m);
  assert.equal(v.twin,isPrime(m-1)&&isPrime(m+1));
  assert.equal(v.omega===2,v.twin);
  assert.equal(v.factors.reduce((a,b)=>a*b,1),m*m-1);
}
const four=rooms.squareNeighbour(34);assert.equal(four.omega,4);assert.equal(four.mu,1);assert.equal(four.twin,false);
const flight=rooms.collatz(27);assert.equal(flight.path.length-1,111);assert.equal(Math.max(...flight.path),9232);assert.equal(flight.path.at(-1),1);
assert.deepEqual(rooms.collatz(1).path,[1]);
for(const seed of [7,97,871,6171,1000000]){
  const actual=rooms.collatz(seed);let n=BigInt(seed);
  for(const value of actual.path){assert.equal(BigInt(value),n);n=n%2n===0n?n/2n:3n*n+1n;}
}
for(let j=0;j<=7;j++)for(let a=0;a<=360;a+=3){const v=rooms.shapiro(j,a*Math.PI/180);near(v.p+v.q,2**(j+1),1e-10);}
console.log('Existing treasures: twin criterion, BigInt Collatz cross-check and circle-energy identity pass.');
for(const sigma of [.25,.5,1,2,3])for(const t of [-20,-6,0,6,20]){
  const w=cabinet.diskPoint(sigma,t), s=cabinet.inverseDisk(w.re,w.im);
  near(s.re,sigma);near(s.im,t);near(w.magnitude**2,((sigma-2)**2+t*t)/((sigma+1)**2+t*t));
}
assert.equal(cabinet.diskPoint(2,0).magnitude,0);
for(const t of cabinet.zeros)near(cabinet.diskPoint(.5,t).magnitude,1,1e-14);
assert.throws(()=>cabinet.diskPoint(-1,0),RangeError);
assert.throws(()=>cabinet.inverseDisk(1,0),RangeError);
for(const seed of [.01,.17,.37,.63,.99])for(const r of [2.8,3.445,3.98]){
  const merge=cabinet.orbit('merge',r,seed,0,48);
  near(merge[1].x,merge[1].y,1e-14);
  const mirror=cabinet.orbit('mirror',r,seed,0,1);
  near(mirror[1].x+mirror[1].y,1,1e-14);
  for(const delta of [-.02,0,.02]){
    const split=cabinet.orbit('split',r,seed,delta,48);
    near(Math.abs(split[1].x-split[1].y),Math.abs(delta)*seed*(1-seed),1e-14);
    for(const v of split){assert.ok(v.x>=0&&v.x<=1&&v.y>=0&&v.y<=1);}
  }
}
assert.ok(3.445<cabinet.flip && 3.445+.0073>cabinet.flip);
console.log('Cabinet: inverse coordinates, boundary, conjugacy and parameter-gap checks pass.');
console.log('These finite checks do not establish the open conjectures discussed by the site.');
