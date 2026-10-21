// A navigation reference, never a second copy of the learner's financial state.
export const referenceViews = new Set(['lesson', 'statements', 'map', 'topics', 'trails']);

export function resolveReturn(session, index) {
  if (!Number.isSafeInteger(index) || index < 0) return null;
  const run = session.runs[index];
  if (!run || run.id !== 'P02' || !Number.isInteger(run.step) || run.step < 0 || run.step >= run.clues.length) return null;
  return { index, step: run.step, complete: run.complete, run };
}

export function needsLessonHint(context) {
  if (!context || context.complete) return false;
  const { run, step } = context;
  return run.answers[step] === undefined && !run.hints[step] && !(run.responses[step]?.length);
}
