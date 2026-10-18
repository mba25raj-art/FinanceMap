import receivables from '../content/lesson-packages/receivables.v1.json' with { type: 'json' };
import equation from '../content/lesson-packages/accounting-equation.v1.json' with { type: 'json' };
import accrual from '../content/lesson-packages/cash-accrual.v1.json' with { type: 'json' };
import cash from '../content/lesson-packages/cash-equivalents.v1.json' with { type: 'json' };
import revenue from '../content/lesson-packages/revenue-recognition.v1.json' with { type: 'json' };
import policy from '../content/coverage-policy.json' with { type: 'json' };

export { receivables };
const imported = new Map([
  ['content/lesson-packages/accounting-equation.v1.json', equation],
  ['content/lesson-packages/cash-accrual.v1.json', accrual],
  ['content/lesson-packages/cash-equivalents.v1.json', cash],
  ['content/lesson-packages/revenue-recognition.v1.json', revenue],
  ['content/lesson-packages/receivables.v1.json', receivables],
]);
export const lessonPackages = policy.packages.map(entry => {
  const lesson = imported.get(entry.file);
  if (!lesson) throw new Error(`Missing renderer package: ${entry.file}`);
  return lesson;
});
const pages = new Map(), questions = new Map();
for (const entry of policy.packages) {
  const lesson = imported.get(entry.file);
  for (const id of entry.renderedConceptIds) {
    if (pages.has(id)) throw new Error(`Duplicate lesson page: ${id}`);
    pages.set(id, lesson);
  }
  for (const item of lesson.practice) {
    if (questions.has(item.id)) throw new Error(`Duplicate lesson practice ID: ${item.id}`);
    questions.set(item.id, { lesson, item });
  }
}
export const lessonPackageForConcept = id => pages.get(id);
export const lessonPackageForQuestion = item => {
  const found = questions.get(item?.id);
  return found?.item.version === item?.version ? found?.lesson : undefined;
};
