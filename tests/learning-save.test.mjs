import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createSaveCodec,createLearningStorage,emptyLearningProfile,LEARNING_STORAGE_KEY,MAX_SAVE_BYTES} from '../src/learning-save.js';
import {learningSessionReducer as reduce,learningCounts} from '../src/learning-session.js';
import {lessonPackages,lessonPackageForConcept} from '../src/lesson-packages.js';
import {lessonPracticeCounts,practiceKey} from '../src/lesson-practice.js';
import {mystery} from '../src/data/lessons.js';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url)));
const topics=read('src/data/complete-lessons.json'),manifest=read('content/assessment-versions.json');
const clues=mystery.steps.map((c,i)=>({...c,id:`P02-C${i+1}`}));
const codec=createSaveCodec({conceptIds:read('content/master-network.json').nodes.map(n=>n.id),topics,topicVersions:manifest.topics,packages:lessonPackages,cases:{P02:{version:'1.0.0',fingerprint:manifest.cases.P02,clues}}});
const clone=structuredClone;
const memoryStorage=initial=>{
 const data=new Map(initial===undefined?[]:[[LEARNING_STORAGE_KEY,initial]]);
 return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
};
function sample(){
 const p=emptyLearningProfile();p.bookmarks=['A02','A11'];p.visited=['A02','A05'];p.trail=['A02','A05','A02'];
 let s=p.session;const topic=topics.A02,wrong=(topic.correct+1)%topic.options.length;
 for(const a of [{type:'topic-answer',id:'A02',choice:wrong,correct:topic.correct,optionCount:3},{type:'topic-answer',id:'A02',choice:topic.correct,correct:topic.correct,optionCount:3},{type:'topic-retry',id:'A02'}])s=reduce(s,a);
 const lesson=lessonPackageForConcept('A02'),q=lesson.practice[0],action={conceptId:lesson.conceptId,contentVersion:lesson.contentVersion,questionId:q.id,version:q.version};
 s=reduce(s,{...action,type:'lesson-hint',hint:0});s=reduce(s,{...action,type:'lesson-answer',choice:q.correctOptionId});s=reduce(s,{...action,type:'lesson-retry'});
 s=reduce(s,{type:'case-start',id:'P02',clues:clues.map(c=>({correct:c.correct,optionCount:c.options.length}))});
 s=reduce(s,{type:'case-answer',run:0,step:0,choice:(clues[0].correct+1)%3});s=reduce(s,{type:'case-hint',run:0,step:0});
 for(let i=0;i<clues.length;i++){s=reduce(s,{type:'case-answer',run:0,step:i,choice:clues[i].correct});if(i<clues.length-1)s=reduce(s,{type:'case-next',run:0,step:i});}
 s=reduce(s,{type:'case-finish',run:0,step:2});s=reduce(s,{type:'case-start',id:'P02',clues:clues.map(c=>({correct:c.correct,optionCount:c.options.length}))});
 p.session=s;p.navigation='#simulations/P02?run=2&concept=A05';return p;
}

test('assessment versions deterministically fingerprint the actual prompt, data, option order and answer definition',()=>{
 const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
 for(const [id,l] of Object.entries(topics))assert.equal(manifest.topics[id],digest([l.question,l.quizContext||'',l.example,l.options,l.correct]));
 assert.equal(manifest.cases.P02,digest(mystery.steps.map(c=>[c.concept,c.question,c.options,c.correct])));
});
test('export/import preserves wrong-first, latest-correct, retry, assistance and replay without storing correctness keys',()=>{
 const p=sample(),raw=JSON.stringify(codec.encode(p)),restored=codec.parse(raw).profile;
 assert.deepEqual(restored,p);assert.deepEqual(learningCounts(restored.session),learningCounts(p.session));
 assert.deepEqual(lessonPracticeCounts(restored.session.lessonPractice),lessonPracticeCounts(p.session.lessonPractice));
 assert.ok(!raw.includes('"correct"'));assert.ok(!raw.includes('"clues"'));assert.ok(!raw.includes('"completedCases"'));
 assert.equal(restored.session.runs.length,2);assert.equal(restored.session.completedCases.length,1);
 assert.equal(restored.session.answers.A02,undefined);assert.equal(restored.session.runs[0].responses[0][0].hinted,false);assert.equal(restored.session.runs[0].responses[0][1].hinted,true);
 const q=lessonPackageForConcept('A02').practice[0];assert.equal(restored.session.lessonPractice[practiceKey(q)].choice,null);
});
test('a directional-only hint survives reload without exposing a solution or awarding an answer',()=>{
 const p=emptyLearningProfile(),lesson=lessonPackageForConcept('A03'),q=lesson.practice[0];
 p.session=reduce(p.session,{type:'lesson-hint',conceptId:'A03',contentVersion:lesson.contentVersion,questionId:q.id,version:q.version,hint:0});
 const restored=codec.decode(codec.encode(p));assert.equal(restored.session.lessonPractice[practiceKey(q)].revealed,false);assert.equal(lessonPracticeCounts(restored.session.lessonPractice).answered,0);
});
test('changed or unavailable content versions are recovered without importing fabricated scores',()=>{
 const d=codec.encode(sample());
 for(const alter of [x=>x.progress.topics[0].questionVersion='changed',x=>x.progress.lessonPractice[0].contentVersion='99.0.0',x=>x.progress.cases[0].definitionVersion='changed',x=>x.progress.topics[0].correct=true,x=>x.progress.cases[0].score=100]){
  const bad=clone(d);alter(bad);assert.throws(()=>codec.decode(bad));
 }
 const wrong=clone(d);wrong.progress.topics[0].attempts=[(topics.A02.correct+1)%3];wrong.progress.topics[0].selectedChoice=null;
 const state=codec.decode(wrong).session;assert.equal(learningCounts(state).topicsLatestCorrect,0);
});
test('malformed, duplicate, future/old schema, oversized and non-finite data fail with recovery',()=>{
 const d=codec.encode(sample());assert.throws(()=>codec.parse('{broken'),/valid JSON/);assert.throws(()=>codec.parse(' '.repeat(MAX_SAVE_BYTES+1)),/5 MiB/);
 for(const alter of [x=>x.schemaVersion=0,x=>x.schemaVersion=2,x=>x.progress.activeRun=Infinity,x=>x.progress.concepts.saved.push('missing'),x=>x.progress.topics.push(x.progress.topics[0]),x=>x.progress.lessonPractice.push(x.progress.lessonPractice[0]),x=>x.progress.cases[0].selectedChoices[0].choice=99,x=>x.savedAt='2026-02-31T00:00:00.000Z',x=>x.progress.simulations=[{activityId:'unknown'}]]){
  const bad=clone(d);alter(bad);assert.throws(()=>codec.decode(bad));
 }
 assert.throws(()=>codec.parse('{"__proto__":{"polluted":true}}'));assert.equal({}.polluted,undefined);
});
test('case progression and explicit Finish cannot be fabricated by selecting a later clue',()=>{
 const d=codec.encode(sample());
 for(const alter of [x=>x.progress.cases[1].finished=true,x=>x.progress.cases[1].step=2,x=>x.progress.cases[0].hints=[],x=>x.progress.cases[0].attempts.reverse(),x=>x.progress.cases[0].selectedChoices=[]]){
  const bad=clone(d);alter(bad);assert.throws(()=>codec.decode(bad));
 }
});
test('storage round trip is cross-instance and empty opening does not create a record',()=>{
 const memory=memoryStorage(),first=createLearningStorage(memory,codec);assert.equal(first.initial.kind,'empty');
 assert.equal(first.save(emptyLearningProfile()).kind,'empty');assert.equal(memory.getItem(LEARNING_STORAGE_KEY),null);
 assert.equal(first.save(sample()).ok,true);const reopened=createLearningStorage(memory,codec);assert.equal(reopened.initial.kind,'ready');assert.deepEqual(reopened.initial.profile,sample());
});
test('corrupt or unsupported storage pauses automatic replacement and preserves original bytes',()=>{
 for(const raw of ['{broken',JSON.stringify({...codec.encode(sample()),schemaVersion:0})]){
  const memory=memoryStorage(raw),store=createLearningStorage(memory,codec);assert.equal(store.initial.kind,'blocked');assert.equal(store.save(sample()).ok,false);assert.equal(memory.getItem(LEARNING_STORAGE_KEY),raw);
 }
});
test('denied or full storage leaves the last successful record intact and reports failure',()=>{
 const raw=JSON.stringify(codec.encode(sample())),memory=memoryStorage(raw);memory.setItem=()=>{throw new Error('Quota exceeded');};
 const store=createLearningStorage(memory,codec),changed=sample();changed.bookmarks=['A03'];assert.equal(store.save(changed).ok,false);assert.equal(memory.getItem(LEARNING_STORAGE_KEY),raw);
 const denied=createLearningStorage({getItem(){throw new Error('Denied');}},codec);assert.equal(denied.initial.kind,'unavailable');assert.equal(denied.save(sample()).ok,false);
});
test('Import requires explicit replacement, rejects invalid data and retains run order on a valid replace',()=>{
 const memory=memoryStorage(),store=createLearningStorage(memory,codec),raw=JSON.stringify(codec.encode(sample()));
 assert.equal(store.importRecord(raw).kind,'confirmation');assert.equal(memory.getItem(LEARNING_STORAGE_KEY),null);
 assert.equal(store.importRecord('{bad',true).kind,'invalid');assert.equal(memory.getItem(LEARNING_STORAGE_KEY),null);
 const result=store.importRecord(raw,true);assert.equal(result.ok,true);assert.deepEqual(result.profile,sample());assert.deepEqual(createLearningStorage(memory,codec).initial.profile,sample());
});
test('Reset cancellation changes nothing; confirmed reset deletes only the app key and does not immediately recreate it',()=>{
 const memory=memoryStorage(JSON.stringify(codec.encode(sample())));memory.setItem('unrelated','keep');const store=createLearningStorage(memory,codec),before=memory.getItem(LEARNING_STORAGE_KEY);
 assert.equal(store.reset().ok,false);assert.equal(memory.getItem(LEARNING_STORAGE_KEY),before);
 const result=store.reset(true);assert.equal(result.ok,true);assert.equal(memory.getItem(LEARNING_STORAGE_KEY),null);assert.equal(memory.getItem('unrelated'),'keep');
 store.save(result.profile);assert.equal(memory.getItem(LEARNING_STORAGE_KEY),null);
});
test('two tabs detect conflicting writes, imports and reset instead of silently losing newer history',()=>{
 const memory=memoryStorage(),a=createLearningStorage(memory,codec),b=createLearningStorage(memory,codec);a.save(sample());assert.equal(b.checkConflict(),true);
 assert.equal(b.save(sample()).ok,false);assert.equal(b.reset(true).kind,'conflict');assert.equal(b.importRecord(JSON.stringify(codec.encode(sample())),true).kind,'conflict');
 assert.equal(b.loadLatest().ok,true);assert.equal(b.save(sample()).ok,true);assert.equal(a.save(sample()).kind,'conflict');
});

test('actual App restores before resolving a run link, retains spoiler gates and exposes local backup controls',async()=>{
  const memory=memoryStorage(JSON.stringify(codec.encode(sample())));let writes=0;const originalSet=memory.setItem;memory.setItem=(k,v)=>{writes++;originalSet(k,v);};
  globalThis.window={location:{hash:'#simulations/P02?run=2&concept=A05'},localStorage:memory};
  const {createServer}=await import('vite'),{default:react}=await import('@vitejs/plugin-react');
  const {createElement}=await import('react'),{renderToStaticMarkup}=await import('react-dom/server');
  const server=await createServer({configFile:false,plugins:[react()],server:{middlewareMode:true,hmr:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]},appType:'custom'});
  try{
    const {App}=await server.ssrLoadModule('/src/App.jsx');
    let html=renderToStaticMarkup(createElement(App));assert.ok(html.includes('Run 2'));assert.ok(!html.includes('This run is not available'));assert.ok(!html.includes('practice-solution'));
    window.location.hash='#atlas/lessons/A05?returnRun=2';html=renderToStaticMarkup(createElement(App));assert.ok(html.includes('Read this as a hint?'));assert.ok(!html.includes('data-lesson-concept="A05"'));
    window.location.hash='#learning';html=renderToStaticMarkup(createElement(App));assert.ok(html.includes('Export learning backup'));assert.ok(html.includes('Import JSON backup'));assert.ok(html.includes('Reset local learning record'));assert.ok(html.includes('Your validated learning record is restored'));
    memory.setItem(LEARNING_STORAGE_KEY,'{broken');html=renderToStaticMarkup(createElement(App));assert.ok(html.includes('Current changes remain in memory'));assert.ok(html.includes('Download original stored record'));assert.equal(memory.getItem(LEARNING_STORAGE_KEY),'{broken');
    assert.equal(writes,1,'SSR must not create a save or replace invalid bytes');
  }finally{await server.close();delete globalThis.window;}
});
