import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {lessonPackageForConcept as get} from '../src/lesson-packages.js';
import {validateLessonPackage} from '../scripts/lesson-standard.mjs';
const atlas=JSON.parse(readFileSync(new URL('../content/master-network.json',import.meta.url)));
const v=s=>Object.fromEntries(s.inputs.map(i=>[i.key,i.value]));
const p=(id,n)=>v(get(id).practice[n]);
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);
test('B5 scopes and independent practice satisfy the standard without equating operating and equity values',()=>{
  for(const id of ['T03.01','T03.12','A11','A13','A19']){
    const l=get(id);assert.deepEqual(validateLessonPackage(l,atlas),[],id);assert.equal(l.review.method,'ai-content-source-arithmetic');
    assert.equal(new Set([l.workedExample,...l.practice].map(s=>s.scenarioId)).size,3);assert.equal(l.practice.length,2);
    assert.ok(l.scope.deferred.length);assert.equal(l.context.framework.basis,'conceptual');
  }
});
test('present/future values independently match annual and monthly timelines',()=>{
  let x=v(get('T03.01').workedExample);close(x.present*(1+x.rate)**x.years,121);close(x.year1/(1+x.rate)+x.year2/(1+x.rate)**2,100);
  x=p('T03.01',0);close(x.receipt/(1+x.rate)**x.years,50);
  x=p('T03.01',1);assert.equal(x.monthly_rate,x.nominal_rate/12);close(x.present*(1+x.monthly_rate)**x.months,84.92161204808);
});
test('NPV discounts separate dated receipts and zero NPV still earns the supplied return',()=>{
  let x=v(get('T03.12').workedExample);close(-x.investment+x.year1/(1+x.rate)+x.year2/(1+x.rate)**2,50/11);
  x=p('T03.12',0);close(-x.investment+x.year1/(1+x.rate)+x.year2/(1+x.rate)**2,36/121);
  x=p('T03.12',1);close(-x.investment+x.year1/(1+x.rate)+x.year2/(1+x.rate)**2,0);close(x.investment*(1+x.rate)**2,x.year2);
});
test('FCFF reverses depreciation, includes reinvestment signs and excludes supplied financing',()=>{
  let x=v(get('A11').workedExample);close(x.ebit*(1-x.tax_rate)+x.depreciation-x.capex-x.working_capital_increase,24);
  assert.notEqual(24+x.net_borrowing,24);assert.notEqual(24-x.interest,24);
  x=p('A11',0);close(x.ebit*(1-x.tax_rate)+x.depreciation-x.capex-x.working_capital_increase,15);
  x=p('A11',1);close(x.nopat+x.depreciation-x.capex+x.working_capital_decrease,16);
});
test('WACC uses supplied weights and exactly one stated tax adjustment',()=>{
  let x=v(get('A13').workedExample),total=x.equity+x.debt;close(x.equity/total*x.equity_cost+x.debt/total*x.debt_cost*(1-x.tax_rate),.124);
  x=p('A13',0);total=x.equity+x.debt;close(x.equity/total*x.equity_cost+x.debt/total*x.debt_cost*(1-x.tax_rate),.122);
  x=p('A13',1);close(x.equity_weight+x.debt_weight,1);close(x.equity_weight*x.equity_cost+x.debt_weight*x.after_tax_debt,.09);
  assert.notEqual(x.equity_weight*x.equity_cost+x.debt_weight*x.after_tax_debt*(1-x.tax_rate),.09);
});
test('DCF independently prices the explicit cash and supplied terminal date without an implicit claims bridge',()=>{
  let x=v(get('A19').workedExample),explicit=x.year1/(1+x.rate)+x.year2/(1+x.rate)**2+x.year3/(1+x.rate)**3;
  close(explicit,36.82945154019534);close(explicit+x.terminal/(1+x.rate)**x.horizon,172.0661157024793);
  x=p('A19',0);close(x.year1/(1+x.rate)+(x.year2+x.terminal)/(1+x.rate)**x.horizon,118.18181818181817);
  x=p('A19',1);close(x.year1/(1+x.rate)+(x.year2+x.terminal)/(1+x.rate)**x.horizon,52.22222222222222);
  assert.equal(Object.hasOwn(x,'debt'),false);assert.ok(get('A19').practice[1].options.find(o=>o.id==='correct').text.includes('claims bridge'));
});
