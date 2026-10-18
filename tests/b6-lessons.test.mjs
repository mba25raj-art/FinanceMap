import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {lessonPackages,lessonPackageForConcept as get} from '../src/lesson-packages.js';
import {validateLessonPackage} from '../scripts/lesson-standard.mjs';
const atlas=JSON.parse(readFileSync(new URL('../content/master-network.json',import.meta.url)));
const scope=JSON.parse(readFileSync(new URL('../content/first-release-scope.json',import.meta.url)));
const v=s=>Object.fromEntries(s.inputs.map(i=>[i.key,i.value]));const p=(id,n)=>v(get(id).practice[n]);
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('B6 packages have bounded AI review, complete assumptions and separate practice identities',()=>{
  for(const id of ['T17.12','T17.18','A15','A16','T17.04']){
    const l=get(id);assert.deepEqual(validateLessonPackage(l,atlas),[],id);assert.equal(l.review.method,'ai-content-source-arithmetic');
    assert.equal(new Set([l.workedExample,...l.practice].map(s=>s.scenarioId)).size,3);assert.deepEqual([...new Set(l.objectives.flatMap(o=>o.outcomeIds))],['LO6']);
  }
});
test('terminal value uses the next cash date, full horizon discount and rejects a nonconvergent rate/growth pair',()=>{
  let x=v(get('T17.12').workedExample),next=x.final_fcff*(1+x.growth),terminal=next/(x.rate-x.growth);
  close(next,20.6);close(terminal,257.5);close(terminal/(1+x.rate)**x.horizon,188.2817806849947);
  x=p('T17.12',0);close(x.final_fcff*(1+x.growth)/(x.rate-x.growth),153);
  x=p('T17.12',1);assert.ok(x.growth>=x.rate);assert.ok(get('T17.12').practice[1].options.find(o=>o.id==='correct').text.includes('inapplicable'));
});
test('sensitivity, coherent scenarios and reverse requirements answer distinct questions',()=>{
  let x=v(get('T17.18').workedExample);close(x.next_fcff/(x.rate-x.growth),150);close(x.next_fcff/(x.higher_rate-x.growth),120);
  close(x.downside_fcff/(x.higher_rate-x.downside_growth),1000/11);close(x.reverse_value*(x.rate-x.growth),14.4);
  x=p('T17.18',0);close(x.next_fcff/(x.base_rate-x.growth),100);close(x.next_fcff/(x.higher_rate-x.growth),80);
  x=p('T17.18',1);close(x.value*(x.rate-x.growth),15);close(x.forecast_fcff/(x.rate-x.growth),120);
});
test('enterprise reconstruction removes outside assets and a controlled borrowing adds equal cash and debt',()=>{
  let x=v(get('A15').workedExample);close(x.equity+x.debt+x.preferred-x.excess_cash-x.non_operating,180);
  x=p('A15',0);close(x.equity+x.debt-x.excess_cash,110);
  x=p('A15',1);const before=x.enterprise+x.excess_cash-x.debt,after=x.enterprise+(x.excess_cash+x.new_borrowing)-(x.debt+x.new_borrowing);close(before,60);close(after,before);
});
test('ordinary parent equity deducts the stated claims and uses the matching share count',()=>{
  let x=v(get('A16').workedExample),equity=x.enterprise+x.excess_cash+x.non_operating-x.debt-x.preferred-x.minority;
  close(equity,140);close(equity/x.shares,7);
  x=p('A16',0);equity=x.enterprise+x.excess_cash-x.debt-x.preferred;close(equity,80);close(equity/x.shares,8);
  x=p('A16',1);equity=x.enterprise+x.excess_cash-x.debt-x.preferred-x.minority;close(equity,44);close(equity/x.shares,4);
});
test('gross and net bridge presentations agree without adding operating or excess cash twice',()=>{
  let x=v(get('T17.04').workedExample),outside=x.reported_cash-x.required_cash+x.non_operating,claims=x.debt+x.debt_like+x.preferred+x.minority,equity=x.enterprise+outside-claims;
  close(outside,28);close(claims,88);close(equity,140);close(equity/x.shares,14);close(equity+claims-outside,x.enterprise);
  x=p('T17.04',0);close(x.enterprise+x.reported_cash-x.required_cash-x.debt-x.other_claim,118);
  x=p('T17.04',1);close(x.enterprise+x.excess_cash-x.gross_debt,100);close(x.enterprise-x.net_debt,100);assert.notEqual(x.enterprise-x.net_debt+x.excess_cash,100);
});
test('all thirty selected concepts resolve to their own reviewed packages, with only the explicit receivables shared page',()=>{
  const ids=scope.batches.flatMap(b=>b.conceptIds);assert.equal(ids.length,30);assert.equal(new Set(ids).size,30);
  assert.deepEqual(lessonPackages.map(l=>l.conceptId),ids);assert.equal(lessonPackages.flatMap(l=>l.practice).length,61);
  for(const id of ids){assert.equal(get(id).conceptId,id);assert.equal(get(id).review.state,'reviewed');}
  assert.equal(get('T06.04'),get('A02'));assert.equal(get('T17.03'),undefined);assert.equal(get('T07.08'),undefined);
});
