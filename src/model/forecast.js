import {ModelError,toPaise,fromPaise,dateNumber,daysBetween} from './contract.js';
const fail=(field,message)=>{throw new ModelError('forecast',message,field);};
const money=(v,field)=>toPaise(v,field);
const signed=(v,field)=>{if(typeof v!=='number'||!Number.isFinite(v))fail(field,'Use a finite cash-flow amount.');return Math.sign(v)*money(Math.abs(v),field);};
const rate=(v,field='rate')=>{if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>1)fail(field,'Use a stated rate between zero and 100%, entered as a fraction.');return v;};
const rows=(a,field)=>{if(!Array.isArray(a)||a.length<1||a.length>120)fail(field,'Provide between 1 and 120 explicit periods or cash flows.');};
const finite=(v,field)=>{if(!Number.isFinite(v))fail(field,'The assumptions do not produce a finite result.');return v;};
export function cashForecast({opening,minimum,events}){
 let cash=money(opening,'opening'),funding=0;const buffer=money(minimum,'minimum');rows(events,'events');let last='',firstBreach=null,lowest=cash;const grouped=[];
 for(const e of events){dateNumber(e.date);if(e.date<last)fail('date','List dated cash events in chronological order.');last=e.date;const r=money(e.receipts,'receipts'),p=money(e.payments,'payments');if(grouped.at(-1)?.date===e.date){grouped.at(-1).r+=r;grouped.at(-1).p+=p;}else grouped.push({date:e.date,r,p});}
 // Daily amounts are netted; no intraday sequence is inferred.
 const result=grouped.map(e=>{cash+=e.r-e.p;lowest=Math.min(lowest,cash);if(cash<buffer&&firstBreach===null)firstBreach=e.date;const need=Math.max(funding,buffer-cash,0),staged=need-funding;funding=need;return {date:e.date,receipts:fromPaise(e.r),payments:fromPaise(e.p),unfundedClosing:fromPaise(cash),cumulativeRequired:fromPaise(funding),stagedFunding:fromPaise(staged),fundedClosing:fromPaise(cash+funding)};});
 return {opening,minimum,rows:result,firstBreach,totalFundingNeeded:fromPaise(funding),lowestUnfundedCash:fromPaise(lowest),openingBufferShortfall:fromPaise(Math.max(0,buffer-money(opening,'opening')))};
}
export function fcff({ebit,taxRate,depreciation,capex,workingCapitalChange}){
 const op=signed(ebit,'ebit'),tax=Math.round(Math.max(op,0)*rate(taxRate,'taxRate')),dep=money(depreciation,'depreciation'),investment=money(capex,'capex'),wc=signed(workingCapitalChange,'workingCapitalChange');const nopat=op-tax,operatingCash=nopat+dep-wc;
 return {ebit:fromPaise(op),operatingTax:fromPaise(tax),nopat:fromPaise(nopat),depreciation,capex,workingCapitalChange,operatingCash:fromPaise(operatingCash),fcff:fromPaise(operatingCash-investment)};
}
export function operatingForecast({opening,periods}){
 rows(periods,'periods');const wc=b=>money(b.receivables,'receivables')+money(b.inventory,'inventory')-money(b.tradePayables,'tradePayables')-money(b.accruedOperating,'accruedOperating');let prior=wc(opening),last='',ids=new Set();
 return periods.map(p=>{if(typeof p.id!=='string'||!p.id||ids.has(p.id))fail('id','Give each forecast period a unique reference.');ids.add(p.id);dateNumber(p.endDate);if(p.endDate<=last)fail('endDate','Forecast period ends must increase.');last=p.endDate;
  if(typeof p.units!=='number'||!Number.isFinite(p.units)||p.units<0||p.units>1e6)fail('units','Use a finite non-negative sales quantity up to 1,000,000.');
  const price=money(p.price,'price'),cost=money(p.unitCost,'unitCost'),revenue=Math.round(p.units*price),cogs=Math.round(p.units*cost),expense=money(p.operatingCosts,'operatingCosts'),dep=money(p.depreciation,'depreciation');if(![revenue,cogs].every(Number.isSafeInteger))fail('units','The sales assumptions exceed the model currency limit.');const closingWC=wc(p.closing),change=closingWC-prior;prior=closingWC;
  return {id:p.id,endDate:p.endDate,units:p.units,price:p.price,unitCost:p.unitCost,revenue:fromPaise(revenue),costOfSales:fromPaise(cogs),operatingCosts:p.operatingCosts,closingWorkingCapital:fromPaise(closingWC),...fcff({ebit:fromPaise(revenue-cogs-expense-dep),taxRate:p.taxRate,depreciation:p.depreciation,capex:p.capex,workingCapitalChange:fromPaise(change)})};
 });
}
export function projectNPV({initial,cashFlows,rate:discount}){
 rows(cashFlows,'cashFlows');rate(discount);const initialPaise=money(initial,'initial'),presentValues=cashFlows.map((c,i)=>fromPaise(signed(c,'cashFlow'))/(1+discount)**(i+1));return {initial,rate:discount,presentValues,npv:finite(-fromPaise(initialPaise)+presentValues.reduce((a,b)=>a+b,0),'npv')};
}
export function datedNPV({valuationDate,flows,rate:discount}){
 dateNumber(valuationDate);rate(discount);rows(flows,'flows');const ids=new Set();const presentValues=flows.map(f=>{if(typeof f.id!=='string'||!f.id||ids.has(f.id))fail('id','Each dated flow needs a unique reference.');ids.add(f.id);dateNumber(f.date);if(f.date<valuationDate)fail('date','Discount only flows on or after the valuation date.');const amount=fromPaise(signed(f.amount,'cashFlow'));return {id:f.id,date:f.date,amount,presentValue:amount/(1+discount)**(daysBetween(valuationDate,f.date)/365)};});return {valuationDate,rate:discount,presentValues,npv:finite(presentValues.reduce((n,f)=>n+f.presentValue,0),'npv')};
}
export function financingTerms({need,annualRate,years,preMoney}){
 money(need,'need');if(need<=0)fail('need','Specify positive funding to compare.');rate(annualRate,'annualRate');money(preMoney,'preMoney');if(preMoney<=0)fail('preMoney','Use a positive stated pre-money equity value.');if(typeof years!=='number'||!Number.isFinite(years)||years<=0||years>20)fail('years','Use an explicit term above zero and no greater than twenty years.');const interest=fromPaise(Math.round(money(need,'need')*annualRate*years));return {need,annualRate,years,interest,totalRepayment:need+interest,preMoney,postMoney:preMoney+need,newOwnership:need/(preMoney+need),existingOwnership:preMoney/(preMoney+need)};
}
export function valueFCFF({cashFlows,wacc,growth,debt=0,excessCash=0,otherClaims=0}){
 rows(cashFlows,'cashFlows');rate(wacc,'wacc');if(typeof growth!=='number'||!Number.isFinite(growth)||growth<=-1||growth>=wacc)fail('growth','Perpetual growth must be above −100% and strictly below the supplied WACC.');cashFlows.forEach(c=>signed(c,'fcff'));if(cashFlows.at(-1)<=0)fail('fcff','This perpetuity requires positive sustainable final FCFF; use another supported terminal method otherwise.');[debt,excessCash,otherClaims].forEach((v,i)=>money(v,['debt','excessCash','otherClaims'][i]));const terminal=cashFlows.at(-1)*(1+growth)/(wacc-growth),pvTerminal=terminal/(1+wacc)**cashFlows.length,presentValues=cashFlows.map((v,i)=>v/(1+wacc)**(i+1));const enterprise=finite(presentValues.reduce((a,b)=>a+b,0)+pvTerminal,'enterprise'),equity=enterprise-debt+excessCash-otherClaims;return {cashFlows:[...cashFlows],wacc,growth,presentValues,terminal,pvTerminal,enterprise,debt,excessCash,otherClaims,equity,equityBridgeBelowZero:equity<0};
}
export function valuationSensitivity(base,{waccs,growths}){
 if(!Array.isArray(waccs)||!Array.isArray(growths)||!waccs.length||!growths.length||waccs.length>20||growths.length>20)fail('sensitivity','Choose up to twenty explicit values per sensitivity axis.');return waccs.flatMap(wacc=>growths.map(growth=>{try{return {wacc,growth,...valueFCFF({...base,wacc,growth})};}catch(e){return {wacc,growth,error:e.message};}}));
}
