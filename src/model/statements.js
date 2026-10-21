import {dateNumber,ModelError} from './contract.js';
import {balances,assertModel} from './ledger.js';
const sum=(rows,field)=>rows.reduce((n,r)=>n+r[field],0);
export const workingCapital=b=>b.receivables+b.inventory-b.tradePayables-b.accruedOperating;
export function statements(state,{from=state.config.startDate,to=state.lastDate}={}){
 dateNumber(from);dateNumber(to);if(from<state.config.startDate||to>state.lastDate||from>to)throw new ModelError('period','Choose a reporting interval inside posted history.','period');
 const opening={...state.openingLedger},closing={...state.openingLedger};
 for(const row of state.journal){if(row.date<from)opening[row.account]+=row.amount;if(row.date<=to)closing[row.account]+=row.amount;}
 const ob=balances(state,opening),cb=balances(state,closing),change=k=>cb[k]-ob[k];
 const income={revenue:change('revenue'),costOfSales:change('costOfSales'),operatingExpense:change('operatingExpense'),depreciation:change('depreciationExpense'),interest:change('interestExpense'),tax:change('taxExpense')};
 income.ebit=income.revenue-income.costOfSales-income.operatingExpense-income.depreciation;income.preTax=income.ebit-income.interest;income.netIncome=income.preTax-income.tax;
 const rows=state.journal.filter(r=>r.date>=from&&r.date<=to&&r.account==='cash');
 const cashFlow={opening:ob.cash,operating:sum(rows.filter(r=>r.cashCategory==='operating'),'amount'),investing:sum(rows.filter(r=>r.cashCategory==='investing'),'amount'),financing:sum(rows.filter(r=>r.cashCategory==='financing'),'amount'),closing:cb.cash};
 cashFlow.change=cashFlow.operating+cashFlow.investing+cashFlow.financing;
 const indirect={netIncome:income.netIncome,depreciation:income.depreciation,workingCapitalChange:workingCapital(cb)-workingCapital(ob),interestPayableChange:change('interestPayable'),taxPayableChange:change('taxPayable')};
 indirect.operating=indirect.netIncome+indirect.depreciation-indirect.workingCapitalChange+indirect.interestPayableChange+indirect.taxPayableChange;
 const equityBridge={opening:ob.equity,netIncome:income.netIncome,contributions:change('contributedCapital'),distributions:change('distributions'),closing:cb.equity};
 const result={from,to,income,balanceSheet:cb,openingBalanceSheet:ob,cashFlow,indirect,equityBridge};assertStatements(result);return result;
}
export function assertStatements(r){
 const fail=message=>{throw new ModelError('reconciliation',message,'statements');};
 if(r.balanceSheet.assets!==r.balanceSheet.liabilities+r.balanceSheet.equity)fail('The balance sheet does not reconcile.');
 if(r.cashFlow.opening+r.cashFlow.change!==r.cashFlow.closing)fail('Cash-flow categories do not reconcile to cash.');
 if(r.indirect.operating!==r.cashFlow.operating)fail('Indirect operating cash does not match direct operating cash.');
 if(r.equityBridge.opening+r.equityBridge.netIncome+r.equityBridge.contributions-r.equityBridge.distributions!==r.equityBridge.closing)fail('Equity does not reconcile.');
 return r;
}
