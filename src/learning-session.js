import { lessonPracticeReducer } from './lesson-practice.js';
// Session-only records. Clearing a choice for practice never deletes a response.
export function createLearningSession(initialAnswers = {}, lessons = {}) {
  let state = { answers: {}, topics: {}, runs: [], activeRun: -1, completedCases: [] };
  for (const [id, choice] of Object.entries(initialAnswers)) {
    const lesson = lessons[id];
    if (lesson) state = learningSessionReducer(state, {
      type: 'topic-answer', id, choice, correct: lesson.correct, optionCount: lesson.options.length,
    });
  }
  return state;
}

const validChoice = (choice, count) => Number.isInteger(choice) && choice >= 0 && choice < count;
export const activeCaseRun = state => state.runs[state.activeRun];
export const unfinishedCaseRuns = state => state.runs.map((run,index)=>({run,index})).filter(({run})=>run.id==='P02'&&!run.complete);

export function learningSessionReducer(state, action) {
  if(action.type.startsWith('lesson-')){
    const previous=state.lessonPractice||{},next=lessonPracticeReducer(previous,action);
    return next===previous?state:{...state,lessonPractice:next};
  }
  if (action.type === 'topic-answer') {
    if (!validChoice(action.choice, action.optionCount) || !validChoice(action.correct, action.optionCount)) return state;
    if (state.answers[action.id] === action.choice) return state;
    const responses = state.topics[action.id] || [];
    return { ...state,
      answers: { ...state.answers, [action.id]: action.choice },
      topics: { ...state.topics, [action.id]: [...responses, { choice: action.choice, correct: action.choice === action.correct }] },
    };
  }
  if (action.type === 'topic-retry') {
    if (state.answers[action.id] === undefined) return state;
    const answers = { ...state.answers };
    delete answers[action.id];
    return { ...state, answers };
  }
  if (action.type === 'case-start') {
    if (action.expectedRunCount !== undefined && action.expectedRunCount !== state.runs.length) return state;
    if (!action.id || !action.clues?.length || !action.clues.every(c => validChoice(c.correct, c.optionCount))) return state;
    const run = { id: action.id, clues: action.clues, step: 0, answers: {}, hints: {}, responses: {}, complete: false };
    return { ...state, runs: [...state.runs, run], activeRun: state.runs.length };
  }
  if (action.type === 'case-resume') {
    if (!Number.isInteger(action.run) || !state.runs[action.run] || state.runs[action.run].id !== 'P02' || state.activeRun === action.run) return state;
    return { ...state, activeRun: action.run };
  }
  const run = activeCaseRun(state);
  // Bind commands to the rendered run and clue. Rapid double-clicks cannot skip a clue.
  if (!run || run.complete || action.run !== state.activeRun || action.step !== run.step) return state;
  const clue = run.clues[run.step];
  let updated;
  if (action.type === 'case-answer') {
    if (!validChoice(action.choice, clue.optionCount) || run.answers[run.step] === action.choice) return state;
    updated = { ...run,
      answers: { ...run.answers, [run.step]: action.choice },
      responses: { ...run.responses, [run.step]: [...(run.responses[run.step] || []), {
        choice: action.choice, correct: action.choice === clue.correct, hinted: run.hints[run.step] === true,
      }] },
    };
  } else if (action.type === 'case-hint') {
    if (run.hints[run.step]) return state;
    updated = { ...run, hints: { ...run.hints, [run.step]: true } };
  } else if (action.type === 'case-retry') {
    if (run.answers[run.step] === undefined) return state;
    const answers = { ...run.answers };
    delete answers[run.step];
    updated = { ...run, answers };
  } else if (action.type === 'case-next') {
    if (run.answers[run.step] !== clue.correct || run.step === run.clues.length - 1) return state;
    updated = { ...run, step: run.step + 1 };
  } else if (action.type === 'case-finish') {
    if (run.step !== run.clues.length - 1 || !run.clues.every((c, i) => run.answers[i] === c.correct)) return state;
    updated = { ...run, complete: true };
  } else return state;
  const runs = state.runs.map((r, i) => i === state.activeRun ? updated : r);
  const completedCases = updated.complete && !state.completedCases.includes(run.id)
    ? [...state.completedCases, run.id] : state.completedCases;
  return { ...state, runs, completedCases };
}

export function learningCounts(state) {
  const topics = Object.values(state.topics);
  const clues = new Map();
  for (const run of state.runs) {
    for (const [step, responses] of Object.entries(run.responses)) {
      const key = `${run.id}:${step}`;
      const previous = clues.get(key);
      clues.set(key, { first: previous?.first || responses[0], latest: responses.at(-1) });
    }
  }
  const caseClues = [...clues.values()];
  return {
    topicsAnswered: topics.length,
    topicsLatestCorrect: topics.filter(r => r.at(-1).correct).length,
    topicsFirstCorrect: topics.filter(r => r[0].correct).length,
    cluesAnswered: caseClues.length,
    cluesLatestCorrect: caseClues.filter(r => r.latest.correct).length,
    cluesFirstCorrect: caseClues.filter(r => r.first.correct && !r.first.hinted).length,
    casesSolved: state.completedCases.length,
    completedRuns: state.runs.filter(r => r.complete).length,
  };
}
