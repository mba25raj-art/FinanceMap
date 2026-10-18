import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lessonPackages, lessonPackageForConcept as get } from '../src/lesson-packages.js';
import { validateLessonPackage } from '../scripts/lesson-standard.mjs';
import { createLearningSession, learningSessionReducer as reduce, learningCounts } from '../src/learning-session.js';
import { lessonPracticeCounts, practiceRecord, practiceKey } from '../src/lesson-practice.js';
const atlas=JSON.parse(readFileSync(new URL('../content/master-network.json',import.meta.url)));
const scope=JSON.parse(readFileSync(new URL('../content/first-release-scope.json',import.meta.url)));
const ids=['A03','A04','A05','A06','T07.14'];
const values=item=>Object.fromEntries(item.inputs.map(i=>[i.key,i.value]));
const answer=(lesson,item,choice)=>({type:'lesson-answer',conceptId:lesson.conceptId,contentVersion:lesson.contentVersion,questionId:item.id,version:item.version,choice});

test('B2 integrates exactly its five selected concepts with independent scenarios and explicit AI review',()=>{
  assert.deepEqual(scope.batches.find(b=>b.id==='04.4-B2').conceptIds,ids);
  assert.deepEqual(lessonPackages.slice(5,10).map(p=>p.conceptId),ids);
  assert.equal(lessonPackages.slice(0,10).flatMap(p=>p.practice).length,21);
  const scenarios=new Set();
  for(const id of ids){
    const p=get(id),selected=scope.concepts.find(c=>c.id===id);
    assert.deepEqual(validateLessonPackage(p,atlas),[],id);
    assert.equal(p.review.method,'ai-content-source-arithmetic');
    assert.ok(p.review.reviewer.includes('AI'));assert.equal(p.review.state,'reviewed');
    assert.equal(p.practice.length,2);assert.ok(p.mechanism.every(m=>m.title.trim()));
    assert.equal(p.context.framework.basis,'conceptual');assert.ok(p.context.fictional);
    assert.deepEqual([...new Set(p.objectives.flatMap(o=>o.outcomeIds))].sort(),selected.outcomeIds.slice().sort());
    for(const s of [p.workedExample,...p.practice]){
      assert.ok(!scenarios.has(s.scenarioId));scenarios.add(s.scenarioId);
      assert.ok(s.inputs.every(i=>i.unit==='INR lakh'));
    }
  }
  for(const alias of ['T06.05','T06.13','T14.01','T07.01','T07.03'])assert.equal(get(alias),undefined,'Deep-reading aliases are not implicit package mappings');
});

// Independent balance ledger: post the authored events, rather than parse solution prose.
function ledger(opening){
  const b={cash:0,receivables:0,inventory:0,equipment:0,payables:0,debt:0,equity:0,...opening};
  const cf={operating:0,investing:0,financing:0};let profit=0;
  const check=()=>assert.equal(b.cash+b.receivables+b.inventory+b.equipment,b.payables+b.debt+b.equity);
  check();
  return {
    post(accounts,income=0,cashKind){
      const previousCash=b.cash;
      for(const [k,v] of Object.entries(accounts))b[k]+=v;
      profit+=income;b.equity+=income;
      if(cashKind)cf[cashKind]+=b.cash-previousCash;
      else assert.equal(b.cash,previousCash,'Every bank event needs a category');
      check();
    },
    result(){assert.equal(b.cash-opening.cash,cf.operating+cf.investing+cf.financing);return {b,cf,profit};}
  };
}

test('inventory worked events reconcile cost, non-cash loss, supplier credit, equity and actual cash',()=>{
  const x=values(get('A03').workedExample),l=ledger({cash:x.openingCash,inventory:x.openingInventory,equity:x.openingCash+x.openingInventory});
  l.post({inventory:x.creditPurchase,payables:x.creditPurchase});
  l.post({inventory:x.freight,cash:-x.freight},0,'operating');
  l.post({receivables:x.sales},x.sales);
  l.post({inventory:-x.costSold},-x.costSold);
  l.post({cash:x.collections,receivables:-x.collections},0,'operating');
  const writeDown=Math.max(0,x.openingInventory+x.creditPurchase+x.freight-x.costSold-x.nrv);
  l.post({inventory:-writeDown},-writeDown);
  const {b,cf,profit}=l.result();
  assert.deepEqual([b.cash,b.inventory,b.receivables,b.payables,b.equity,profit,cf.operating],[62,11,6,20,59,9,22]);
  assert.equal(profit-b.receivables-(b.inventory-x.openingInventory)+b.payables,cf.operating);
  const grossInventoryChange=b.inventory+writeDown-x.openingInventory;
  assert.equal(profit+writeDown-b.receivables-grossInventoryChange+b.payables,cf.operating);
});

test('payable worked events reconcile accepted return, inventory sold and settlement without a second expense',()=>{
  const x=values(get('A04').workedExample),l=ledger({cash:x.openingCash,inventory:x.openingInventory,payables:x.openingPayables,equity:x.openingCash+x.openingInventory-x.openingPayables});
  l.post({inventory:x.creditPurchases,payables:x.creditPurchases});
  l.post({inventory:-x.returns,payables:-x.returns});
  l.post({receivables:x.sales},x.sales);l.post({inventory:-x.costSold},-x.costSold);
  l.post({cash:x.collections,receivables:-x.collections},0,'operating');
  l.post({cash:-x.payments,payables:-x.payments},0,'operating');
  const {b,cf,profit}=l.result();
  assert.deepEqual([b.cash,b.receivables,b.inventory,b.payables,b.equity,profit,cf.operating],[53,5,14,9,63,11,3]);
  assert.equal(profit-b.receivables-(b.inventory-x.openingInventory)+(b.payables-x.openingPayables),cf.operating);
});

test('working-capital and operating-cash examples agree with independent direct cash reconstruction',()=>{
  for(const [id,expected] of [['A05',[20,29,8,52,47,41,3,43,114]],['A06',[23,34,12,70,50,45,7,53,154]]]){
    const x=values(get(id).workedExample);
    const opening=x.openingReceivables+x.openingInventory-x.openingPayables;
    const closing=x.closingReceivables+x.closingInventory-x.closingPayables;
    const profit=x.sales-x.costSold-x.wages-x.depreciation;
    const collections=x.openingReceivables+x.sales-x.closingReceivables;
    const purchases=x.costSold+x.closingInventory-x.openingInventory;
    const supplierPayments=x.openingPayables+purchases-x.closingPayables;
    const operating=collections-supplierPayments-x.wages;
    assert.equal(profit+x.depreciation-(closing-opening),operating);
    const cash=x.openingCash+operating-(x.equipmentPurchase??0)+(x.loan??0);
    const equipment=x.openingEquipment+(x.equipmentPurchase??0)-x.depreciation;
    const assets=cash+x.closingReceivables+x.closingInventory+equipment;
    const openingEquity=x.openingCash+x.openingReceivables+x.openingInventory+x.openingEquipment-x.openingPayables;
    assert.equal(assets,x.closingPayables+(x.loan??0)+openingEquity+profit);
    assert.deepEqual([opening,closing,profit,collections,purchases,supplierPayments,operating,cash,assets],expected,id);
  }
});

test('every worked three-statement event balances and direct cash agrees with the indirect bridge',()=>{
  const x=values(get('T07.14').workedExample),l=ledger({cash:x.openingCash,inventory:x.openingInventory,equity:x.openingCash+x.openingInventory});
  l.post({cash:x.loan,debt:x.loan},0,'financing');
  l.post({cash:-x.equipment,equipment:x.equipment},0,'investing');
  l.post({inventory:x.creditPurchase,payables:x.creditPurchase});
  l.post({receivables:x.sales},x.sales);l.post({inventory:-x.costSold},-x.costSold);
  l.post({cash:x.collections,receivables:-x.collections},0,'operating');
  l.post({cash:-x.supplierPayment,payables:-x.supplierPayment},0,'operating');
  l.post({equipment:-x.depreciation},-x.depreciation);
  const {b,cf,profit}=l.result();
  assert.deepEqual(b,{cash:80,receivables:8,inventory:16,equipment:15,payables:3,debt:25,equity:91});
  assert.deepEqual(cf,{operating:13,investing:-18,financing:25});assert.equal(profit,11);
  assert.equal(profit+x.depreciation-b.receivables-(b.inventory-x.openingInventory)+b.payables,cf.operating);
});

test('all ten changed-data B2 assessment keys agree with independent arithmetic and distinct worked totals',()=>{
  const scenarios=new Map(ids.flatMap(id=>get(id).practice.map(q=>[q.id,values(q)])));
  const x=id=>scenarios.get(id);
  let a=x('inv-predict-cost-pool');assert.deepEqual([a.purchase+a.freight-a.costSold,a.sales-a.costSold,a.sales-a.purchase-a.freight],[6,7,1]);
  a=x('inv-transfer-write-down');const loss=a.openingInventory+a.purchase-a.costSold-a.nrv;assert.deepEqual([loss,a.sales-a.costSold-loss,a.sales-a.purchase],[3,5,10]);
  a=x('ap-predict-balance');assert.equal(a.openingPayables+a.purchases-a.payments,14);
  a=x('ap-transfer-sale-settlement');assert.deepEqual([a.openingCash+a.sales-a.payments,a.purchases-a.costSold,a.purchases-a.payments,a.sales-a.costSold],[39,6,7,8]);
  for(const [id,expected] of [['owc-predict-change',[14,18,-4]],['owc-transfer-negative',[-5,-7,2]]]){
    a=x(id);const opening=a.openingReceivables+a.openingInventory-a.openingPayables,closing=a.closingReceivables+a.closingInventory-a.closingPayables;
    assert.deepEqual([opening,closing,-(closing-opening)],expected);
  }
  a=x('ocf-predict-bridge');assert.equal(a.profit+a.depreciation-a.receivablesIncrease-a.inventoryIncrease+a.payablesIncrease,16);
  a=x('ocf-transfer-write-down');const rawChange=a.closingInventory-a.openingInventory;
  assert.equal(a.profit-rawChange,0);assert.equal(a.profit+a.writeDown-(rawChange+a.writeDown),0);
  assert.equal(a.profit+a.writeDown-rawChange,4,'Mixed method deliberately fails the zero-cash control');
  a=x('ts-predict-credit-sale');assert.equal(a.sales-a.costSold,17);assert.equal(a.sales-a.costSold-a.sales+a.costSold,a.receipts);
  a=x('ts-transfer-equipment-loan');const cash=a.openingCash+a.loan-a.equipment,equity=a.openingCash-a.depreciation;
  assert.deepEqual([cash,a.equipment-a.depreciation,equity,-a.depreciation+a.depreciation],[29,18,33,0]);
  assert.equal(cash+a.equipment-a.depreciation,a.loan+equity);
  for(const id of ids)for(const q of get(id).practice){
    assert.equal(q.correctOptionId,'correct');assert.equal(q.options.filter(o=>o.id==='correct').length,1);
    assert.equal(q.options.find(o=>o.id==='correct').misconceptionId,null);
  }
});

test('B2 practice stays separate from B1, alias, topic and case records through answers and retry',()=>{
  let s=createLearningSession();const before=learningCounts(s);
  for(const id of ids){const p=get(id);for(const q of p.practice)s=reduce(s,answer(p,q,q.correctOptionId));}
  assert.deepEqual(lessonPracticeCounts(s.lessonPractice),{answered:10,latestCorrect:10,firstUnassisted:10,helped:0,total:lessonPackages.flatMap(p=>p.practice).length});
  for(const p of lessonPackages.filter(p=>!ids.includes(p.conceptId)))assert.equal(lessonPracticeCounts(s.lessonPractice,p).answered,0);
  assert.deepEqual(learningCounts(s),before);
  const p=get('A06'),q=p.practice[1],key=practiceKey(q),responses=practiceRecord(s.lessonPractice,q).responses;
  s=reduce(s,{...answer(p,q,q.correctOptionId),type:'lesson-retry'});
  assert.deepEqual(practiceRecord(s.lessonPractice,q).responses,responses);assert.equal(practiceRecord(s.lessonPractice,q).choice,null);
  assert.ok(key.startsWith('A06@1.0.0:'));assert.equal(Object.keys(s.lessonPractice).length,10);
  assert.equal(reduce(s,{...answer(p,q,q.correctOptionId),conceptId:'A02'}),s);
});
