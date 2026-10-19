import script from '../../content/cases/nila.v1.json' with {type:'json'};
import config from '../../content/model/nila-case.v1.json' with {type:'json'};
import {ModelError,toPaise,dateNumber} from '../model/contract.js';
import {createModel,postTransaction,balances,inLakh} from '../model/ledger.js';
import {statements} from '../model/statements.js';
export {script as companyScript};
export const COMPANY='CASE-NILA-HOMEWARE',IMPLEMENTED_ROUNDS=3;
export const emptyCompany=()=>({activityId:COMPANY,scenarioVersion:'1.0.0',period:0,decisions:[]});
const fail=message=>{throw new ModelError('activity',message,'decision');};
const shape=(v,keys)=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==keys.length||keys.some(k=>!Object.hasOwn(v,k)))fail('Unsupported or missing company-case fields.');};
const shifted=(date,days)=>new Date(dateNumber(date)+days*86400000).toISOString().slice(0,10);
export function companyTransactions(choices,variant='base'){
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
export function companyLedgerAt(choices,variant,cutoff){
 let model=createModel(config);for(const t of companyTransactions(choices,variant).filter(t=>t.date<=cutoff))model=postTransaction(model,t);
 // Advancing the disclosed case clock does not invent a journal entry. Replay always starts at the opening.
 model.lastDate=cutoff;return model;
}
const expectedFor=round=>round===1?{profit:8,cash:0}:round===2?{revenue:0,operatingCash:10}:{profit:0,payables:10};
const grade=(values,round)=>{const expected=expectedFor(round);shape(values,Object.keys(expected));const checks={};for(const [key,value]of Object.entries(values)){if(typeof value!=='number'||!Number.isFinite(value))fail('Enter finite numerical predictions.');toPaise(Math.abs(value),key);checks[key]=Math.abs(value-expected[key])<=.010000001;}return {values:structuredClone(values),checks,allCorrect:Object.values(checks).every(Boolean)};};
function derive(record,checkPeriod){
 shape(record,['activityId','scenarioVersion','period','decisions']);if(record.activityId!==COMPANY||record.scenarioVersion!=='1.0.0')fail('This company scenario version is unavailable. Keep the original export.');
 if(!Array.isArray(record.decisions)||record.decisions.length>1000||!Number.isSafeInteger(record.period)||record.period<0||record.period>IMPLEMENTED_ROUNDS)fail('Invalid company-case stage or decision history.');
 let variant=null,completed=0;const rounds=Array.from({length:IMPLEMENTED_ROUNDS},()=>({attempts:[],hints:[],choice:null,explanation:''}));
 for(const d of record.decisions){
  if(!d||typeof d!=='object'||Array.isArray(d))fail('Invalid company-case decision.');
  if(!variant){shape(d,['type','variant']);if(d.type!=='setup'||d.variant!=='base')fail('Choose the base company preview. Alternate variants follow with the replay feature.');variant=d.variant;continue;}
  const round=completed+1,current=rounds[completed];if(!current||d.round!==round)fail('That action is outside the current company round.');
  if(d.type==='hint'){shape(d,['type','round','stage']);if(d.stage!==current.hints.length+1||d.stage>3)fail('Request the next available hint stage.');current.hints.push(d.stage);}
  else if(d.type==='predict'){shape(d,['type','round','values']);current.attempts.push({...grade(d.values,round),helpBeforeAnswer:current.hints.length>0});}
  else if(d.type==='commit'){shape(d,['type','round','choice']);if(!current.attempts.length||current.choice!==null||!script.rounds[completed].choices.includes(d.choice))fail('Attempt the prediction, then commit one supplied decision.');current.choice=d.choice;}
  else if(d.type==='explain'){shape(d,['type','round','text']);if(current.choice===null||typeof d.text!=='string'||!d.text.trim()||d.text.length>2000)fail('Commit a choice and save an explanation up to 2,000 characters.');current.explanation=d.text;completed++;}
  else fail('This company action is unavailable in the three-round preview.');
 }
 if(checkPeriod&&record.period!==completed)fail('The saved completed-round count does not match its decisions.');
 const currentRound=Math.min(completed+1,IMPLEMENTED_ROUNDS),current=rounds[currentRound-1],choices=Object.fromEntries(rounds.flatMap((r,i)=>r.choice===null?[]:[[`R${i+1}`,r.choice]]));
 const cutoff=variant?script.rounds[currentRound-1].date:config.startDate,model=companyLedgerAt(choices,variant||'base',cutoff);
 const phase=!variant?'setup':completed===IMPLEMENTED_ROUNDS?'preview-complete':current.choice!==null?'explain':current.attempts.length?'decide':'predict';
 const beforeChoices={...choices};delete beforeChoices[`R${currentRound}`];const beforeModel=current.choice===null?model:companyLedgerAt(beforeChoices,variant,cutoff);
 return {variant,completed,round:currentRound,phase,rounds,current,choices,cutoff,model,before:inLakh(balances(beforeModel)),after:inLakh(balances(model)),statements:statements(model),expected:expectedFor(currentRound),finished:false,pending:companyTransactions(choices,variant||'base').filter(t=>t.date>cutoff)};
}
export const replayCompany=record=>derive(record,true);
export function addCompanyDecision(record,decision){const next=structuredClone(record);next.decisions.push(structuredClone(decision));next.period=derive(next,false).completed;return next;}
export function companyHint(round,stage){
 const direction=['Separate recognition from payment.','Track the claim that the customer already owes.','Separate stock received from stock sold.'];
 const mechanism=['Profit is selling price less assigned cost; a credit sale has no collection at delivery.','Settlement exchanges a customer claim for cash. The question excludes the separate agent service.','The all-credit offer adds an asset and an obligation; no new stock is sold and no payment is made.'];
 const worked=['Profit increases by 20 − 12 = 8; cash movement is 0.','Revenue effect is 0; operating cash increases by 10.','Profit effect is 0; trade payables increase by 10.'];
 if(!Number.isInteger(round)||round<1||round>3||!Number.isInteger(stage)||stage<1||stage>3)fail('Unavailable hint.');return [direction,mechanism,worked][stage-1][round-1];
}
