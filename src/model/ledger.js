import {nilaScenario,ModelError,toPaise,fromPaise,accountIsDebit,assertTransaction} from './contract.js';
const fail=(code,message,field,details={})=>{throw Object.assign(new ModelError(code,message,field),details);};
const own=(o,key)=>Object.hasOwn(o,key)?o[key]:undefined;
export function createModel(config=nilaScenario,rules={}){
 const ledger=Object.fromEntries(Object.entries(config.opening).map(([k,v])=>[k,toPaise(v,k)*(accountIsDebit(config.accounts[k])?1:-1)]));
 const register=(rows,field)=>Object.fromEntries(rows.map(r=>[r.id,{...r,balance:toPaise(r[field])}]));
 const state={scenarioId:config.id,scenarioVersion:config.version,config:structuredClone(config),rules:{depreciation:true,interest:true,taxRate:config.taxRate,...rules},openingLedger:{...ledger},ledger,
  receivables:register(config.receivables,'amount'),payables:register(config.payables,'amount'),equipmentPayables:{},accruals:{},taxes:{},
  equipment:Object.fromEntries(config.equipment.map(r=>[r.id,{...r,cost:toPaise(r.cost),residual:toPaise(r.residual),accumulated:toPaise(r.accumulated)}])),
  loans:Object.fromEntries(config.loans.map(r=>[r.id,{...r,balance:toPaise(r.principal),interestBalance:0,accruedUntil:r.startDate}])),
  shares:config.openingSharesLakh,owners:{founder:config.openingSharesLakh},journal:[],decisions:[],usedIds:[...config.receivables,...config.payables,...config.equipment,...config.loans].map(r=>r.id),lastDate:config.startDate,sealedThrough:null};
 assertModel(state);return state;
}
export function balances(state,ledger=state.ledger){
 const b=Object.fromEntries(Object.entries(ledger).map(([k,v])=>[k,v*(accountIsDebit(state.config.accounts[k])?1:-1)]));
 b.profit=b.revenue-b.costOfSales-b.operatingExpense-b.depreciationExpense-b.interestExpense-b.taxExpense;
 b.equipment=b.equipmentCost-b.accumulatedDepreciation;b.assets=b.cash+b.receivables+b.inventory+b.equipment;
 b.liabilities=b.tradePayables+b.equipmentPayables+b.accruedOperating+b.debt+b.interestPayable+b.taxPayable;
 b.equity=b.contributedCapital+b.openingRetainedEarnings+b.profit-b.distributions;
 return b;
}
export const inLakh=values=>Object.fromEntries(Object.entries(values).map(([k,v])=>[k,fromPaise(v)]));
export function assertModel(state){
 for(const [k,v] of Object.entries(state.ledger))if(!Number.isSafeInteger(v))fail('invariant',`Unsafe currency balance: ${k}.`,k);
 if(Object.values(state.ledger).reduce((a,b)=>a+b,0)!==0)fail('invariant','The journal does not balance.','ledger');
 const b=balances(state);if(b.assets!==b.liabilities+b.equity)fail('invariant','Assets do not equal liabilities plus equity.','ledger');
 for(const [register,account,field] of [['receivables','receivables','balance'],['payables','tradePayables','balance'],['equipmentPayables','equipmentPayables','balance'],['accruals','accruedOperating','balance'],['loans','debt','balance'],['taxes','taxPayable','balance'],['equipment','equipmentCost','cost'],['equipment','accumulatedDepreciation','accumulated'],['loans','interestPayable','interestBalance']]){
  if(Object.values(state[register]).reduce((n,r)=>n+r[field],0)!==b[account])fail('invariant',`${register} does not reconcile to ${account}.`,account);
 }
 if(b.cash<0||b.inventory<0)fail('invariant','Cash and inventory cannot be negative.','ledger');
 return state;
}
export function appendJournal(state,event,lines){
 const total=lines.reduce((n,l)=>n+l.amount,0);if(total!==0||lines.some(l=>!Object.hasOwn(state.ledger,l.account)||!Number.isSafeInteger(l.amount)))fail('invariant','Invalid journal entry.','journal');
 for(const line of lines){state.ledger[line.account]+=line.amount;state.journal.push({sourceId:event.id,type:event.type,date:event.date,...line});}
}
export function postTransaction(previous,input){
 const t=assertTransaction(input,previous.config);
 if(previous.usedIds.includes(t.id))fail('duplicate','That transaction/reference ID is already used.','id');
 if(t.date<previous.lastDate||(previous.sealedThrough&&t.date<=previous.sealedThrough))fail('order','Post in date order after the last sealed period, or replay earlier choices.','date');
 const s=structuredClone(previous),lines=[];
 const line=(account,amount,cashCategory)=>lines.push({account,amount,...(cashCategory?{cashCategory}:{})});
 const debit=(a,n)=>line(a,n),credit=(a,n)=>line(a,-n),cash=(n,category)=>line('cash',n,category);
 const settle=(register,reference,amount)=>{const lot=own(s[register],reference);if(!lot)fail('reference','Choose an existing outstanding item.',reference);if(amount>lot.balance)fail('balance','The settlement exceeds the outstanding balance.','amount');lot.balance-=amount;return lot;};
 switch(t.type){
  case 'owner-funding':
   if(Object.keys(s.owners).length>1)fail('ownership','Use an explicit equity issue after outside ownership exists.','type');
   cash(t.amount,'financing');credit('contributedCapital',t.amount);break;
  case 'inventory-purchase':
   debit('inventory',t.amount);cash(-t.cashPaid,'operating');credit('tradePayables',t.amount-t.cashPaid);s.payables[t.id]={id:t.id,balance:t.amount-t.cashPaid,dueDate:t.dueDate||t.date};break;
  case 'credit-sale':
   if(t.cost>balances(s).inventory)fail('inventory','The cost sold exceeds available inventory.','cost');
   debit('receivables',t.amount);credit('revenue',t.amount);debit('costOfSales',t.cost);credit('inventory',t.cost);s.receivables[t.id]={id:t.id,balance:t.amount,dueDate:t.dueDate};break;
  case 'collection':settle('receivables',t.invoiceId,t.amount);cash(t.amount,'operating');credit('receivables',t.amount);break;
  case 'supplier-payment':settle('payables',t.payableId,t.amount);debit('tradePayables',t.amount);cash(-t.amount,'operating');break;
  case 'operating-payment':
   if(t.accrualId){settle('accruals',t.accrualId,t.amount);debit('accruedOperating',t.amount);}else debit('operatingExpense',t.amount);
   cash(-t.amount,'operating');break;
  case 'operating-accrual':debit('operatingExpense',t.amount);credit('accruedOperating',t.amount);s.accruals[t.id]={id:t.id,balance:t.amount};break;
  case 'equipment-purchase':
   debit('equipmentCost',t.amount);cash(-t.cashPaid,'investing');credit('equipmentPayables',t.amount-t.cashPaid);
   s.equipment[t.id]={id:t.id,cost:t.amount,residual:t.residual,accumulated:0,lifeMonths:t.lifeMonths,availableDate:t.availableDate};s.equipmentPayables[t.id]={id:t.id,balance:t.amount-t.cashPaid,dueDate:t.dueDate||t.date};break;
  case 'equipment-payment':settle('equipmentPayables',t.payableId,t.amount);debit('equipmentPayables',t.amount);cash(-t.amount,'investing');break;
  case 'borrowing':
   cash(t.amount,'financing');credit('debt',t.amount);s.loans[t.id]={id:t.id,balance:t.amount,annualRate:t.annualRate,startDate:t.date,maturity:t.maturity,interestBalance:0,accruedUntil:t.date};break;
  case 'debt-repayment':settle('loans',t.loanId,t.amount);debit('debt',t.amount);cash(-t.amount,'financing');break;
  case 'interest-payment':{
   const loan=own(s.loans,t.loanId);if(!loan||t.amount>loan.interestBalance)fail('balance','Pay only the interest already accrued for this loan.','amount');loan.interestBalance-=t.amount;debit('interestPayable',t.amount);cash(-t.amount,'operating');break;
  }
  case 'tax-payment':settle('taxes',t.taxPeriod,t.amount);debit('taxPayable',t.amount);cash(-t.amount,'operating');break;
  case 'equity-issue':{
   if(own(s.owners,t.investorId)!==undefined)fail('ownership','Use a new investor reference for this issue.','investorId');
   const issued=s.shares*t.amount/t.preMoney;s.owners[t.investorId]=issued;s.shares+=issued;cash(t.amount,'financing');credit('contributedCapital',t.amount);break;
  }
  case 'dividend':debit('distributions',t.amount);cash(-t.amount,'financing');break;
 }
 const closingCash=s.ledger.cash+lines.filter(l=>l.account==='cash').reduce((n,l)=>n+l.amount,0);
 if(closingCash<0)fail('funding','This payment needs explicit funding before it can be committed.','amount',{shortfall:-closingCash,bufferRequirement:toPaise(s.config.minimumCash)-closingCash});
 appendJournal(s,t,lines);s.usedIds.push(t.id);s.lastDate=t.date;s.decisions.push(structuredClone(input));assertModel(s);return s;
}
export function replayTransactions(transactions,config=nilaScenario,rules={}){return transactions.reduce(postTransaction,createModel(config,rules));}
