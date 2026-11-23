/* Run as `node atlas/verify_reader.cjs` after copying the helper to
 * atlas/tests/reader-dom.cjs. No browser is launched.
 * Requires @napi-rs/canvas; the supplied runtime is also recognized.
 */
const fs=require('fs'),path=require('path'),assert=require('assert');
const ATLAS=process.env.ATLAS_SOURCE_DIR||__dirname;
const ASSETS=process.env.ATLAS_ASSET_DIR||path.join(ATLAS,'..','assets');
const HELPER=process.env.ATLAS_DOM_HELPER||path.join(ATLAS,'tests','reader-dom.cjs');
const A=require(path.join(ASSETS,'atlas-reveal.js')),G=require(path.join(ASSETS,'atlas-gif.js'));
let canvas;try{canvas=require('@napi-rs/canvas')}catch{canvas=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'', '@napi-rs/canvas'))}
const {createCanvas,loadImage}=canvas,{runDomChecks}=require(HELPER);
const readConfig=file=>{const html=fs.readFileSync(file,'utf8'),match=html.match(/<script[^>]*id="reader-config"[^>]*>([\s\S]*?)<\/script>/);assert(match,'reader-config missing: '+file);return JSON.parse(match[1])};
const checks=[];function pass(name,detail){checks.push({name,status:'PASS',detail});console.log('PASS '+name+(detail?' — '+detail:''))}
(async()=>{
 const entryFiles=fs.readdirSync(path.join(ATLAS,'entries')).filter(n=>n.endsWith('.html'));assert.equal(entryFiles.length,46,'The current atlas must retain all 46 entry pages.');
 let blocks=0,pages=0;
 for(const name of entryFiles){const config=readConfig(path.join(ATLAS,'entries',name)),plan=A.buildGifPlan(config,{createCanvas,readHoldMs:3500,readPerWordMs:0});assert.equal(plan.inputBlockCount,config.gifBlocks.filter(b=>String(b.text||'').trim()||b.image).length);blocks+=plan.inputBlockCount;pages+=plan.pages.length;for(const page of plan.pages)for(const chunk of page.chunks){assert(chunk.y+chunk.height<=plan.height-plan.padding-plan.footerHeight+.1);if(A.evidenceKind(chunk.status)==='neutral')assert.equal(chunk.kind,'neutral')}}
 pass('Real 46-entry GIF pagination retains every block',blocks+' blocks across '+pages+' bounded pages');
 const full=readConfig(path.join(ATLAS,'README.html')),plan=A.buildGifPlan(full,{createCanvas,readHoldMs:3500,readPerWordMs:0});assert.equal(plan.inputBlockCount,full.gifBlocks.filter(b=>String(b.text||'').trim()||b.image).length);for(const coverage of plan.coverage){let end=0;for(const part of coverage.parts){assert.equal(part.start,end);end=part.end}assert.equal(end,coverage.words)}pass('Full atlas GIF has contiguous complete coverage',plan.inputBlockCount+' blocks, '+plan.pages.length+' pages');
 assert(['exploratory','conjectural','conditional','numerical'].every(s=>A.evidenceKind(s)==='neutral'));assert(!fs.readFileSync(path.join(ASSETS,'atlas-reveal.js'),'utf8').includes('Math.random'));pass('Evidence classification is deterministic and uncertainty stays neutral');
 const tower=readConfig(path.join(ATLAS,'proofs','alternating-towers.html')),trap=readConfig(path.join(ATLAS,'traps','logistic-global-identity.html'));
 const authentic=tower.passages.filter(p=>p.zyntalic),falsePassage=trap.passages.find(p=>p.zyntalic);assert(authentic.length>=2);assert(falsePassage);
 for(const result of runDomChecks(A,authentic,falsePassage))pass(result.name);
 const abort=new AbortController();let encoded=0;await assert.rejects(A.exportGifData(full,{createCanvas,readHoldMs:3500,readPerWordMs:0,signal:abort.signal,onProgress:p=>{if(p.phase==='encoding'){encoded=p.frame;if(p.frame===2)abort.abort()}}}),e=>e.name==='AbortError');assert.equal(encoded,2);pass('Actual full-atlas export cancels promptly without producing a partial download');
 const palette=G.rgb332();let seed=0x12345678;
 for(let frame=0;frame<3;frame++){
  const width=113,height=79,indices=new Uint8Array(width*height);for(let i=0;i<indices.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;indices[i]=frame===0?seed>>>24:frame===1?i%256:255}
  const encoder=new G.Encoder(width,height,{palette});encoder.addFrame(indices);const bytes=encoder.finish();assert.equal(Buffer.from(bytes.slice(0,6)).toString(),'GIF89a');const image=await loadImage(Buffer.from(bytes)),surface=createCanvas(width,height),ctx=surface.getContext('2d');ctx.drawImage(image,0,0);const rgba=ctx.getImageData(0,0,width,height).data;
  for(let i=0;i<indices.length;i++)for(let c=0;c<3;c++)assert.equal(rgba[i*4+c],palette[indices[i]*3+c]);
 }
 pass('Independent native GIF decoder reproduces every indexed test pixel','random/dictionary reset, palette ramp and solid frame');
 console.log('Reader verification complete: '+checks.length+' checks; no browser used.');
})().catch(error=>{console.error('FAIL '+error.stack);process.exitCode=1});
