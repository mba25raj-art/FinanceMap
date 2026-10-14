import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { receivables as pkg, practiceRecord, lessonPracticeCounts } from '../src/lesson-practice.js';
import { createLearningSession, learningSessionReducer as reduce, learningCounts } from '../src/learning-session.js';
import { validateLessonPackage } from '../scripts/lesson-standard.mjs';
const atlas=JSON.parse(readFileSync(new URL('../content/master-network.json',import.meta.url)));
const [prediction,transfer,writeoff]=pkg.practice;
const action=(item,type,extra={})=>({type,questionId:item.id,version:item.version,contentVersion:pkg.contentVersion,...extra});
const inputs=item=>Object.fromEntries(item.inputs.map(i=>[i.key,i.value]));

test('receivables package and independently recomputed gross/net/allowance/cash bridges agree',()=>{
  assert.deepEqual(validateLessonPackage(pkg,atlas),[]);
  const w=inputs(pkg.workedExample),gross=w.openingGross+w.creditSales-w.collections-w.writeoff;
  const charge=w.closingAllowance-(w.openingAllowance-w.writeoff),net=gross-w.closingAllowance;
  assert.deepEqual([gross,charge,net],[23,3,20]);
  assert.equal(w.creditSales-charge-(net-(w.openingGross-w.openingAllowance)),w.collections);
  assert.notEqual(w.creditSales-charge+charge-(net-(w.openingGross-w.openingAllowance)),w.collections,'Double-counting non-cash loss must not be taught as a valid bridge');
  const t=inputs(transfer);assert.equal(t.openingGross+t.sales-t.receipts-t.writeoff-t.closingAllowance,20.5);assert.equal(t.closingAllowance-(t.openingAllowance-t.writeoff),1.5);
  const f=inputs(writeoff);assert.equal(f.gross-f.allowance,(f.gross-f.writeoff)-(f.allowance-f.writeoff));
  assert.equal(prediction.correctOptionId,'exchange');assert.equal(transfer.correctOptionId,'reconcile');assert.equal(writeoff.correctOptionId,'covered');
});

test('wrong-first, correction and retry preserve separate lesson evidence without inflating existing totals',()=>{
  let s=createLearningSession();const before=learningCounts(s);
  s=reduce(s,action(prediction,'lesson-answer',{choice:'new-sale'}));
  s=reduce(s,action(prediction,'lesson-answer',{choice:'exchange'}));
  s=reduce(s,action(prediction,'lesson-retry'));
  const r=practiceRecord(s.lessonPractice,prediction);
  assert.equal(r.choice,null);assert.equal(r.responses.length,2);assert.equal(r.responses[0].correct,false);assert.equal(r.revealed,true);
  assert.deepEqual(learningCounts(s),before);assert.equal(lessonPracticeCounts(s.lessonPractice).answered,1);assert.equal(lessonPracticeCounts(s.lessonPractice).latestCorrect,1);assert.equal(lessonPracticeCounts(s.lessonPractice).firstUnassisted,0);
});

test('directional and worked hints are scoped, do not submit answers and retain assistance on retry',()=>{
  let s=createLearningSession();s=reduce(s,action(transfer,'lesson-hint',{hint:0}));
  assert.equal(practiceRecord(s.lessonPractice,transfer).revealed,false);assert.equal(lessonPracticeCounts(s.lessonPractice).answered,0);
  s=reduce(s,action(transfer,'lesson-hint',{hint:1}));assert.equal(practiceRecord(s.lessonPractice,transfer).revealed,true);
  assert.equal(practiceRecord(s.lessonPractice,prediction).revealed,false);
  s=reduce(s,action(transfer,'lesson-answer',{choice:'reconcile'}));s=reduce(s,action(transfer,'lesson-retry'));
  assert.equal(practiceRecord(s.lessonPractice,transfer).responses[0].hinted,true);assert.equal(lessonPracticeCounts(s.lessonPractice).firstUnassisted,0);
  assert.equal(reduce(s,action(transfer,'lesson-hint',{hint:0})),s,'Retry should not turn previously revealed feedback into new help');
});

test('invalid versions, choices and client-supplied answer keys cannot create credit',()=>{
  const s=createLearningSession();
  for(const bad of [{version:'0.0.0'},{contentVersion:'99.0.0'},{choice:'invalid'},{questionId:'missing'}])assert.equal(reduce(s,action(prediction,'lesson-answer',{choice:'exchange',...bad})),s);
  const wrong=reduce(s,action(prediction,'lesson-answer',{choice:'new-sale',correctOptionId:'new-sale',correct:true}));
  assert.equal(practiceRecord(wrong.lessonPractice,prediction).responses[0].correct,false);
});

test('rendered checkpoint protects its solution and both receivables routes reuse session records',async()=>{
  globalThis.window={location:{hash:'#atlas/lessons/A02'}};
  const {createServer}=await import('vite'),{default:react}=await import('@vitejs/plugin-react');
  const {createElement}=await import('react'),{renderToStaticMarkup}=await import('react-dom/server');
  const server=await createServer({configFile:false,plugins:[react()],server:{middlewareMode:true,hmr:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]},appType:'custom'});
  try{
    const {LessonPractice}=await server.ssrLoadModule('/src/ReceivablesLesson.jsx');const {App}=await server.ssrLoadModule('/src/App.jsx');
    const render=records=>renderToStaticMarkup(createElement(LessonPractice,{item:prediction,records,dispatch:()=>{}}));
    assert.ok(!render().includes('practice-solution'));assert.ok(!render().includes(prediction.solution));
    let s=reduce(createLearningSession(),action(prediction,'lesson-hint',{hint:0}));assert.ok(!render(s.lessonPractice).includes('practice-solution'));
    s=reduce(s,action(prediction,'lesson-answer',{choice:'new-sale'}));assert.ok(render(s.lessonPractice).includes('practice-solution'));
    for(const id of ['A02','T06.04']){
      const html=renderToStaticMarkup(createElement(App,{initialRoute:{view:'lesson',id},initialSession:s}));
      assert.ok(html.includes('NILA HOMEWARE'));assert.ok(html.includes('First lesson-practice answer'));
      assert.ok(html.indexOf(prediction.question)<html.indexOf('Read gross and net balances together'),'Checkpoint is not interleaved');
      assert.ok(html.includes('BROADER STUDY GUIDE'));assert.ok(html.includes('Apply it in the cash mystery'));assert.ok(html.includes('customer-collection lab is planned'));
    }
    assert.equal(lessonPracticeCounts(s.lessonPractice).answered,1,'Two concept routes duplicate the assessment record');
  }finally{await server.close();delete globalThis.window;}
});
