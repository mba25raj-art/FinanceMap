import test from 'node:test';
import assert from 'node:assert/strict';
import refs from '../content/model/references.v1.json' with {type:'json'};
import {cashForecast,fcff,operatingForecast,projectNPV,datedNPV,financingTerms,valueFCFF,valuationSensitivity} from '../src/model/forecast.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('dated forecast preserves unfunded path and staged cumulative funding',()=>{
 const f=refs.independent.cashForecast,r=cashForecast({opening:f.opening,minimum:f.minimum,events:f.receipts.map((v,i)=>({date:`2026-01-${i===0?'07':'14'}`,receipts:v,payments:f.payments[i]}))});assert.deepEqual(r.rows.map(x=>x.unfundedClosing),f.unfundedClosing);assert.deepEqual(r.rows.map(x=>x.cumulativeRequired),f.cumulativeRequired);assert.deepEqual(r.rows.map(x=>x.stagedFunding),f.stagedDraws);assert.equal(r.firstBreach,'2026-01-07');assert.equal(r.totalFundingNeeded,5);assert.deepEqual(r.rows.map(x=>x.fundedClosing),[3,3]);
});
test('daily cash timing is explicit and invalid inputs fail',()=>{
 const r=cashForecast({opening:1,minimum:3,events:[{date:'2026-01-01',receipts:5,payments:0},{date:'2026-01-01',receipts:0,payments:2}]});assert.equal(r.rows.length,1);assert.equal(r.rows[0].unfundedClosing,4);assert.equal(r.openingBufferShortfall,2);
 assert.throws(()=>cashForecast({opening:6,minimum:3,events:[{date:'2026-01-02',receipts:1,payments:1},{date:'2026-01-01',receipts:1,payments:1}]}));assert.throws(()=>cashForecast({opening:6,minimum:3,events:[{date:'2026-02-30',receipts:1,payments:1}]}));
});
test('FCFF matches operating perimeter and excludes financing',()=>{
 assert.equal(fcff({ebit:25,taxRate:.2,depreciation:5,capex:8,workingCapitalChange:10}).fcff,7);const r=fcff({ebit:-5,taxRate:.2,depreciation:2,capex:0,workingCapitalChange:-3});assert.equal(r.operatingTax,0);assert.equal(r.fcff,0);
});
test('sales drivers propagate through working capital and reinvestment',()=>{
 const p={id:'year1',endDate:'2026-12-31',units:10,price:10,unitCost:4,operatingCosts:30,depreciation:5,capex:8,taxRate:.2,closing:{receivables:30,inventory:30,tradePayables:15,accruedOperating:0}},args={opening:{receivables:20,inventory:30,tradePayables:15,accruedOperating:0},periods:[p]},r=operatingForecast(args)[0];assert.equal(r.revenue,100);assert.equal(r.ebit,25);assert.equal(r.nopat,20);assert.equal(r.workingCapitalChange,10);assert.equal(r.fcff,7);assert.equal(operatingForecast({...args,periods:[{...p,price:11}]})[0].fcff-r.fcff,8);assert.throws(()=>operatingForecast({...args,periods:[p,p]}));assert.throws(()=>operatingForecast({...args,periods:[{...p,units:NaN}]}));
});
test('NPV discounts investment once and dates preserve opportunity cost',()=>{
 const p=refs.independent.project;near(projectNPV({initial:p.initial,cashFlows:p.cashFlows,rate:p.rate}).npv,p.npv);const now=datedNPV({valuationDate:'2026-01-01',rate:.1,flows:[{id:'buy',date:'2026-01-01',amount:-10},{id:'y1',date:'2027-01-01',amount:6},{id:'y2',date:'2028-01-01',amount:6}]});near(now.npv,p.npv);const later=datedNPV({valuationDate:'2026-01-01',rate:.1,flows:[{id:'buy',date:'2027-01-01',amount:-10},{id:'y1',date:'2028-01-01',amount:6},{id:'y2',date:'2028-12-31',amount:6}]});near(later.npv,now.npv/1.1);assert.throws(()=>datedNPV({valuationDate:'2026-01-01',rate:.1,flows:[{id:'old',date:'2025-01-01',amount:1}]}));
});
test('simple loan service and equity dilution match reference terms',()=>{
 const f=refs.independent.financing,r=financingTerms({need:f.need,annualRate:f.annualRate,years:f.years,preMoney:f.preMoney});near(r.interest,f.interest);near(r.totalRepayment,f.totalRepayment);near(r.newOwnership,f.newOwnership);near(r.existingOwnership,.8);assert.throws(()=>financingTerms({...f,preMoney:0}));
});
test('DCF and equity bridge match both reference WACCs with recalculated sensitivities',()=>{
 const v=refs.independent.valuation,args={cashFlows:v.fcff,wacc:v.wacc,growth:v.growth,debt:v.debt,excessCash:v.excessCash},r=valueFCFF(args);near(r.terminal,v.terminal);near(r.enterprise,v.enterprise);near(r.equity,v.equity);const higher=valueFCFF({...args,wacc:v.higherWacc});near(higher.enterprise,v.higherEnterprise);near(higher.equity,v.higherEquity);const grid=valuationSensitivity(args,{waccs:[.1,.12],growths:[.03,.11]});near(grid[2].enterprise,v.higherEnterprise);assert.ok(grid[1].error);assert.ok(grid[3].enterprise);assert.equal(valueFCFF({...args,otherClaims:5}).equity,r.equity-5);assert.equal(valueFCFF({...args,debt:1000}).equityBridgeBelowZero,true);
});
test('invalid rates, horizons and perpetuities cannot become teaching results',()=>{
 const valid={cashFlows:[10,12],wacc:.1,growth:.03};for(const change of [{cashFlows:[]},{cashFlows:[10,0]},{cashFlows:[10,NaN]},{wacc:Infinity},{growth:.1},{growth:-1},{debt:-1}])assert.throws(()=>valueFCFF({...valid,...change}));const p={initial:10,cashFlows:[6,6],rate:.1};assert.throws(()=>projectNPV({...p,rate:-1}));assert.throws(()=>projectNPV({...p,cashFlows:[Infinity]}));
});
