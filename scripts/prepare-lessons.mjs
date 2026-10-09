import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { parseDeepLessons } from './deep-lesson-format.mjs';
import { lessons as core } from '../src/data/lessons.js';
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const atlas = read('../content/master-network.json');
const guides = read('../content/domain-guides.json');
const prompts = read('../content/quiz-prompts.json');
const feedback = read('../content/quiz-feedback.json');
const output = {};
const domainDepth = parseDeepLessons(readFileSync(new URL('../content/domain-depth.guide',import.meta.url),'utf8'));
if(Object.keys(domainDepth).length!==atlas.domains.length) throw new Error('Every domain requires a detailed study guide');
const deep = {};
for (const name of readdirSync(new URL('../content/deep-lessons/', import.meta.url)).filter(n=>n.endsWith('.deep'))) {
  for(const [id,lesson] of Object.entries(parseDeepLessons(readFileSync(new URL('../content/deep-lessons/'+name,import.meta.url),'utf8')))) {
    if(deep[id]) throw new Error('Duplicate detailed lesson '+id);
    deep[id] = lesson;
  }
}
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
const aliases={A01:'T05.01',A02:'T06.04',A03:'T06.05',A04:'T06.13',A06:'T07.03',A07:'T07.06',A08:'T05.10',A09:'T05.11',A10:'T17.05',A11:'T17.05',A12:'T17.05',A15:'T17.03',A16:'T17.04',A18:'T07.08',A19:'T17.07',A13:'T13.10',A14:'T13.01',A20:'T09.08',A05:'T14.01',A17:'T24.16'};
for(const [id,target] of Object.entries(aliases)) if(deep[target]&&!deep[id]) deep[id]=deep[target];
for(const [id,detail] of Object.entries(deep)) {
  if(!output[id]) throw new Error('Unknown detailed lesson '+id);
  output[id].detail = detail;
  output[id].stage = 'Detailed lesson';
}
for(const node of atlas.nodes) output[node.id].domainGuide=node.domain;
for (const n of atlas.nodes) {
  const l = output[n.id];
  if (!l || !l.summary || !l.example || !l.question || l.options.length !== 3 || new Set(l.options).size !== 3 || !Number.isInteger(l.correct) || l.correct < 0 || l.correct > 2) throw new Error(`Invalid assessment: ${n.id}`);
}
writeFileSync(new URL('../src/data/complete-lessons.json', import.meta.url), JSON.stringify(output));
writeFileSync(new URL('../src/data/domain-study-guides.json', import.meta.url), JSON.stringify(domainDepth));
writeFileSync(new URL('../content/lesson-coverage.json', import.meta.url), JSON.stringify({
  totalConcepts: atlas.nodes.length, lessons: Object.keys(output).length, examples: Object.keys(output).length,
  quizzes: Object.keys(output).length, missing: [],
  detailedLessons:Object.keys(deep).length,
  detailedMissing:atlas.nodes.filter(n=>!deep[n.id]).map(n=>n.id),
  domainStudyGuides:Object.keys(domainDepth).length,
  pagesWithExpandedStudyMaterial:atlas.nodes.length,
  stage: `${atlas.nodes.length} topic pages with detailed area guides; ${Object.keys(deep).length} individually expanded lessons`,
  domains: atlas.domains.map(d => ({id:d.id,name:d.name,originalTopics:d.topics.length,lessons:atlas.nodes.filter(n=>n.domain===d.id).length})),
}, null, 2));
console.log(`Prepared ${Object.keys(output).length} lessons, worked examples, and quizzes across ${atlas.domains.length} domains.`);
