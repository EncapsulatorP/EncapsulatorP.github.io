/* Atlas reading/reveal engine and complete-entry local GIF export.
 * Browser and Node Canvas use the same pure layout and frame renderer.
 * Ordinary source HTML remains complete when JavaScript is unavailable.
 */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./atlas-gif.js'));
  else {
    root.AtlasReveal=factory(root.AtlasGif);
    const source = document.currentScript?.src;
    if (source && document.querySelector('.reader-header .reader-brand')) {
      const wordmark = document.createElement('script');
      wordmark.src = new URL('pq-wordmark.js?v=blue-violet-1', source);
      document.head.append(wordmark);
    }
  }
})(typeof globalThis==='object'?globalThis:this,function(Gif){
  'use strict';
  const COOL=[[0,'#284cad'],[.24,'#1480c5'],[.46,'#078b9e'],[.69,'#5d65c7'],[.95,'#8054b5'],[1,'#6c9e95']];
  const DULL=[[0,'#65717c'],[.35,'#827481'],[.7,'#887a75'],[1,'#706679']];
  // This alphabet is a transient visual mask, never an asserted translation.
  // Authentic prose endpoints come only from config.passages[].zyntalic.
  const MASK_ALPHABET=Array.from('ƶʑƿʒʐƛɣʃɷɱʉɨɲʄʍɸʁɯɤ');
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const smooth=n=>{n=clamp(n);return n*n*(3-2*n)};
  const normalize=s=>String(s??'').replace(/\s+/gu,' ').trim();
  const words=s=>normalize(s).split(' ').filter(Boolean);
  const blockTokens=b=>b.type==='math'&&!b.image?String(b.text||'').replace(/\r\n?/g,'\n').split(/(\n)/).flatMap(s=>s==='\n'?['\n']:words(s)):words(b.text);
  const hex=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));
  const rgb=a=>'rgb('+a.map(Math.round).join(',')+')';
  const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
  function evidenceKind(status){const s=String(status||'').toLowerCase();if(['exact','proved','proven','proof','treasure','theorem'].includes(s))return'treasure';if(['false','trap','refuted','disproved'].includes(s))return'trap';return'neutral'}
  function evidenceLabel(s){return {exact:'Exact result',proved:'Proved result',proven:'Proved result',proof:'Proof',theorem:'Theorem',false:'Refuted extension',refuted:'Refuted extension',disproved:'Disproved claim',trap:'Scope trap',exploratory:'Exploratory',conjectural:'Conjectural',conditional:'Conditional',collection:'Evidence collection',numerical:'Numerical observation'}[String(s||'').toLowerCase()]||String(s||'Evidence note')}
  // Statuses whose English is shown as plain text, never masked: proved/exact results, finite
  // and numerical computations, asymptotics, reviews of them, and refuted claims (folded instead).
  const PLAIN_STATUSES=new Set(['exact','proved','proven','proof','theorem','treasure','finite','numerical','asymptotic','conditional','review','reference','collection','false','trap','refuted','disproved']);
  function isPlainStatus(status){return PLAIN_STATUSES.has(String(status||'').toLowerCase())}
  function colourAt(fraction,kind='treasure'){const stops=kind==='treasure'?COOL:DULL,t=clamp(fraction);for(let i=1;i<stops.length;i++)if(t<=stops[i][0])return mix(hex(stops[i-1][1]),hex(stops[i][1]),(t-stops[i-1][0])/(stops[i][0]-stops[i-1][0]));return hex(stops.at(-1)[1])}
  function hash(value){value|=0;value=Math.imul(value^(value>>>16),0x45d9f3b);value=Math.imul(value^(value>>>16),0x45d9f3b);return(value^(value>>>16))>>>0}
  function seedFor(s){let n=2166136261;for(const c of String(s))n=hash(n+c.codePointAt(0));return n}
  function visualMask(text,seed=1){return Array.from(String(text)).map((c,i)=>/\s/u.test(c)?c:MASK_ALPHABET[hash(seed+i*977)%MASK_ALPHABET.length]).join('')}
  function morphText(source,target,progress,tick=0,seed=1){
    const p=clamp(progress);if(p===0)return String(source);if(p===1)return String(target);
    const from=Array.from(source),to=Array.from(target),pool=from.filter(c=>/\p{L}/u.test(c)),length=Math.max(from.length,to.length),out=[];
    for(let i=0;i<length;i++){const h=hash(seed+i*977),begin=.43*(i/Math.max(1,length))+.1*(h%1000)/1000,end=Math.min(.99,begin+.3+.13*((h>>>10)%1000)/1000);if(p<begin)out.push(from[i]||'');else if(p>=end)out.push(to[i]||'');else{const c=to[i]||from[i]||'';out.push(/\s/u.test(c)||!(/\p{L}/u.test(c))?c:(pool.length?pool[hash(h+tick*331)%pool.length]:c))}}
    return out.join('');
  }
  function makePalette(logoColours=[]){
    const out=[];for(let i=0;i<32;i++)out.push(...Array(3).fill(Math.round(i*255/31)));
    for(const kind of ['treasure','trap'])for(let h=0;h<16;h++)for(const alpha of [1,.7,.4,.15])out.push(...mix([255,255,255],colourAt(h/15,kind),alpha).map(Math.round));
    for(const colour of logoColours.slice(0,96))out.push(...colour);
    while(out.length<768)out.push(255,255,255);return new Uint8Array(out.slice(0,768));
  }
  function logoPalette(image,make){
    if(!image)return[];const c=make(96,96),ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,96,96);ctx.drawImage(image,0,0,96,96);
    const data=ctx.getImageData(0,0,96,96).data,hist=new Map();
    for(let i=0;i<data.length;i+=4){const rgb=[data[i],data[i+1],data[i+2]].map(v=>Math.min(255,Math.round(v/12)*12));if(rgb.every(v=>v>245))continue;const key=rgb.join(',');hist.set(key,(hist.get(key)||0)+1)}
    const sorted=[...hist].sort((a,b)=>b[1]-a[1]).map(([s])=>s.split(',').map(Number)),warm=sorted.filter(([r,g,b])=>r>g*1.12&&g>b*1.2&&r>100).slice(0,16);
    const keys=new Set(warm.map(c=>c.join(',')));return [...warm,...sorted.filter(c=>!keys.has(c.join(','))).slice(0,96-warm.length)];
  }
  function createCanvasDefault(w,h){if(typeof document==='undefined')throw new Error('Inject createCanvas(width,height) in Node.');const c=document.createElement('canvas');c.width=w;c.height=h;return c}
  function font(ctx,size,type='paragraph',family='"DejaVu Sans",Arial,sans-serif'){ctx.font=(type==='heading'?'600 ':'')+size+'px '+(type==='math'?'"DejaVu Sans Mono",monospace':type==='heading'?'Georgia,"DejaVu Serif",serif':family);ctx.textBaseline='top'}
  function wrap(ctx,text,width){
    if(String(text).includes('\n'))return String(text).split('\n').flatMap(line=>wrap(ctx,line,width));
    const output=[];let line='';
    for(const word of words(text)){
      if(ctx.measureText(word).width>width){if(line){output.push(line);line=''}let part='';for(const c of Array.from(word)){if(part&&ctx.measureText(part+c).width>width){output.push(part);part=''}part+=c}line=part;continue}
      const trial=line?line+' '+word:word;if(line&&ctx.measureText(trial).width>width){output.push(line);line=word}else line=trial;
    }
    if(line||!output.length)output.push(line);return output;
  }
  function passageMap(config){return new Map((config.passages||[]).map(p=>[p.id,p]))}
  function buildGifPlan(config,options={}){
    options={...(config.gifOptions||{}),...options};
    const width=options.width||760,height=options.height||1040,padding=options.padding||44,family=options.fontFamily||'"DejaVu Sans",Arial,sans-serif';
    if(width<320||height<400)throw new RangeError('GIF portrait pages must be at least 320 × 400 pixels.');
    const make=options.createCanvas||createCanvasDefault,canvas=make(width,height),ctx=canvas.getContext('2d'),contentWidth=width-padding*2;
    const title=String(config.title||config.entryId||config.id||'Atlas entry'),sourceLabel=String(config.sourceLabel||''),sourceUrl=String(config.sourceUrl||'');
    const logoImage=options.logoImage||options.preparedImages?.get(config.logoSrc)||null,logoSize=112,titleSeed=seedFor(title),titleMask=visualMask(title,titleSeed);
    font(ctx,23,'heading',family);const titleLines=wrap(ctx,title,contentWidth),titleHeight=Math.max(titleLines.length,wrap(ctx,titleMask,contentWidth).length)*30;
    const titleY=padding+logoSize+14,headerHeight=titleY+titleHeight+38;
    font(ctx,10,'caption',family);const footerLines=wrap(ctx,[sourceLabel,sourceUrl].filter(Boolean).join(' · '),contentWidth);const footerHeight=30+footerLines.length*14;
    const bottom=height-padding-footerHeight;if(headerHeight+110>=bottom)throw new RangeError('Entry title/source labels leave no usable GIF text area.');
    const preparedImages=options.preparedImages||new Map();
    const supplied=config.gifBlocks||[];if(!supplied.length)throw new Error('Complete-entry GIF export requires nonempty gifBlocks.');
    const passages=passageMap(config),input=supplied.map((b,index)=>({...b,text:String(b.text??''),originalIndex:index})),units=[];
    let lastStatus='';
    for(const b of input){if(!normalize(b.text)&&!b.image)continue;const status=b.status||b.evidence||config.status||'exploratory';if(status!==lastStatus){units.push({type:'caption',text:'Evidence: '+evidenceLabel(status),status,originalIndex:-1});lastStatus=status}if(b.sourceLabel)units.push({type:'caption',text:'Source: '+b.sourceLabel,status,originalIndex:-1});units.push({...b,status})}
    const pages=[];let current={chunks:[],wordCount:0,animated:false},y=headerHeight;
    const commit=()=>{if(current.chunks.length)pages.push(current);current={chunks:[],wordCount:0,animated:false};y=headerHeight};
    for(let unitIndex=0;unitIndex<units.length;unitIndex++){const b=units[unitIndex];
      if(b.image){
        const image=preparedImages.get(b.image);if(!image)throw new Error('GIF image has not been prepared: '+b.image);
        const iw=Number(b.width)||image.naturalWidth||image.width,ih=Number(b.height)||image.naturalHeight||image.height;
        if(!(iw>0&&ih>0))throw new Error('GIF image has invalid natural dimensions: '+b.image);
        const imageTop=current.chunks.length&&current.chunks.every(c=>c.type==='caption'&&c.originalIndex<0)?y:headerHeight;
        const scale=Math.min(b.pageArtwork?Infinity:1,contentWidth/iw,(bottom-imageTop-16)/ih),w=iw*scale,h=ih*scale;
        if(y+h+16>bottom)commit();
        const count=Math.max(1,words(b.text).length);
        current.chunks.push({type:'image',imageKey:b.image,image,text:b.text,alt:b.alt||b.text,status:b.status,kind:evidenceKind(b.status),role:b.role||'',maskKind:'visual',seed:seedFor(b.image),originalIndex:b.originalIndex,wordStart:0,wordEnd:count,wordTotal:count,x:padding+(contentWidth-w)/2,y,width:w,height:h});
        current.wordCount+=Math.min(count,70);y+=h+16;
        const caption=b.caption||(b.type==='caption'?b.text:'');if(normalize(caption))units.splice(unitIndex+1,0,{type:'caption',text:caption,status:b.status,originalIndex:-1});
        continue;
      }
      const type=['heading','math','caption'].includes(b.type)?b.type:'paragraph',size=type==='heading'?22:type==='caption'?12:17.5,leading=size*1.48,gap=type==='heading'?14:12;
      const englishWords=blockTokens(b),ref=passages.get(b.passageId),status=b.status||config.status,kind=evidenceKind(status);
      const match=ref&&ref.zyntalic&&normalize(ref.english)===normalize(b.sourceEnglish??b.text);
      const animate=true,sourceWords=match?words(ref.zyntalic):englishWords.map((w,i)=>w==='\n'?'\n':visualMask(w,seedFor((config.entryId||title)+'|'+b.originalIndex+'|'+i)));let start=0;
      // Keep complete semantic paragraphs/equations together whenever a fresh
      // page can hold them. Only an intrinsically taller block may be split.
      font(ctx,size,type,family);const semanticHeight=Math.max(wrap(ctx,englishWords.join(' '),contentWidth).length,wrap(ctx,sourceWords.join(' '),contentWidth).length)*leading;
      const keepTogether=semanticHeight+gap<=bottom-headerHeight;
      if(keepTogether&&y+semanticHeight+gap>bottom)commit();
      while(start<englishWords.length){
        if(y+leading+gap>bottom){commit();continue}
        const available=bottom-y-gap;let low=start+1,high=englishWords.length,best=start,bestHeight=0;
        font(ctx,size,type,family);
        while(low<=high){const end=(low+high)>>>1,s0=Math.round(sourceWords.length*start/englishWords.length),s1=Math.round(sourceWords.length*end/englishWords.length),et=englishWords.slice(start,end).join(' '),zt=sourceWords.slice(s0,s1).join(' '),h=Math.max(wrap(ctx,et,contentWidth).length,wrap(ctx,zt,contentWidth).length)*leading;if(h<=available){best=end;bestHeight=h;low=end+1}else high=end-1}
        if(best===start){if(current.chunks.length){commit();continue}throw new RangeError('A text token is taller than one GIF page; split that semantic block without dropping its content.');}
        const s0=Math.round(sourceWords.length*start/englishWords.length),s1=Math.round(sourceWords.length*best/englishWords.length);
        const mask=sourceWords.slice(s0,s1).join(' '),chunk={type,status,kind,role:b.role||'',text:englishWords.slice(start,best).join(' '),mask,maskKind:match?'authentic':'visual',zyntalic:match?mask:'',keepTogether,semanticHeight,originalIndex:b.originalIndex,wordStart:start,wordEnd:best,wordTotal:englishWords.length,passageId:b.passageId||'',x:padding,y,width:contentWidth,height:bestHeight,size,leading,seed:seedFor((config.entryId||config.id||title)+'|'+b.originalIndex+'|'+start)};
        current.chunks.push(chunk);current.wordCount+=best-start;current.animated ||=animate;y+=bestHeight+gap;start=best;if(start<englishWords.length)commit();
      }
    }
    commit();
    const baseReadMs=options.readHoldMs??4500,readPerWordMs=options.readPerWordMs??180;
    for(const [i,page]of pages.entries()){
      page.index=i;page.readMs=Math.max(baseReadMs,Math.min(90000,page.wordCount*readPerWordMs));page.kind=evidenceKind(config.status);page.animated=true;
      page.chunks.forEach(c=>{c.revealStart=1000+Math.round(1600*(c.y-headerHeight)/Math.max(1,bottom-headerHeight));c.revealMs=c.type==='image'?2100:1350});
      page.sourceStart=Math.max(1700,...page.chunks.map(c=>c.revealStart+c.revealMs));
      page.transitionMs=page.kind==='trap'?4200:Math.ceil((page.sourceStart+550)/100)*100;
      page.durationMs=page.transitionMs+page.readMs;
      const times=[];
      if(page.kind==='trap'){
        times.push({time:0,delayMs:Math.max(1800,Math.min(page.readMs,12000))});
        for(let t=1800;t<4200;t+=100)times.push({time:t,delayMs:100});times.push({time:4200,delayMs:page.readMs});
      }else{times.push({time:0,delayMs:700});for(let t=700;t<page.transitionMs;t+=100)times.push({time:t,delayMs:100});times.push({time:page.transitionMs,delayMs:page.readMs});}
      page.frames=times;
    }
    const coverage=input.filter(b=>normalize(b.text)||b.image).map(b=>({blockIndex:b.originalIndex,kind:b.image?'image':'text',words:b.image?Math.max(1,words(b.text).length):blockTokens(b).length,parts:pages.flatMap((p,page)=>p.chunks.filter(c=>c.originalIndex===b.originalIndex).map(c=>({page,start:c.wordStart,end:c.wordEnd}))) }));
    for(const c of coverage){let end=0;for(const p of c.parts){if(p.start!==end)throw new Error('GIF block coverage is discontinuous.');end=p.end}if(end!==c.words)throw new Error('GIF block coverage is incomplete.')}
    return {width,height,padding,family,title,titleLines,titleMask,titleSeed,titleY,titleHeight,logoImage,logoSrc:config.logoSrc||'',logoBounds:{x:padding,y:padding-6,width:logoSize,height:logoSize},headerHeight,footerLines,footerHeight,sourceLabel,sourceUrl,status:config.status||'exploratory',entryId:config.entryId||config.id||'atlas-entry',pages,coverage,inputBlockCount:coverage.length,frameCount:pages.reduce((n,p)=>n+p.frames.length,0),durationMs:pages.reduce((n,p)=>n+p.frames.reduce((v,f)=>v+f.delayMs,0),0),palette:makePalette(logoPalette(logoImage,make))};
  }
  function drawText(ctx,text,x,y,width,{size=17.5,leading=size*1.48,type='paragraph',family,colour='#24252b',gradient=null,maxHeight=Infinity,alpha=1}={}){
    font(ctx,size,type,family);let lines=wrap(ctx,text,width);while(lines.length*leading>maxHeight&&size>8){size-=.3;leading=size*1.48;font(ctx,size,type,family);lines=wrap(ctx,text,width)}
    if(lines.length*leading>maxHeight+.5)throw new RangeError('Intermediate GIF text does not fit its reserved block.');
    ctx.save();ctx.globalAlpha=alpha;
    for(const [i,line] of lines.entries()){
      if(!gradient){ctx.fillStyle=colour;ctx.fillText(line,x,y+i*leading);continue}
      let at=x;for(const word of line.split(' ')){const w=ctx.measureText(word).width;ctx.fillStyle=rgb(colourAt((at-x+w/2)/Math.max(1,width),gradient));ctx.fillText(word,at,y+i*leading);at+=w+ctx.measureText(' ').width}
    }
    ctx.restore();return lines.length*leading;
  }
  function gifFrameState(plan,pageIndex,time){
    const page=plan.pages[pageIndex];if(!page)throw new RangeError('Unknown GIF page.');
    const reverse=page.kind==='trap',tick=Math.floor(time/45),titleP=reverse?1:smooth((time-650)/950),sourceP=reverse?1:smooth((time-page.sourceStart)/550);
    return {
      title:{text:morphText(plan.titleMask,plan.title,titleP,tick,plan.titleSeed),progress:titleP},
      source:{text:morphText(visualMask(plan.footerLines.join('\n'),plan.titleSeed+97),plan.footerLines.join('\n'),sourceP,tick,plan.titleSeed+97),progress:sourceP},
      chunks:page.chunks.map(c=>{
        const backwards=reverse&&c.kind==='trap'&&c.role!=='correction',p=reverse?(backwards?smooth((time-1800)/1600):1):smooth((time-c.revealStart)/c.revealMs),alpha=backwards?1-smooth((time-3700)/500):1;
        if(c.type==='image')return {chunk:c,progress:p,imageVisible:backwards?1-p:p,alpha,maskKind:'visual'};
        return {chunk:c,progress:p,text:morphText(backwards?c.text:c.mask,backwards?c.mask:c.text,p,tick,c.seed),alpha,maskKind:c.maskKind,gradient:backwards?(p>0?c.kind:null):(p<1?c.kind:null)};
      }),
      complete:time>=page.transitionMs
    };
  }
  function drawImageMask(ctx,chunk,progress,kind){
    const reveal=clamp(progress);ctx.save();ctx.beginPath();ctx.rect(chunk.x,chunk.y,chunk.width,chunk.height*reveal);ctx.clip();ctx.drawImage(chunk.image,chunk.x,chunk.y,chunk.width,chunk.height);ctx.restore();
    if(reveal>=1)return;
    ctx.save();ctx.beginPath();ctx.rect(chunk.x,chunk.y+chunk.height*reveal,chunk.width,chunk.height*(1-reveal));ctx.clip();
    ctx.fillStyle='#fff';ctx.fillRect(chunk.x,chunk.y,chunk.width,chunk.height);
    const size=Math.max(11,Math.min(18,chunk.width/38)),leading=size*1.65,letters=Math.max(10,Math.floor(chunk.width/(size*.68))),rows=Math.ceil(chunk.height/leading);
    font(ctx,size,'paragraph');
    for(let row=0;row<rows;row++){const source=Array.from({length:letters},(_,i)=>i%7===6?' ':MASK_ALPHABET[hash(chunk.seed+row*7919+i*113)%MASK_ALPHABET.length]).join('');ctx.fillStyle=rgb(colourAt(row/Math.max(1,rows-1),kind));ctx.fillText(source,chunk.x,chunk.y+row*leading)}ctx.restore();
  }
  function renderGifFrame(plan,pageIndex,time,canvas){
    if(!plan.logoImage)throw new Error('The existing EncapsulatorP logo is required for every GIF frame. Prepare logoSrc before rendering.');
    const page=plan.pages[pageIndex],state=gifFrameState(plan,pageIndex,time);canvas.width=plan.width;canvas.height=plan.height;const ctx=canvas.getContext('2d');
    ctx.fillStyle='#fff';ctx.fillRect(0,0,plan.width,plan.height);ctx.fillStyle=page.kind==='treasure'?'#5b7bbb':'#8a808d';ctx.fillRect(plan.padding,24,plan.width-plan.padding*2,2);
    const logo=plan.logoBounds,brandY=logo.y+(logo.height-36)/2;ctx.drawImage(plan.logoImage,logo.x,logo.y,logo.width,logo.height);
    drawText(ctx,'ENCAPSULATORP',logo.x+logo.width+14,brandY,plan.width-plan.padding*2-logo.width-14,{size:13,leading:18,type:'caption',family:plan.family,colour:'#34445c'});
    drawText(ctx,'READING EDITION',logo.x+logo.width+14,brandY+22,plan.width-plan.padding*2-logo.width-14,{size:10,leading:14,type:'caption',family:plan.family,colour:'#737a86'});
    drawText(ctx,state.title.text,plan.padding,plan.titleY,plan.width-plan.padding*2,{size:23,leading:30,type:'heading',family:plan.family,gradient:state.title.progress<1?page.kind:null,maxHeight:plan.titleHeight});
    drawText(ctx,evidenceLabel(plan.status)+'  ·  Part '+(pageIndex+1)+' / '+plan.pages.length,plan.padding,plan.headerHeight-28,plan.width-plan.padding*2,{size:11,leading:16,type:'caption',family:plan.family,colour:'#6b7280'});
    for(const item of state.chunks){const chunk=item.chunk;
      if(chunk.type==='image'){ctx.save();ctx.globalAlpha=item.alpha;drawImageMask(ctx,chunk,item.imageVisible,chunk.kind);ctx.restore();continue}
      drawText(ctx,item.text,chunk.x,chunk.y,chunk.width,{size:chunk.size,leading:chunk.leading,type:chunk.type,family:plan.family,colour:chunk.type==='caption'?'#707784':'#24252b',gradient:item.gradient,maxHeight:chunk.height,alpha:item.alpha});
    }
    const fy=plan.height-plan.padding-plan.footerHeight+12;ctx.fillStyle='#e4e7ee';ctx.fillRect(plan.padding,fy-13,plan.width-plan.padding*2,1);
    drawText(ctx,state.source.text,plan.padding,fy,plan.width-plan.padding*2,{size:10,leading:14,type:'caption',family:plan.family,colour:'#737a86',gradient:state.source.progress<1?page.kind:null,maxHeight:plan.footerHeight-20});
    const label=page.kind==='trap'&&state.complete?'Scope correction retained':state.complete?'English reading':'Text unveiling';
    drawText(ctx,'ENCAPSULATORP · READING EDITION · '+label,plan.padding,plan.height-plan.padding-13,plan.width-plan.padding*2,{size:10,leading:14,type:'caption',family:plan.family,colour:'#737a86'});return canvas;
  }
  async function exportGifData(config,options={}){
    if(!Gif)throw new Error('Load atlas-gif.js before atlas-reveal.js.');
    options={...(config.gifOptions||{}),...options};
    const check=()=>{if(options.signal?.aborted){const e=new Error('GIF export cancelled.');e.name='AbortError';throw e}};check();
    const preparedImages=new Map(options.preparedImages||[]),images=[...new Set((config.gifBlocks||[]).map(b=>b.image).filter(Boolean))];
    const load=options.loadImage||((url)=>new Promise((resolve,reject)=>{if(typeof Image==='undefined'){reject(new Error('Inject loadImage(url) for Node GIF images.'));return}const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Could not load local GIF image: '+url));image.src=url}));
    const resolve=key=>{const base=options.baseURL||config.baseURL||(typeof document!=='undefined'?document.baseURI:null);return options.resolveImage?options.resolveImage(key,config):base?new URL(key,base).href:key};
    const logoSrc=options.logoSrc||config.logoSrc;let logoImage=options.logoImage;
    if(!logoSrc&&!logoImage)throw new Error('GIF export requires logoSrc pointing to the existing EncapsulatorP logo.');
    if(!logoImage){try{logoImage=preparedImages.get(logoSrc)||await load(resolve(logoSrc))}catch(error){throw new Error('The existing EncapsulatorP logo could not load: '+logoSrc+' — '+error.message)}}
    if(!(logoImage.width||logoImage.naturalWidth))throw new Error('The existing EncapsulatorP logo has no usable image dimensions.');
    for(let i=0;i<images.length;i++){
      check();const key=images[i];if(!preparedImages.has(key)){
        preparedImages.set(key,await load(resolve(key)));
      }
      options.onProgress?.({phase:'images',page:0,pages:0,frame:i+1,frames:images.length,fraction:images.length?(i+1)/images.length:1});
    }
    check();const make=options.createCanvas||createCanvasDefault,plan=buildGifPlan({...config,logoSrc},{...options,logoImage,preparedImages,createCanvas:make}),canvas=make(plan.width,plan.height),encoder=new Gif.Encoder(plan.width,plan.height,{palette:plan.palette,loop:options.loop??null,background:31}),quantize=Gif.makeQuantizer(plan.palette);
    let previous=null,frame=0;
    check();options.onProgress?.({phase:'layout',page:0,pages:plan.pages.length,frame:0,frames:plan.frameCount,fraction:0,durationMs:plan.durationMs,width:plan.width,height:plan.height});
    for(const page of plan.pages)for(const step of page.frames){
      check();renderGifFrame(plan,page.index,step.time,canvas);const indices=quantize(canvas.getContext('2d').getImageData(0,0,plan.width,plan.height).data),d=Gif.delta(previous,indices,plan.width,plan.height);encoder.addFrame(d.indices,{...d,delay:Math.round(step.delayMs/10)});previous=indices;frame++;
      options.onProgress?.({phase:'encoding',page:page.index+1,pages:plan.pages.length,frame,frames:plan.frameCount,fraction:frame/plan.frameCount});
      await new Promise(resolve=>setTimeout(resolve,0));
    }
    check();const bytes=encoder.finish(),fileName=String(config.entryId||config.id||'atlas-entry').replace(/[^a-z0-9_-]+/gi,'-')+'.gif';
    return {bytes,mime:'image/gif',fileName,summary:{pages:plan.pages.length,blocks:plan.inputBlockCount,frames:plan.frameCount,durationMs:plan.durationMs,coverage:plan.coverage,width:plan.width,height:plan.height,logoSrc:logoSrc||'injected existing logo',initialState:plan.pages[0].kind==='trap'?'readable false extension':'full cipher',maskProvenance:'Authentic Zyntalic for mapped prose; transient visual masks for other content.'}};
  }

  // Browser integration is defined below; no DOM is touched when required in Node.
  function mount(config={}){return mountBrowser(config)}
  let mountBrowser=()=>{throw new Error('Browser integration has not been initialized.');};
  const api={mount,evidenceKind,evidenceLabel,colourAt,morphText,visualMask,makePalette,buildGifPlan,gifFrameState,renderGifFrame,exportGifData};
  function semanticText(node){
    if(node.nodeType===3)return node.nodeValue||'';
    if(node.nodeType!==1)return'';
    if(node.hasAttribute?.('data-gif-text'))return node.getAttribute('data-gif-text');
    if(node.matches?.('svg,img'))return node.getAttribute('aria-label')||node.getAttribute('alt')||node.getAttribute('data-tex')||'';
    const body=Array.from(node.childNodes||[]).map(semanticText).join('');
    if(node.tagName==='SUP')return'^('+body+')';if(node.tagName==='SUB')return'_('+body+')';if(node.tagName==='BR')return'\n';
    if(['TD','TH'].includes(node.tagName))return body+' | ';if(node.tagName==='TR')return body+'\n';return body;
  }
  api.semanticText=semanticText;
  function deriveGifBlocks(root,status){
    const nodes=Array.from(root.querySelectorAll('h1,h2,h3,h4,p,li,pre,table,[data-gif-math]'));
    return nodes.filter(el=>!el.closest('.ar-controls,[data-ar-ignore]')&&!nodes.some(other=>other!==el&&other.contains(el))).map(el=>({type:el.matches('[data-gif-math],pre')?'math':/^H[1-4]$/.test(el.tagName)?'heading':'paragraph',text:semanticText(el),passageId:el.dataset.passageId,status:el.dataset.evidence||status}));
  }
  function restorePlainDOM(doc){
    doc.documentElement?.classList.remove('ar-reveal-pending');
    for(const source of Array.from(doc.querySelectorAll?.('[data-ar-original]')||[])){source.style.opacity=source.dataset.arOriginalOpacity||'';source.style.clipPath=source.dataset.arOriginalClip||'';const mask=source.parentNode?.querySelector('.ar-mask');if(mask)mask.hidden=true}
  }
  api.restorePlainDOM=restorePlainDOM;
  mountBrowser=function(config={}){
    if(typeof document==='undefined')throw new Error('mount() requires a DOM; use the injected Canvas export functions in Node.');
    const root=typeof config.root==='string'?document.querySelector(config.root):(config.root||document.querySelector('#reader-content'));
    if(!root)throw new Error('Atlas reader content root was not found.');if(root.__atlasReveal)return root.__atlasReveal;
    const doc=root.ownerDocument||document,win=doc.defaultView||window,media=win.matchMedia('(prefers-reduced-motion: reduce)'),collection=config.status==='collection';
    const entryId=config.entryId||config.id||root.id||'atlas-entry';
    const fallbackPassages=Array.from(root.querySelectorAll('[data-zyntalic]')).map(el=>({id:el.dataset.passageId,english:semanticText(el),zyntalic:el.dataset.zyntalic,status:el.dataset.evidence||config.status}));
    const spec={...config,entryId,passages:config.passages||fallbackPassages,gifBlocks:config.gifBlocks?.length?config.gifBlocks:deriveGifBlocks(root,config.status)};
    const warnings=[],records=[],visible=new Set(),running=new Set(),byElement=new Map(),singleKind=evidenceKind(spec.status);
    let raf=0,lastClock=null,playing=false,elapsed=0,plainMode=media.matches,exportController=null,observer=null,destroyed=false;
    const escapeSelector=s=>String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"');
    const translated=new Map();
    for(const p of spec.passages){let el;try{el=root.querySelector(p.selector||`[data-passage-id="${escapeSelector(p.id)}"]`)}catch{warnings.push('Invalid selector for '+p.id);continue}if(!el){warnings.push('Missing passage '+p.id);continue}if(p.english&&normalize(p.english)!==normalize(el.textContent)&&normalize(p.english)!==normalize(semanticText(el))){warnings.push('English source mismatch; using a visual mask for '+p.id);continue}translated.set(el,p)}
    const correction=spec.correctionSelector?root.querySelector(spec.correctionSelector):null;
    const chrome='script,style,noscript,template,[data-reader-chrome],[data-ar-ignore],.ar-controls,.ar-sr-only,.reader-accessible-text';
    const atomic='p,h1,h2,h3,h4,h5,h6,li,dt,dd,summary,pre,table,figure,figcaption,caption,math,svg,img,[data-reader-reveal],[data-gif-math],.reader-equation,.equation';
    const candidates=[];
    function collect(el){
      if(el.nodeType!==1||el.matches(chrome)||el.closest?.(chrome))return;
      if(singleKind==='trap'){const p=translated.get(el);if(p&&p.zyntalic&&evidenceKind(p.status||spec.status)==='trap'){candidates.push(el);return}for(const child of Array.from(el.children||[]))collect(child);return}
      if(el!==root&&el.matches(atomic)&&!el.querySelector('[data-reader-chrome]')){candidates.push(el);return}
      for(const child of Array.from(el.childNodes||[])){if(child.nodeType===1)collect(child);else if(child.nodeType===3&&normalize(child.nodeValue)){const span=doc.createElement('span');child.parentNode.replaceChild(span,child);span.append(child);candidates.push(span)}}
    }
    collect(root);
    if(singleKind!=='trap')for(const el of Array.from(doc.querySelectorAll?.('[data-reader-reveal]')||[]))if(!root.contains(el)&&!candidates.some(c=>c.contains(el)))collect(el);
    const order=new Map();let ordinal=0;function sequence(el){if(el.nodeType===1){order.set(el,ordinal++);for(const child of Array.from(el.childNodes||[]))sequence(child)}}sequence(doc.body||root);
    candidates.sort((a,b)=>(order.get(a)||0)-(order.get(b)||0));
    for(const el of candidates){
      if(candidates.some(other=>other!==el&&other.contains(el)))continue;
      const p=translated.get(el),status=p?.status||el.dataset?.evidence||el.dataset?.sourceStatus||el.closest?.('[data-evidence]')?.dataset.evidence||el.closest?.('[data-source-status]')?.dataset.sourceStatus||spec.status;
      if(isPlainStatus(status))continue; // proved, exact, numerical and asymptotic text stays plain; traps are folded by the reader
      const target=el.textContent||semanticText(el),seed=seedFor(entryId+'|'+(p?.id||records.length));
      const isImage=el.matches('img,svg,math')||Boolean(el.querySelector('img,svg,math'));
      const authentic=Boolean(p?.zyntalic)&&!isImage,source=authentic?String(p.zyntalic):visualMask(target||semanticText(el)||'visual equation mask',seed);
      const r={id:p?.id||'visual-'+records.length,el,status,kind:evidenceKind(status),source,target,isImage,authentic,prepared:false,done:plainMode,elapsed:0,seed,index:records.length,originalOpacity:el.style.opacity||'',originalClip:el.style.clipPath||'',shell:null,mask:null,glyphs:[]};records.push(r);byElement.set(el,r);
    }
    const lazy=singleKind!=='trap'&&(collection||records.length>24),stagger=records.length>1?Math.min(180,4800/(records.length-1)):0,hold=singleKind==='trap'?1800:850,changeMs=2100;
    const transitionEnd=hold+Math.max(0,records.length-1)*stagger+changeMs,durationMs=records.length?(transitionEnd+(singleKind==='trap'?1300:700)):0;
    function fitMask(r){
      if(!r.mask||r.isImage)return;const mask=r.mask,height=r.el.offsetHeight||r.el.getBoundingClientRect?.().height||0;if(!height)return;
      let size=parseFloat(mask.style.fontSize)||16;for(let n=0;n<8&&mask.scrollHeight>height+1&&size>8;n++){size=Math.max(8,size*.88);mask.style.fontSize=size+'px';mask.style.lineHeight='1.4'}
    }
    function installMask(r){
      if(r.shell)return;const shell=doc.createElement('div'),mask=doc.createElement('span');shell.className='ar-shell';shell.dataset.arKind=r.kind;shell.dataset.arMask=r.authentic?'authentic':'visual';mask.className=r.isImage?'ar-mask ar-image-mask':'ar-mask';mask.setAttribute('aria-hidden','true');
      r.el.parentNode.insertBefore(shell,r.el);shell.append(r.el,mask);r.shell=shell;r.mask=mask;mask.textContent=r.source;
      r.el.dataset.arOriginal='';r.el.dataset.arOriginalOpacity=r.originalOpacity;r.el.dataset.arOriginalClip=r.originalClip;
      const style=win.getComputedStyle?.(r.el);if(style)for(const key of ['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','textAlign'])mask.style[key]=style[key];
      mask.style.top=(r.el.offsetTop||0)+'px';mask.style.left=(r.el.offsetLeft||0)+'px';mask.style.width=(r.el.offsetWidth?r.el.offsetWidth+'px':'100%');
      if(r.isImage){const height=r.el.offsetHeight||800,width=r.el.offsetWidth||650,columns=Math.max(15,Math.floor(width/11)),rows=Math.max(5,Math.ceil(height/28));mask.textContent=Array.from({length:rows},(_,j)=>Array.from({length:columns},(_,i)=>i%7===6?' ':MASK_ALPHABET[hash(r.seed+j*7919+i*113)%MASK_ALPHABET.length]).join('')).join('\n')}
      fitMask(r);
    }
    function prepare(r){
      installMask(r);if(r.prepared||r.isImage)return;r.prepared=true;r.mask.replaceChildren();
      const source=Array.from(r.source),target=Array.from(r.target),wordPositions=[];let word=0;for(let i=0;i<source.length;i++){wordPositions.push(word);if(/\s/u.test(source[i])&&i&&!/\s/u.test(source[i-1]))word++}
      for(let i=0;i<Math.max(source.length,target.length);i++){const span=doc.createElement('span'),text=doc.createTextNode('');span.className='ar-glyph';span.style.setProperty('--ar-word-color',rgb(colourAt((wordPositions[Math.min(source.length-1,i)]||0)/Math.max(1,word),r.kind)));span.append(text);r.mask.append(span);r.glyphs.push(text)}
    }
    function englishRecord(r){if(r.shell){r.mask.hidden=true;r.el.style.opacity=r.originalOpacity;r.el.style.clipPath=r.originalClip;r.shell.dataset.arPhase='english'}r.el.dataset.arPhase='english'}
    function renderRecord(r,p,tick){
      installMask(r);const reverse=singleKind==='trap'&&r.kind==='trap';
      if(reverse?p===0:p===1){englishRecord(r);return}
      r.mask.hidden=false;r.el.style.opacity=r.isImage&&p>0?'1':'0';
      if(r.isImage){const reveal=reverse?1-p:p;r.el.style.clipPath=`inset(0 0 ${(1-reveal)*100}% 0)`;r.mask.style.clipPath=`inset(${reveal*100}% 0 0 0)`}
      else if(p===0||p===1){r.mask.textContent=reverse?r.source:r.source;r.prepared=false;r.glyphs=[];fitMask(r)}
      else{prepare(r);const value=Array.from(morphText(reverse?r.target:r.source,reverse?r.source:r.target,p,tick,r.seed));for(let i=0;i<r.glyphs.length;i++)r.glyphs[i].nodeValue=value[i]||'';fitMask(r)}
      r.el.dataset.arPhase=r.shell.dataset.arPhase=(p===0||p===1)?(r.authentic?'zyntalic':'masked'):'resolving';
    }
    const controls=typeof spec.controls==='string'?doc.querySelector(spec.controls):spec.controls||doc.querySelector('#reader-tools');
    let tools=controls,createdTools=false;if(!tools){tools=doc.createElement('div');root.parentNode.insertBefore(tools,root);createdTools=true}tools.classList.add('ar-controls');
    const addButton=(action,label)=>{const b=doc.createElement('button');b.type='button';b.dataset.readerAction=action;b.textContent=label;tools.append(b);return b};
    if(!tools.querySelector('[data-reader-action]')){if(records.length){addButton('play','Pause');addButton('replay','Replay');addButton('plain','Read English')}addButton('gif','Export this entry as GIF');const cancel=addButton('cancel-gif','Cancel export');cancel.hidden=true}
    if(!tools.querySelector('[data-reader-gif-pace]')){
      const label=doc.createElement('label');label.className='ar-gif-pace';label.append(doc.createTextNode('GIF pace '));
      const select=doc.createElement('select');select.dataset.readerGifPace='';select.setAttribute('aria-label','GIF pace');
      for(const [value,text] of [['preview','Preview'],['reading','Reading']]){const option=doc.createElement('option');option.value=value;option.textContent=text;select.append(option)}select.value='preview';label.append(select);
      const exportButton=tools.querySelector('[data-reader-action="gif"]');if(exportButton)tools.insertBefore(label,exportButton);else tools.append(label);
    }
    let progress=tools.querySelector('[data-reader-export-status]');if(!progress){progress=doc.createElement('span');progress.dataset.readerExportStatus='';progress.className='ar-export-status';progress.setAttribute('role','status');progress.setAttribute('aria-live','polite');tools.append(progress)}
    let stateLabel=tools.querySelector('[data-reader-state]');if(!stateLabel){stateLabel=doc.createElement('span');stateLabel.dataset.readerState='';stateLabel.className='ar-status';tools.append(stateLabel)}
    const returnPanel=doc.createElement('aside');returnPanel.className='ar-return-panel';returnPanel.hidden=true;
    const returnText=doc.createElement('p');returnText.textContent='This false extension has vanished. Its correction remains available.';const back=doc.createElement('a');back.href=spec.returnUrl||spec.menuHref||'/atlas/README.html';back.textContent='Return to the atlas';returnPanel.append(returnText,back);if(singleKind==='trap')root.append(returnPanel);
    const trapTargets=singleKind==='trap'?(spec.trapSelector?Array.from(root.querySelectorAll(spec.trapSelector)):records.map(r=>r.el)):[];
    function trapState(ms,forcePlain=false){if(singleKind!=='trap')return;const fade=forcePlain?0:smooth((ms-transitionEnd-600)/700),done=fade>=1;for(const el of trapTargets){const host=byElement.get(el)?.shell||el;host.style.opacity=String(1-fade);host.hidden=done;el.hidden=done}returnPanel.hidden=!done;if(correction){correction.hidden=false;if(done&&correction.tagName==='DETAILS')correction.open=true}}
    function setStateLabel(){stateLabel.textContent=plainMode?'English reading':lazy?'Reveals as passages enter view':playing?'Text unveiling':'Paused';tools.querySelectorAll('[data-reader-action="play"]').forEach(b=>b.textContent=playing?'Pause':'Play')}
    function stop(){playing=false;if(raf)win.cancelAnimationFrame(raf);raf=0;lastClock=null;setStateLabel()}
    function renderSingle(ms){elapsed=clamp(ms,0,durationMs);records.forEach(r=>renderRecord(r,smooth((elapsed-hold-r.index*stagger)/changeMs),Math.floor(elapsed/45)));trapState(elapsed)}
    function schedule(){if(destroyed||!playing||raf)return;if(lazy&&!running.size)return;raf=win.requestAnimationFrame(frame)}
    function frame(now){raf=0;if(!playing||destroyed)return;const dt=lastClock===null?0:Math.max(0,now-lastClock);lastClock=now;
      if(lazy){for(const r of [...running]){if(!visible.has(r)){running.delete(r);continue}r.elapsed+=dt;renderRecord(r,smooth((r.elapsed-850)/2100),Math.floor(r.elapsed/45));if(r.elapsed>=2950){r.done=true;running.delete(r)}}if(!running.size)lastClock=null}
      else{renderSingle(elapsed+dt);if(elapsed>=durationMs){stop();return}}schedule();
    }
    function plain(){stop();plainMode=true;for(const r of records){englishRecord(r);r.done=true}running.clear();trapState(0,true);setStateLabel();return snapshot()}
    function replay(){stop();if(media.matches)return plain();plainMode=false;elapsed=0;running.clear();for(const r of records){r.done=false;r.elapsed=0;renderRecord(r,0,0)}if(lazy){let offset=0;for(const r of [...visible].sort((a,b)=>a.index-b.index)){r.elapsed=-offset;offset+=120;running.add(r)}}else renderSingle(0);playing=Boolean(records.length);setStateLabel();schedule();return snapshot()}
    function play(){if(media.matches)return plain();if(plainMode||(!lazy&&elapsed>=durationMs))return replay();playing=Boolean(records.length);if(lazy)for(const r of visible)if(!r.done)running.add(r);setStateLabel();schedule();return snapshot()}
    function renderAt(ms){if(!Number.isFinite(Number(ms)))throw new TypeError('renderAt(ms) requires a finite value.');if(media.matches)return plain();stop();plainMode=false;if(lazy){for(const r of records){r.elapsed=Math.max(0,Number(ms))-Math.min(4800,r.index*120);renderRecord(r,smooth((r.elapsed-850)/2100),Math.floor(r.elapsed/45));r.done=r.elapsed>=2950}}else renderSingle(Number(ms));return snapshot()}
    function snapshot(){return {entryId,status:spec.status,playing,plain:plainMode,elapsed,durationMs,passages:records.length,masked:records.filter(r=>r.shell&&r.el.dataset.arPhase!=='english').length,prepared:records.filter(r=>r.prepared).length,visible:visible.size,exporting:Boolean(exportController),warnings:[...warnings]}}
    async function exportCurrent(options={}){
      if(exportController)throw new Error('An export is already running.');stop();exportController=new AbortController();const own=exportController;let download;
      tools.querySelectorAll('[data-reader-action="gif"]').forEach(b=>b.disabled=true);tools.querySelectorAll('[data-reader-action="cancel-gif"]').forEach(b=>b.hidden=false);
      try{
        let estimate='';
        const pacing=tools.querySelector('[data-reader-gif-pace]')?.value==='reading'?{}:{readHoldMs:3500,readPerWordMs:0};
        const result=await exportGifData(spec,{...pacing,...options,signal:own.signal,onProgress:p=>{if(p.phase==='layout')estimate=p.pages+' pages · about '+Math.max(1,Math.round(p.durationMs/60000))+' min playback';progress.textContent=p.phase==='images'?'Preparing images · '+Math.round(p.fraction*100)+'%':estimate+' · encoding page '+p.page+'/'+p.pages+' · '+Math.round(p.fraction*100)+'%';options.onProgress?.(p)}});
        if(own.signal.aborted)throw Object.assign(new Error('GIF export cancelled.'),{name:'AbortError'});
        const blob=new Blob([result.bytes],{type:result.mime}),url=URL.createObjectURL(blob);download=doc.createElement('a');download.href=url;download.download=result.fileName;download.className='ar-export-link';download.textContent='Download GIF · '+result.summary.pages+' pages';progress.replaceChildren(download);download.click();win.setTimeout(()=>URL.revokeObjectURL(url),60000);return result;
      }catch(error){progress.textContent=error.name==='AbortError'?'GIF export cancelled.':'GIF export could not finish: '+error.message;throw error}
      finally{exportController=null;tools.querySelectorAll('[data-reader-action="gif"]').forEach(b=>b.disabled=false);tools.querySelectorAll('[data-reader-action="cancel-gif"]').forEach(b=>b.hidden=true)}
    }
    function cancelExport(){exportController?.abort()}
    const handlers={play:()=>playing?stop():play(),pause:stop,replay,plain,gif:()=>exportCurrent().catch(()=>{}),'cancel-gif':cancelExport};
    tools.querySelectorAll('[data-reader-action]').forEach(b=>b.addEventListener('click',()=>handlers[b.dataset.readerAction]?.()));
    // Every content block is concealed synchronously before the head cloak is released.
    // Lazy mode delays only the moving glyphs, never the initial mask.
    if(!plainMode)for(const r of records)renderRecord(r,0,0);
    doc.documentElement?.classList.remove('ar-reveal-pending');if(win.__atlasRevealWatchdog)win.clearTimeout?.(win.__atlasRevealWatchdog);
    if(lazy&&typeof win.IntersectionObserver==='function'){
      observer=new win.IntersectionObserver(entries=>{let offset=0;for(const entry of [...entries].sort((a,b)=>(byElement.get(a.target)?.index||0)-(byElement.get(b.target)?.index||0))){const r=byElement.get(entry.target);if(!r)continue;if(entry.isIntersecting){visible.add(r);if(!plainMode&&!r.done){if(r.elapsed===0){r.elapsed=-offset;offset+=120}renderRecord(r,smooth((r.elapsed-850)/2100),Math.floor(r.elapsed/45));running.add(r)}}else{visible.delete(r);running.delete(r)}}if(!running.size){if(raf)win.cancelAnimationFrame(raf);raf=0;lastClock=null}else schedule()},{rootMargin:'0px 0px 70px 0px',threshold:.02});
      records.forEach(r=>observer.observe(r.el));playing=!plainMode&&Boolean(records.length);
    }else if(records.length){if(plainMode)plain();else{if(lazy)records.forEach(r=>visible.add(r));replay()}}
    let printState=null;const beforePrint=()=>{printState={playing,elapsed,plain:plainMode};plain()},afterPrint=()=>{if(!printState)return;const s=printState;printState=null;if(s.plain)return;if(lazy){replay();if(!s.playing)stop()}else{renderAt(s.elapsed);if(s.playing)play()}};
    win.addEventListener('beforeprint',beforePrint);win.addEventListener('afterprint',afterPrint);media.addEventListener?.('change',()=>{if(media.matches)plain()});
    doc.addEventListener('visibilitychange',()=>{if(doc.hidden)stop()});setStateLabel();
    const instance={config:spec,play,pause:stop,replay,plain,renderAt,snapshot,exportGif:exportCurrent,cancelExport,get durationMs(){return durationMs},destroy(){plain();cancelExport();observer?.disconnect();destroyed=true;win.removeEventListener('beforeprint',beforePrint);win.removeEventListener('afterprint',afterPrint);for(const r of records)if(r.shell?.parentNode){r.shell.parentNode.insertBefore(r.el,r.shell);r.shell.remove()}if(createdTools)tools.remove();delete root.__atlasReveal}};
    root.__atlasReveal=instance;return instance;
  };
  if(typeof document!=='undefined'){
    const boot=()=>{const node=document.getElementById('reader-config')||document.getElementById('reader-data');if(!node){restorePlainDOM(document);return}try{const config=JSON.parse(node.textContent);if(!config.root)config.root='#reader-content';if(!config.controls)config.controls='#reader-tools';window.atlasReveal=api.mount(config)}catch(error){restorePlainDOM(document);console.error('Atlas reader remains available as plain HTML:',error)}};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  }
  return api;
});
