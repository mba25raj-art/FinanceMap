import test from 'node:test';
import assert from 'node:assert/strict';
import examples from '../content/connections/examples.v1.json' with {type:'json'};
import atlas from '../content/master-network.json' with {type:'json'};
import {emptyLearningProfile} from '../src/learning-save.js';
import scope from '../content/first-release-scope.json' with {type:'json'};
import {emptyCompany,replayCompany,addCompanyDecision as add} from '../src/activities/company.js';
import {companyTrace} from '../src/activities/company-trace.js';
const options=['30-days','agent-early','cash-discount','debt-expand','buy-now','wacc10-growth3'],near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function through(count,variant='base',choices=options){let r=add(emptyCompany(),{type:'setup',variant});for(let n=1;n<=count;n++){const v=replayCompany(r);r=add(r,{type:'predict',round:n,values:v.expected});r=add(r,{type:'commit',round:n,choice:choices[n-1]});r=add(r,{type:'explain',round:n,text:'A conditional account, timing and downstream explanation.'});}return r;}
test('all 22 selected financial links retain their master identities and have checked numerical examples/conditions',()=>{
 const selected=new Set(scope.concepts.map(c=>c.id)),learning=new Set(['PART_OF','EXPLORE_WITH','RECOMMENDED_BEFORE','DEEPENS']),links=atlas.edges.filter(e=>selected.has(e.from)&&selected.has(e.to)&&!learning.has(e.type));assert.equal(examples.examples.length,22);assert.deepEqual(new Set(examples.examples.map(e=>e.edgeId)),new Set(links.map(e=>e.id)));
 for(const e of examples.examples){const master=links.find(m=>m.id===e.edgeId);assert.equal(e.fromId,master.from);assert.equal(e.toId,master.to);assert.ok(e.example&&e.conditions);const i=e.inputs;let answer;
  if(e.kind==='credit-sale')answer=i.sale;else if(e.kind==='owc')answer=i.ar+i.inventory-i.payables;else if(e.kind==='indirect')answer=i.profit+i.depreciation-i.change;else if(e.kind==='days')answer=i.average/i.annualFlow*i.days;else if(e.kind==='ebit')answer=i.revenue-i.cost-i.opex-i.dep;else if(e.kind==='fcff')answer=i.nopat+i.dep-i.capex-i.change;else if(e.kind==='nopat')answer=i.ebit*(1-i.tax);else if(e.kind==='pv')answer=i.cash/(1+i.rate);else if(e.kind==='financing-excluded')answer=i.fcff;else if(e.kind==='dcf')answer=i.flows.reduce((n,v,j)=>n+v/(1+i.wacc)**(j+1),0)+(i.flows.at(-1)*(1+i.growth)/(i.wacc-i.growth))/(1+i.wacc)**i.flows.length;else if(e.kind==='equity')answer=i.enterprise-i.debt+i.excessCash-i.otherClaims;else if(e.kind==='npv')answer=-i.initial+i.flows.reduce((n,v,j)=>n+v/(1+i.rate)**(j+1),0);else assert.fail(e.kind);near(answer,e.expected);
 }
});
test('decision traces use actual before/after ledgers without revealing the next unanswered calculation',()=>{
 assert.equal(companyTrace(replayCompany(emptyCompany())),null);assert.equal(companyTrace(replayCompany(through(0))),null);
 for(let n=1;n<=6;n++){const record=through(n),result=replayCompany(record),before=JSON.stringify(result),trace=companyTrace(result);assert.equal(trace.round,n);assert.ok(trace.timing&&trace.downstream&&trace.conditions);assert.ok(trace.concepts.length);assert.equal(JSON.stringify(result),before);assert.deepEqual(companyTrace(replayCompany(structuredClone(record))),trace);}
 const sale=companyTrace(replayCompany(through(1)));assert.equal(sale.delta.cash,0);assert.equal(sale.delta.profit,8);assert.equal(sale.delta.receivables,20);assert.equal(sale.delta.inventory,-12);assert.ok(sale.timing.includes('2026-02-04'));
 const r3=companyTrace(replayCompany(through(3)));assert.equal(r3.round,3);assert.ok(!r3.downstream.includes('19.70'));assert.ok(!r3.downstream.includes('15.64'));const r5=companyTrace(replayCompany(through(5)));assert.equal(r5.round,5);assert.ok(!r5.downstream.includes('23.30'));
});
test('timing traces separate unposted delayed receipts, services, supplier credit and retained funding on deferral',()=>{
 const late=companyTrace(replayCompany(through(2,'late-customer')));assert.equal(late.delta.cash,-.2);assert.equal(late.delta.receivables,0);assert.equal(late.delta.profit,-.2);assert.ok(late.timing.includes('2026-02-09'));assert.ok(late.conditions.includes('service fee does not'));
 const credit=companyTrace(replayCompany(through(3,'base',[...options.slice(0,2),'supplier-credit'])));assert.equal(credit.delta.cash,0);assert.equal(credit.delta.inventory,10);assert.equal(credit.delta.tradePayables,10);assert.ok(credit.downstream.includes('0.00'));
 const equity=companyTrace(replayCompany(through(4,'base',[...options.slice(0,3),'equity-expand'])));assert.equal(equity.delta.cash,19.7);assert.equal(equity.delta.contributedCapital,19.7);assert.equal(equity.delta.profit,0);assert.ok(equity.timing.includes('no mandatory coupon'));
 const defer=companyTrace(replayCompany(through(5,'base',[...options.slice(0,4),'defer'])));assert.equal(defer.delta.cash,0);assert.equal(defer.after.debt,94.7);assert.ok(defer.timing.includes('financing is retained'));
});
test('valuation trace distinguishes unchanged posted accounts from conditional annual FCFF/value and counted claims',()=>{
 const t=companyTrace(replayCompany(through(6)));assert.equal(t.delta.cash,0);assert.equal(t.delta.profit,0);assert.ok(t.downstream.includes('FCFF 23.30'));assert.ok(t.downstream.includes('enterprise 271.16'));assert.ok(t.downstream.includes('equity residual 180.18'));assert.ok(t.conditions.includes('count claims/excess cash once'));assert.ok(t.journal.some(j=>j.account==='depreciationExpense'&&j.amount>0));assert.ok(t.mechanismIds.includes('E2155'));
});
test('render offers a text/table causal path and numerical Atlas details while preserving learning/financial distinctions',async()=>{
 globalThis.window={location:{hash:'#atlas/lessons/A10'}};const {createServer}=await import('vite'),{default:react}=await import('@vitejs/plugin-react'),{createElement}=await import('react'),{renderToStaticMarkup}=await import('react-dom/server');const server=await createServer({configFile:false,plugins:[react()],server:{middlewareMode:true,hmr:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]},appType:'custom'});
 try{const {default:Trace}=await server.ssrLoadModule('/src/CompanyTrace.jsx'),{default:Case}=await server.ssrLoadModule('/src/CompanyCase.jsx'),{App}=await server.ssrLoadModule('/src/App.jsx');const html=renderToStaticMarkup(createElement(Trace,{result:replayCompany(through(6))}));assert.ok(html.includes('Immediate account effect'));assert.ok(html.includes('Timing effect'));assert.ok(html.includes('Downstream mechanism'));assert.ok(html.includes('without requiring a canvas'));assert.ok(html.includes('Selected choice at this date'));
  const before=renderToStaticMarkup(createElement(Case,{record:through(3)}));assert.ok(!before.includes('Funding results'));assert.ok(!before.includes('19.70'));const app=renderToStaticMarkup(createElement(App,{initialRoute:{view:'lesson',id:'A10'},initialSession:emptyLearningProfile().session}));assert.ok(app.includes('Why this connection · worked numbers'));assert.ok(app.includes('NOPAT sixteen'));assert.ok(app.includes('Conditions:'));assert.ok(app.includes('Independent illustrative example'));
 }finally{await server.close();delete globalThis.window;}
});
