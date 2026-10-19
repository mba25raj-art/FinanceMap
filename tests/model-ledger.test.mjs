import test from 'node:test';
import assert from 'node:assert/strict';
import refs from '../content/model/references.v1.json' with {type:'json'};
import {createModel,postTransaction,replayTransactions,balances,inLakh,assertModel} from '../src/model/ledger.js';
test('roadmap sequence posts exact balanced snapshots and cash provenance',()=>{
 let s=createModel(undefined,refs.core.rules);refs.core.transactions.forEach((t,i)=>{s=postTransaction(s,t);assertModel(s);const expected=refs.core.expected.find(r=>r.after===i+1);if(expected){const b=inLakh(balances(s));for(const [k,v]of Object.entries(expected))if(k!=='after')assert.equal(b[k==='payables'?'tradePayables':k],v,k);}});
 const flow={operating:0,investing:0,financing:0};for(const row of s.journal)if(row.account==='cash')flow[row.cashCategory]+=row.amount/1e7;
 assert.deepEqual({...flow,change:Object.values(flow).reduce((a,b)=>a+b,0)},refs.core.cashFlow);
 assert.ok(s.journal.every(r=>r.sourceId&&r.type&&r.date));assert.deepEqual(s,replayTransactions(refs.core.transactions,undefined,refs.core.rules));
});
test('owner funding, inventory receipt and partial supplier settlement preserve cost recognition',()=>{
 let s=createModel();for(const t of [{id:'fund',type:'owner-funding',amount:5},{id:'stock',type:'inventory-purchase',amount:10,cashPaid:2,dueDate:'2026-02-01'},{id:'pay',type:'supplier-payment',amount:3,payableId:'stock'}])s=postTransaction(s,{date:'2026-01-01',...t});
 const b=inLakh(balances(s));assert.equal(b.cash,20);assert.equal(b.inventory,60);assert.equal(b.tradePayables,30);assert.equal(b.profit,0);assert.equal(b.contributedCapital,105);assert.equal(s.payables.stock.balance,5e7);
});
test('collection and accrual settlement never repeat income or expense',()=>{
 let s=createModel();s=postTransaction(s,{id:'bill',type:'operating-accrual',date:'2026-01-02',amount:6});
 s=postTransaction(s,{id:'pay',type:'operating-payment',date:'2026-01-03',amount:4,accrualId:'bill'});
 s=postTransaction(s,{id:'collect',type:'collection',date:'2026-01-04',amount:10,invoiceId:'opening-customers'});
 const b=inLakh(balances(s));assert.equal(b.profit,-6);assert.equal(b.accruedOperating,2);assert.equal(b.cash,26);assert.equal(b.revenue,0);
});
test('equipment credit is separate from operating creditors and principal repayment is not expense',()=>{
 let s=createModel();for(const t of [{id:'machine',type:'equipment-purchase',amount:10,cashPaid:2,dueDate:'2026-02-01',residual:1,lifeMonths:12,availableDate:'2026-01-01'},{id:'pay',type:'equipment-payment',amount:3,payableId:'machine'},{id:'principal',type:'debt-repayment',amount:4,loanId:'opening-debt'}])s=postTransaction(s,{date:'2026-01-01',...t});
 const b=inLakh(balances(s));assert.equal(b.equipment,110);assert.equal(b.equipmentPayables,5);assert.equal(b.tradePayables,25);assert.equal(b.debt,71);assert.equal(b.profit,0);assert.equal(b.cash,11);
});
test('failed funding, stock, settlement, duplicate and ordering checks leave state untouched',()=>{
 const s=createModel(),before=structuredClone(s);
 const bad=[{id:'big',type:'operating-payment',amount:21},{id:'sale',type:'credit-sale',amount:100,cost:51,dueDate:'2026-02-01'},{id:'collect',type:'collection',amount:31,invoiceId:'opening-customers'},{id:'missing',type:'collection',amount:1,invoiceId:'missing'},{id:'opening-customers',type:'owner-funding',amount:1}];
 for(const t of bad){assert.throws(()=>postTransaction(s,{date:'2026-01-02',...t}));assert.deepEqual(s,before);}
 assert.throws(()=>postTransaction(s,{id:'gap',type:'operating-payment',date:'2026-01-02',amount:21}),e=>e.code==='funding'&&e.shortfall===1e7&&e.bufferRequirement===4e7);
 const later=postTransaction(s,{id:'later',type:'owner-funding',date:'2026-01-03',amount:1});assert.throws(()=>postTransaction(later,{id:'earlier',type:'owner-funding',date:'2026-01-02',amount:1}),e=>e.code==='order');
});
test('minimum buffer is disclosed policy and is not an invented overdraft',()=>{
 const s=postTransaction(createModel(),{id:'spend',type:'operating-payment',date:'2026-01-01',amount:19});assert.equal(inLakh(balances(s)).cash,1);assert.equal(inLakh(balances(s)).debt,75);
});
test('new equity uses pre-money ownership arithmetic and financing cash',()=>{
 const s=postTransaction(createModel(),{id:'raise',type:'equity-issue',date:'2026-01-01',amount:10,preMoney:40,investorId:'new-owner'});assert.equal(s.owners['new-owner']/s.shares,.2);assert.equal(inLakh(balances(s)).revenue,0);assert.equal(inLakh(balances(s)).cash,30);
});
