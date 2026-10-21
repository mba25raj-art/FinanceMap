import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveReturn, needsLessonHint } from '../src/activity-context.js';
import { createLearningSession, learningSessionReducer as reduce } from '../src/learning-session.js';
const start = s => reduce(s,{type:'case-start',id:'P02',clues:[{correct:1,optionCount:3},{correct:1,optionCount:3},{correct:2,optionCount:3}]});

test('return resolves the current run rather than restoring an obsolete clue snapshot',()=>{
  let s=start(createLearningSession());
  assert.ok(needsLessonHint(resolveReturn(s,0)));
  s=reduce(s,{type:'case-answer',run:0,step:0,choice:0});
  assert.equal(needsLessonHint(resolveReturn(s,0)),false);
  s=reduce(s,{type:'case-retry',run:0,step:0});
  assert.equal(needsLessonHint(resolveReturn(s,0)),false,'Retry must not erase the previous attempt or turn reading into a requested hint');
  s=reduce(s,{type:'case-answer',run:0,step:0,choice:1});
  s=reduce(s,{type:'case-next',run:0,step:0});
  assert.equal(resolveReturn(s,0).step,1);assert.ok(needsLessonHint(resolveReturn(s,0)));
  const before=JSON.stringify(s);resolveReturn(s,0);assert.equal(JSON.stringify(s),before,'Navigation lookup mutates answers');
  for(const index of [undefined,-1,0.5,1,100,NaN])assert.equal(resolveReturn(s,index),null);
});

test('hint detours retain their original run across replay and return selects it without adding a run',()=>{
  let s=start(createLearningSession());s=reduce(s,{type:'case-hint',run:0,step:0});
  assert.equal(needsLessonHint(resolveReturn(s,0)),false);
  s=start(s);assert.ok(needsLessonHint(resolveReturn(s,1)));
  const original=s.runs[0];s=reduce(s,{type:'case-resume',run:0});
  assert.equal(s.runs.length,2);assert.equal(s.runs[0],original);assert.equal(s.runs[0].hints[0],true);
  for(let step=0;step<3;step++){
    s=reduce(s,{type:'case-answer',run:0,step,choice:[1,1,2][step]});
    s=reduce(s,{type:step===2?'case-finish':'case-next',run:0,step});
  }
  assert.equal(resolveReturn(s,0).complete,true);assert.equal(needsLessonHint(resolveReturn(s,0)),false);
  assert.deepEqual(s.completedCases,['P02']);
});
