import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lessonPackages, lessonPackageForConcept } from '../src/lesson-packages.js';
import { practiceKey, practiceRecord, lessonPracticeCounts } from '../src/lesson-practice.js';
import { createLearningSession, learningSessionReducer as reduce, learningCounts } from '../src/learning-session.js';
import { validateLessonPackage } from '../scripts/lesson-standard.mjs';
const atlas=JSON.parse(readFileSync(new URL('../content/master-network.json',import.meta.url)));
const policy=JSON.parse(readFileSync(new URL('../content/coverage-policy.json',import.meta.url)));
const get=id=>lessonPackageForConcept(id);
const values=item=>Object.fromEntries(item.inputs.map(i=>[i.key,i.value]));
const action=(lesson,item,type,extra={})=>({type,conceptId:lesson.conceptId,contentVersion:lesson.contentVersion,questionId:item.id,version:item.version,...extra});

test('B1 packages meet the lesson standard, explicitly scoped review and renderer mapping',()=>{
  assert.deepEqual(lessonPackages.map(p=>p.conceptId),['T04.01','T04.05','T06.02','A01','A02']);
  assert.equal(lessonPackages.reduce((sum,p)=>sum+p.practice.length,0),11);
  for(const p of lessonPackages){
    assert.deepEqual(validateLessonPackage(p,atlas),[],p.conceptId);
    assert.ok(p.mechanism.every(m=>m.title?.trim()),p.conceptId);
    assert.equal(p.review.state,'reviewed');assert.ok(p.review.reviewer.includes('AI'));
    assert.ok(p.scope.deferred.length);assert.ok(p.context.fictional);
    const scenarios=[p.workedExample,...p.practice].map(x=>x.scenarioId);
    assert.equal(new Set(scenarios).size,scenarios.length);
  }
  for(const entry of policy.packages)for(const id of entry.renderedConceptIds)assert.equal(get(id)?.conceptId,JSON.parse(readFileSync(new URL('../'+entry.file,import.meta.url))).conceptId,id);
  assert.equal(get('T06.04'),get('A02'));
  assert.equal(get('T05.01'),undefined,'A deep-reading alias must not imply new package integration');
  assert.equal(get('A03'),undefined,'B2 has not been converted');
});

test('independent ledger arithmetic reconciles all accounting-equation and accrual worked balances',()=>{
  const e=values(get('T04.01').workedExample);
  const profit=e.sales-e.costSold;
  const cash=e.openingCash+e.borrowing+e.sales-e.supplierPayment-e.distribution;
  const inventory=e.inventoryPurchase-e.costSold;
  const liabilities=e.borrowing+e.inventoryPurchase-e.supplierPayment;
  const equity=e.openingCash+profit-e.distribution;
  assert.deepEqual([cash,inventory,liabilities,equity,profit],[67,5,24,48,11]);
  assert.equal(cash+inventory,liabilities+equity);
  assert.equal(cash-e.openingCash,(e.sales-e.supplierPayment)+(e.borrowing-e.distribution));
  const a=values(get('T04.05').workedExample),insuranceExpense=a.insurancePayment/a.coverageMonths;
  const netIncome=a.sales-a.openingInventory-a.wageExpense-insuranceExpense;
  const cashFlow=a.receipts-a.wagePayment-a.insurancePayment;
  const receivable=a.sales-a.receipts,payable=a.wageExpense-a.wagePayment,prepaid=a.insurancePayment-insuranceExpense;
  assert.deepEqual([netIncome,cashFlow,receivable,payable,prepaid],[10,8,12,2,4]);
  assert.equal(netIncome-receivable+a.openingInventory+payable-prepaid,cashFlow);
  assert.equal(a.openingCash+cashFlow+receivable+prepaid,payable+a.openingCash+a.openingInventory+netIncome);
});

test('cash-component and revenue examples reconcile classification, availability, performance and collections',()=>{
  const c=values(get('T06.02').workedExample);
  const reported=c.cash+c.deposit+c.qualifyingBill,usable=reported-c.restricted;
  assert.deepEqual([reported,usable,usable-c.buffer],[21,17,14]);
  assert.equal((c.deposit-2)+(c.qualifyingBill+2)+c.cash,reported,'A qualifying internal transfer creates no external cash flow');
  assert.equal(Object.hasOwn(c,'profit'),false);
  const r=values(get('A01').workedExample),receivable=r.deliveredPrice-r.advance-r.currentReceipts;
  assert.deepEqual([receivable,r.deliveredPrice-r.deliveredCost,r.advance+r.currentReceipts],[7,10,17]);
  assert.equal(r.advance+r.currentReceipts+receivable,r.deliveredPrice);
  assert.equal(r.deliveredPrice+r.remainingPrice,r.contractPrice);
  assert.notEqual(r.currentReceipts,r.advance+r.currentReceipts,'Current receipts must not include the earlier advance');
});

test('changed-data practice answers agree with independent calculations rather than worked-example totals',()=>{
  const [eq1,eq2]=get('T04.01').practice, x=values(eq1),y=values(eq2);
  assert.equal(x.openingCash+x.loan-x.equipment,45);assert.equal(x.openingCash+x.loan,65);
  assert.equal(eq1.correctOptionId,'balanced');
  assert.equal(y.openingCash+y.sale-y.cost,40);assert.equal(y.openingCash+y.purchase-y.cost+y.sale,50);assert.equal(eq2.correctOptionId,'balanced');
  const [ac1,ac2]=get('T04.05').practice,a=values(ac1),b=values(ac2);
  assert.deepEqual([a.revenue-a.expense,a.receipts-a.payment],[17,4]);
  assert.deepEqual([b.earned-b.insurance/b.months,b.insurance-b.insurance/b.months,b.advance-b.earned,b.advance-b.insurance],[1,10,5,-4]);
  assert.equal(ac1.correctOptionId,'correct');assert.equal(ac2.correctOptionId,'correct');
  const [ce1,ce2]=get('T06.02').practice,c=values(ce1),d=values(ce2);
  assert.equal(c.deposit+c.bill,11);assert.deepEqual([d.deposit+d.bill,d.deposit+d.bill-d.restriction],[13,9]);
  assert.equal(ce1.correctOptionId,'correct');assert.equal(ce2.correctOptionId,'correct');
  const [rv1,rv2]=get('A01').practice,r=values(rv2);
  assert.equal(values(rv1).advance,9);assert.equal(rv1.correctOptionId,'correct');
  assert.deepEqual([r.price-r.advance-r.currentReceipt,r.price-r.cost],[10,9]);assert.equal(rv2.correctOptionId,'correct');
});

test('all lesson records isolate owners, versions, first responses, assistance and retries without changing topic/case totals',()=>{
  let state=createLearningSession();const before=learningCounts(state);
  const keys=new Set();
  for(const lesson of lessonPackages)for(const item of lesson.practice){
    const wrong=item.options.find(o=>o.id!==item.correctOptionId).id;
    assert.ok(!keys.has(practiceKey(item)));keys.add(practiceKey(item));
    for(const bad of [{conceptId:'missing'},{contentVersion:'99.0.0'},{version:'99.0.0'},{choice:'missing'}])assert.equal(reduce(state,action(lesson,item,'lesson-answer',{choice:item.correctOptionId,...bad})),state);
    state=reduce(state,action(lesson,item,'lesson-answer',{choice:wrong,correct:true}));
    state=reduce(state,action(lesson,item,'lesson-answer',{choice:item.correctOptionId}));
    state=reduce(state,action(lesson,item,'lesson-retry'));
    const record=practiceRecord(state.lessonPractice,item);
    assert.equal(record.choice,null);assert.equal(record.responses[0].correct,false);assert.equal(record.responses.at(-1).correct,true);assert.equal(record.revealed,true);
  }
  assert.deepEqual(learningCounts(state),before);
  assert.deepEqual(lessonPracticeCounts(state.lessonPractice),{answered:11,latestCorrect:11,firstUnassisted:0,helped:0,total:11});
  assert.equal(practiceKey(get('A02').practice[0]),'A02@1.0.0:collect-predict@1.0.0','Preserve the original receivables key');
  const lesson=get('T04.01'),item=lesson.practice[0];
  assert.equal(reduce(state,action(get('A01'),item,'lesson-answer',{choice:item.correctOptionId})),state,'Question cannot be answered under another lesson owner');
});

test('help remains question-scoped and cannot award an unassisted first response',()=>{
  for(const lesson of lessonPackages)for(const item of lesson.practice){
    let s=createLearningSession();s=reduce(s,action(lesson,item,'lesson-hint',{hint:0}));
    assert.equal(practiceRecord(s.lessonPractice,item).revealed,false);assert.equal(lessonPracticeCounts(s.lessonPractice).answered,0);
    s=reduce(s,action(lesson,item,'lesson-hint',{hint:1}));assert.equal(practiceRecord(s.lessonPractice,item).revealed,true);
    s=reduce(s,action(lesson,item,'lesson-answer',{choice:item.correctOptionId}));
    assert.equal(lessonPracticeCounts(s.lessonPractice).firstUnassisted,0);
    assert.equal(lessonPracticeCounts(s.lessonPractice).helped,1);
  }
});

test('actual B1 routes render the right package, interleave checkpoints and hide every initial practice solution',async()=>{
  globalThis.window={location:{hash:'#atlas/lessons/T04.01'}};
  const {createServer}=await import('vite'),{default:react}=await import('@vitejs/plugin-react');
  const {createElement}=await import('react'),{renderToStaticMarkup}=await import('react-dom/server');
  const server=await createServer({configFile:false,plugins:[react()],server:{middlewareMode:true,hmr:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]},appType:'custom'});
  try{
    const {App}=await server.ssrLoadModule('/src/App.jsx'),{LessonPractice}=await server.ssrLoadModule('/src/StandardLesson.jsx');
    for(const lesson of lessonPackages){
      const html=renderToStaticMarkup(createElement(App,{initialRoute:{view:'lesson',id:lesson.conceptId}}));
      assert.ok(html.includes(`data-lesson-concept="${lesson.conceptId}"`));
      assert.ok(html.includes('BROADER STUDY GUIDE'));assert.ok(html.includes('Topic quiz'));
      assert.ok(html.includes('each unit is shown'));assert.ok(html.includes('Scope still to study'));
      const checkpoint=lesson.practice.find(q=>q.stage==='checkpoint'),after=lesson.mechanism.findIndex(m=>m.id===checkpoint.afterMechanismId);
      assert.ok(html.indexOf(checkpoint.question)>html.indexOf(lesson.mechanism[after].title));
      if(lesson.mechanism[after+1])assert.ok(html.indexOf(checkpoint.question)<html.indexOf(lesson.mechanism[after+1].title));
      for(const item of lesson.practice){
        const render=records=>renderToStaticMarkup(createElement(LessonPractice,{item,records,dispatch:()=>{}}));
        const untouched=render();assert.ok(!untouched.includes('practice-solution'));assert.ok(!untouched.includes('aria-pressed="true"'));
        let s=reduce(createLearningSession(),action(lesson,item,'lesson-hint',{hint:0}));assert.ok(!render(s.lessonPractice).includes('practice-solution'));
        s=reduce(s,action(lesson,item,'lesson-answer',{choice:item.options.find(o=>o.id!==item.correctOptionId).id}));
        assert.ok(render(s.lessonPractice).includes('Not quite.'));assert.ok(render(s.lessonPractice).includes('practice-solution'));
      }
    }
    const alias=renderToStaticMarkup(createElement(App,{initialRoute:{view:'lesson',id:'T06.04'}}));assert.ok(alias.includes('data-lesson-concept="A02"'));
  }finally{await server.close();delete globalThis.window;}
});
