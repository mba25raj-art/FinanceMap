import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyFinancing,addFinancingDecision,replayFinancing} from '../src/activities/financing.js';
import {activityDefinitions,validateSimulationRecord} from '../src/activities/registry.js';
import {createSaveCodec,emptyLearningProfile} from '../src/learning-save.js';
import {parseRoute,routeHash} from '../src/routes.js';
const prediction={type:'prediction',annualRate:.12,preMoney:40,firstFCFF:10,raiseCategory:'financing',raiseProfit:'unchanged',newOwnership:20};
const make=(change={})=>addFinancingDecision(emptyFinancing(),{...prediction,...change});
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('identical investment, cash raised and operating assumptions isolate the finance consequences',()=>{
 const r=replayFinancing(make());assert.equal(r.debt.afterInvestment.cash,20);assert.equal(r.equity.afterInvestment.cash,20);assert.equal(r.debt.afterInvestment.equipment,30);assert.equal(r.equity.afterInvestment.equipment,30);assert.equal(r.debt.atRaise.profit,0);assert.equal(r.equity.atRaise.profit,0);assert.equal(r.debt.afterInvestment.debt,10);assert.equal(r.equity.afterInvestment.debt,0);assert.equal(r.terms.interest,1.2);assert.equal(r.terms.totalRepayment,11.2);assert.equal(r.equity.model.owners['new-investor']/r.equity.model.shares,.2);assert.deepEqual(r.checks,{raiseCategory:true,raiseProfit:true,newOwnership:true});
});
test('common weaker cash creates a disclosed loan-service funding need without automatic refinancing',()=>{
 const base=replayFinancing(make()),low=replayFinancing(make({firstFCFF:5})),stress=replayFinancing(make({firstFCFF:-5}));assert.equal(base.debt.forecast.totalFundingNeeded,0);near(base.debt.forecast.rows.at(-1).unfundedClosing,18.8);assert.equal(low.debt.forecast.totalFundingNeeded,4.2);assert.equal(low.equity.forecast.totalFundingNeeded,0);assert.equal(low.debt.forecast.firstBreach,'2027-01-01');assert.equal(stress.debt.forecast.totalFundingNeeded,14.2);assert.equal(stress.equity.forecast.totalFundingNeeded,3);assert.equal(low.debt.model.ledger.debt,-10e7);assert.equal(low.debt.model.decisions.length,2);
});
test('enterprise remains common under the fixed supplied WACC while each claim is bridged once',()=>{
 const r=replayFinancing(make());near(r.debt.valuation.enterprise,164.93506493506493);assert.equal(r.debt.valuation.enterprise,r.equity.valuation.enterprise);near(r.debt.valuation.equity,156.93506493506493);near(r.equity.valuation.equity,166.93506493506493);near(r.equity.founderResidual,r.equity.valuation.equity*.8);near(r.sensitivity[1].enterprise,127.97619047619045);
});
test('negotiated pre-money and higher interest recompute ownership and service separately',()=>{
 const r=replayFinancing(make({annualRate:.18,preMoney:160,newOwnership:5.88}));assert.ok(r.checks.newOwnership);near(r.terms.newOwnership,10/170);assert.equal(r.terms.interest,1.8);near(r.debt.forecast.rows.at(-1).unfundedClosing,18.2);const wrong=replayFinancing(make({newOwnership:25,raiseProfit:'increase'}));assert.equal(wrong.checks.newOwnership,false);assert.equal(wrong.checks.raiseProfit,false);assert.equal(wrong.debt.atRaise.profit,0);
});
test('registry, replay and save round trip preserve scenario versions and ungraded recommendations',()=>{
 const r=addFinancingDecision(make(),{type:'explanation',text:'Debt keeps ownership but the weaker cash branch needs 4.2 to retain the reserve.'});assert.equal(replayFinancing(r).phase,2);assert.deepEqual(replayFinancing(r),replayFinancing(structuredClone(r)));const codec=createSaveCodec({conceptIds:[],topics:{},topicVersions:{},packages:[],cases:{},validateSimulation:validateSimulationRecord}),p=emptyLearningProfile();p.simulations=[r];assert.deepEqual(codec.decode(codec.encode(p)).simulations,[r]);
 for(const [id,d]of Object.entries(activityDefinitions)){assert.equal(validateSimulationRecord(d.empty()).activityId,id);assert.ok(d.title);assert.ok(d.stages[0]);}
});
test('unsupported rates, amounts, claimed results and stages fail before results can be imported',()=>{
 for(const change of [{annualRate:NaN},{annualRate:.2},{preMoney:0},{firstFCFF:Infinity},{newOwnership:101},{raiseCategory:'correct'},{enterprise:900}])assert.throws(()=>make(change));for(const change of [{scenarioVersion:'0.0.0'},{period:2},{model:{cash:999}}])assert.throws(()=>validateSimulationRecord({...make(),...change}));
});
test('all three lab links retain their independent saved-run return context',()=>{
 const inventory={concepts:new Set(['A02']),journeys:new Map()};for(const id of Object.keys(activityDefinitions)){const r=parseRoute(routeHash('labs','A02',{labId:id,activityRun:2}),inventory);assert.equal(r.labId,id);assert.equal(r.activityRun,2);const detour=parseRoute(routeHash('lesson','A02',{returnLab:id,returnAttempt:2}),inventory);assert.equal(detour.returnLab,id);assert.equal(detour.returnAttempt,2);}
});
test('render conceals comparison before prediction and labels the independent mini-case and conditional values',async()=>{
 globalThis.window={location:{hash:'#labs/LAB-FINANCING'}};const {createServer}=await import('vite'),{default:react}=await import('@vitejs/plugin-react');const {createElement}=await import('react'),{renderToStaticMarkup}=await import('react-dom/server');
 const server=await createServer({configFile:false,plugins:[react()],server:{middlewareMode:true,hmr:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]},appType:'custom'});
 try{const {default:Lab}=await server.ssrLoadModule('/src/FinancingLab.jsx'),{App}=await server.ssrLoadModule('/src/App.jsx');const render=r=>renderToStaticMarkup(createElement(Lab,{record:r}));const initial=render(emptyFinancing());assert.ok(!initial.includes('Financing results'));assert.ok(!initial.includes('Founder share of residual'));assert.ok(initial.includes('independent mini-case'));assert.ok(initial.includes('0.01 percentage point'));
  const result=render(make());assert.ok(result.includes('Financing results'));assert.ok(result.includes('Founder share of residual'));assert.ok(result.includes('Your explanation · ungraded'));assert.ok(result.includes('no competency label'));const app=renderToStaticMarkup(createElement(App,{initialRoute:{view:'labs',id:'A18',labId:'LAB-FINANCING'},initialSession:emptyLearningProfile().session}));assert.ok(app.includes('Save prediction and compare funding'));
 }finally{await server.close();delete globalThis.window;}
});
