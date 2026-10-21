import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyEquipment,addEquipmentDecision,replayEquipment} from '../src/activities/equipment.js';
import {validateSimulationRecord} from '../src/activities/registry.js';
import {createSaveCodec,emptyLearningProfile} from '../src/learning-save.js';
import {statements} from '../src/model/statements.js';
const prediction={type:'prediction',purchase:'now',payment:'purchase',available:'purchase',lifeMonths:24,cash:'decrease',asset:'increase',profit:'unchanged'};
const make=(change={})=>addEquipmentDecision(emptyEquipment(),{...prediction,...change});
const near=(a,b,tol=1e-7)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
test('purchase and depreciation have distinct balanced account/cash effects',()=>{
 const r=replayEquipment(make()),jan=r.selected.months[0],dec=r.selected.months.at(-1);near(jan.cash,10);near(jan.investing,-10);near(jan.newDepreciation,10/24);near(jan.newProfitEffect,-10/24);near(dec.newCarryingValue,5);near(r.selected.months.reduce((n,m)=>n+m.newDepreciation,0),5);
 const statementsResult=statements(r.selected.model);assert.equal(statementsResult.cashFlow.operating,0);assert.equal(statementsResult.cashFlow.investing,-10e7);assert.equal(statementsResult.balanceSheet.assets,statementsResult.balanceSheet.liabilities+statementsResult.balanceSheet.equity);assert.deepEqual(r.checks,{cash:true,asset:true,profit:true});
});
test('supplier credit moves investing payment without moving acquisition or inventing expense',()=>{
 const r=replayEquipment(make({payment:'next-month',cash:'unchanged'}));assert.equal(r.selected.atAcquisition.cash,20);assert.equal(r.selected.atAcquisition.equipmentPayables,10);assert.equal(r.selected.months[0].investing,0);assert.equal(r.selected.months[1].investing,-10);near(r.selected.months[0].newDepreciation,10/24);assert.ok(r.checks.cash);
});
test('availability delays depreciation and useful life changes expense without inventing cash',()=>{
 const delayed=replayEquipment(make({available:'next-month'})),longer=replayEquipment(make({lifeMonths:36}));assert.equal(delayed.selected.months[0].newDepreciation,0);near(delayed.selected.months[1].newDepreciation,10/24);near(longer.selected.months[0].newDepreciation,10/36);assert.equal(longer.selected.months[0].cash,10);near(longer.selected.project.npv,replayEquipment(make()).selected.project.npv);
});
test('same-assumption branches separate positive project value from near-term affordability',()=>{
 const r=replayEquipment(make());near(r.now.project.npv,.4132231404958673);assert.ok(r.now.project.npv>r.later.project.npv);assert.equal(r.now.forecast.totalFundingNeeded,8);assert.equal(r.now.forecast.firstBreach,'2026-03-01');assert.equal(r.later.forecast.totalFundingNeeded,0);assert.equal(r.later.forecast.firstBreach,null);assert.equal(r.now.project.presentValues.filter(f=>f.amount<0).length,1);assert.equal(r.later.months[5].newCarryingValue,0);assert.equal(r.later.months[6].newCarryingValue,10-Number((10/24).toFixed(7)));
});
test('registered stages retain wrong predictions and ungraded reflection with deterministic replay',()=>{
 const r=make({profit:'increase'}),result=replayEquipment(r);assert.equal(result.checks.profit,false);const full=addEquipmentDecision(r,{type:'explanation',text:'January needs funding before June receipts; depreciation is not another payment.'});assert.equal(replayEquipment(full).phase,2);assert.deepEqual(replayEquipment(full),replayEquipment(structuredClone(full)));
 const codec=createSaveCodec({conceptIds:[],topics:{},topicVersions:{},packages:[],cases:{},validateSimulation:validateSimulationRecord}),p=emptyLearningProfile();p.simulations=[full];assert.deepEqual(codec.decode(codec.encode(p)).simulations,[full]);
});
test('unsupported terms, stages and imported results are rejected',()=>{
 for(const change of [{lifeMonths:12},{purchase:'tomorrow'},{available:'future'},{cash:'correct'},{rate:.1}])assert.throws(()=>make(change));
 assert.throws(()=>validateSimulationRecord({...make(),scenarioVersion:'2.0.0'}));assert.throws(()=>validateSimulationRecord({...make(),model:{cash:900}}));assert.throws(()=>validateSimulationRecord({...make(),period:2}));assert.throws(()=>addEquipmentDecision(emptyEquipment(),{type:'explanation',text:'skip'}));
});
test('render hides branch results until prediction and preserves units, dates and comparison',async()=>{
 globalThis.window={location:{hash:'#labs/LAB-EQUIPMENT'}};const {createServer}=await import('vite'),{default:react}=await import('@vitejs/plugin-react');const {createElement}=await import('react'),{renderToStaticMarkup}=await import('react-dom/server');
 const server=await createServer({configFile:false,plugins:[react()],server:{middlewareMode:true,hmr:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]},appType:'custom'});
 try{const {default:Lab}=await server.ssrLoadModule('/src/EquipmentLab.jsx'),{App}=await server.ssrLoadModule('/src/App.jsx');const render=r=>renderToStaticMarkup(createElement(Lab,{record:r}));const initial=render(emptyEquipment());assert.ok(!initial.includes('Equipment results'));assert.ok(!initial.includes('Peak funding to minimum'));assert.ok(initial.includes('100 additional orders'));assert.ok(initial.includes('6 at each'));
  const result=render(make());assert.ok(result.includes('Equipment results'));assert.ok(result.includes('Peak funding to minimum'));assert.ok(result.includes('Your explanation · ungraded'));assert.ok(result.includes('investment included once'));
  const app=renderToStaticMarkup(createElement(App,{initialRoute:{view:'labs',id:'A07',labId:'LAB-EQUIPMENT'},initialSession:emptyLearningProfile().session}));assert.ok(app.includes('Buying equipment is not depreciation.'));assert.ok(!app.includes('Equipment results'));
 }finally{await server.close();delete globalThis.window;}
});
