// Outcome wording belongs to the renderer; authored feedback explains the answer.
export function getQuizFeedback(lesson, answer) {
  if (!Number.isInteger(answer) || answer < 0 || answer >= lesson.options.length) return null;
  const explanation = lesson.feedback.replace(/^(?:(?:Exactly|Correct)[.!]\s*)+/i, '').trim();
  if (answer === lesson.correct) return `Correct. ${explanation}`;

  const choice = lesson.options[answer];
  const misconception = lesson.incorrectFeedback?.[choice] || `You selected “${choice}”.`;
  const supportedAnswer = lesson.options[lesson.correct];
  return `Not quite. ${misconception} The supported answer is “${supportedAnswer}”. ${explanation} Watch for this: ${lesson.trap}`;
}
