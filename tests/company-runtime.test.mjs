import test from 'node:test';
import assert from 'node:assert/strict';
import {COMPANY,emptyCompany,replayCompany,addCompanyDecision as add,companyHint} from '../src/activities/company.js';
import {validateSimulationRecord,activityUnfinished} from '../src/activities/registry.js';
import {commitActivityRecord} from '../src/activities/records.js';
import {createSaveCodec,emptyLearningProfile} from '../src/learning-save.js';
import {learningNextSteps} from '../src/learning-next.js';
import {parseRoute,routeHash} from '../src/routes.js';
const values=[{profit:8,cash:0},{revenue:0,operatingCash:10},{profit:0,payables:10}];
const choices=['30-days','agent-early','cash-discount'];
const start=()=>add(emptyCompany(),{type:'setup',variant:'base'});
function through(count=3,selected=choices){let r=start();for(let round=1;round<=count;round++){r=add(r,{type:'predict',round,values:values[round-1]});r=add(r,{type:'commit',round,choice:selected[round-1]});r=add(r,{type:'explain',round,text:`Round ${round}: recognition and cash settlement differ.`});}return r;}
const codec=createSaveCodec({conceptIds:[],topics:{},topicVersions:{},packages:[],cases:{},validateSimulation:validateSimulationRecord});
test('three staged rounds reconcile original opening and distinguish expense, collection and inventory',()=>{
 const r=replayCompany(through());assert.equal(r.phase,'preview-complete');assert.equal(r.completed,3);assert.equal(r.finished,false);assert.equal(activityUnfinished(through()),false);
 assert.equal(r.after.cash,20.3);assert.equal(r.after.receivables,40);assert.equal(r.after.inventory,47.5);assert.equal(r.after.tradePayables,25);assert.equal(r.after.assets,207.8);assert.equal(r.after.profit,7.8);
 assert.equal(r.statements.cashFlow.operating,.3e7);assert.equal(r.statements.cashFlow.investing,0);assert.equal(r.statements.cashFlow.financing,0);
 const other=replayCompany(through(3,['60-days','wait','supplier-credit']));assert.equal(other.after.cash,20);assert.equal(other.after.receivables,50);assert.equal(other.after.inventory,48);assert.equal(other.after.tradePayables,35);assert.equal(other.after.assets,218);assert.equal(other.after.profit,8);
 assert.ok(other.pending.some(t=>t.id==='case-sale-collection'&&t.date==='2026-03-06'));assert.ok(other.pending.some(t=>t.id==='case-stock-settlement'&&t.date==='2026-02-10'));
});
test('every action prefix resumes by replay and contains only versioned raw decisions',()=>{
 const full=through();for(let n=0;n<=full.decisions.length;n++){
  let record=emptyCompany();for(const d of full.decisions.slice(0,n))record=add(record,d);
  const profile=emptyLearningProfile();profile.simulations=[record];const restored=codec.decode(codec.encode(profile)).simulations[0];assert.deepEqual(restored,record);assert.deepEqual(replayCompany(restored),replayCompany(record));
  assert.deepEqual(Object.keys(restored),['activityId','scenarioVersion','period','decisions']);
 }
});
test('first/latest predictions and requested help retain chronology; wrong predictions can proceed',()=>{
 let r=add(start(),{type:'predict',round:1,values:{profit:0,cash:20}});r=add(r,{type:'hint',round:1,stage:1});r=add(r,{type:'predict',round:1,values:values[0]});
 const result=replayCompany(r);assert.equal(result.current.attempts[0].allCorrect,false);assert.equal(result.current.attempts[0].helpBeforeAnswer,false);assert.equal(result.current.attempts[1].allCorrect,true);assert.equal(result.current.attempts[1].helpBeforeAnswer,true);
 const wrong=add(add(start(),{type:'predict',round:1,values:{profit:0,cash:20}}),{type:'commit',round:1,choice:'30-days'});assert.equal(replayCompany(wrong).phase,'explain');
 assert.ok(!companyHint(1,1).includes('20 − 12'));assert.ok(!companyHint(1,2).includes('20 − 12'));assert.ok(companyHint(1,3).includes('20 − 12'));
});
test('invalid versions, imported results, progression and premature Finish are rejected',()=>{
 for(const change of [{scenarioVersion:'0.0.0'},{period:1},{balances:{cash:999}}])assert.throws(()=>replayCompany({...start(),...change}));
 for(const d of [null,{type:'setup',variant:'late-customer'},{type:'predict',round:2,values:values[1]},{type:'hint',round:1,stage:2},{type:'predict',round:1,values:{profit:NaN,cash:0}},{type:'predict',round:1,values:{profit:8,cash:0,correct:true}},{type:'commit',round:1,choice:'30-days'},{type:'explain',round:1,text:'Premature'},{type:'finish',round:1}])assert.throws(()=>add(start(),d));
 assert.throws(()=>add(through(),{type:'predict',round:4,values:{funding:19.7}}));assert.throws(()=>add(through(),{type:'finish',round:3}));
});
test('stale commands are rejected even when consecutive actions leave completed-round count unchanged',()=>{
 const first=start(),one=commitActivityRecord([],0,first,0),pred=add(first,{type:'predict',round:1,values:values[0]});const two=commitActivityRecord(one,0,pred,1);assert.equal(two[0].period,0);assert.equal(two[0].decisions.length,2);assert.equal(commitActivityRecord(two,0,pred,1),two);assert.equal(commitActivityRecord(two,0,first,0),two);
});
test('company and lesson return links preserve the global activity index and planner selects real unfinished work',()=>{
 const inventory={concepts:new Set(['A02']),journeys:new Map()},r=parseRoute(routeHash('company','A02',{activityRun:2}),inventory);assert.equal(r.view,'company');assert.equal(r.activityRun,2);
 const detour=parseRoute(routeHash('lesson','A02',{returnLab:COMPANY,returnAttempt:2}),inventory);assert.equal(detour.returnLab,COMPANY);assert.equal(detour.returnAttempt,2);assert.ok(parseRoute('#simulations/'+COMPANY+'?attempt=0',inventory).message);
 const session=emptyLearningProfile().session,activities=[{activityId:COMPANY,index:2,title:'Nila',unfinished:true}],before=JSON.stringify(activities),plan=learningNextSteps({session,activities});assert.equal(plan.next.kind,'activity');assert.equal(plan.next.activityRun,2);assert.equal(JSON.stringify(activities),before);assert.equal(learningNextSteps({session,activities:[]}).next.kind,'brief');
});
test('render hides unattempted solutions, restores a partial company record and never claims full completion',async()=>{
 globalThis.window={location:{hash:'#simulations/'+COMPANY}};const {createServer}=await import('vite'),{default:react}=await import('@vitejs/plugin-react'),{createElement}=await import('react'),{renderToStaticMarkup}=await import('react-dom/server');
 const server=await createServer({configFile:false,plugins:[react()],server:{middlewareMode:true,hmr:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]},appType:'custom'});
 try{const {default:Case}=await server.ssrLoadModule('/src/CompanyCase.jsx'),{App}=await server.ssrLoadModule('/src/App.jsx');const render=r=>renderToStaticMarkup(createElement(Case,{record:r}));
  for(const r of [emptyCompany(),start()]){const html=render(r);assert.ok(!html.includes('Company prediction feedback'));assert.ok(!html.includes('20 − 12 = 8'));assert.ok(!html.includes('Supported result'));}
  const prediction=add(start(),{type:'predict',round:1,values:values[0]}),html=render(prediction);assert.ok(html.includes('Company prediction feedback'));assert.ok(html.includes('profit effect 8, cash movement 0'));assert.ok(html.includes('Commit: 30-day credit'));
  const done=render(through());assert.ok(done.includes('3 of 6 rounds'));assert.ok(done.includes('Finish is not available'));assert.ok(done.includes('recognition and cash settlement differ'));
  const profile=emptyLearningProfile();profile.simulations=[through(1)];profile.navigation='#simulations/'+COMPANY+'?attempt=1';const raw=JSON.stringify(codec.encode(profile));window.localStorage={getItem:()=>raw};
  const restored=renderToStaticMarkup(createElement(App));assert.ok(restored.includes('Company round 2'));assert.ok(restored.includes('1 of 6 rounds'));assert.ok(!restored.includes('Start company preview'));
  const learning=renderToStaticMarkup(createElement(App,{initialRoute:{view:'learning',id:'A02'}}));assert.ok(learning.includes('Resume this activity'));assert.ok(learning.includes('1/6 rounds explained'));
  const missing=renderToStaticMarkup(createElement(App,{initialRoute:{view:'company',id:'A02',activityRun:4}}));assert.ok(missing.includes('This activity record is unavailable'));assert.ok(!missing.includes('Company round 1'));
 }finally{await server.close();delete globalThis.window;}
});
