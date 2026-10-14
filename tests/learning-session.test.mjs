import test from 'node:test';
import assert from 'node:assert/strict';
import { createLearningSession, learningSessionReducer as reduce, activeCaseRun, learningCounts, unfinishedCaseRuns } from '../src/learning-session.js';
import { mystery } from '../src/data/lessons.js';

const start = state => reduce(state, { type: 'case-start', id: 'P02', clues: mystery.steps.map(c => ({ correct: c.correct, optionCount: c.options.length })) });
const command = (state, type, choice) => ({ type, run: state.activeRun, step: activeCaseRun(state).step, choice });
const act = (state, type, choice) => reduce(state, command(state, type, choice));

test('topic correction and retry retain the first response and count a topic once', () => {
  let s = createLearningSession();
  const answer = choice => ({ type: 'topic-answer', id: 'A02', choice, correct: 0, optionCount: 3 });
  s = reduce(s, answer(1));
  const first = s.topics.A02[0];
  assert.equal(reduce(s, answer(1)), s, 'Duplicate click adds a response');
  s = reduce(s, { type: 'topic-retry', id: 'A02' });
  assert.equal(s.answers.A02, undefined);
  assert.equal(learningCounts(s).topicsAnswered, 1);
  assert.equal(s.topics.A02[0], first);
  s = reduce(s, answer(0));
  assert.equal(learningCounts(s).topicsLatestCorrect, 1);
  assert.equal(learningCounts(s).topicsFirstCorrect, 0);
  assert.equal(learningCounts(s).cluesAnswered, 0, 'Topic answers counted as case clues');
  s = reduce(s, { type: 'topic-retry', id: 'A02' });
  assert.equal(learningCounts(s).topicsLatestCorrect, 1, 'Clearing selection erases submitted success');
  assert.equal(s.topics.A02.length, 2);
  for (const choice of [-1, 3, 0.5, '0', null]) assert.equal(reduce(s, answer(choice)), s);
});

test('whole mystery: wrong answer, correction, finish and replay preserve evidence and deduplicate completion', () => {
  let s = start(createLearningSession());
  assert.equal(act(s, 'case-next'), s);
  assert.equal(act(s, 'case-finish'), s);
  s = act(s, 'case-answer', 0); // Wrong: receivables consume, not add, cash.
  const first = activeCaseRun(s).responses[0][0];
  assert.equal(first.correct, false);
  assert.equal(act(s, 'case-answer', 0), s);
  assert.equal(act(s, 'case-next'), s, 'Wrong answer advances');
  s = act(s, 'case-retry');
  assert.equal(activeCaseRun(s).answers[0], undefined);
  assert.equal(activeCaseRun(s).responses[0][0], first);
  s = act(s, 'case-answer', 1);
  const oldNext = command(s, 'case-next');
  s = reduce(s, oldNext);
  assert.equal(activeCaseRun(s).step, 1);
  assert.equal(reduce(s, oldNext), s, 'Double-click skips a clue');
  assert.deepEqual(activeCaseRun(s).hints, {});
  s = act(s, 'case-answer', 1);
  s = act(s, 'case-next');
  s = act(s, 'case-answer', 2);
  assert.equal(learningCounts(s).casesSolved, 0, 'Last answer automatically finishes');
  const finish = command(s, 'case-finish');
  s = reduce(s, finish);
  assert.equal(activeCaseRun(s).complete, true);
  assert.equal(reduce(s, finish), s, 'Finish records duplicate completion');
  assert.deepEqual(learningCounts(s), {
    topicsAnswered: 0, topicsLatestCorrect: 0, topicsFirstCorrect: 0,
    cluesAnswered: 3, cluesLatestCorrect: 3, cluesFirstCorrect: 2, casesSolved: 1, completedRuns: 1,
  });
  const finishedRun = activeCaseRun(s);
  s = start(s);
  assert.equal(s.runs[0], finishedRun);
  assert.deepEqual(activeCaseRun(s).answers, {});
  assert.deepEqual(activeCaseRun(s).hints, {});
  assert.equal(learningCounts(s).casesSolved, 1, 'Replay erases solved case');
  assert.equal(reduce(s, finish), s, 'Stale finish command finishes replay');
  for (const [i, clue] of mystery.steps.entries()) {
    s = act(s, 'case-answer', clue.correct);
    s = act(s, i === 2 ? 'case-finish' : 'case-next');
  }
  assert.equal(learningCounts(s).casesSolved, 1);
  assert.equal(learningCounts(s).cluesAnswered, 3);
  assert.equal(learningCounts(s).cluesFirstCorrect, 2, 'Replay rewrites original first attempt');
  assert.equal(learningCounts(s).completedRuns, 2);
  assert.equal(s.runs[0].responses[0][0], first);
});

test('hint-only actions cannot progress or count as answers; hinted first success gets no unassisted credit', () => {
  let s = start(createLearningSession());
  s = act(s, 'case-hint');
  assert.equal(learningCounts(s).cluesAnswered, 0);
  assert.equal(act(s, 'case-next'), s);
  s = act(s, 'case-answer', 1);
  assert.equal(activeCaseRun(s).responses[0][0].hinted, true);
  assert.equal(learningCounts(s).cluesLatestCorrect, 1);
  assert.equal(learningCounts(s).cluesFirstCorrect, 0);
  s = act(s, 'case-next');
  assert.equal(activeCaseRun(s).hints[1], undefined);
  for (const choice of [-1, 3, 1.5, '1', undefined]) assert.equal(act(s, 'case-answer', choice), s);
});

test('a fresh page session has no previous answers or case completions', () => {
  assert.deepEqual(learningCounts(createLearningSession()), {
    topicsAnswered: 0, topicsLatestCorrect: 0, topicsFirstCorrect: 0,
    cluesAnswered: 0, cluesLatestCorrect: 0, cluesFirstCorrect: 0, casesSolved: 0, completedRuns: 0,
  });
});

test('resume selects an existing unfinished run with its exact choices, hints, step and first responses',()=>{
  let s=start(createLearningSession());
  s=act(s,'case-answer',0);s=act(s,'case-hint');s=act(s,'case-answer',1);s=act(s,'case-next');s=act(s,'case-answer',0);
  const original=activeCaseRun(s),counts=learningCounts(s);
  s=start(s);
  assert.equal(unfinishedCaseRuns(s).length,2);
  s=reduce(s,{type:'case-resume',run:0});
  assert.equal(activeCaseRun(s),original);assert.equal(s.runs.length,2);
  assert.equal(activeCaseRun(s).step,1);assert.equal(activeCaseRun(s).answers[1],0);assert.equal(activeCaseRun(s).responses[0][0].choice,0);assert.equal(activeCaseRun(s).hints[0],true);
  assert.equal(learningCounts(s).casesSolved,counts.casesSolved);
  for(const run of [-1,2,'0',null])assert.equal(reduce(s,{type:'case-resume',run}),s);
});

test('stale duplicate start commands cannot create two runs',()=>{
  const empty=createLearningSession();
  const command={type:'case-start',id:'P02',expectedRunCount:0,clues:mystery.steps.map(c=>({correct:c.correct,optionCount:c.options.length}))};
  const s=reduce(empty,command);assert.equal(s.runs.length,1);assert.equal(reduce(s,command),s);
});
