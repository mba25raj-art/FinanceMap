import {ModelError,dateNumber,toPaise} from '../model/contract.js';
import {createModel,postTransaction,inLakh,balances} from '../model/ledger.js';
import {statements} from '../model/statements.js';
import {cashForecast} from '../model/forecast.js';
export const COLLECTIONS='LAB-COLLECTIONS';
export const emptyCollection=()=>({activityId:COLLECTIONS,scenarioVersion:'1.0.0',period:0,decisions:[]});
const fail=message=>{throw new ModelError('activity',message,'decision');};
const shape=(v,keys)=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==keys.length||keys.some(k=>!Object.hasOwn(v,k)))fail('Unsupported or missing collection-lab fields.');};
export function replayCollection(record){
 shape(record,['activityId','scenarioVersion','period','decisions']);if(record.activityId!==COLLECTIONS||record.scenarioVersion!=='1.0.0')fail('This collection scenario version is unavailable. Keep the original export.');
 if(!Array.isArray(record.decisions)||record.decisions.length>3||record.period!==record.decisions.length)fail('The collection lab has an inconsistent decision stage.');
 let model=createModel(undefined,{depreciation:false,interest:false,taxRate:0}),before=null,prediction=null,forecast=null,reflection='';
 for(const [i,d]of record.decisions.entries()){
  if(i===0){shape(d,['type','amount','cost']);if(d.type!=='sale'||d.amount<5||d.amount>30||d.cost>50)fail('Use a qualifying sale of 5–30 lakh and inventory cost up to the available 50 lakh.');model=postTransaction(model,{id:'lab-sale',type:'credit-sale',date:'2026-01-05',amount:d.amount,cost:d.cost,dueDate:'2026-02-15'});before=inLakh(balances(model));}
  if(i===1){shape(d,['type','amount','paymentDate','cash','receivables','profit','classification']);if(d.type!=='prediction')fail('Record a prediction before revealing collection results.');dateNumber(d.paymentDate);if(!['2026-01-10','2026-02-15','2026-03-15'].includes(d.paymentDate))fail('Choose a supplied settlement date.');for(const k of ['cash','receivables','profit'])if(!['increase','decrease','unchanged'].includes(d[k]))fail('Predict each account direction.');if(!['operating','investing','financing'].includes(d.classification))fail('Predict the cash-flow category.');toPaise(d.amount);if(d.amount>record.decisions[0].amount)fail('Collection cannot exceed this invoice.');
   model=postTransaction(model,{id:'lab-collection',type:'collection',date:d.paymentDate,amount:d.amount,invoiceId:'lab-sale'});prediction={...d,checks:{cash:d.cash==='increase',receivables:d.receivables==='decrease',profit:d.profit==='unchanged',classification:d.classification==='operating'}};
   forecast=cashForecast({opening:20,minimum:3,events:[{date:d.paymentDate,receipts:d.amount,payments:0},{date:'2026-01-20',receipts:0,payments:8},{date:'2026-02-10',receipts:0,payments:25}].sort((a,b)=>a.date.localeCompare(b.date))});
  }
  if(i===2){shape(d,['type','text']);if(d.type!=='explanation'||typeof d.text!=='string'||!d.text.trim()||d.text.length>2000)fail('Add a short explanation up to 2,000 characters.');reflection=d.text;}
 }
 return {model,before,after:prediction?inLakh(balances(model)):null,statements:prediction?statements(model):null,prediction,forecast,reflection,phase:record.period};
}
export function addCollectionDecision(record,decision){const next=structuredClone(record);next.period++;next.decisions.push(structuredClone(decision));replayCollection(next);return next;}
