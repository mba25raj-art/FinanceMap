import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lessonPackageForConcept as get } from '../src/lesson-packages.js';
import { validateLessonPackage } from '../scripts/lesson-standard.mjs';
const atlas=JSON.parse(readFileSync(new URL('../content/master-network.json',import.meta.url)));
const values=x=>Object.fromEntries(x.inputs.map(i=>[i.key,i.value]));
const practice=id=>['T14.03','T14.04','T14.15','A18','T07.09'].flatMap(id=>get(id).practice).find(q=>q.id===id);
const cycle=x=>[x.inventory/x.cost_sold*x.period_days,x.receivables/x.credit_sales*x.period_days,x.payables/x.credit_purchases*x.period_days];
test('B3 scope, units, source limits and independent scenarios satisfy the contract',()=>{
  const scenarios=new Set();
  for(const id of ['T14.03','T14.04','T14.15','A18','T07.09']){
    const p=get(id);assert.deepEqual(validateLessonPackage(p,atlas),[],id);assert.equal(p.review.method,'ai-content-source-arithmetic');
    assert.equal(p.context.framework.basis,'conceptual');assert.equal(p.practice.length,2);
    for(const s of [p.workedExample,...p.practice]){assert.ok(!scenarios.has(s.scenarioId));scenarios.add(s.scenarioId);}
  }
});
test('operating days use the stated flow and period rather than one universal denominator',()=>{
  let x=values(get('T14.03').workedExample),d=cycle(x);assert.deepEqual(d,[48,36,36]);assert.equal(d[0]+d[1]-d[2],48);
  x=values(practice('days-predict'));d=cycle(x);assert.deepEqual(d,[30,30,30]);assert.equal(d[0]+d[1]-d[2],30);
  x=values(practice('days-transfer-purchases'));d=cycle(x);assert.deepEqual(d,[30,40,30]);assert.equal(d[0]+d[1]-d[2],40);
  assert.notEqual(x.payables/x.cost_sold*x.period_days,d[2]);
});
test('dated cash forecast finds the early trough and carries explicit funding forward once',()=>{
  let x=values(get('T14.04').workedExample),first=x.opening+x.w1_receipts-x.w1_payments,draw=Math.max(0,x.minimum-first);
  assert.deepEqual([first,draw,first+draw,first+draw+x.w2_receipts-x.w2_payments],[-2,5,3,18]);
  x=values(practice('forecast-predict'));assert.equal(Math.max(0,x.minimum-x.opening-x.receipts+x.payments),5);
  x=values(practice('forecast-transfer-date'));const trough=x.opening-x.day1_payment;draw=Math.max(0,x.minimum-trough);
  assert.deepEqual([trough,draw,trough+draw+x.day2_receipt],[-8,12,24]);assert.ok(x.opening+x.day2_receipt-x.day1_payment>0);
});
test('buffer need excludes restrictions and hoped-for capacity in base and stress data',()=>{
  let x=values(get('T14.15').workedExample),trough=x.reported_cash-x.restricted+x.receipts-x.payments,need=Math.max(0,x.minimum-trough);
  assert.deepEqual([trough,need,Math.max(0,need-x.committed)],[-6,10,3]);
  x=values(practice('buffer-predict'));need=x.minimum-(x.reported_cash-x.restricted-x.net_payments);assert.deepEqual([need,Math.max(0,need-x.committed)],[4,0]);
  x=values(practice('buffer-transfer-stress'));need=x.minimum-(x.usable_cash-x.net_payments);assert.deepEqual([need,Math.max(0,need-x.committed)],[5,2]);
});
test('principal, cost, gross refinancing and closing accounts reconcile independently',()=>{
  let x=values(get('A18').workedExample),net=x.draw-x.repayment,cash=x.opening_cash+net-x.interest,debt=x.opening_debt+net,equity=x.opening_cash+x.equipment-x.opening_debt-x.interest;
  assert.deepEqual([net,cash,debt,equity],[10,23,40,18]);assert.equal(cash+x.equipment,debt+equity);
  x=values(practice('borrowing-predict'));assert.deepEqual([x.draw-x.repayment,x.opening_debt+x.draw-x.repayment,x.draw-x.repayment-x.interest],[5,25,4]);
  x=values(practice('borrowing-transfer-refinance'));assert.deepEqual([x.draw-x.repayment,x.opening_debt+x.draw-x.repayment,x.draw-x.repayment-x.fee],[0,40,-1]);assert.ok(x.draw>0&&x.repayment>0);
});
test('share issues and payouts reconcile money and outstanding shares separately',()=>{
  let x=values(get('T07.09').workedExample),issue=x.new_shares*x.issue_price,buy=x.buyback_shares*x.buyback_price,cash=x.opening_cash+issue-x.dividend-buy,equity=x.opening_equity+issue-x.dividend-buy,shares=x.old_shares+x.new_shares-x.buyback_shares;
  assert.deepEqual([issue,buy,cash,equity,shares],[20,5,22,52,14]);assert.equal(cash+x.other_assets,equity);assert.equal(Math.round(x.old_shares/shares*10000)/100,71.43);
  x=values(practice('equity-predict-issue'));assert.deepEqual([x.new_shares*x.price,x.old_shares/(x.old_shares+x.new_shares)],[12,.8]);
  x=values(practice('equity-transfer-payout'));const payout=x.buyback_shares*x.price+x.dividend;assert.deepEqual([x.opening_cash-payout,x.opening_equity-payout,x.holding/(x.old_shares-x.buyback_shares)],[32,62,.3]);
});
