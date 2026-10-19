import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyCollection,addCollectionDecision,replayCollection,COLLECTIONS} from '../src/activities/collections.js';
import {validateSimulationRecord} from '../src/activities/registry.js';
import {commitActivityRecord} from '../src/activities/records.js';
import {createSaveCodec,createLearningStorage,emptyLearningProfile} from '../src/learning-save.js';
import {parseRoute,routeHash} from '../src/routes.js';
const sale={type:'sale',amount:20,cost:12};
const prediction={type:'prediction',amount:10,paymentDate:'2026-01-10',cash:'increase',receivables:'decrease',profit:'unchanged',classification:'operating'};
const make=(d=prediction)=>addCollectionDecision(addCollectionDecision(emptyCollection(),sale),d);
test('sale, prediction and explanation replay deterministic model results without trusting balances',()=>{
 const start=emptyCollection(),s=addCollectionDecision(start,sale);assert.equal(start.decisions.length,0);assert.equal(replayCollection(s).after,null);
 const r=make(),result=replayCollection(r);assert.equal(result.before.cash,20);assert.equal(result.before.receivables,50);assert.equal(result.before.profit,8);assert.equal(result.after.cash,30);assert.equal(result.after.receivables,40);assert.equal(result.after.profit,8);assert.equal(result.statements.cashFlow.operating,10e7);assert.deepEqual(result.prediction.checks,{cash:true,receivables:true,profit:true,classification:true});
 const full=addCollectionDecision(r,{type:'explanation',text:'Collection settles the invoice; revenue arose at delivery.'});assert.equal(replayCollection(full).phase,3);assert.ok(replayCollection(full).reflection);assert.deepEqual(replayCollection(full),replayCollection(structuredClone(full)));
 assert.throws(()=>validateSimulationRecord({...full,balance:900}));assert.throws(()=>validateSimulationRecord({...full,scenarioVersion:'0.0.0'}));
});
test('payment delay changes dated cash need but neither revenue nor profit',()=>{
 const early=replayCollection(make()),late=replayCollection(make({...prediction,paymentDate:'2026-03-15'}));assert.equal(early.forecast.totalFundingNeeded,6);assert.equal(late.forecast.totalFundingNeeded,16);assert.equal(early.after.profit,late.after.profit);assert.equal(early.after.revenue,late.after.revenue);assert.equal(early.model.ledger.debt,late.model.ledger.debt);assert.equal(late.forecast.firstBreach,'2026-02-10');
});
test('invalid stage, precision, stock, choice and settlement references cannot enter saves',()=>{
 for(const bad of [{...sale,amount:31},{...sale,cost:51},{...sale,cost:-1},{...sale,amount:NaN}])assert.throws(()=>addCollectionDecision(emptyCollection(),bad));
 const s=addCollectionDecision(emptyCollection(),sale);for(const bad of [{...prediction,amount:21},{...prediction,amount:0},{...prediction,paymentDate:'2026-02-30'},{...prediction,cash:'correct'},{...prediction,balance:100}])assert.throws(()=>addCollectionDecision(s,bad));
 assert.throws(()=>replayCollection({...make(),period:0}));assert.throws(()=>addCollectionDecision(emptyCollection(),prediction));
});
test('wrong predictions remain saved observations rather than becoming answer keys',()=>{
 const r=make({...prediction,profit:'increase',classification:'financing'}),p=replayCollection(r).prediction;assert.equal(p.checks.profit,false);assert.equal(p.checks.classification,false);assert.equal(r.decisions[1].profit,'increase');assert.equal(replayCollection(r).after.profit,8);
});
test('activity saves round-trip and restore only registered decision versions',()=>{
 const codec=createSaveCodec({conceptIds:[],topics:{},topicVersions:{},packages:[],cases:{},validateSimulation:validateSimulationRecord}),profile=emptyLearningProfile();profile.simulations=[make()];profile.navigation='#labs/LAB-COLLECTIONS';
 const memory=new Map(),storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};const writer=createLearningStorage(storage,codec);assert.ok(writer.save(profile).ok);const loaded=createLearningStorage(storage,codec).initial.profile;assert.deepEqual(loaded.simulations,profile.simulations);assert.deepEqual(replayCollection(loaded.simulations[0]),replayCollection(make()));
 const bad=codec.encode(profile);bad.progress.simulations[0].decisions[1].score=100;assert.throws(()=>codec.decode(bad));
});
test('stale duplicate commits do not create another experiment or replace a later stage',()=>{
 const first=addCollectionDecision(emptyCollection(),sale),one=commitActivityRecord([],0,first,0);assert.equal(one.length,1);assert.equal(commitActivityRecord(one,0,first,0),one);const two=commitActivityRecord(one,0,make(),1);assert.equal(two[0].period,2);assert.equal(commitActivityRecord(two,0,make(),1),two);
});
test('lab run and lesson return routes preserve activity identity',()=>{
 const inventory={concepts:new Set(['A02']),journeys:new Map()},hash=routeHash('labs','A02',{labId:COLLECTIONS,activityRun:2}),r=parseRoute(hash,inventory);assert.equal(r.labId,COLLECTIONS);assert.equal(r.activityRun,2);
 const detour=parseRoute(routeHash('lesson','A02',{returnLab:COLLECTIONS,returnAttempt:2}),inventory);assert.equal(detour.returnLab,COLLECTIONS);assert.equal(detour.returnAttempt,2);assert.ok(parseRoute('#labs/LAB-COLLECTIONS?attempt=0',inventory).message);
});
test('render protects pre-prediction result, labels units and displays recorded wrong predictions',async()=>{
 globalThis.window={location:{hash:'#labs/LAB-COLLECTIONS'}};const {createServer}=await import('vite'),{default:react}=await import('@vitejs/plugin-react');const {createElement}=await import('react'),{renderToStaticMarkup}=await import('react-dom/server');
 const server=await createServer({configFile:false,plugins:[react()],server:{middlewareMode:true,hmr:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]},appType:'custom'});
 try{const {default:Lab}=await server.ssrLoadModule('/src/CollectionLab.jsx'),{App}=await server.ssrLoadModule('/src/App.jsx');const render=r=>renderToStaticMarkup(createElement(Lab,{record:r}));
  for(const r of [emptyCollection(),addCollectionDecision(emptyCollection(),sale)]){const html=render(r);assert.ok(!html.includes('Collection result'));assert.ok(!html.includes('Actual model postings'));assert.ok(!html.includes('it creates no new revenue or profit'));assert.ok(html.includes('INR lakh'));}
  const html=render(make({...prediction,profit:'increase'}));assert.ok(html.includes('Collection result'));assert.ok(html.includes('increase · review'));assert.ok(html.includes('Your explanation · ungraded'));assert.ok(html.includes('Remaining invoice: 10.00'));
  const app=renderToStaticMarkup(createElement(App,{initialRoute:{view:'labs',id:'A02',labId:COLLECTIONS},initialSession:emptyLearningProfile().session}));assert.ok(app.includes('Commit the credit sale'));assert.ok(!app.includes('Collection result'));
 }finally{await server.close();}
});
