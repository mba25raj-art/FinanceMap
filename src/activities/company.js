import script from '../../content/cases/nila.v1.json' with {type:'json'};
import config from '../../content/model/nila-case.v1.json' with {type:'json'};
import {ModelError,dateNumber} from '../model/contract.js';
import {createModel,postTransaction,balances,inLakh} from '../model/ledger.js';
import {statements} from '../model/statements.js';
import {closePeriod} from '../model/close.js';
import {cashForecast,fcff,operatingForecast,projectNPV,valueFCFF,valuationSensitivity} from '../model/forecast.js';
export {script as companyScript};
export const COMPANY='CASE-NILA-HOMEWARE',IMPLEMENTED_ROUNDS=6;
export const emptyCompany=()=>({activityId:COMPANY,scenarioVersion:'1.0.0',period:0,decisions:[]});
const fail=message=>{throw new ModelError('activity',message,'decision');};
const shape=(v,keys)=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==keys.length||keys.some(k=>!Object.hasOwn(v,k)))fail('Unsupported or missing company-case fields.');};
const shifted=(date,days)=>new Date(dateNumber(date)+days*86400000).toISOString().slice(0,10);
export function companyOperatingTransactions(choices,variant='base'){
 const delay=script.variants.find(v=>v.id===variant)?.customerReceiptDelayDays;if(delay===undefined)fail('Unavailable company scenario variant.');
 const events=[],add=t=>events.push(t),s=script.sale,c=script.collection;
 if(choices.R1){const term=s.terms.find(t=>t.id===choices.R1);if(!term)fail('Unavailable customer credit term.');add({id:'case-sale',type:'credit-sale',date:s.date,amount:s.amount,cost:s.cost,dueDate:term.dueDate});add({id:'case-sale-collection',type:'collection',date:shifted(term.dueDate,delay),amount:s.amount,invoiceId:'case-sale'});}
 const early=choices.R2==='agent-early';
 add({id:'case-opening-collection',type:'collection',date:shifted(early?c.earlyDate:c.waitDate,delay),amount:c.amount,invoiceId:c.invoiceId});
 add({id:'case-remaining-collection',type:'collection',date:shifted(c.remainingOpeningDate,delay),amount:c.remainingOpeningAmount,invoiceId:c.invoiceId});
 if(early)add({id:'case-agent-service',type:'operating-payment',date:c.agentFeeDate,amount:c.agentFee});
 if(choices.R3){const stock=script.inventory,cash=choices.R3==='cash-discount';if(!cash&&choices.R3!=='supplier-credit')fail('Unavailable supplier offer.');add({id:'case-stock',type:'inventory-purchase',date:stock.date,amount:cash?stock.cashPrice:stock.creditPrice,cashPaid:cash?stock.cashPrice:0,...(!cash?{dueDate:stock.creditDue}:{})});if(!cash)add({id:'case-stock-settlement',type:'supplier-payment',date:stock.creditDue,amount:stock.creditPrice,payableId:'case-stock'});}
 add({id:'case-opening-supplier',type:'supplier-payment',date:script.calendar.openingSupplierPayment,amount:25,payableId:'opening-suppliers'});
 script.calendar.operatingPayments.forEach((p,i)=>add({id:`case-running-cost-${i+1}`,type:'operating-payment',date:p.date,amount:p.amount}));
 return events.sort((a,b)=>a.date.localeCompare(b.date));
}
const postThrough=(events,cutoff)=>{let model=createModel(config);for(const t of events.filter(t=>t.date<=cutoff))model=postTransaction(model,t);model.lastDate=cutoff;return model;};
const cashEvent=t=>({date:t.date,receipts:['collection','borrowing','equity-issue'].includes(t.type)?t.amount:0,payments:['supplier-payment','operating-payment'].includes(t.type)?t.amount:t.type==='equipment-purchase'?t.cashPaid:0});
export function companyFundingPlans(choices,variant='base'){
 const events=companyOperatingTransactions(choices,variant),opening=inLakh(balances(postThrough(events,script.funding.date))).cash;
 return Object.fromEntries(script.funding.plans.map(plan=>{const schedule=[...events.filter(t=>t.date>script.funding.date&&t.date<=script.cashForecastEnd).map(cashEvent),...(plan==='expand'?[{date:script.investment.date,receipts:0,payments:script.investment.cost}]:[])].sort((a,b)=>a.date.localeCompare(b.date));return [plan,cashForecast({opening,minimum:script.minimumCash,events:schedule})];}));
}
export function companyFunding(choices,variant='base'){
 if(!choices.R4)return null;const [instrument,plan]=choices.R4.split('-');if(!script.funding.instruments.includes(instrument)||!script.funding.plans.includes(plan))fail('Choose a supplied funding contract.');
 const forecast=companyFundingPlans(choices,variant)[plan],amount=forecast.totalFundingNeeded;
 if(instrument==='none'&&amount!==0)fail('This plan needs funding to retain minimum cash. Choose debt or equity.');
 if(instrument!=='none'&&amount===0)fail('This plan has no funding need. Choose no funding rather than a zero-value issue.');
 if(instrument==='debt'&&amount>script.funding.loanLimit)fail('The requested funding exceeds the disclosed debt offer.');
 return {instrument,plan,amount,forecast,annualCoupon:instrument==='debt'?amount*script.funding.loanAnnualRate:0,newOwnership:instrument==='equity'?amount/(script.funding.preMoney+amount):0};
}
export function companyTransactions(choices,variant='base'){
 const events=companyOperatingTransactions(choices,variant),funding=companyFunding(choices,variant);
 if(funding?.amount){events.push(funding.instrument==='debt'?{id:'case-new-funding',type:'borrowing',date:script.funding.date,amount:funding.amount,annualRate:script.funding.loanAnnualRate,maturity:script.calendar.newDebtMaturity}:{id:'case-new-funding',type:'equity-issue',date:script.funding.date,amount:funding.amount,preMoney:script.funding.preMoney,investorId:'case-investor'});}
 if(choices.R5==='buy-now'){
  if(!funding||companyFundingPlans(choices,variant).expand.totalFundingNeeded>funding.amount+.00000001)fail('The committed financing cannot keep the full equipment quarter above the cash minimum. Defer or compare another funded branch.');
  const p=script.investment;events.push({id:'case-equipment',type:'equipment-purchase',date:p.date,amount:p.cost,cashPaid:p.cost,residual:p.residual,lifeMonths:p.lifeMonths,availableDate:p.availableDate});
 }else if(choices.R5&&choices.R5!=='defer')fail('Choose buy now or defer.');
 return events.sort((a,b)=>a.date.localeCompare(b.date));
}
export function companyLedgerAt(choices,variant,cutoff){
 let model=postThrough(companyTransactions(choices,variant),cutoff);
 if(cutoff==='2026-01-31')model=closePeriod(model,'2026-01');return model;
}
export function companyProject(){
 const p=script.investment,operating=fcff({ebit:p.incrementalAnnualOrders*(p.pricePerOrder-p.costPerOrder)-p.incrementalAnnualOperatingCost-p.incrementalAnnualDepreciation,taxRate:script.forecast.taxRate,depreciation:p.incrementalAnnualDepreciation,capex:p.incrementalAnnualMaintenanceCapex,workingCapitalChange:0});
 const cashFlows=Array.from({length:p.projectYears},(_,i)=>operating.fcff-(i===0?p.additionalWorkingCapital:0)+(i===p.projectYears-1?p.additionalWorkingCapital:0)),npv=projectNPV({initial:p.cost,cashFlows,rate:p.projectRate});
 return {...npv,operating,cashFlows,deferredNPV:npv.npv/(1+p.projectRate)};
}
export function companyProjection(model,expanded){
 const b=inLakh(balances(model)),f=script.forecast,p=script.investment;
 return operatingForecast({opening:b,periods:Array.from({length:f.years},(_,i)=>({id:`year${i+1}`,endDate:`${2027+i}-01-31`,units:f.baseUnits+(expanded?p.incrementalAnnualOrders:0),price:f.price,unitCost:f.unitCost,operatingCosts:f.operatingCosts+(expanded?p.incrementalAnnualOperatingCost:0),depreciation:f.depreciation+(expanded?p.incrementalAnnualDepreciation:0),capex:f.maintenanceCapex+(expanded?p.incrementalAnnualMaintenanceCapex:0),taxRate:f.taxRate,closing:expanded?f.expandedClosingWorkingCapital:f.baseClosingWorkingCapital}))});
}
const valueInputs=model=>{const b=inLakh(balances(model));return {debt:b.debt,excessCash:Math.max(b.cash-script.minimumCash,0),otherClaims:b.interestPayable+b.taxPayable};};
const rates=choice=>{const m=/^wacc(10|12)-growth(0|3)$/.exec(choice||'');if(!m)fail('Choose a supplied discount and growth combination.');return {wacc:Number(m[1])/100,growth:Number(m[2])/100};};
function expectedFor(round,choices,variant){
 if(round===1)return {profit:8,cash:0};if(round===2)return {revenue:0,operatingCash:10};if(round===3)return {profit:0,payables:10};
 if(round===4)return {fundingGap:companyFundingPlans(choices,variant).expand.totalFundingNeeded};if(round===5)return {npv:companyProject().npv};
 return {fcff:companyProjection(companyLedgerAt(choices,variant,'2026-01-31'),choices.R5==='buy-now')[0].fcff};
}
const grade=(values,expected)=>{shape(values,Object.keys(expected));const checks={};for(const [key,value]of Object.entries(values)){if(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>1e9)fail('Enter finite numerical predictions inside the scenario limit.');checks[key]=Math.abs(value-expected[key])<=.010000001;}return {values:structuredClone(values),checks,allCorrect:Object.values(checks).every(Boolean)};};
function derive(record,checkPeriod){
 shape(record,['activityId','scenarioVersion','period','decisions']);if(record.activityId!==COMPANY||record.scenarioVersion!=='1.0.0')fail('This company scenario version is unavailable. Keep the original export.');
 if(!Array.isArray(record.decisions)||record.decisions.length>1000||!Number.isSafeInteger(record.period)||record.period<0||record.period>IMPLEMENTED_ROUNDS)fail('Invalid company-case stage or decision history.');
 let variant=null,completed=0,finished=false,replayFrom=null;const replayRounds=[];const choices={},expectedByRound={};const rounds=Array.from({length:IMPLEMENTED_ROUNDS},()=>({attempts:[],hints:[],choice:null,explanation:''}));
 for(const d of record.decisions){
  if(!d||typeof d!=='object'||Array.isArray(d))fail('Invalid company-case decision.');
  if(!variant){shape(d,['type','variant']);if(d.type!=='setup'||!script.variants.some(v=>v.id===d.variant))fail('Choose a disclosed company scenario variant.');variant=d.variant;continue;}
  if(d.type==='finish'){shape(d,['type']);if(completed!==IMPLEMENTED_ROUNDS||finished)fail('Explain all six rounds before one explicit Finish.');finished=true;continue;}
  if(finished)fail('This company record is finished. Start a new experiment.');
  const round=completed+1,current=rounds[completed];if(!current||d.round!==round)fail('That action is outside the current company round.');
  if(d.type==='replay'){shape(d,['type','round']);if(current.attempts.length||current.hints.length||current.choice!==null||replayRounds.includes(round))fail('A replay marker must precede all work in its restarted round.');replayRounds.push(round);replayFrom=Math.min(replayFrom??round,round);}
  else if(d.type==='hint'){shape(d,['type','round','stage']);if(d.stage!==current.hints.length+1||d.stage>3)fail('Request the next available hint stage.');current.hints.push(d.stage);}
  else if(d.type==='predict'){shape(d,['type','round','values']);current.attempts.push({...grade(d.values,expectedByRound[round]??=expectedFor(round,choices,variant)),helpBeforeAnswer:current.hints.length>0,priorExposure:replayFrom!==null&&round>=replayFrom});}
  else if(d.type==='commit'){shape(d,['type','round','choice']);if(!current.attempts.length||current.choice!==null||!script.rounds[completed].choices.includes(d.choice))fail('Attempt the prediction, then commit one supplied decision.');const candidate={...choices,[`R${round}`]:d.choice};if(round===4)companyFunding(candidate,variant);if(round===5)companyTransactions(candidate,variant);if(round===6)rates(d.choice);current.choice=d.choice;choices[`R${round}`]=d.choice;}
  else if(d.type==='explain'){shape(d,['type','round','text']);if(current.choice===null||typeof d.text!=='string'||!d.text.trim()||d.text.length>2000)fail('Commit a choice and save an explanation up to 2,000 characters.');current.explanation=d.text;completed++;}
  else fail('This company action is unavailable.');
 }
 if(checkPeriod&&record.period!==completed)fail('The saved completed-round count does not match its decisions.');
 const currentRound=Math.min(completed+1,IMPLEMENTED_ROUNDS),current=rounds[currentRound-1];
 const cutoff=variant?script.rounds[currentRound-1].date:config.startDate,model=companyLedgerAt(choices,variant||'base',cutoff);
 const phase=!variant?'setup':finished?'complete':completed===IMPLEMENTED_ROUNDS?'finish':current.choice!==null?'explain':current.attempts.length?'decide':'predict';
 const beforeChoices={...choices};delete beforeChoices[`R${currentRound}`];const beforeModel=current.choice===null?model:companyLedgerAt(beforeChoices,variant,cutoff);
 const projection=currentRound===6?companyProjection(model,choices.R5==='buy-now'):null,claims=projection?valueInputs(model):null,valuation=choices.R6?valueFCFF({cashFlows:projection.map(r=>r.fcff),...claims,...rates(choices.R6)}):null;
 const quarter=variant&&currentRound>=4?cashForecast({opening:inLakh(balances(model)).cash,minimum:script.minimumCash,events:companyTransactions(choices,variant).filter(t=>t.date>cutoff&&t.date<=script.cashForecastEnd).map(cashEvent)}):null;
 return {variant,replayFrom,completed,round:currentRound,phase,rounds,current,choices,cutoff,model,before:inLakh(balances(beforeModel)),after:inLakh(balances(model)),statements:statements(model),expected:expectedByRound[currentRound]??expectedFor(currentRound,choices,variant||'base'),finished,financial:{plans:currentRound>=4?companyFundingPlans(choices,variant||'base'):null,funding:companyFunding(choices,variant||'base'),project:companyProject(),quarter,projection,valuation,sensitivity:projection?valuationSensitivity({cashFlows:projection.map(r=>r.fcff),...claims},{waccs:script.forecast.waccOptions,growths:script.forecast.growthOptions}):[]},pending:companyTransactions(choices,variant||'base').filter(t=>t.date>cutoff)};
}
export const replayCompany=record=>derive(record,true);
export function addCompanyDecision(record,decision){const next=structuredClone(record);next.decisions.push(structuredClone(decision));next.period=derive(next,false).completed;return next;}
export function companyHint(round,stage,result){
 const direction=['Separate recognition from payment.','Track the claim that the customer already owes.','Separate stock received from stock sold.','Order the dated cash receipts and payments before adding funding.','Discount incremental project cash, including reinvestment.','Separate operating cash available to all capital providers from financing.'];
 const mechanism=['Profit is selling price less assigned cost; a credit sale has no collection at delivery.','Settlement exchanges a customer claim for cash. The question excludes the separate agent service.','The all-credit offer adds an asset and an obligation; no new stock is sold and no payment is made.','Start with cash on 15 January. Subtract the equipment, suppliers and running costs on their dates; maintain the three-lakh minimum at the lowest point.','Use EBIT after operating tax, add depreciation, then subtract maintenance capex and additional working capital; release working capital only at the standalone project end.','FCFF equals EBIT after operating tax plus depreciation, less capex and the change in operating working capital. Start from your actual January closing working capital.'];
 const worked=['Profit increases by 20 − 12 = 8; cash movement is 0.','Revenue effect is 0; operating cash increases by 10.','Profit effect is 0; trade payables increase by 10.',`The expanded quarter needs ${result?.expected?.fundingGap?.toFixed(2)??'the computed peak shortfall'} lakh of cumulative funding.`,`The five project cash flows are 2.80, 12.80, 12.80, 12.80 and 22.80; NPV at ten percent is ${companyProject().npv.toFixed(2)}.`,`Your first forecast-year FCFF is ${result?.expected?.fcff?.toFixed(2)??'computed from your actual closing working capital'}.`];
 if(!Number.isInteger(round)||round<1||round>6||!Number.isInteger(stage)||stage<1||stage>3)fail('Unavailable hint.');return [direction,mechanism,worked][stage-1][round-1];
}

export function forkCompany(record,restartRound){
 const source=replayCompany(record);if(!Number.isSafeInteger(restartRound)||restartRound<1||restartRound>IMPLEMENTED_ROUNDS||!source.rounds[restartRound-1].choice)fail('Restart from an actual saved contract decision.');
 const at=record.decisions.findIndex(d=>d.round===restartRound);const fork=emptyCompany();fork.decisions=structuredClone(record.decisions.slice(0,at));fork.period=restartRound-1;
 return addCompanyDecision(fork,{type:'replay',round:restartRound});
}
export function compareCompany(left,right){
 const a=replayCompany(left),b=replayCompany(right);if(!a.finished||!b.finished)fail('Finish both company records before comparing their complete outcomes.');if(a.variant!==b.variant)fail('Compare strategies within the same disclosed receipt scenario.');
 const summarize=r=>{const values=valueFCFF({cashFlows:r.financial.projection.map(p=>p.fcff),...valueInputs(r.model),wacc:.1,growth:.03}),atFunding=companyLedgerAt(r.choices,r.variant,script.funding.date),opening=inLakh(balances(atFunding)).cash,quarter=cashForecast({opening,minimum:script.minimumCash,events:companyTransactions(r.choices,r.variant).filter(t=>t.date>script.funding.date&&t.date<=script.cashForecastEnd).map(cashEvent)});return {choices:r.choices,cash:r.after.cash,profit:r.after.profit,debt:r.after.debt,founderOwnership:r.model.owners.founder/r.model.shares,raised:r.financial.funding.amount,quarterMinimum:quarter.lowestUnfundedCash,additionalNeed:quarter.totalFundingNeeded,firstFCFF:r.financial.projection[0].fcff,enterprise:values.enterprise,equity:values.equity};};
 return {variant:a.variant,comparisonWACC:.1,comparisonGrowth:.03,left:summarize(a),right:summarize(b)};
}
