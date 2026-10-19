import {ModelError} from '../model/contract.js';
import {createModel,postTransaction,inLakh,balances} from '../model/ledger.js';
import {closePeriod,monthBounds} from '../model/close.js';
import {statements} from '../model/statements.js';
import {datedNPV,cashForecast} from '../model/forecast.js';
export const EQUIPMENT='LAB-EQUIPMENT';
export const emptyEquipment=()=>({activityId:EQUIPMENT,scenarioVersion:'1.0.0',period:0,decisions:[]});
const fail=message=>{throw new ModelError('activity',message,'decision');};
const shape=(v,keys)=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==keys.length||keys.some(k=>!Object.hasOwn(v,k)))fail('Unsupported or missing equipment-lab fields.');};
const nextMonth=date=>monthBounds(date.slice(0,7)).next;
const nextYear=(date,n)=>`${Number(date.slice(0,4))+n}${date.slice(4)}`;
export function equipmentBranch({purchase,payment,available,lifeMonths}){
 const purchaseDate=purchase==='now'?'2026-01-01':'2026-07-01',paymentDate=payment==='purchase'?purchaseDate:nextMonth(purchaseDate),availableDate=available==='purchase'?purchaseDate:nextMonth(purchaseDate);
 const transactions=[{id:'new-equipment',type:'equipment-purchase',date:purchaseDate,amount:10,cashPaid:payment==='purchase'?10:0,...(payment==='next-month'?{dueDate:paymentDate}:{}),residual:0,lifeMonths,availableDate},...(payment==='next-month'?[{id:'equipment-settlement',type:'equipment-payment',date:paymentDate,amount:10,payableId:'new-equipment'}]:[])];
 let model=createModel(undefined,{depreciation:true,interest:false,taxRate:0}),baseline=createModel(undefined,{depreciation:true,interest:false,taxRate:0}),atAcquisition=null;const months=[];
 for(let m=1;m<=12;m++){
  const period=`2026-${String(m).padStart(2,'0')}`,bounds=monthBounds(period);
  for(const t of transactions.filter(t=>t.date>=bounds.from&&t.date<=bounds.to)){model=postTransaction(model,t);if(t.type==='equipment-purchase')atAcquisition=inLakh(balances(model));}
  model=closePeriod(model,period);baseline=closePeriod(baseline,period);const r=statements(model,{from:bounds.from}),b=statements(baseline,{from:bounds.from}),asset=model.equipment['new-equipment'];
  months.push({period,cash:balances(model).cash/1e7,investing:r.cashFlow.investing/1e7,newDepreciation:(r.income.depreciation-b.income.depreciation)/1e7,newProfitEffect:(r.income.netIncome-b.income.netIncome)/1e7,newCarryingValue:asset?(asset.cost-asset.accumulated)/1e7:0});
 }
 const project=datedNPV({valuationDate:'2026-01-01',rate:.1,flows:[{id:'investment',date:paymentDate,amount:-10},{id:'benefit-1',date:nextYear(availableDate,1),amount:6},{id:'benefit-2',date:nextYear(availableDate,2),amount:6}]});
 const forecast=cashForecast({opening:20,minimum:3,events:[{date:paymentDate,receipts:0,payments:10},{date:'2026-03-01',receipts:0,payments:15},{date:'2026-06-01',receipts:8,payments:0}].sort((a,b)=>a.date.localeCompare(b.date))});
 return {purchaseDate,paymentDate,availableDate,lifeMonths,model,atAcquisition,months,project,forecast};
}
export function replayEquipment(record){
 shape(record,['activityId','scenarioVersion','period','decisions']);if(record.activityId!==EQUIPMENT||record.scenarioVersion!=='1.0.0')fail('This equipment scenario version is unavailable. Keep the original export.');
 if(!Array.isArray(record.decisions)||record.decisions.length>2||record.period!==record.decisions.length)fail('The equipment lab has an inconsistent decision stage.');
 if(!record.decisions.length)return {phase:0};
 const d=record.decisions[0];shape(d,['type','purchase','payment','available','lifeMonths','cash','asset','profit']);
 if(d.type!=='prediction'||!['now','later'].includes(d.purchase)||!['purchase','next-month'].includes(d.payment)||!['purchase','next-month'].includes(d.available)||![24,36].includes(d.lifeMonths))fail('Choose the supplied purchase, payment, availability and useful-life terms.');
 for(const k of ['cash','asset','profit'])if(!['increase','decrease','unchanged'].includes(d[k]))fail('Predict each acquisition-day account effect.');
 const now=equipmentBranch({...d,purchase:'now'}),later=equipmentBranch({...d,purchase:'later'}),selected=d.purchase==='now'?now:later,checks={cash:d.cash===(d.payment==='purchase'?'decrease':'unchanged'),asset:d.asset==='increase',profit:d.profit==='unchanged'};
 let reflection='';if(record.decisions[1]){const r=record.decisions[1];shape(r,['type','text']);if(r.type!=='explanation'||typeof r.text!=='string'||!r.text.trim()||r.text.length>2000)fail('Add an explanation up to 2,000 characters.');reflection=r.text;}
 return {phase:record.period,selected,now,later,prediction:d,checks,reflection};
}
export function addEquipmentDecision(record,decision){const next=structuredClone(record);next.period++;next.decisions.push(structuredClone(decision));replayEquipment(next);return next;}
