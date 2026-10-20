import {readFileSync,writeFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
const base=new URL('../dist/client/',import.meta.url),manifest=JSON.parse(readFileSync(new URL('.vite/manifest.json',base),'utf8'));
const entry=Object.keys(manifest).find(key=>manifest[key].isEntry);assert.ok(entry);
const html=readFileSync(new URL('index.html',base),'utf8');assert.ok(html.includes(manifest[entry].file),'Built HTML and manifest identify different entry assets');
for(const css of manifest[entry].css||[])assert.ok(html.includes(css),'Built HTML omits its current stylesheet');
const initial=new Set();function visit(key){if(initial.has(key))return;initial.add(key);for(const child of manifest[key].imports||[])visit(child);}visit(entry);
const study=Object.keys(manifest).filter(key=>key.startsWith('src/data/study/')&&key.endsWith('.json'));
assert.equal(study.length,40);for(const key of study){assert.ok(manifest[key].isDynamicEntry);assert.ok(!initial.has(key),'Study material entered the initial static dependency graph: '+key);}
const size=file=>{const bytes=readFileSync(new URL(file,base));return {file,bytes:bytes.length,gzipBytes:gzipSync(bytes).length};};
const files=[...new Set([...initial].flatMap(key=>[manifest[key].file,...(manifest[key].css||[])]))].map(size);
const deferred=study.map(key=>size(manifest[key].file));
const result={measurement:'Built asset bytes and gzip transfer estimate; not device/network load time',htmlBytes:Buffer.byteLength(html),htmlGzipBytes:gzipSync(html).length,initialFiles:files,initialBytes:files.reduce((n,f)=>n+f.bytes,0),initialGzipBytes:files.reduce((n,f)=>n+f.gzipBytes,0),deferredStudyChunks:deferred.length,largestStudyChunkBytes:Math.max(...deferred.map(f=>f.bytes)),totalDeferredStudyBytes:deferred.reduce((n,f)=>n+f.bytes,0)};
assert.ok(result.initialBytes<3_200_000,'Initial payload regressed beyond the measured split budget');
writeFileSync(new URL('../docs/implementation/loading-build.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
