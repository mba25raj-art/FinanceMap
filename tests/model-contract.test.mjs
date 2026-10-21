import test from 'node:test';
import assert from 'node:assert/strict';
import refs from '../content/model/references.v1.json' with {type:'json'};
import {nilaScenario as s,toPaise,fromPaise,dateNumber,daysBetween,validateTransaction,assertTransaction,accountIsDebit} from '../src/model/contract.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const tx={id:'sale-1',type:'credit-sale',date:'2026-01-05',amount:20,cost:12,dueDate:'2026-02-04'};
test('opening chart reconciles to the roadmap and register balances',()=>{
 let debit=0,credit=0;for(const [id,v] of Object.entries(s.opening)){assert.ok(s.accounts[id]);if(accountIsDebit(s.accounts[id]))debit+=v;else credit+=v;}
 assert.equal(debit,200);assert.equal(credit,200);
 for(const [register,account,field] of [['receivables','receivables','amount'],['payables','tradePayables','amount'],['equipment','equipmentCost','cost'],['loans','debt','principal']])assert.equal(s[register].reduce((n,r)=>n+r[field],0),s.opening[account]);
});
test('integer paise accepts one paise and refuses invalid or sub-paise amounts',()=>{
 assert.equal(toPaise(.0000001),1);assert.equal(fromPaise(toPaise(12.34)),12.34);
 for(const v of [-1,NaN,Infinity,'10',.00000001,1000001])assert.throws(()=>toPaise(v));
 assert.throws(()=>toPaise(0,'amount',{zero:false}));assert.equal(toPaise(0),0);
});
test('calendar and reporting horizons are strict',()=>{
 assert.ok(dateNumber('2024-02-29'));assert.equal(daysBetween('2026-01-01','2027-01-01'),365);
 for(const d of ['2026-02-29','2026-04-31','2026-1-01','x'])assert.throws(()=>dateNumber(d));
 for(const d of ['2025-12-31','2028-01-01'])assert.equal(validateTransaction({...tx,date:d}).ok,false);
 assert.equal(validateTransaction({...tx,dueDate:'2026-01-04'}).ok,false);
});
test('transactions whitelist fields and normalize inputs without mutation',()=>{
 const before=structuredClone(tx),result=assertTransaction(tx);assert.deepEqual(tx,before);assert.equal(result.amount,200000000);
 for(const bad of [{...tx,id:'__proto__'},{...tx,type:'close'},{...tx,cash:100},{...tx,cost:undefined},{...tx,amount:0}])assert.equal(validateTransaction(bad).ok,false);
 for(const t of refs.core.transactions)assert.ok(validateTransaction(t).ok);
});
test('equipment and debt terms reject inconsistent terms',()=>{
 const equipment=refs.core.transactions.at(-1);
 for(const change of [{cashPaid:31},{cashPaid:20},{residual:31},{lifeMonths:1.5},{lifeMonths:0},{availableDate:'2026-01-14'}])assert.equal(validateTransaction({...equipment,...change}).ok,false);
 assert.ok(validateTransaction({...equipment,cashPaid:20,dueDate:'2026-02-01'}).ok);
 const loan=refs.core.transactions[2];for(const change of [{annualRate:1.01},{annualRate:-.1},{maturity:loan.date}])assert.equal(validateTransaction({...loan,...change}).ok,false);
});
test('roadmap core arithmetic is independently reproduced',()=>{
 let cash=20,ar=30,inventory=50,ppe=100,debt=75,profit=0;
 refs.core.transactions.forEach((t,i)=>{
  if(t.type==='credit-sale'){ar+=t.amount;inventory-=t.cost;profit+=t.amount-t.cost;}
  if(t.type==='collection'){cash+=t.amount;ar-=t.amount;}
  if(t.type==='borrowing'){cash+=t.amount;debt+=t.amount;}
  if(t.type==='equipment-purchase'){cash-=t.cashPaid;ppe+=t.amount;}
  const expected=refs.core.expected.find(r=>r.after===i+1);if(expected)assert.deepEqual({after:i+1,cash,receivables:ar,inventory,equipment:ppe,payables:25,debt,profit,equity:100+profit,assets:cash+ar+inventory+ppe},expected);
 });
 assert.equal(cash,20);assert.equal(25+debt+100+profit,cash+ar+inventory+ppe);
});
test('independent forecast, financing, NPV and DCF controls match the source',()=>{
 const r=refs.independent,f=r.cashForecast;let cash=f.opening,raised=0;
 f.receipts.forEach((v,i)=>{cash+=v-f.payments[i];assert.equal(cash,f.unfundedClosing[i]);const need=Math.max(raised,f.minimum-cash,0);assert.equal(need,f.cumulativeRequired[i]);assert.equal(need-raised,f.stagedDraws[i]);raised=need;});
 near(r.financing.need*r.financing.annualRate,r.financing.interest);near(r.financing.need/r.financing.postMoney,r.financing.newOwnership);
 const p=r.project;near(-p.initial+p.cashFlows.reduce((n,c,i)=>n+c/(1+p.rate)**(i+1),0),p.npv);
 const v=r.valuation,dcf=w=>v.fcff[0]/(1+w)+(v.fcff[1]+v.fcff[1]*(1+v.growth)/(w-v.growth))/(1+w)**2;
 near(v.fcff[1]*(1+v.growth)/(v.wacc-v.growth),v.terminal);near(dcf(v.wacc),v.enterprise);near(v.enterprise-v.debt+v.excessCash,v.equity);near(dcf(v.higherWacc),v.higherEnterprise);near(v.higherEnterprise-v.debt+v.excessCash,v.higherEquity);
});
