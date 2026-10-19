import test from 'node:test';
import assert from 'node:assert/strict';
import refs from '../content/cases/nila-references.v1.json' with {type:'json'};
import {emptyCompany,replayCompany,addCompanyDecision as add,companyFundingPlans,companyProject} from '../src/activities/company.js';
import {validateSimulationRecord,activityUnfinished} from '../src/activities/registry.js';
import {createSaveCodec,emptyLearningProfile} from '../src/learning-save.js';
const near=(a,b,t=1e-7)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
const selected=['30-days','agent-early','cash-discount','debt-expand','buy-now','wacc10-growth3'];
function round(r,choice){const v=replayCompany(r),n=v.round;r=add(r,{type:'predict',round:n,values:v.expected});r=add(r,{type:'commit',round:n,choice});return add(r,{type:'explain',round:n,text:'The chosen cash dates, service or dilution and demand assumptions support this conditional plan; weaker demand could reverse it.'});}
function through(count=6,choices=selected){let r=add(emptyCompany(),{type:'setup',variant:'base'});for(const c of choices.slice(0,count))r=round(r,c);return r;}
test('runtime funding schedule reproduces all sixteen independent scenario controls before financing',()=>{
 for(const b of refs.quarterBranches){const plans=companyFundingPlans({R1:b.terms,R2:b.collection,R3:b.inventory},b.variant);for(const plan of ['operate','expand']){near(plans[plan].opening,b.cashAtFundingDate);near(plans[plan].totalFundingNeeded,b[plan].funding);near(plans[plan].rows.at(-1).unfundedClosing,b[plan].unfundedClosing);assert.equal(plans[plan].firstBreach,b[plan].firstBreach);}}
});
test('full runtime closes January and projects/values against independent controls',()=>{
 const record=through(),r=replayCompany(record);assert.equal(r.phase,'finish');assert.equal(r.finished,false);assert.equal(activityUnfinished(record),true);
 for(const [k,v]of Object.entries(refs.default.januaryClose))near(r.after[k],v);near(r.financial.funding.amount,19.7);assert.equal(r.financial.funding.instrument,'debt');assert.equal(r.financial.quarter.totalFundingNeeded,0);assert.ok(r.financial.quarter.rows.every(p=>p.unfundedClosing>=3));
 r.financial.projection.forEach((p,i)=>near(p.fcff,refs.default.forecastFCFF[i]));near(r.financial.valuation.enterprise,refs.default.enterprise);near(r.financial.valuation.equity,refs.default.equity);near(companyProject().npv,refs.default.projectNPV);
 assert.equal(r.statements.indirect.operating,r.statements.cashFlow.operating);assert.equal(r.statements.equityBridge.closing,r.statements.equityBridge.opening+r.statements.income.netIncome);
 const finished=add(record,{type:'finish'});assert.equal(replayCompany(finished).finished,true);assert.equal(activityUnfinished(finished),false);assert.throws(()=>add(finished,{type:'finish'}));assert.throws(()=>add(finished,{type:'predict',round:6,values:{fcff:23.3}}));
});
test('funding eligibility and affordability cannot be bypassed with a correct or incorrect prediction',()=>{
 const prefix=through(3),p=add(prefix,{type:'predict',round:4,values:{fundingGap:0}});assert.throws(()=>add(p,{type:'commit',round:4,choice:'none-expand'}));assert.throws(()=>add(p,{type:'commit',round:4,choice:'debt-operate'}));
 const noFunding=round(prefix,'none-operate'),r5=add(noFunding,{type:'predict',round:5,values:{npv:15.64}});assert.throws(()=>add(r5,{type:'commit',round:5,choice:'buy-now'}));const deferred=round(noFunding,'defer');assert.equal(replayCompany(deferred).after.equipmentCost,100);assert.equal(replayCompany(deferred).after.debt,75);
 const funded=round(prefix,'debt-expand');assert.ok(replayCompany(funded).after.cash>=30);assert.equal(replayCompany(funded).after.profit,7.8,'Funding is not income');
});
test('ordinary equity changes ownership and accrued claims while common operations retain enterprise value',()=>{
 const debt=replayCompany(through()),equity=replayCompany(through(6,[...selected.slice(0,3),'equity-expand',...selected.slice(4)]));assert.equal(equity.after.cash,debt.after.cash);assert.equal(equity.after.debt,75);near(equity.financial.funding.newOwnership,19.7/119.7);near(equity.model.owners['case-investor']/equity.model.shares,19.7/119.7);assert.equal(equity.financial.valuation.enterprise,debt.financial.valuation.enterprise);assert.ok(equity.after.interestPayable<debt.after.interestPayable);assert.ok(equity.after.taxPayable>debt.after.taxPayable);assert.equal(equity.financial.projection[0].fcff,23.3);near(equity.financial.valuation.equity,equity.financial.valuation.enterprise-75+5-equity.after.interestPayable-equity.after.taxPayable);
});
test('retaining raised cash on deferral never silently cancels the contract or deducts equipment twice',()=>{
 const r=replayCompany(through(6,[...selected.slice(0,4),'defer',selected[5]]));assert.equal(r.after.cash,38);assert.equal(r.after.equipmentCost,100);assert.equal(r.after.debt,94.7);assert.equal(r.financial.valuation.excessCash,35);near(r.financial.projection[0].workingCapitalChange,-12.5);near(r.financial.projection[0].fcff,20.5);assert.ok(r.financial.projection.slice(1).every(p=>p.fcff===8));
});
test('all feasible base credit/collection/stock and funding/investment choices remain cash-safe and reconcile',()=>{
 for(const b of refs.quarterBranches.filter(b=>b.variant==='base')){const prefix=[b.terms,b.collection,b.inventory],plans=companyFundingPlans({R1:b.terms,R2:b.collection,R3:b.inventory});
  for(const plan of ['operate','expand'])for(const instrument of plans[plan].totalFundingNeeded?['debt','equity']:['none'])for(const buy of plan==='expand'?['buy-now','defer']:['defer']){
   const r=replayCompany(through(6,[...prefix,`${instrument}-${plan}`,buy,'wacc12-growth0']));assert.equal(r.financial.quarter.totalFundingNeeded,0);assert.equal(r.statements.balanceSheet.assets,r.statements.balanceSheet.liabilities+r.statements.balanceSheet.equity);assert.equal(r.statements.indirect.operating,r.statements.cashFlow.operating);assert.equal(r.financial.sensitivity.length,4);assert.ok(Number.isFinite(r.financial.valuation.equity));
  }
 }
});
test('every financial prefix round-trips without importing computed answers and earlier preview prefixes continue at four',()=>{
 const full=add(through(),{type:'finish'}),codec=createSaveCodec({conceptIds:[],topics:{},topicVersions:{},packages:[],cases:{},validateSimulation:validateSimulationRecord});let r=emptyCompany();
 for(const d of full.decisions){r=add(r,d);const p=emptyLearningProfile();p.simulations=[r];const encoded=codec.encode(p),raw=JSON.stringify(encoded);assert.ok(!raw.includes('"checks"'));assert.ok(!raw.includes('"balances"'));assert.deepEqual(codec.decode(encoded).simulations,[r]);assert.deepEqual(replayCompany(codec.decode(encoded).simulations[0]),replayCompany(r));}
 assert.equal(replayCompany(through(3)).round,4);assert.equal(replayCompany(through(3)).phase,'predict');
 const wrong=structuredClone(full);wrong.decisions.find(d=>d.type==='commit'&&d.round===4).choice='none-expand';assert.throws(()=>validateSimulationRecord(wrong));assert.throws(()=>validateSimulationRecord({...full,finished:true}));
});
test('financial screens provide all inputs before predictions and exact financial terms before commitment',async()=>{
 globalThis.window={location:{hash:'#simulations/CASE-NILA-HOMEWARE'}};const {createServer}=await import('vite'),{default:react}=await import('@vitejs/plugin-react'),{createElement}=await import('react'),{renderToStaticMarkup}=await import('react-dom/server');const server=await createServer({configFile:false,plugins:[react()],server:{middlewareMode:true,hmr:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]},appType:'custom'});
 try{const {default:Case}=await server.ssrLoadModule('/src/CompanyCase.jsx');const render=r=>renderToStaticMarkup(createElement(Case,{record:r}));
  for(const [n,inputs,results]of [[3,'Funding inputs','Funding results'],[4,'Investment inputs','Investment results'],[5,'Annual forecast inputs','Valuation results']]){const record=through(n),html=render(record);assert.ok(html.includes(inputs));assert.ok(!html.includes(results));assert.ok(!html.includes('Supported result'));assert.ok(!html.includes('Finish this company case'));const attempted=add(record,{type:'predict',round:n+1,values:replayCompany(record).expected}),after=render(attempted);assert.ok(after.includes(results));assert.ok(after.includes('Inspect the terms, then commit one choice'));}
  const fourth=render(add(through(3),{type:'predict',round:4,values:{fundingGap:19.7}}));assert.ok(fourth.includes('19.70'));assert.ok(fourth.includes('First debt coupon (365 days)'));assert.ok(fourth.includes('New ordinary ownership'));assert.ok(fourth.includes('15 January 2027'));assert.ok(fourth.includes('disabled=""'));
  const finish=render(through());assert.ok(finish.includes('Finish this company case'));assert.ok(finish.includes('271.16'));assert.ok(finish.includes('180.18'));assert.ok(finish.includes('without awarding competency'));const complete=render(add(through(),{type:'finish'}));assert.ok(complete.includes('Company case finished'));assert.ok(!complete.includes('Finish this company case'));
 }finally{await server.close();delete globalThis.window;}
});
