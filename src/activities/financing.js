import config from '../../content/model/funding-lab.v1.json' with {type:'json'};
import {ModelError} from '../model/contract.js';
import {createModel,postTransaction,inLakh,balances} from '../model/ledger.js';
import {financingTerms,cashForecast,valueFCFF,valuationSensitivity} from '../model/forecast.js';
export const FINANCING='LAB-FINANCING';
export const emptyFinancing=()=>({activityId:FINANCING,scenarioVersion:'1.0.0',period:0,decisions:[]});
const fail=message=>{throw new ModelError('activity',message,'decision');};
const shape=(v,keys)=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==keys.length||keys.some(k=>!Object.hasOwn(v,k)))fail('Unsupported or missing financing-lab fields.');};
export function replayFinancing(record){
 shape(record,['activityId','scenarioVersion','period','decisions']);if(record.activityId!==FINANCING||record.scenarioVersion!=='1.0.0')fail('This financing scenario version is unavailable. Keep the original export.');
 if(!Array.isArray(record.decisions)||record.decisions.length>2||record.period!==record.decisions.length)fail('The financing lab has an inconsistent decision stage.');
 if(!record.decisions.length)return {phase:0};
 const d=record.decisions[0];shape(d,['type','annualRate','preMoney','firstFCFF','raiseCategory','raiseProfit','newOwnership']);
 if(d.type!=='prediction'||![.12,.18].includes(d.annualRate)||![40,80,160].includes(d.preMoney)||![10,5,-5].includes(d.firstFCFF))fail('Choose the supplied finance terms and common operating scenario.');
 if(!['operating','investing','financing'].includes(d.raiseCategory)||!['increase','decrease','unchanged'].includes(d.raiseProfit)||typeof d.newOwnership!=='number'||!Number.isFinite(d.newOwnership)||d.newOwnership<0||d.newOwnership>100)fail('Predict cash classification, profit and a new ownership percentage from zero to 100.');
 const terms=financingTerms({need:10,annualRate:d.annualRate,years:1,preMoney:d.preMoney});
 const operatingEvents=[{date:'2026-01-01',receipts:10,payments:10},{date:'2026-12-31',receipts:Math.max(0,d.firstFCFF),payments:Math.max(0,-d.firstFCFF)}];
 const branch=kind=>{
  let model=createModel(config,{depreciation:false,interest:false,taxRate:0});model=postTransaction(model,kind==='debt'?{id:'raise',type:'borrowing',date:'2026-01-01',amount:10,annualRate:d.annualRate,maturity:'2027-01-01'}:{id:'raise',type:'equity-issue',date:'2026-01-01',amount:10,preMoney:d.preMoney,investorId:'new-investor'});
  const atRaise=inLakh(balances(model));model=postTransaction(model,{id:'investment',type:'equipment-purchase',date:'2026-01-01',amount:10,cashPaid:10,residual:0,lifeMonths:24,availableDate:'2026-01-01'});
  const forecast=cashForecast({opening:20,minimum:18,events:[...operatingEvents,{date:'2027-01-01',receipts:0,payments:kind==='debt'?terms.totalRepayment:0}]});
  const valuation=valueFCFF({cashFlows:[d.firstFCFF,12],wacc:.1,growth:.03,debt:kind==='debt'?10:0,excessCash:2}),founderOwnership=kind==='debt'?1:terms.existingOwnership;
  return {kind,model,atRaise,afterInvestment:inLakh(balances(model)),forecast,valuation,founderOwnership,founderResidual:valuation.equity*founderOwnership};
 };
 const debt=branch('debt'),equity=branch('equity'),checks={raiseCategory:d.raiseCategory==='financing',raiseProfit:d.raiseProfit==='unchanged',newOwnership:Math.abs(d.newOwnership-terms.newOwnership*100)<=.010000001};
 let reflection='';if(record.decisions[1]){const r=record.decisions[1];shape(r,['type','text']);if(r.type!=='explanation'||typeof r.text!=='string'||!r.text.trim()||r.text.length>2000)fail('Add an explanation up to 2,000 characters.');reflection=r.text;}
 return {phase:record.period,prediction:d,terms,debt,equity,checks,reflection,sensitivity:valuationSensitivity({cashFlows:[d.firstFCFF,12],debt:10,excessCash:2},{waccs:[.1,.12],growths:[.03]})};
}
export function addFinancingDecision(record,decision){const next=structuredClone(record);next.period++;next.decisions.push(structuredClone(decision));replayFinancing(next);return next;}
