import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getQuizFeedback } from '../src/quiz-feedback.js';
const read = p => JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const atlas=read('../content/master-network.json');
const lessons=read('../src/data/complete-lessons.json');
const guides=read('../content/domain-guides.json');
const study=read('../src/data/domain-study-guides.json');
test('feedback distinguishes the two receivables misconceptions and the supported collection effect',()=>{
  const l=lessons.A02;
  const revenue=getQuizFeedback(l,l.options.indexOf('Revenue rises again'));
  const profit=getQuizFeedback(l,l.options.indexOf('Profit falls'));
  assert.match(revenue,/sale a second time/);
  assert.match(profit,/not an expense or a write-off/);
  assert.notEqual(revenue,profit);
  for(const feedback of [revenue,profit]){
    assert.match(feedback,/Cash rises by ₹5 lakh and receivables fall by ₹5 lakh/);
    assert.doesNotMatch(feedback,/Exactly\.|Correct\./);
  }
});
test('every quiz outcome is consistent and author explanations stay attached to the selected choice',()=>{
  for(const [id,l] of Object.entries(lessons)){
    assert.equal(getQuizFeedback(l,undefined),null,`Feedback before attempt: ${id}`);
    assert.match(getQuizFeedback(l,l.correct),/^Correct\. /,id);
    for(let answer=0;answer<l.options.length;answer++){
      if(answer===l.correct)continue;
      const feedback=getQuizFeedback(l,answer);
      assert.match(feedback,/^Not quite\. /,id);
      assert.doesNotMatch(feedback,/\b(?:Exactly|Correct)[.!]/,id);
      assert.ok(feedback.includes(`The supported answer is “${l.options[l.correct]}”.`),id);
      if(l.incorrectFeedback?.[l.options[answer]])assert.ok(feedback.includes(l.incorrectFeedback[l.options[answer]]),id);
    }
  }
  const basis=lessons['T02.01'];
  assert.match(getQuizFeedback(basis,basis.options.indexOf('0.5')),/percentage points.*multiplying by 100/);
  const npv=lessons['T03.12'];
  assert.match(getQuizFeedback(npv,npv.options.indexOf('₹4.55')),/question specifies 15%/);
});
test('all 698 topic pages have individually authored detailed lessons and separate area guides',()=>{
  assert.equal(Object.keys(study).length,40);
  let detailed=0;
  for(const n of atlas.nodes){
    const lesson=lessons[n.id];
    assert.ok(lesson.detail,`Missing individual detailed lesson: ${n.id}`);
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
  const coverage=read('../content/lesson-coverage.json');assert.equal(detailed,coverage.detailedLessons);assert.equal(detailed,698);
  assert.deepEqual(coverage.detailedMissing,[]);
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
      assert.ok(initial.includes('BROADER STUDY GUIDE'),node.id);
      assert.ok(initial.indexOf('Work through it step by step')<initial.indexOf('Topic quiz'),node.id);
      assert.ok(!initial.includes('feedback success')&&!initial.includes('feedback retry'),`Answer exposed: ${node.id}`);
      const expanded=renderToStaticMarkup(createElement(App,{initialRoute:route,initialDepth:true,initialAnswers:{[node.id]:lessons[node.id].correct}}));
      assert.ok(expanded.includes('A worked example'),node.id);assert.ok(expanded.includes('feedback success'),node.id);
      assert.ok(expanded.includes('Next connected topic question'),node.id);assert.ok(expanded.includes('How to analyse it'),node.id);
      assert.ok(expanded.includes('BROADER STUDY GUIDE'),node.id);assert.ok(expanded.includes('Work through it step by step'),node.id);
      if(lessons[node.id].detail)assert.ok(expanded.includes('Types and important distinctions'),node.id);
      // Regression: exercise both wrong states of every lesson, not only the success path.
      for(let choice=0;choice<lessons[node.id].options.length;choice++){
        if(choice===lessons[node.id].correct)continue;
        const wrongHtml=renderToStaticMarkup(createElement(App,{initialRoute:route,initialAnswers:{[node.id]:choice}}));
        assert.ok(wrongHtml.includes('feedback retry'),node.id);
        assert.ok(wrongHtml.includes('role="status"'),node.id);
        assert.ok(wrongHtml.includes('Retry topic question'),node.id);
        assert.ok(!wrongHtml.includes('Not quite. Exactly.')&&!wrongHtml.includes('Not quite. Correct.'),node.id);
        if(node.id==='A02')assert.ok(wrongHtml.includes(choice===1?'sale a second time':'not an expense or a write-off'));
      }
    }
    const wrong=(lessons['T17.05'].correct+1)%3;
    const retry=renderToStaticMarkup(createElement(App,{initialRoute:{view:'topics',id:'T17.05'},initialAnswers:{'T17.05':wrong}}));
    assert.ok(retry.includes('feedback retry'));assert.ok(retry.includes('Retry topic question'));
    for(const view of ['map','topics','missions','learning','resources']){
      const html=renderToStaticMarkup(createElement(App,{initialRoute:{view,id:'T17.05'}}));assert.ok(html.length>1000,view);
    }
  }finally{await server.close();delete globalThis.window;}
});
test('mystery solutions and worked lessons appear only after a valid attempt or a deliberate clue hint',async()=>{
  globalThis.window={location:{hash:'#missions/A02'}};
  const {createServer}=await import('vite');
  const {createElement}=await import('react');
  const {renderToStaticMarkup}=await import('react-dom/server');
  const {default:react}=await import('@vitejs/plugin-react');
  const server=await createServer({configFile:false,plugins:[react()],server:{middlewareMode:true,hmr:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]},appType:'custom'});
  try{
    const {App}=await server.ssrLoadModule('/src/App.jsx');
    const {default:CashMystery,MysteryLessonGate,canRevealMysteryClue}=await server.ssrLoadModule('/src/CashMystery.jsx');
    const {mystery}=await server.ssrLoadModule('/src/data/lessons.js');
    const render=(Component,props)=>renderToStaticMarkup(createElement(Component,props));
    const landing=render(App,{initialRoute:{view:'missions',id:'A02'}});
    assert.ok(landing.includes('To discover'));
    assert.ok(!landing.includes('₹7 lakh'),'Landing exposes final amount');
    assert.ok(!mystery.intro.includes('₹7 lakh'),'Introduction exposes final amount');
    assert.ok(!mystery.facts.some(f=>/cash tied up/.test(f.note)),'Early fact card gives the first solution');
    for(let step=0;step<mystery.steps.length;step++){
      const clue=mystery.steps[step];
      const base={step,answers:{},hints:{},complete:false};
      const initial=render(CashMystery,base);
      assert.ok(!initial.includes('role="status"'),'Unattempted explanation mounted');
      assert.ok(!initial.includes(clue.why),'Unattempted solution mounted');
      assert.ok(!initial.includes('aria-pressed="true"'),'Answer preselected');
      assert.ok(initial.includes('disabled=""'),'Progression enabled before an answer');
      // The candidate ₹7 answer and all calculation inputs remain visible on clue 3.
      for(const option of clue.options)assert.ok(initial.includes(option),option);
      const hinted=render(CashMystery,{...base,hints:{[step]:true}});
      assert.ok(hinted.includes('Hint revealed.'));
      assert.ok(hinted.includes(clue.why));
      assert.ok(hinted.includes('disabled=""'),'A hint advances the case');
      const wrong=render(CashMystery,{...base,answers:{[step]:(clue.correct+1)%clue.options.length}});
      assert.ok(wrong.includes('Not quite.'));
      assert.ok(wrong.includes(clue.why));
      assert.ok(wrong.includes('disabled=""'),'Wrong answer advances the case');
      const right=render(CashMystery,{...base,answers:{[step]:clue.correct}});
      assert.ok(right.includes('Correct.'));
      assert.ok(right.includes(clue.why));
      assert.ok(!right.includes('disabled=""'),'Correct answer cannot continue');
      for(const answer of [-1,3,1.2,'2',null,undefined])assert.equal(canRevealMysteryClue(step,{[step]:answer},{}),false);
      if(step>0)assert.equal(canRevealMysteryClue(step,{}, {[step-1]:true}),false,'Prior hint reveals the next clue');
    }
    const workedLesson=createElement('p',null,lessons.A11.example);
    const hidden=render(MysteryLessonGate,{revealed:false,topicTitle:'Free cash flow to the firm',children:workedLesson});
    assert.ok(!hidden.includes('₹7'),'Worked answer remains in rendered/accessibility text');
    assert.ok(hidden.includes('Open full lesson (reveals hint)'));
    const revealed=render(MysteryLessonGate,{revealed:true,children:workedLesson});
    assert.ok(revealed.includes('₹7'),'Opt-in lesson does not reveal the worked answer');
    const solved=render(CashMystery,{step:2,answers:{0:1,1:1,2:2},hints:{},complete:true});
    assert.ok(solved.includes('CASE SOLVED'));
    assert.ok(solved.includes('₹7 lakh FCFF.'));
    assert.ok(solved.includes('₹20 lakh NOPAT + ₹5 lakh depreciation − ₹8 lakh capex − ₹10 lakh'));
    const {createLearningSession,learningSessionReducer:reduce,activeCaseRun}=await server.ssrLoadModule('/src/learning-session.js');
    const start=s=>reduce(s,{type:'case-start',id:'P02',clues:mystery.steps.map(c=>({correct:c.correct,optionCount:c.options.length}))});
    const act=(s,type,choice)=>reduce(s,{type,choice,run:s.activeRun,step:activeCaseRun(s).step});
    const renderRun=s=>{const run=activeCaseRun(s);return render(CashMystery,{...run,runNumber:s.activeRun+1});};
    let session=start(createLearningSession());
    session=act(session,'case-answer',0);
    const wrongRun=renderRun(session);
    assert.ok(wrongRun.includes('First answer this run:'));
    assert.ok(wrongRun.includes('Retry this case clue'));
    assert.ok(wrongRun.includes('Continue to case clue 2 of 3'));
    session=act(session,'case-retry');
    const retryRun=renderRun(session);
    assert.ok(retryRun.includes('Explanation from your earlier attempt.'));
    assert.ok(!retryRun.includes('Hint revealed.'));
    assert.ok(retryRun.includes('First answer this run:'));
    assert.ok(retryRun.includes('disabled=""'));
    assert.equal(canRevealMysteryClue(0,{}, {},activeCaseRun(session).responses),true);
    session=act(session,'case-answer',1);
    for(let step=1;step<3;step++){
      session=act(session,'case-next');
      session=act(session,'case-answer',mystery.steps[step].correct);
    }
    const ready=renderRun(session);
    assert.ok(ready.includes('Finish case'));
    assert.ok(ready.includes('Finish to record this case as solved.'));
    assert.ok(ready.includes('value="3"'));
    session=act(session,'case-finish');
    assert.ok(renderRun(session).includes('Replay case (keeps your record)'));
    session=start(session);
    assert.ok(!renderRun(session).includes('role="status"'),'Replay exposes earlier solution');
    assert.ok(!renderRun(session).includes('aria-pressed="true"'));
    const learning=render(App,{initialRoute:{view:'learning',id:'A02'},initialSession:session});
    assert.ok(learning.includes('<strong>0</strong><span>Topic quizzes answered</span>'));
    assert.ok(learning.includes('<strong>3</strong><span>Case clues answered</span>'));
    assert.ok(learning.includes('<strong>1</strong><span>Distinct cases solved</span>'));
    assert.ok(learning.includes('<strong>2 of 3</strong> correct on the first submitted answer'));
    assert.ok(learning.includes('Case P02 · Run 1 · finished'));
    assert.ok(learning.includes('Case P02 · Run 2 · unfinished'));
    assert.ok(learning.includes('Adds ₹10 lakh of cash'),'Original wrong answer absent from review');
    assert.ok(learning.includes('Export a backup in My learning'));

  }finally{await server.close();delete globalThis.window;}
});

test('guided entry, case brief, resume and missing-run screens show honest next actions',async()=>{
  globalThis.window={location:{hash:''}};
  const {createServer}=await import('vite');
  const {createElement}=await import('react');
  const {renderToStaticMarkup}=await import('react-dom/server');
  const {default:react}=await import('@vitejs/plugin-react');
  const server=await createServer({configFile:false,plugins:[react()],server:{middlewareMode:true,hmr:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]},appType:'custom'});
  try{
    const {App}=await server.ssrLoadModule('/src/App.jsx');
    const {createLearningSession,learningSessionReducer:reduce}=await server.ssrLoadModule('/src/learning-session.js');
    const {mystery}=await server.ssrLoadModule('/src/data/lessons.js');
    const render=(view,session,extra={})=>renderToStaticMarkup(createElement(App,{initialRoute:{view,id:'A02',...extra},initialSession:session}));
    const entry=render('atlas');
    assert.ok(entry.includes('GUIDED BEGINNER ROUTE')&&entry.includes('FREE EXPLORATION'));
    assert.ok(entry.includes('No account needed'));
    assert.ok(!entry.includes('Resume cash mystery'));
    const brief=render('brief');
    assert.ok(brief.includes('Estimated 10–15 minutes'));
    assert.ok(brief.includes('Before you begin')&&brief.includes('Start cash mystery'));
    assert.ok(!brief.includes('₹7 lakh'));
    const emptyLearning=render('learning');
    assert.ok(emptyLearning.includes('<strong>0</strong><span>Concepts explored</span>'),'Entry visit counts as concept exploration');
    let s=reduce(createLearningSession(),{type:'case-start',id:'P02',clues:mystery.steps.map(c=>({correct:c.correct,optionCount:c.options.length}))});
    s=reduce(s,{type:'case-answer',run:0,step:0,choice:0});
    s=reduce(s,{type:'case-answer',run:0,step:0,choice:1});
    s=reduce(s,{type:'case-next',run:0,step:0});
    s=reduce(s,{type:'case-hint',run:0,step:1});
    for(const view of ['atlas','brief','missions','learning'])assert.ok(render(view,s).includes('Resume cash mystery'),view);
    const resumed=render('missions',s,{journeyId:'P02',runIndex:0,id:'A08'});
    assert.ok(resumed.includes('CASE CLUE 2 OF 3'));
    assert.ok(resumed.includes('Hint revealed.'));
    assert.ok(!resumed.includes('aria-pressed="true"'));
    const missing=render('missions',undefined,{journeyId:'P02',runIndex:9});
    assert.ok(missing.includes('This run is not available in this session'));
    assert.ok(missing.includes('Start cash mystery')&&!missing.includes('CASE CLUE'));
    const reference=render('trails',s,{journeyId:'P02',stop:0});
    assert.ok(reference.includes('ATLAS READING TRAIL'));
    assert.ok(reference.includes('STOP 1 OF 8'));
    assert.ok(!reference.includes('CASE CLUE'));
    const labs=render('labs');assert.equal((labs.match(/PLANNED LAB/g)||[]).length,1);
    const focused=render('missions',s,{journeyId:'P02',runIndex:0,id:'A08'});
    assert.ok(focused.includes('focused-workspace')&&focused.includes('Open full lesson'));
    assert.ok(!focused.includes('deeper-content')&&!focused.includes('Topic quiz'),'Case workspace mounts the detailed companion lesson');
    const full=render('lesson',s,{id:'A08',returnRun:0});
    assert.ok(full.includes('full-lesson-view')&&full.includes('deeper-content')&&full.includes('Topic quiz'));
    assert.ok(full.includes('Return to cash mystery')&&full.includes('clue 2 of 3'));
    const fresh=reduce(createLearningSession(),{type:'case-start',id:'P02',clues:mystery.steps.map(c=>({correct:c.correct,optionCount:c.options.length}))});
    const protectedLesson=render('lesson',fresh,{id:'A05',returnRun:0});
    assert.ok(protectedLesson.includes('Open lesson as a hint'));
    assert.ok(!protectedLesson.includes('deeper-content')&&!protectedLesson.includes('Topic quiz'),'Direct detour link bypasses unanswered-clue gate');
    const stale=render('lesson',undefined,{id:'A08',returnRun:9});
    assert.ok(stale.includes('This activity is unavailable in this session'));
    assert.ok(stale.includes('deeper-content'),'Expired return context prevents free Atlas reading');

  }finally{await server.close();delete globalThis.window;}
});
