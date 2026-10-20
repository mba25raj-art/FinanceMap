import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createStudyLoader} from '../src/study-loader.js';
const detail={explanation:['A mechanism.'],types:[],workedCase:{steps:['A calculation.']},analysis:['A condition.']};
const bundle=domain=>({domain,guide:detail,details:{A01:detail}});
test('study loading is on demand, shared by topic/guide, and cached after success',async()=>{
 let calls=0,resolve;const loader=createStudyLoader({loaders:{D01:()=>{calls++;return new Promise(r=>{resolve=r;});}}});
 assert.equal(calls,0);assert.equal(loader.peek('D01'),undefined);
 const a=loader.load('D01'),b=loader.load('D01');assert.equal(a,b);await Promise.resolve();assert.equal(calls,1);resolve(bundle('D01'));assert.deepEqual(await a,bundle('D01'));await loader.load('D01');assert.equal(calls,1);
});
test('failed or malformed study responses do not poison the retry cache',async()=>{
 let calls=0;
 const loader=createStudyLoader({loaders:{D01:async()=>{calls++;if(calls===1)throw new Error('network failure');if(calls===2)return {domain:'wrong',details:{}};return bundle('D01');}}});
 await assert.rejects(loader.load('D01'),/network failure/);assert.equal(loader.peek('D01'),undefined);await assert.rejects(loader.load('D01'),/Unsupported/);assert.equal(loader.peek('D01'),undefined);await loader.load('D01');assert.equal(calls,3);await assert.rejects(loader.load('missing'),/unavailable/);
});
test('every generated deferred lesson and guide equals the complete authored reference',()=>{
 const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
 const manifest=read('../src/data/study-manifest.json'),complete=read('../src/data/complete-lessons.json'),summaries=read('../src/data/lesson-summaries.json'),guides=read('../src/data/domain-study-guides.json');
 assert.equal(manifest.domains.length,40);assert.equal(Object.keys(manifest.conceptDomains).length,698);let count=0;
 for(const domain of manifest.domains){const data=read(`../src/data/study/${domain}.json`);assert.equal(data.domain,domain);assert.deepEqual(data.guide,guides[domain]);for(const [id,deep]of Object.entries(data.details)){assert.equal(manifest.conceptDomains[id],domain);assert.deepEqual(deep,complete[id].detail);const {detail:original,...base}=complete[id];assert.deepEqual(summaries[id],{...base,detail:!!original});count++;}}
 assert.equal(count,698);
});
