import test from 'node:test';
import assert from 'node:assert/strict';
import refs from '../content/model/references.v1.json' with {type:'json'};
import {nilaScenario} from '../src/model/contract.js';
import {createModel,postTransaction,replayTransactions,inLakh,balances} from '../src/model/ledger.js';
import {statements} from '../src/model/statements.js';
import {closePeriod,replayModel} from '../src/model/close.js';
const empty=()=>{const c=structuredClone(nilaScenario);for(const k of Object.keys(c.opening))c.opening[k]=0;c.receivables=[];c.payables=[];c.equipment=[];c.loans=[];return c;};
test('three statements reconcile the roadmap from one journal',()=>{
 const s=replayTransactions(refs.core.transactions,undefined,refs.core.rules),r=statements(s);
 assert.equal(r.income.netIncome,8e7);assert.equal(r.balanceSheet.assets,228e7);assert.deepEqual(inLakh(r.cashFlow),{opening:20,operating:10,investing:-30,financing:20,closing:20,change:0});assert.equal(r.indirect.workingCapitalChange,-2e7);assert.equal(r.indirect.operating,10e7);
});
test('indirect cash distinguishes operating accruals and non-cash equipment creditors',()=>{
 let s=createModel(undefined,refs.core.rules);
 for(const t of [{id:'accrue',type:'operating-accrual',amount:6},{id:'settle',type:'operating-payment',amount:4,accrualId:'accrue'},{id:'asset',type:'equipment-purchase',amount:24,cashPaid:0,dueDate:'2026-02-01',residual:0,lifeMonths:12,availableDate:'2026-01-01'}])s=postTransaction(s,{date:'2026-01-01',...t});
 const r=statements(s);assert.equal(r.income.netIncome,-6e7);assert.equal(r.cashFlow.operating,-4e7);assert.equal(r.indirect.workingCapitalChange,-2e7);assert.equal(r.cashFlow.investing,0);assert.equal(r.balanceSheet.equipmentPayables,24e7);
});
test('depreciation full-month and part-month charges cap at residual with no cash expense',()=>{
 let s=createModel(empty(),{interest:false,taxRate:0});
 s=postTransaction(s,{id:'asset',type:'equipment-purchase',date:'2026-01-01',amount:24,cashPaid:0,dueDate:'2026-12-31',residual:0,lifeMonths:12,availableDate:'2026-01-01'});s=closePeriod(s,'2026-01');
 let r=statements(s);assert.equal(r.income.depreciation,2e7);assert.equal(r.balanceSheet.equipment,22e7);assert.equal(r.cashFlow.change,0);assert.equal(r.indirect.operating,0);
 for(let m=2;m<=12;m++)s=closePeriod(s,`2026-${String(m).padStart(2,'0')}`);s=closePeriod(s,'2027-01');assert.equal(balances(s).equipment,0);assert.equal(statements(s,{from:'2027-01-01'}).income.depreciation,0);
 let p=createModel(empty(),{interest:false,taxRate:0});p=postTransaction(p,{id:'partial',type:'equipment-purchase',date:'2026-01-16',amount:31,cashPaid:0,dueDate:'2026-12-31',residual:0,lifeMonths:1,availableDate:'2026-01-16'});p=closePeriod(p,'2026-01');assert.equal(statements(p).income.depreciation,16e7);
});
test('Actual/365 interest retains principal and settles next period without a second expense',()=>{
 let s=createModel(empty(),{depreciation:false,taxRate:0});s=postTransaction(s,{id:'loan',type:'borrowing',date:'2026-01-01',amount:10,annualRate:.12,maturity:'2027-01-01'});
 for(let m=1;m<=12;m++)s=closePeriod(s,`2026-${String(m).padStart(2,'0')}`);
 assert.equal(balances(s).debt,10e7);assert.equal(statements(s).income.interest,1.2e7);assert.equal(statements(s).cashFlow.operating,0);
 s=postTransaction(s,{id:'pay-interest',type:'interest-payment',date:'2027-01-01',amount:1.2,loanId:'loan'});assert.equal(statements(s,{from:'2027-01-01'}).income.interest,0);assert.equal(statements(s,{from:'2027-01-01'}).cashFlow.operating,-1.2e7);
});
test('mid-month repayment changes daily interest exposure',()=>{
 let s=createModel(empty(),{depreciation:false,taxRate:0});for(const t of [{id:'loan',type:'borrowing',date:'2026-01-01',amount:10,annualRate:.12,maturity:'2027-01-01'},{id:'repay',type:'debt-repayment',date:'2026-01-16',amount:5,loanId:'loan'}])s=postTransaction(s,t);s=closePeriod(s,'2026-01');assert.equal(statements(s).income.interest,Math.round((10e7*15+5e7*16)*.12/365));
});
test('hypothetical tax accrues on positive pre-tax income and payment is not repeated expense',()=>{
 const c=empty();c.opening.inventory=4;c.opening.contributedCapital=4;let s=createModel(c,{depreciation:false,interest:false});
 s=postTransaction(s,{id:'sale',type:'credit-sale',date:'2026-01-01',amount:10,cost:4,dueDate:'2026-02-01'});s=closePeriod(s,'2026-01');let r=statements(s);assert.equal(r.income.preTax,6e7);assert.equal(r.income.tax,1.2e7);assert.equal(r.income.netIncome,4.8e7);assert.equal(r.indirect.operating,0);
 s=postTransaction(s,{id:'collect',type:'collection',date:'2026-02-01',amount:10,invoiceId:'sale'});s=postTransaction(s,{id:'tax',type:'tax-payment',date:'2026-02-01',amount:1.2,taxPeriod:'2026-01'});assert.equal(statements(s,{from:'2026-02-01'}).income.tax,0);
 let loss=createModel(undefined,{depreciation:false,interest:false});loss=postTransaction(loss,{id:'expense',type:'operating-payment',date:'2026-01-01',amount:1});loss=closePeriod(loss,'2026-01');assert.equal(statements(loss).income.tax,0);
});
test('period close is ordered, sealed and deterministic; intervals preserve opening equity',()=>{
 let s=createModel(undefined,refs.core.rules);assert.throws(()=>closePeriod(s,'2026-02'));s=closePeriod(s,'2026-01');const before=structuredClone(s);assert.throws(()=>closePeriod(s,'2026-01'));assert.deepEqual(s,before);
 assert.throws(()=>postTransaction(s,{id:'old',type:'owner-funding',date:'2026-01-31',amount:1}));s=postTransaction(s,{id:'new',type:'owner-funding',date:'2026-02-01',amount:1});s=closePeriod(s,'2026-02');assert.deepEqual(replayModel(s.decisions,undefined,refs.core.rules),s);const r=statements(s,{from:'2026-02-01'});assert.equal(r.equityBridge.opening,100e7);assert.equal(r.equityBridge.closing,101e7);
 assert.throws(()=>createModel(undefined,{taxRate:NaN}));assert.throws(()=>createModel(undefined,{surprise:true}));
});
