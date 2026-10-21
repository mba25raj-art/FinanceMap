import test from 'node:test';
import assert from 'node:assert/strict';
import refs from '../content/cases/nila-references.v1.json' with {type:'json'};
import {emptyCompany,replayCompany,addCompanyDecision as add,forkCompany,compareCompany,companyTransactions} from '../src/activities/company.js';
import {validateSimulationRecord} from '../src/activities/registry.js';
import {createSaveCodec,emptyLearningProfile} from '../src/learning-save.js';
const options=['30-days','agent-early','cash-discount','debt-expand','buy-now','wacc10-growth3'];
function advance(r,choice){const {round,expected}=replayCompany(r);r=add(r,{type:'predict',round,values:expected});r=add(r,{type:'commit',round,choice});return add(r,{type:'explain',round,text:'I protect the cash reserve on the supplier date, but weaker demand or slower receipts could reverse this funded plan.'});}
function make(variant='base',choices=options){let r=add(emptyCompany(),{type:'setup',variant});for(const c of choices)r=advance(r,c);return add(r,{type:'finish'});}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('late scenario shifts every customer receipt by thirty calendar days without changing invoices, fees or other terms',()=>{
 const choices={R1:'60-days',R2:'agent-early',R3:'supplier-credit'},base=companyTransactions(choices,'base'),late=companyTransactions(choices,'late-customer');
 for(let i=0;i<base.length;i++){const a=base[i],b=late.find(x=>x.id===a.id);if(a.type==='collection'){assert.equal(Date.parse(b.date)-Date.parse(a.date),30*86400000);assert.deepEqual({...b,date:a.date},a);}else assert.deepEqual(b,a);}
 assert.equal(late.find(t=>t.id==='case-sale-collection').date,'2026-04-05');assert.equal(late.find(t=>t.id==='case-sale').dueDate,'2026-03-06');assert.equal(late.find(t=>t.id==='case-agent-service').date,'2026-01-10');
});
test('all disclosed scenarios complete with reproducible funded receipts and no automatic borrowing',()=>{
 for(const b of refs.quarterBranches){const record=make(b.variant,[b.terms,b.collection,b.inventory,'debt-expand','buy-now','wacc10-growth3']),r=replayCompany(record);near(r.financial.funding.amount,b.expand.funding);assert.ok(r.financial.quarter.rows.every(p=>p.unfundedClosing>=3));assert.equal(r.financial.quarter.totalFundingNeeded,0);assert.deepEqual(replayCompany(structuredClone(record)),r);assert.equal(r.model.decisions.filter(t=>t.type==='borrowing').length,1);assert.equal(r.after.debt,75+b.expand.funding);}
});
test('forking any saved decision preserves its original and prior history, clears that round and records exposure',()=>{
 const original=make(),before=JSON.stringify(original),source=replayCompany(original);
 for(let n=1;n<=6;n++){const fork=forkCompany(original,n),r=replayCompany(fork);assert.equal(r.round,n);assert.equal(r.completed,n-1);assert.equal(r.phase,'predict');assert.equal(r.finished,false);assert.equal(r.current.choice,null);assert.deepEqual(r.current.attempts,[]);assert.deepEqual(r.current.hints,[]);assert.equal(r.replayFrom,n);assert.deepEqual(r.rounds.slice(0,n-1),source.rounds.slice(0,n-1));assert.equal(fork.decisions.at(-1).type,'replay');
  const attempted=add(fork,{type:'predict',round:n,values:r.expected});assert.equal(replayCompany(attempted).current.attempts[0].priorExposure,true);assert.equal(replayCompany(attempted).current.attempts[0].helpBeforeAnswer,false);
 }
 assert.equal(JSON.stringify(original),before);assert.throws(()=>forkCompany(emptyCompany(),1));assert.throws(()=>forkCompany(original,0));assert.throws(()=>forkCompany(original,7));
 let nested=advance(forkCompany(original,4),'equity-expand');nested=advance(nested,'buy-now');const fork=forkCompany(nested,5);assert.equal(replayCompany(fork).replayFrom,4);assert.equal(replayCompany(fork).round,5);
});
test('forks round-trip and cannot smuggle computed outcomes or a replay marker after answering',()=>{
 const fork=forkCompany(make(),4),codec=createSaveCodec({conceptIds:[],topics:{},topicVersions:{},packages:[],cases:{},validateSimulation:validateSimulationRecord}),profile=emptyLearningProfile();profile.simulations=[make(),fork];const raw=codec.encode(profile);assert.deepEqual(codec.decode(raw).simulations,profile.simulations);
 const answered=add(fork,{type:'predict',round:4,values:{fundingGap:19.7}});assert.throws(()=>add(answered,{type:'replay',round:4}));assert.throws(()=>add(fork,{type:'replay',round:4}));assert.throws(()=>validateSimulationRecord({...fork,sourceBalances:{cash:90}}));
});
test('comparison requires finished records in the same scenario and evaluates both at common rates without a quality score',()=>{
 const debt=make(),equity=make('base',[...options.slice(0,3),'equity-expand',...options.slice(4,5),'wacc12-growth0']),comparison=compareCompany(debt,equity);assert.equal(comparison.variant,'base');assert.equal(comparison.comparisonWACC,.1);assert.equal(comparison.comparisonGrowth,.03);assert.equal(comparison.left.enterprise,comparison.right.enterprise);assert.equal(comparison.left.cash,comparison.right.cash);assert.equal(comparison.left.raised,comparison.right.raised);assert.equal(comparison.left.quarterMinimum,3);assert.ok(comparison.right.founderOwnership<comparison.left.founderOwnership);assert.ok(!JSON.stringify(comparison).includes('score'));assert.ok(!JSON.stringify(comparison).includes('quality'));assert.equal(replayCompany(equity).choices.R6,'wacc12-growth0');
 assert.throws(()=>compareCompany(debt,make('late-customer')));assert.throws(()=>compareCompany(debt,forkCompany(debt,4)));
 const fork=advance(advance(advance(forkCompany(debt,4),'none-operate'),'defer'),'wacc10-growth3'),alternative=add(fork,{type:'finish'}),c=compareCompany(debt,alternative);assert.equal(c.right.debt,75);assert.equal(c.right.raised,0);assert.notEqual(c.left.firstFCFF,c.right.firstFCFF);assert.equal(c.right.quarterMinimum,13.3);
});
test('render discloses the variant before start, marks replay exposure and limits comparisons to same-scenario completed records',async()=>{
 globalThis.window={location:{hash:'#simulations/CASE-NILA-HOMEWARE'}};const {createServer}=await import('vite'),{default:react}=await import('@vitejs/plugin-react'),{createElement}=await import('react'),{renderToStaticMarkup}=await import('react-dom/server');const server=await createServer({configFile:false,plugins:[react()],server:{middlewareMode:true,hmr:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]},appType:'custom'});
 try{const {default:Case}=await server.ssrLoadModule('/src/CompanyCase.jsx');const render=(record,extra={})=>renderToStaticMarkup(createElement(Case,{record,...extra}));const initial=render(emptyCompany());assert.ok(initial.includes('Receipts arrive 30 days later'));assert.ok(initial.includes('Every customer receipt moves exactly 30 calendar days'));assert.ok(!initial.includes('Company prediction feedback'));
  const base=make(),late=make('late-customer'),equity=make('base',[...options.slice(0,3),'equity-expand',...options.slice(4)]),html=render(base,{records:[base,equity,late],recordIndex:0,onFork:()=>{}});assert.ok(html.includes('Restart at round 4'));assert.ok(html.includes('Other experiment 2'));assert.ok(!html.includes('Other experiment 3'));assert.ok(html.includes('common supplied WACC 10% and growth 3%'));assert.ok(html.includes('does not automatically make an explanation better'));
  const fork=forkCompany(base,4),attempted=add(fork,{type:'predict',round:4,values:{fundingGap:19.7}}),replay=render(attempted);assert.ok(replay.includes('prior exposure in a restarted experiment'));assert.ok(replay.includes('guided replay evidence'));
  const lateRound=add(add(emptyCompany(),{type:'setup',variant:'late-customer'}),{type:'predict',round:1,values:{profit:8,cash:0}}),terms=render(lateRound);assert.ok(terms.includes('invoice due 2026-02-04 · expected cash 2026-03-06'));assert.ok(!terms.includes('invoice due 2026-03-06 · expected cash 2026-03-06'));
 }finally{await server.close();delete globalThis.window;}
});
