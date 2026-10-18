import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {lessonPackageForConcept as get} from '../src/lesson-packages.js';
import {validateLessonPackage} from '../scripts/lesson-standard.mjs';
const atlas=JSON.parse(readFileSync(new URL('../content/master-network.json',import.meta.url)));
const values=s=>Object.fromEntries(s.inputs.map(i=>[i.key,i.value]));
const p=(id,n)=>values(get(id).practice[n]);
test('B4 packages retain selected outcomes, explicit assumptions and two independent practice scenarios',()=>{
  const expected={A07:['LO1','LO5'],A08:['LO1','LO2','LO5'],A09:['LO2','LO6'],A10:['LO2','LO6'],'T12.05':['LO5']};
  for(const [id,outcomes] of Object.entries(expected)){
    const l=get(id);assert.deepEqual(validateLessonPackage(l,atlas),[],id);assert.deepEqual([...new Set(l.objectives.flatMap(o=>o.outcomeIds))],outcomes);
    assert.equal(new Set([l.workedExample,...l.practice].map(s=>s.scenarioId)).size,3);assert.equal(l.review.method,'ai-content-source-arithmetic');
  }
});
test('capitalised cost, expenses, credit acquisition and cash reconcile independently',()=>{
  let x=values(get('A07').workedExample),asset=x.purchase+x.transport+x.installation,expense=x.training+x.maintenance+x.depreciation,cash=x.opening_cash-asset-x.training-x.maintenance;
  assert.deepEqual([asset,expense,cash,asset-x.depreciation],[30,8,35,27]);assert.equal(cash+asset-x.depreciation,x.opening_cash-expense);
  x=p('A07',0);assert.deepEqual([x.purchase+x.installation,x.training+x.maintenance,x.purchase+x.installation+x.training+x.maintenance],[17,2,19]);
  x=p('A07',1);cash=x.opening_cash-x.cash_paid;assert.deepEqual([cash,x.asset_cost-x.depreciation,x.opening_cash-x.depreciation],[22,22,38]);assert.equal(cash+x.asset_cost-x.depreciation,x.creditor+x.opening_cash-x.depreciation);
});
test('depreciation uses residual, life and time fraction and does not invent cash',()=>{
  let x=values(get('A08').workedExample),d=(x.cost-x.residual)/x.life*x.fraction;assert.equal(d,6);assert.equal(x.cost-d,30);assert.equal(x.opening_cash-x.cost+x.cost-d,x.opening_cash-d);
  x=p('A08',0);d=(x.cost-x.residual)/x.life*x.fraction;assert.deepEqual([d,x.cost-d],[6,22]);
  x=p('A08',1);d=(x.cost-x.residual)/x.life*x.fraction;assert.deepEqual([d,x.cost-d,-d+d],[3,27,0]);
});
test('EBIT includes depreciation once and remains independent of financing choice',()=>{
  let x=values(get('A09').workedExample),ebit=x.revenue-x.cost-x.operating_expense-x.depreciation,net=(ebit-x.interest)*(1-x.tax_rate);
  assert.deepEqual([ebit,ebit+x.depreciation,ebit-x.interest,net],[30,35,24,18]);
  x=p('A09',0);ebit=x.revenue-x.cost-x.operating_expense-x.depreciation;assert.deepEqual([ebit,ebit-x.interest],[21,18]);
  x=p('A09',1);ebit=x.revenue-x.operating_expense-x.depreciation;assert.deepEqual([ebit,Math.round((ebit-x.interest)*(1-x.tax_rate)*100)/100,ebit*(1-x.tax_rate)],[30,19.2,24]);
});
test('NOPAT keeps financing separate and does not infer a loss benefit from a nominal rate',()=>{
  let x=values(get('A10').workedExample),nopat=x.ebit*(1-x.tax_rate),net=(x.ebit-x.interest)*(1-x.tax_rate);
  assert.deepEqual([nopat,net,nopat+x.depreciation-x.capex-x.working_capital_increase],[30,24,18]);
  x=p('A10',0);assert.deepEqual([x.ebit*(1-x.tax_rate),(x.ebit-x.interest)*(1-x.tax_rate)],[18,15]);
  x=p('A10',1);const usableLossBenefit=0;assert.equal(x.ebit+usableLossBenefit,-12);assert.notEqual(x.ebit*(1-x.tax_rate),-12);
  assert.equal(get('A10').practice[1].options.find(o=>o.id==='correct').text,'−12');
});
test('incremental cash includes foregone alternatives and terminal release while excluding sunk/non-cash amounts',()=>{
  let x=values(get('T12.05').workedExample),annual=x.receipts-x.operating_cost-x.lost_contribution-x.foregone_rent;
  assert.deepEqual([-x.equipment-x.working_capital,annual,annual+x.salvage+x.working_capital],[-35,8,19]);
  x=p('T12.05',0);assert.equal(x.receipts-x.cost-x.lost_contribution,7);
  x=p('T12.05',1);assert.deepEqual([-x.equipment-x.working_capital,x.annual_net_cash,x.annual_net_cash+x.salvage+x.working_capital],[-24,9,16]);
});
