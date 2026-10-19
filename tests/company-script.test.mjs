import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import script from '../content/cases/nila.v1.json' with {type:'json'};
import refs from '../content/cases/nila-references.v1.json' with {type:'json'};
import config from '../content/model/nila-case.v1.json' with {type:'json'};
import original from '../content/model/nila.v1.json' with {type:'json'};
import {createModel,postTransaction,inLakh,balances} from '../src/model/ledger.js';
import {closePeriod} from '../src/model/close.js';
import {statements} from '../src/model/statements.js';
import {cashForecast,projectNPV,operatingForecast,valueFCFF} from '../src/model/forecast.js';
import {dateNumber} from '../src/model/contract.js';
const near=(a,b,t=1e-7)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
function defaultModel(){
 let s=createModel(config);
 for(const t of [{id:'sale',type:'credit-sale',date:'2026-01-05',amount:20,cost:12,dueDate:'2026-02-04'},{id:'collect',type:'collection',date:'2026-01-10',amount:10,invoiceId:'opening-customers'},{id:'agent',type:'operating-payment',date:'2026-01-10',amount:.2},{id:'stock',type:'inventory-purchase',date:'2026-01-12',amount:9.5,cashPaid:9.5},{id:'fund',type:'borrowing',date:'2026-01-15',amount:19.7,annualRate:.12,maturity:'2029-01-15'},{id:'asset',type:'equipment-purchase',date:'2026-01-16',amount:30,cashPaid:30,residual:0,lifeMonths:60,availableDate:'2026-01-17'},{id:'operating',type:'operating-payment',date:'2026-01-31',amount:2}])s=postTransaction(s,t);
 return closePeriod(s,'2026-01');
}
test('case preserves roadmap opening while lab/reference contracts remain separate and labelled',()=>{
 assert.deepEqual(config.opening,original.opening);assert.equal(inLakh(balances(createModel(config))).assets,200);assert.equal(config.id,'NILA-COMPANY-CASE');assert.equal(config.loans[0].annualRate,.08);assert.equal(original.loans[0].annualRate,.12);assert.equal(config.loans[0].maturity,'2029-01-01');assert.ok(config.assumptions.some(s=>s.includes('roadmap did not specify')));
 assert.equal(script.setup.openingAssets,200);assert.equal(script.setup.openingLiabilitiesAndEquity,200);assert.equal(script.status,'scripted-not-playable');
});
test('six complete rounds cover all selected IDs/outcomes with ordered dates and disclosed terms',()=>{
 const selected=new Set(read('content/first-release-scope.json').concepts.map(c=>c.id)),mapped=new Set(script.setup.optionalConcepts);assert.equal(script.rounds.length,6);let date='';const outcomes=new Set();
 script.rounds.forEach((r,i)=>{assert.equal(r.id,`R${i+1}`);dateNumber(r.date);assert.ok(r.date>date);date=r.date;assert.ok(r.prediction&&r.responseFields.length&&r.choices.length>1&&r.explanation);r.concepts.forEach(id=>{assert.ok(selected.has(id),id);mapped.add(id);});r.outcomes.forEach(id=>outcomes.add(id));});assert.deepEqual(mapped,selected);assert.deepEqual([...outcomes].sort(),['LO1','LO2','LO3','LO4','LO5','LO6']);
 assert.equal(script.funding.loanLimit,60);assert.equal(script.funding.fee,0);assert.equal(script.calendar.newDebtMaturity,'2029-01-15');assert.equal(script.investment.availableDate,'2026-01-17');assert.equal(script.calendar.taxCashDate,'2027-03-31');
});
test('all sixteen independent dated branch controls reconcile with the cash-forecast implementation',()=>{
 assert.equal(refs.quarterBranches.length,16);const shift=(date,days)=>new Date(dateNumber(date)+days*86400000).toISOString().slice(0,10);let zero=0,positive=0;
 for(const r of refs.quarterBranches){
  const delay=script.variants.find(v=>v.id===r.variant).customerReceiptDelayDays,collection=shift(r.collection==='agent-early'?script.collection.earlyDate:script.collection.waitDate,delay),due=shift(script.sale.terms.find(t=>t.id===r.terms).dueDate,delay);
  const opening=20-(r.collection==='agent-early'?.2:0)-(r.inventory==='cash-discount'?9.5:0)+(collection<='2026-01-15'?10:0);near(opening,r.cashAtFundingDate);
  for(const plan of ['operate','expand']){
   const e=[{date:shift('2026-02-15',delay),receipts:20,payments:0},{date:due,receipts:20,payments:0},{date:'2026-02-10',receipts:0,payments:25+(r.inventory==='supplier-credit'?10:0)},...script.calendar.operatingPayments.map(p=>({date:p.date,receipts:0,payments:p.amount})),...(collection>'2026-01-15'?[{date:collection,receipts:10,payments:0}]:[]),...(plan==='expand'?[{date:'2026-01-16',receipts:0,payments:30}]:[])].filter(e=>e.date<=script.cashForecastEnd).sort((a,b)=>a.date.localeCompare(b.date));
   const f=cashForecast({opening,minimum:3,events:e});near(f.totalFundingNeeded,r[plan].funding);near(f.rows.at(-1).unfundedClosing,r[plan].unfundedClosing);assert.equal(f.firstBreach,r[plan].firstBreach);assert.ok(f.totalFundingNeeded<=script.funding.loanLimit);
   if(plan==='operate')r[plan].funding===0?zero++:positive++;
  }
 }assert.ok(zero>0&&positive>0,'No-funding eligibility must be conditional rather than promised for every branch');
});
test('default January ledger/close reconciles every independently calculated reference balance',()=>{
 const s=defaultModel(),b=inLakh(balances(s));for(const [k,v]of Object.entries(refs.default.januaryClose))near(b[k],v);const r=statements(s);assert.equal(r.cashFlow.opening+r.cashFlow.change,r.cashFlow.closing);assert.equal(r.indirect.operating,r.cashFlow.operating);assert.equal(r.equityBridge.closing,r.equityBridge.opening+r.income.netIncome);assert.equal(s.scenarioId,config.id);
});
test('project and continuing-company cash perimeters produce independent NPV/DCF controls',()=>{
 const p=script.investment,ebit=p.incrementalAnnualOrders*(p.pricePerOrder-p.costPerOrder)-p.incrementalAnnualOperatingCost-p.incrementalAnnualDepreciation,nopat=ebit*.8,cash=nopat+p.incrementalAnnualDepreciation-p.incrementalAnnualMaintenanceCapex;
 const flows=Array.from({length:5},(_,i)=>cash-(i===0?10:0)+(i===4?10:0));flows.forEach((v,i)=>near(v,refs.default.projectFlows[i]));near(projectNPV({initial:30,cashFlows:flows,rate:.1}).npv,refs.default.projectNPV);near(refs.default.deferredProjectNPV,refs.default.projectNPV/1.1);
 const b=inLakh(balances(defaultModel())),f=script.forecast,projection=operatingForecast({opening:{receivables:b.receivables,inventory:b.inventory,tradePayables:b.tradePayables,accruedOperating:b.accruedOperating},periods:Array.from({length:5},(_,i)=>({id:`year${i+1}`,endDate:`${2027+i}-01-31`,units:140,price:1,unitCost:.4,operatingCosts:32,depreciation:26,capex:26,taxRate:.2,closing:f.expandedClosingWorkingCapital}))});
 projection.forEach((r,i)=>near(r.fcff,refs.default.forecastFCFF[i]));const v=valueFCFF({cashFlows:projection.map(r=>r.fcff),wacc:.1,growth:.03,debt:b.debt,excessCash:Math.max(0,b.cash-3),otherClaims:b.interestPayable+b.taxPayable});near(v.enterprise,refs.default.enterprise);near(v.equity,refs.default.equity);assert.notEqual(projection.at(-1).fcff,flows.at(-1),'Standalone liquidation must not inflate company terminal FCFF');
});
test('script defines spoiler protection, informed commitment, replay and honest reasoning evidence without publishing',()=>{
 assert.equal(script.interaction.predictionBeforeResults,true);assert.equal(script.interaction.allDecisionTermsBeforeCommit,true);assert.equal(script.interaction.wrongPredictionCanContinue,true);assert.ok(script.interaction.explanationGrading.includes('ungraded'));assert.ok(script.interaction.finish.includes('Explicit Finish'));assert.ok(script.debriefCriteria.some(s=>s.includes('wealth')));assert.equal(script.review.type,'ai-script-contract-arithmetic');
 const activity=read('content/coverage-policy.json').activities.find(a=>a.id===script.activityId);assert.equal(activity.availability,'planned');assert.equal(activity.route,null);
});
