import receivables from '../content/lesson-packages/receivables.v1.json' with { type: 'json' };
import equation from '../content/lesson-packages/accounting-equation.v1.json' with { type: 'json' };
import accrual from '../content/lesson-packages/cash-accrual.v1.json' with { type: 'json' };
import cash from '../content/lesson-packages/cash-equivalents.v1.json' with { type: 'json' };
import revenue from '../content/lesson-packages/revenue-recognition.v1.json' with { type: 'json' };
import inventory from '../content/lesson-packages/inventory.v1.json' with { type: 'json' };
import payables from '../content/lesson-packages/trade-payables.v1.json' with { type: 'json' };
import workingCapital from '../content/lesson-packages/operating-working-capital.v1.json' with { type: 'json' };
import operatingCash from '../content/lesson-packages/operating-cash-flow.v1.json' with { type: 'json' };
import transactions from '../content/lesson-packages/three-statement-transactions.v1.json' with { type: 'json' };
import policy from '../content/coverage-policy.json' with { type: 'json' };

import b3_0 from '../content/lesson-packages/working-capital-days.v1.json' with { type: 'json' };
import b3_1 from '../content/lesson-packages/cash-forecast.v1.json' with { type: 'json' };
import b3_2 from '../content/lesson-packages/liquidity-buffer.v1.json' with { type: 'json' };
import b3_3 from '../content/lesson-packages/net-borrowing.v1.json' with { type: 'json' };
import b3_4 from '../content/lesson-packages/equity-funding-payouts.v1.json' with { type: 'json' };

import b4_0 from '../content/lesson-packages/capital-expenditure.v1.json' with { type: 'json' };
import b4_1 from '../content/lesson-packages/depreciation.v1.json' with { type: 'json' };
import b4_2 from '../content/lesson-packages/ebit.v1.json' with { type: 'json' };
import b4_3 from '../content/lesson-packages/nopat.v1.json' with { type: 'json' };
import b4_4 from '../content/lesson-packages/incremental-cash-flows.v1.json' with { type: 'json' };

import b5_0 from '../content/lesson-packages/present-future-value.v1.json' with { type: 'json' };
import b5_1 from '../content/lesson-packages/net-present-value.v1.json' with { type: 'json' };
import b5_2 from '../content/lesson-packages/fcff.v1.json' with { type: 'json' };
import b5_3 from '../content/lesson-packages/wacc.v1.json' with { type: 'json' };
import b5_4 from '../content/lesson-packages/discounted-cash-flow.v1.json' with { type: 'json' };

export { receivables };
const imported = new Map([
  ['content/lesson-packages/present-future-value.v1.json', b5_0],
  ['content/lesson-packages/net-present-value.v1.json', b5_1],
  ['content/lesson-packages/fcff.v1.json', b5_2],
  ['content/lesson-packages/wacc.v1.json', b5_3],
  ['content/lesson-packages/discounted-cash-flow.v1.json', b5_4],
  ['content/lesson-packages/capital-expenditure.v1.json', b4_0],
  ['content/lesson-packages/depreciation.v1.json', b4_1],
  ['content/lesson-packages/ebit.v1.json', b4_2],
  ['content/lesson-packages/nopat.v1.json', b4_3],
  ['content/lesson-packages/incremental-cash-flows.v1.json', b4_4],
  ['content/lesson-packages/working-capital-days.v1.json', b3_0],
  ['content/lesson-packages/cash-forecast.v1.json', b3_1],
  ['content/lesson-packages/liquidity-buffer.v1.json', b3_2],
  ['content/lesson-packages/net-borrowing.v1.json', b3_3],
  ['content/lesson-packages/equity-funding-payouts.v1.json', b3_4],
  ['content/lesson-packages/accounting-equation.v1.json', equation],
  ['content/lesson-packages/cash-accrual.v1.json', accrual],
  ['content/lesson-packages/cash-equivalents.v1.json', cash],
  ['content/lesson-packages/revenue-recognition.v1.json', revenue],
  ['content/lesson-packages/receivables.v1.json', receivables],
  ['content/lesson-packages/inventory.v1.json', inventory],
  ['content/lesson-packages/trade-payables.v1.json', payables],
  ['content/lesson-packages/operating-working-capital.v1.json', workingCapital],
  ['content/lesson-packages/operating-cash-flow.v1.json', operatingCash],
  ['content/lesson-packages/three-statement-transactions.v1.json', transactions],
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
