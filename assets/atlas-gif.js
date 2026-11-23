/* Small local GIF89a encoder. Original implementation for the atlas.
 * Format reference: https://www.w3.org/Graphics/GIF/spec-gif89a.txt
 * No network, workers, browser recorder, or external service is used.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AtlasGif = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  class Bytes {
    constructor() { this.chunks=[]; this.buffer=new Uint8Array(16384); this.used=0; }
    byte(value) { if(this.used===this.buffer.length)this.flush(); this.buffer[this.used++]=value; }
    word(value) { this.byte(value&255); this.byte((value>>>8)&255); }
    text(value) { for(let i=0;i<value.length;i++)this.byte(value.charCodeAt(i)); }
    array(values) { for(let i=0;i<values.length;i++)this.byte(values[i]); }
    flush() { if(this.used)this.chunks.push(this.buffer.slice(0,this.used)); this.used=0; }
    finish() { this.flush(); const length=this.chunks.reduce((n,c)=>n+c.length,0),out=new Uint8Array(length); let at=0;for(const c of this.chunks){out.set(c,at);at+=c.length}return out; }
  }
  function lzw(indices) {
    const out=new Bytes(); let bits=9,next=258,word=0,used=0,dict=new Map();
    function emit(code){word|=code<<used;used+=bits;while(used>=8){out.byte(word&255);word>>>=8;used-=8}}
    emit(256);
    if(indices.length){
      let prefix=indices[0];
      for(let i=1;i<indices.length;i++){
        const suffix=indices[i],key=(prefix<<8)|suffix,known=dict.get(key);
        if(known!==undefined){prefix=known;continue}
        emit(prefix);
        if(next<4096){dict.set(key,next++);if(next>(1<<bits)&&bits<12)bits++}
        else{emit(256);dict=new Map();bits=9;next=258}
        prefix=suffix;
      }
      emit(prefix);
    }
    emit(257);if(used)out.byte(word&255);return out.finish();
  }
  function rgb332(){const p=new Uint8Array(768);for(let i=0;i<256;i++){p[i*3]=Math.round(((i>>>5)&7)*255/7);p[i*3+1]=Math.round(((i>>>2)&7)*255/7);p[i*3+2]=(i&3)*85}return p}
  function makeQuantizer(palette){
    if(!(palette instanceof Uint8Array)||palette.length!==768)throw new TypeError('Palette must contain 256 RGB colours.');
    const lut=new Uint8Array(4096);
    for(let key=0;key<4096;key++){
      const r=((key>>>8)&15)*17,g=((key>>>4)&15)*17,b=(key&15)*17;let best=0,distance=Infinity;
      for(let j=0;j<256;j++){const dr=r-palette[j*3],dg=g-palette[j*3+1],db=b-palette[j*3+2],d=dr*dr+dg*dg+db*db;if(d<distance){distance=d;best=j}}
      lut[key]=best;
    }
    return rgba=>{const out=new Uint8Array(rgba.length/4);for(let i=0,j=0;i<rgba.length;i+=4,j++){const alpha=rgba[i+3]/255;const r=alpha===1?rgba[i]:Math.round(255+(rgba[i]-255)*alpha),g=alpha===1?rgba[i+1]:Math.round(255+(rgba[i+1]-255)*alpha),b=alpha===1?rgba[i+2]:Math.round(255+(rgba[i+2]-255)*alpha);out[j]=lut[((r>>>4)<<8)|((g>>>4)<<4)|(b>>>4)]}return out};
  }
  class Encoder {
    constructor(width,height,{palette=rgb332(),loop=null,background=255}={}){
      if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>65535||height>65535)throw new RangeError('GIF dimensions must be positive 16-bit integers.');
      if(palette.length!==768)throw new RangeError('Expected 256 RGB palette entries.');
      this.width=width;this.height=height;this.palette=palette;this.out=new Bytes();this.count=0;this.ended=false;
      this.out.text('GIF89a');this.out.word(width);this.out.word(height);this.out.array([0xf7,background,0]);this.out.array(palette);
      if(loop!==null){this.out.array([0x21,0xff,11]);this.out.text('NETSCAPE2.0');this.out.array([3,1]);this.out.word(loop);this.out.byte(0)}
    }
    addFrame(indices,{delay=8,x=0,y=0,width=this.width,height=this.height}={}){
      if(this.ended)throw new Error('GIF encoder is already finalized.');
      if(indices.length!==width*height||width<1||height<1||x<0||y<0||x+width>this.width||y+height>this.height)throw new RangeError('Frame dimensions do not match indexed pixels.');
      this.out.array([0x21,0xf9,4,4]);this.out.word(Math.max(2,Math.min(65535,Math.round(delay))));this.out.array([0,0]);
      this.out.byte(0x2c);this.out.word(x);this.out.word(y);this.out.word(width);this.out.word(height);this.out.byte(0);this.out.byte(8);
      const compressed=lzw(indices);for(let i=0;i<compressed.length;i+=255){const part=compressed.subarray(i,i+255);this.out.byte(part.length);this.out.array(part)}this.out.byte(0);this.count++;return this;
    }
    finish(){if(!this.count)throw new Error('A GIF needs at least one image.');if(this.ended)throw new Error('GIF encoder is already finalized.');this.out.byte(0x3b);this.ended=true;return this.out.finish()}
  }
  function delta(previous,current,width,height){
    if(!previous)return {indices:current,x:0,y:0,width,height};
    let x0=width,y0=height,x1=-1,y1=-1;
    for(let y=0,at=0;y<height;y++)for(let x=0;x<width;x++,at++)if(previous[at]!==current[at]){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
    if(x1<0)return {indices:current.slice(0,1),x:0,y:0,width:1,height:1};
    const w=x1-x0+1,h=y1-y0+1,out=new Uint8Array(w*h);for(let y=0;y<h;y++)out.set(current.subarray((y+y0)*width+x0,(y+y0)*width+x0+w),y*w);
    return {indices:out,x:x0,y:y0,width:w,height:h};
  }
  return {Encoder,makeQuantizer,rgb332,delta};
});
