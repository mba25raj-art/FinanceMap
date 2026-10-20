import test from 'node:test';
import assert from 'node:assert/strict';
import {focusContent,activityAnnouncement,preferredScrollBehavior} from '../src/activity-accessibility.js';
import {emptyCollection,addCollectionDecision as collection} from '../src/activities/collections.js';
import {emptyEquipment,addEquipmentDecision as equipment} from '../src/activities/equipment.js';
import {emptyFinancing,addFinancingDecision as financing} from '../src/activities/financing.js';
import {emptyCompany,addCompanyDecision as company} from '../src/activities/company.js';
import {emptyPractice,addPracticeDecision as practice,practiceQuestions} from '../src/activities/practice.js';
import {emptyTransfer,addTransferDecision as transfer,transferExpected} from '../src/activities/transfer.js';

test('content focus preserves native Tab order and makes reading targets programmatically focusable',()=>{
 for(const native of ['textarea','select','input','button','link']){
  const calls=[],target={tabIndex:0,hasAttribute:()=>false,setAttribute:()=>assert.fail(`${native} must retain its native Tab order`),focus:options=>calls.push(options)};
  assert.equal(focusContent(target),true);assert.deepEqual(calls,[{preventScroll:false}]);
 }
 const changes=[],heading={tabIndex:-1,hasAttribute:()=>false,setAttribute:(...args)=>changes.push(args),focus:options=>changes.push(options)};
 focusContent(heading,{preventScroll:true});assert.deepEqual(changes,[['tabindex','-1'],{preventScroll:true}]);
 const explicit={tabIndex:-1,hasAttribute:()=>true,setAttribute:()=>assert.fail('Preserve explicit focus policy'),focus:()=>{}};focusContent(explicit);
 assert.equal(focusContent(null),false);
});

test('restored records stay silent while repeated new responses have distinct, spoiler-free announcements',()=>{
 const record={decisions:[{type:'setup'},{type:'predict',values:{profit:999}},{type:'predict',values:{profit:8}}]};
 assert.equal(activityAnnouncement(record,record.decisions.length),'');
 assert.equal(activityAnnouncement({decisions:record.decisions.slice(0,2)},1),'Response 1 saved. Feedback is available.');
 assert.equal(activityAnnouncement(record,2),'Response 2 saved. Feedback is available.');
 const message=activityAnnouncement(record,2);assert.ok(!message.includes('999'));assert.ok(!message.includes('8'));
 assert.match(activityAnnouncement({decisions:[{type:'explain'}]},0),/ungraded/);
 assert.match(activityAnnouncement({decisions:[{type:'hint',stage:3}]},0),/worked answer revealed/);
 assert.match(activityAnnouncement({decisions:[{type:'finish'}]},0),/does not award competency/);
 assert.equal(preferredScrollBehavior(true),'auto');assert.equal(preferredScrollBehavior(false),'smooth');
});

test('rendered activities expose named feedback and a single initially empty announcement region',async()=>{
 const at='2026-10-20T03:35:00.000Z';
 const collectionRecord=collection(collection(emptyCollection(),{type:'sale',amount:20,cost:12}),{type:'prediction',amount:10,paymentDate:'2026-01-10',cash:'increase',receivables:'decrease',profit:'unchanged',classification:'operating'});
 const equipmentRecord=equipment(emptyEquipment(),{type:'prediction',purchase:'now',payment:'purchase',available:'purchase',lifeMonths:24,cash:'decrease',asset:'increase',profit:'unchanged'});
 const financingRecord=financing(emptyFinancing(),{type:'prediction',annualRate:.12,preMoney:40,firstFCFF:10,raiseCategory:'financing',raiseProfit:'unchanged',newOwnership:20});
 const companyRecord=company(company(emptyCompany(),{type:'setup',variant:'base'}),{type:'predict',round:1,values:{profit:0,cash:20}});
 const q=practiceQuestions('starter')[0],practiceRecord=practice(practice(emptyPractice(),{type:'setup',variant:'starter'}),{type:'answer',questionId:q.id,questionVersion:q.version,values:q.expected,at});
 const transferRecord=transfer(transfer(emptyTransfer(),{type:'setup',priorExposure:false,at}),{type:'attempt',values:transferExpected(),explanation:'Compare dates, service, dilution and assumptions.',priorExposure:false,at});
 const cases=[['CollectionLab',emptyCollection(),collectionRecord,'Collection result'],['EquipmentLab',emptyEquipment(),equipmentRecord,'Equipment results'],['FinancingLab',emptyFinancing(),financingRecord,'Financing results'],['CompanyCase',emptyCompany(),companyRecord,'Company prediction feedback'],['PracticeCheck',emptyPractice(),practiceRecord,'Practice feedback'],['TransferCheck',emptyTransfer(),transferRecord,'Transfer result']];
 const {createServer}=await import('vite'),{default:react}=await import('@vitejs/plugin-react'),{createElement}=await import('react'),{renderToStaticMarkup}=await import('react-dom/server');
 const server=await createServer({configFile:false,plugins:[react()],server:{middlewareMode:true,hmr:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]},appType:'custom'});
 try{
  const {default:Frame}=await server.ssrLoadModule('/src/ActivityAccessibility.jsx');
  for(const [name,empty,answered,label] of cases){
   const {default:Component}=await server.ssrLoadModule(`/src/${name}.jsx`);
   const render=record=>renderToStaticMarkup(createElement(Frame,{record},createElement(Component,{record,records:[]})));
   assert.ok(!render(empty).includes('data-feedback'),`${name} must conceal pre-answer feedback`);
   const html=render(answered);
   const feedback=(html.match(/<section\b[^>]*data-feedback[^>]*>/g)||[]).filter(tag=>tag.includes(`aria-label="${label}"`));
   assert.equal(feedback.length,1,`${name} feedback needs a named focus target`);assert.ok(feedback[0].includes('tabindex="-1"'));
   assert.equal((html.match(/role="status"/g)||[]).length,1,`${name} must not compete with its enclosing announcement region`);
   assert.ok(html.includes('aria-live="polite" aria-atomic="true"></p>'),`${name} restore must not announce an old save as a new one`);
   assert.ok(html.includes('<caption>'));assert.ok(html.includes('scope="col"'));assert.ok(html.includes('scope="row"'));
  }
 }finally{await server.close();}
});
