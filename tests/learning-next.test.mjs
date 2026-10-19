import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {learningNextSteps} from '../src/learning-next.js';
import {createLearningSession,learningSessionReducer as reduce} from '../src/learning-session.js';
import {lessonPackageForConcept as get} from '../src/lesson-packages.js';
import {mystery} from '../src/data/lessons.js';
const topics=JSON.parse(readFileSync(new URL('../src/data/complete-lessons.json',import.meta.url)));
const start=s=>reduce(s,{type:'case-start',id:'P02',clues:mystery.steps.map(c=>({correct:c.correct,optionCount:c.options.length}))});
const action=(p,q,type,extra={})=>({type,conceptId:p.conceptId,contentVersion:p.contentVersion,questionId:q.id,version:q.version,...extra});
test('an empty or merely explored record does not imply practice or demonstrated understanding',()=>{
  const s=createLearningSession();let p=learningNextSteps({session:s});assert.equal(p.next.kind,'brief');assert.equal(p.counts.transferQuestions,0);assert.equal(p.counts.topics,0);
  p=learningNextSteps({session:s,visited:['A02','A02']});assert.equal(p.counts.explored,1);assert.equal(p.counts.lessons,0);assert.equal(p.counts.transferConcepts,0);
});
test('latest unfinished run is the primary action and planning never starts, replays or mutates a run',()=>{
  let s=start(createLearningSession());s=reduce(s,{type:'case-answer',run:0,step:0,choice:0});s=start(s);
  const before=JSON.stringify(s),p=learningNextSteps({session:s});assert.equal(p.next.kind,'resume');assert.equal(p.next.runIndex,1);assert.equal(p.next.step,0);assert.equal(JSON.stringify(s),before);
});
test('latest mistakes rank before corrected first mistakes and optional preparation follows directed recommendation edges',()=>{
  let s=createLearningSession();
  for(const [id,corrected] of [['A02',true],['A03',false]]){
    const q=topics[id];s=reduce(s,{type:'topic-answer',id,choice:(q.correct+1)%3,correct:q.correct,optionCount:3});
    if(corrected)s=reduce(s,{type:'topic-answer',id,choice:q.correct,correct:q.correct,optionCount:3});
  }
  const edges=[{from:'T04.01',to:'A03',type:'RECOMMENDED_BEFORE'},{from:'A03',to:'A05',type:'RECOMMENDED_BEFORE'},{from:'A02',to:'A03',type:'CALCULATION_INPUT'}];
  let p=learningNextSteps({session:s,edges});assert.equal(p.next.conceptId,'A03');assert.deepEqual(p.next.preparation,['T04.01']);assert.equal(p.review.find(r=>r.conceptId==='A02').priority,2);
  p=learningNextSteps({session:s,edges,visited:['T04.01']});assert.deepEqual(p.next.preparation,[]);
});
test('only correct first unassisted transfer responses provide that scoped evidence, even after retry or alias navigation',()=>{
  const lesson=get('A02'),q=lesson.practice.find(q=>q.stage==='transfer');let s=createLearningSession();
  s=reduce(s,action(lesson,q,'lesson-answer',{choice:q.correctOptionId}));s=reduce(s,action(lesson,q,'lesson-retry'));
  let p=learningNextSteps({session:s});assert.equal(p.counts.transferQuestions,1);assert.equal(p.counts.transferConcepts,1);assert.equal(p.counts.lessons,1);assert.equal(get('T06.04'),lesson);
  s=createLearningSession();s=reduce(s,action(lesson,q,'lesson-hint',{hint:0}));s=reduce(s,action(lesson,q,'lesson-answer',{choice:q.correctOptionId}));p=learningNextSteps({session:s});assert.equal(p.counts.transferQuestions,0);assert.ok(p.review.some(r=>r.conceptId==='A02'));
  s=createLearningSession();s=reduce(s,action(lesson,q,'lesson-answer',{choice:q.options.find(o=>o.id!==q.correctOptionId).id}));s=reduce(s,action(lesson,q,'lesson-answer',{choice:q.correctOptionId}));assert.equal(learningNextSteps({session:s}).counts.transferQuestions,0);
});
test('case replay uses the global latest response while retaining the original first mistake for review',()=>{
  let s=start(createLearningSession());s=reduce(s,{type:'case-answer',run:0,step:0,choice:0});
  for(let run=0;run<2;run++){
    if(run)s=start(s);
    for(let step=0;step<3;step++){s=reduce(s,{type:'case-answer',run,step,choice:mystery.steps[step].correct});if(step<2)s=reduce(s,{type:'case-next',run,step});}
    s=reduce(s,{type:'case-finish',run,step:2});
  }
  const p=learningNextSteps({session:s});assert.equal(p.next.kind,'review');assert.equal(p.review.find(r=>r.conceptId==='A05').priority,2);assert.ok(p.review[0].reasons[0].includes('corrected'));
});
test('a completed case with no review signals leads to an unexplored selected concept, then manual wider practice',()=>{
  const s=createLearningSession();s.completedCases=['P02'];let p=learningNextSteps({session:s,selectedIds:['A02','A03'],visited:['A02']});assert.equal(p.next.kind,'read');assert.equal(p.next.conceptId,'A03');
  p=learningNextSteps({session:s,selectedIds:['A02','A03'],visited:['A02','A03']});assert.equal(p.next.kind,'browse');assert.equal(p.counts.transferQuestions,0);
});
test('My learning renders next actions, evidence distinctions, review reasons and backup controls together',async()=>{
  globalThis.window={location:{hash:'#learning'}};
  const {createServer}=await import('vite'),{default:react}=await import('@vitejs/plugin-react'),{createElement}=await import('react'),{renderToStaticMarkup}=await import('react-dom/server');
  const server=await createServer({configFile:false,plugins:[react()],server:{middlewareMode:true,hmr:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]},appType:'custom'});
  try{
    const {App}=await server.ssrLoadModule('/src/App.jsx');const session=start(createLearningSession());
    const html=renderToStaticMarkup(createElement(App,{initialRoute:{view:'learning',id:'A02'},initialSession:session}));
    assert.ok(html.includes('Resume this run'));assert.ok(html.includes('Browse all topics'));assert.ok(html.includes('Demonstrated on a task'));assert.ok(html.includes('independent result plus a reviewed explanation'));assert.ok(html.includes('limited to those questions'));assert.ok(html.includes('Export learning backup'));
    assert.ok(html.indexOf('NEXT ACTION')<html.indexOf('Local learning record'));
  }finally{await server.close();delete globalThis.window;}
});
