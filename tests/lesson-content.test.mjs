import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const atlas=read('../content/master-network.json');
const lessons=read('../src/data/complete-lessons.json');
const guides=read('../content/domain-guides.json');
const study=read('../src/data/domain-study-guides.json');
test('all topic pages have a complete area guide and authored topic extensions are structurally valid',()=>{
  assert.equal(Object.keys(study).length,40);
  let detailed=0;
  for(const n of atlas.nodes){
    const lesson=lessons[n.id];
    assert.equal(lesson.domainGuide,n.domain,n.id);
    const guide=study[lesson.domainGuide];assert.ok(guide,n.id);
    for(const d of [guide,...(lesson.detail?[lesson.detail]:[])]){
      assert.ok(d.explanation.length>=2,n.id);
      assert.ok(d.types.length>=3,n.id);
      for(const t of d.types){assert.ok(t.name.trim());assert.ok(t.explanation.trim());}
      assert.ok(d.workedCase.setup.trim(),n.id);assert.ok(d.workedCase.steps.length>=3,n.id);
      assert.ok(d.workedCase.result.trim(),n.id);assert.ok(d.workedCase.interpretation.trim(),n.id);
      assert.ok(d.analysis.length>=3,n.id);
    }
    if(lesson.detail)detailed++;
  }
  assert.equal(detailed,90);
});
test('every original topic and anchor has an explanation, example, unique quiz choices, and valid answer',()=>{
  assert.equal(atlas.topics.length,678);assert.equal(atlas.atoms.length,20);assert.equal(Object.keys(lessons).length,698);
  for(const node of atlas.nodes){const l=lessons[node.id];assert.ok(l,`Missing ${node.id}`);for(const field of ['summary','explanation','example','question','feedback','trap','source'])assert.ok(l[field]?.trim(),`${node.id}: ${field}`);assert.equal(new Set(l.options).size,3,node.id);assert.ok(l.correct>=0&&l.correct<3,node.id);assert.ok(!/not authored|still to be written|lorem ipsum/i.test(l.summary+l.example),node.id);}
  assert.equal(Object.keys(guides).length,40);for(const d of atlas.domains){assert.ok(guides[d.id].context);assert.equal(guides[d.id].steps.length,3);}
});
test('worked numerical quizzes agree with independently recomputed answers',()=>{
  const nearest=(n,places=2)=>Math.round(n*10**places)/10**places;
  const cases={
    'T02.01':'50','T02.02':`${(10+5)/2}%`,'T02.03':`₹${nearest(100*1.1**2*.1).toFixed(2)}`,
    'T02.05':`${nearest(((144/100)**.5-1)*100)}% CAGR`,'T02.07':`${nearest(9/(9+99)*100,1)}%`,
    'T03.06':`₹${nearest(10/(.1-.03)).toFixed(2)}`,'T03.08':`${12/12}%`,'T03.11':`₹${nearest(100*1.1**2+100*1.1)}`,
    'T03.12':'Zero','T04.07':`₹${12-1}`,'T05.04':`₹${150-90}`,'T05.06':`${40/200*100}%`,
    'T05.07':'₹10','T05.13':`₹${10-8}`,'T05.17':`₹${20-3}`,'T05.20':`₹${20-5-3}`,
    'T06.03':`₹${20-8}`,'T06.07':`₹${100+20-5}`,'T07.05':'−₹3','T07.06':'₹10','T07.12':`₹${15+11-8+4-2}`,
    'T09.01':`${30/150*100}%`,'T09.05':`${15/150*100}%`,'T09.07':`${30/5} times`,'T09.11':`₹${110-66-30}`,
    'T11.02':`₹${100+2*50}`,'T11.03':`${100/(10-6)} units`,'T11.07':`₹${1200/100}`,'T11.10':'−₹5',
    'T11.11':`${120/20} months`,'T11.14':`${(4-3)/4*100}%`,'T12.05':`₹${30-10}`,'T13.17':`₹${100+8-3}`,
    'T14.02':`${50+30-40} days`,'T15.06':`₹${10*10}`,'T16.04':`₹${120*5}`,'T16.06':`₹${100+20-10}`,
    'T16.08':`₹${50+10-3}`,'T16.13':`₹${100-40}`,'T17.03':`₹${100+10-30}`,'T17.08':`₹${100+10-2}`,
    'T18.10':`₹${100-70-10}`,'T19.05':`₹${10*100*.4}`,'T20.04':`₹${98+2}`,'T21.02':'Zero',
    'T21.03':`₹${20-7}`,'T21.04':`₹${12-8}`,'T22.15':`${nearest((.10-.04)/.12)}`,'T22.17':`${nearest((100/70-1)*100,1)}% gain`,
    'T23.04':`₹${(110-10)/10}`,'T23.18':`${(40+90)/100}×`,'T24.04':`${4/100*100}%`,'T24.07':`${12/100*100}%`,
    'T24.12':`₹${.02*.4*100}`,'T24.14':`${30/20}`,'T26.07':`₹${20-8-5}`,'T27.06':`${100/125*100}%`,
    'T27.07':`${20/(80+20)*100}%`,'T29.04':`₹${10-2}`,'T29.08':`₹${50*2}`,'T31.16':`₹${10*(1-.2)}`,
    'T33.01':`₹${80*1.25}`,'T39.18':`₹${.8*100}`,
  };
  for(const [id,answer]of Object.entries(cases)){assert.equal(lessons[id].options[lessons[id].correct],answer,id);}
});
test('all 698 lesson renderings have hidden initial feedback, expanded examples, and correct retry states',async()=>{
  globalThis.window={location:{hash:'#statements/A02'}};
  const {createServer}=await import('vite');
  const {createElement}=await import('react');
  const {renderToStaticMarkup}=await import('react-dom/server');
  const {default:react}=await import('@vitejs/plugin-react');
  // Isolate the render harness from development warmup, polling, and dependency scanning.
  const server=await createServer({configFile:false,plugins:[react()],server:{middlewareMode:true,hmr:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]},appType:'custom'});
  try{
    const {App}=await server.ssrLoadModule('/src/App.jsx');
    for(const node of atlas.nodes){
      const route={view:'statements',id:node.id};
      const initial=renderToStaticMarkup(createElement(App,{initialRoute:route}));
      assert.ok(initial.includes('Topic quiz'),node.id);
      assert.ok(!initial.includes('feedback success')&&!initial.includes('feedback retry'),`Answer exposed: ${node.id}`);
      const expanded=renderToStaticMarkup(createElement(App,{initialRoute:route,initialDepth:true,initialAnswers:{[node.id]:lessons[node.id].correct}}));
      assert.ok(expanded.includes('A worked example'),node.id);assert.ok(expanded.includes('feedback success'),node.id);
      assert.ok(expanded.includes('Next connected question'),node.id);assert.ok(expanded.includes('How to analyse it'),node.id);
      assert.ok(expanded.includes('BROADER STUDY GUIDE'),node.id);assert.ok(expanded.includes('Work through it step by step'),node.id);
      if(lessons[node.id].detail)assert.ok(expanded.includes('Types and important distinctions'),node.id);
    }
    const wrong=(lessons['T17.05'].correct+1)%3;
    const retry=renderToStaticMarkup(createElement(App,{initialRoute:{view:'topics',id:'T17.05'},initialAnswers:{'T17.05':wrong}}));
    assert.ok(retry.includes('feedback retry'));assert.ok(retry.includes('Retry question'));
    for(const view of ['map','topics','missions','learning','resources']){
      const html=renderToStaticMarkup(createElement(App,{initialRoute:{view,id:'T17.05'}}));assert.ok(html.length>1000,view);
    }
  }finally{await server.close();delete globalThis.window;}
});
