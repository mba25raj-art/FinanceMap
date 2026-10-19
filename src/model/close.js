import {ModelError,dateNumber,daysBetween,toPaise} from './contract.js';
import {createModel,postTransaction,appendJournal,assertModel} from './ledger.js';
import {statements} from './statements.js';
export function monthBounds(period){
 if(typeof period!=='string'||!/^\d{4}-(0[1-9]|1[0-2])$/.test(period))throw new ModelError('period','Use a calendar month in YYYY-MM format.','period');
 const from=period+'-01',ms=dateNumber(from),d=new Date(ms);d.setUTCMonth(d.getUTCMonth()+1);const next=d.toISOString().slice(0,10),to=new Date(d.getTime()-86400000).toISOString().slice(0,10);return {from,to,next,days:daysBetween(from,next)};
}
function interestFor(s,loan,until){
 const start=loan.accruedUntil;let principal=0;
 const opening=s.config.loans.find(r=>r.id===loan.id);if(opening)principal=toPaise(opening.principal);
 const changes=s.decisions.filter(t=>(t.type==='borrowing'&&t.id===loan.id)||(t.type==='debt-repayment'&&t.loanId===loan.id));
 const delta=t=>toPaise(t.amount)*(t.type==='borrowing'?1:-1);
 for(const t of changes)if(t.date<start)principal+=delta(t);
 let cursor=start,exposure=0;
 for(const t of changes.filter(t=>t.date>=start&&t.date<until)){exposure+=principal*daysBetween(cursor,t.date);principal+=delta(t);cursor=t.date;}
 exposure+=principal*daysBetween(cursor,until);return exposure*loan.annualRate/365;
}
export function closePeriod(previous,period){
 const bounds=monthBounds(period),expected=previous.sealedThrough?monthBounds(previous.sealedThrough.slice(0,7)).next.slice(0,7):previous.config.startDate.slice(0,7);
 if(period!==expected||bounds.to>previous.config.endDate||previous.lastDate>bounds.to)throw new ModelError('period','Close each reporting month once, in order, before posting the next month.','period');
 const s=structuredClone(previous);
 const post=(suffix,lines)=>{if(lines.every(r=>r.amount===0))return;const event={id:`@close:${period}:${suffix}`,type:'period-close',date:bounds.to};appendJournal(s,event,lines);s.usedIds.push(event.id);};
 if(s.rules.depreciation)for(const asset of Object.values(s.equipment)){
  const start=asset.availableDate>bounds.from?asset.availableDate:bounds.from;
  if(start>bounds.to)continue;
  const remaining=asset.cost-asset.residual-asset.accumulated;
  const raw=(asset.cost-asset.residual)/asset.lifeMonths*daysBetween(start,bounds.next)/bounds.days+(asset.roundingRemainder||0);
  const charge=Math.max(0,Math.min(remaining,Math.round(raw)));asset.roundingRemainder=raw-charge;asset.accumulated+=charge;
  post(`depreciation:${asset.id}`,[{account:'depreciationExpense',amount:charge},{account:'accumulatedDepreciation',amount:-charge}]);
 }
 if(s.rules.interest)for(const loan of Object.values(s.loans)){
  const raw=interestFor(s,loan,bounds.next)+(loan.roundingRemainder||0),charge=Math.round(raw);loan.roundingRemainder=raw-charge;loan.interestBalance+=charge;loan.accruedUntil=bounds.next;
  post(`interest:${loan.id}`,[{account:'interestExpense',amount:charge},{account:'interestPayable',amount:-charge}]);
 }
 const pretax=statements({...s,lastDate:bounds.to},{from:bounds.from,to:bounds.to}).income.preTax;
 const tax=Math.round(Math.max(pretax,0)*s.rules.taxRate);s.taxes[period]={id:period,balance:tax};
 post('tax',[{account:'taxExpense',amount:tax},{account:'taxPayable',amount:-tax}]);
 s.lastDate=bounds.to;s.sealedThrough=bounds.to;s.decisions.push({type:'period-close',period});assertModel(s);statements(s);return s;
}
export function replayModel(decisions,config,rules){return decisions.reduce((s,t)=>t.type==='period-close'?closePeriod(s,t.period):postTransaction(s,t),createModel(config,rules));}
