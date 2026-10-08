import { readFileSync, writeFileSync } from 'node:fs';
import { lessons as core } from '../src/data/lessons.js';
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const atlas = read('../content/master-network.json');
const guides = read('../content/domain-guides.json');
const prompts = read('../content/quiz-prompts.json');
const feedback = read('../content/quiz-feedback.json');
const output = {};
let ordinal = 0;
for (const domain of atlas.domains) {
  const records = readFileSync(new URL(`../content/lessons/${domain.id}.lesson`, import.meta.url), 'utf8').trim().split(/\r?\n/);
  const topics = atlas.topics.filter(n => n.domain === domain.id);
  if (records.length !== topics.length) throw new Error(`${domain.id}: ${records.length} records for ${topics.length} topics`);
  records.forEach((record, i) => {
    const cells = record.split('|').map(s => s.trim());
    if (![6, 8].includes(cells.length) || cells.some(s => !s)) throw new Error(`Invalid lesson ${topics[i].id}`);
    const [meaning, mechanism, example, trap, question, right, wrongA, wrongB] = cells.length === 8
      ? cells
      : [cells[0], cells[0].split(/(?<=[.!?])\s+/).slice(1).join(' ') || cells[0], cells[1], guides[domain.id].trap, cells[2], ...cells.slice(3)];
    const id = topics[i].id;
    const options = [right, wrongA, wrongB];
    const rotation = ordinal++ % 3;
    for (let r = 0; r < rotation; r++) options.push(options.shift());
    const q = prompts[id] || question;
    const refersToCase = /\b(this|these|here|that temporary|its contribution|the main|the central|primary exposure|the purpose|best next step|first check|this increment)\b/i.test(q);
    output[id] = {
      hook: core[id]?.hook || topics[i].hook.replace(/ Apply the question to .*/, ''),
      summary: meaning,
      formula: cells.length===8 || mechanism!==meaning ? mechanism : null,
      explanation: cells.length === 8 ? mechanism : meaning,
      example,
      trap,
      question: q,
      quizContext: refersToCase && !prompts[id] ? example : '',
      options,
      correct: options.indexOf(right),
      feedback: feedback[id] || `${right}. ${example} ${meaning}`,
      source: ({'T36.03':'upi','T37.11':'islamic','T37.12':'islamic'})[id] || guides[domain.id].source,
      stage: 'Foundational lesson',
      additionalExplanation: core[id]?.explanation || '',
      additionalExample: core[id]?.example || '',
    };
  });
}
for (const atom of atlas.atoms) {
  if (!core[atom.id]) throw new Error(`Missing anchor lesson ${atom.id}`);
  output[atom.id] = {...core[atom.id], stage: 'Core concept lesson'};
}
if (Object.keys(output).length !== 698) throw new Error('Lesson coverage must be 698/698');
for (const n of atlas.nodes) {
  const l = output[n.id];
  if (!l || !l.summary || !l.example || !l.question || l.options.length !== 3 || new Set(l.options).size !== 3 || !Number.isInteger(l.correct) || l.correct < 0 || l.correct > 2) throw new Error(`Invalid assessment: ${n.id}`);
}
writeFileSync(new URL('../src/data/complete-lessons.json', import.meta.url), JSON.stringify(output));
writeFileSync(new URL('../content/lesson-coverage.json', import.meta.url), JSON.stringify({
  totalConcepts: atlas.nodes.length, lessons: Object.keys(output).length, examples: Object.keys(output).length,
  quizzes: Object.keys(output).length, missing: [],
  stage: 'Foundational coverage across all topics; expanded core statement explanations',
  domains: atlas.domains.map(d => ({id:d.id,name:d.name,originalTopics:d.topics.length,lessons:atlas.nodes.filter(n=>n.domain===d.id).length})),
}, null, 2));
console.log(`Prepared ${Object.keys(output).length} lessons, worked examples, and quizzes across ${atlas.domains.length} domains.`);
