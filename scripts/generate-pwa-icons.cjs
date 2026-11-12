// Generates correctly-sized branded PNG app icons with built-in Node modules.
const { deflateSync } = require('node:zlib');
const { writeFileSync } = require('node:fs');
const { join } = require('node:path');
function crc32(data) {
  let c = 0xffffffff;
  for (const b of data) {
    c ^= b;
    for(let k=0;k<8;k++) c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(name, data) {
  const n = Buffer.from(name), len = Buffer.alloc(4), crc = Buffer.alloc(4);
  len.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(Buffer.concat([n, data])));
  return Buffer.concat([len, n, data, crc]);
}
const segments = [[26,31,26,69],[26,31,39,31],[26,69,39,69],[61,31,61,69],[61,51,80,31],[61,51,81,69]];
for(let k=0;k<16;k++) {
  const a=-Math.PI/2+Math.PI*k/16, b=-Math.PI/2+Math.PI*(k+1)/16;
  segments.push([39+15*Math.cos(a),50+19*Math.sin(a),39+15*Math.cos(b),50+19*Math.sin(b)]);
}
function isLetter(x,y) {
  return segments.some(([ax,ay,bx,by]) => {
    const vx=bx-ax,vy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*vx+(y-ay)*vy)/(vx*vx+vy*vy)));
    return Math.hypot(x-ax-t*vx,y-ay-t*vy)<=3.3;
  });
}
function icon(size) {
  const rows=Buffer.alloc((size*4+1)*size), stride=size*4+1;
  for(let y=0;y<size;y++) {
    const start=y*stride;
    for(let x=0;x<size;x++) {
      const xx=(x+.5)*100/size, yy=(y+.5)*100/size;
      const dx=Math.max(15-xx,0,xx-85),dy=Math.max(15-yy,0,yy-85);
      const gold=xx>=26&&xx<=81&&yy>=80&&yy<=83, white=isLetter(xx,yy), i=start+1+x*4;
      rows[i]=white?255:gold?179:23;
      rows[i+1]=white?255:gold?146:23;
      rows[i+2]=white?255:gold?95:23;
      rows[i+3]=dx*dx+dy*dy<=225?255:0;
    }
  }
  const header=Buffer.alloc(13);
  header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
  const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(rows,{level:9})),chunk('IEND',Buffer.alloc(0))]);
  writeFileSync(join(__dirname,'..','public','dk-app-icon-'+size+'.png'),png);
}
icon(192);icon(512);
