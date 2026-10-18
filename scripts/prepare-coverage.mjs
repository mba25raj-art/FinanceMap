import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { validateLessonPackage } from './lesson-standard.mjs';

export const learningRelationshipTypes = new Set(['PART_OF', 'EXPLORE_WITH', 'RECOMMENDED_BEFORE', 'DEEPENS']);
const root = new URL('../', import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const present = value => typeof value === 'string' && value.trim().length > 0;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const uniqueIds = (items, label) => {
  const ids = items.map(x => x.id);
  assert(ids.every(present) && new Set(ids).size === ids.length, `Duplicate or missing ${label} IDs`);
  return new Set(ids);
};

// A pure projection of existing sources. Existence, conversion and review are separate facts.
export function buildCoverageRegister({ atlas, lessons, aliases, policy, scope, packages }) {
  const nodes = new Map(atlas.nodes.map(n => [n.id, n]));
  const domains = new Map(atlas.domains.map(d => [d.id, d]));
  uniqueIds(atlas.nodes, 'concept'); uniqueIds(atlas.edges, 'relationship');
  uniqueIds(policy.activities, 'activity'); uniqueIds(scope.concepts, 'release concept');
  uniqueIds(scope.batches, 'batch');
  assert(policy.coverageTier === 'introductory-study', 'Unsupported coverage tier');
  const selected = new Map(scope.concepts.map(c => [c.id, c]));
  const seen = new Set();
  for (const batch of scope.batches) {
    assert(batch.conceptIds.length === 5, `${batch.id}: expected five selected concepts`);
    for (const id of batch.conceptIds) {
      assert(!seen.has(id), `Concept occurs in more than one batch: ${id}`); seen.add(id);
      assert(selected.get(id)?.batchId === batch.id, `${id}: batch selection disagrees`);
    }
  }
  assert(seen.size === 30 && selected.size === 30, 'First-release selection must contain 30 concepts');
  for (const c of scope.concepts) {
    assert(nodes.get(c.id)?.title === c.title, `${c.id}: release title does not match the master inventory`);
    assert(c.outcomeIds.length && c.outcomeIds.every(id => /^LO[1-6]$/.test(id)), `${c.id}: invalid learning outcomes`);
  }
  for (const [id, target] of Object.entries(aliases)) {
    assert(nodes.has(id) && nodes.has(target), `Unknown deep-content alias: ${id} -> ${target}`);
  }
  const packageByConcept = new Map();
  for (const entry of policy.packages) {
    const pkg = packages[entry.file];
    assert(pkg, `Missing integrated lesson package: ${entry.file}`);
    const errors = validateLessonPackage(pkg, atlas);
    assert(!errors.length, `${entry.file}: ${errors.join('; ')}`);
    assert(entry.renderedConceptIds.includes(pkg.conceptId), 'Integrated package must include its canonical concept');
    for (const id of entry.renderedConceptIds) {
      assert(nodes.has(id) && !packageByConcept.has(id), `Unknown or duplicate integrated page: ${id}`);
      assert(id === pkg.conceptId || aliases[pkg.conceptId] === id, `${id}: unsupported package alias`);
      packageByConcept.set(id, { entry, pkg });
    }
  }
  for (const [id, review] of Object.entries(policy.legacyReviews)) {
    assert(nodes.has(id), `Review for unknown concept: ${id}`);
    assert(['draft', 'reviewed'].includes(review.state), `${id}: unsupported review state`);
    if (review.state === 'reviewed') {
      assert(present(review.reviewer) && /^\d{4}-\d{2}-\d{2}$/.test(review.reviewedOn) && review.evidence?.length,
        `${id}: reviewed status requires named reviewer, date and evidence`);
    }
  }
  const activities = policy.activities.map(a => {
    assert(['available', 'planned'].includes(a.availability), `${a.id}: invalid availability`);
    assert(['case', 'lab'].includes(a.kind), `${a.id}: invalid activity kind`);
    assert(a.availability === 'planned' ? a.route === null : present(a.route), `${a.id}: planned activities cannot promise playable routes`);
    const links = a.usesFirstReleaseSelection ? scope.concepts.map(c => ({ conceptId: c.id, role: 'planned-application' })) : [
      ...(a.assessmentConcepts || []).map(conceptId => ({ conceptId, role: 'assessed' })),
      ...(a.referenceConcepts || []).map(conceptId => ({ conceptId, role: 'supporting-reference' })),
      ...(a.plannedConcepts || []).map(conceptId => ({ conceptId, role: 'planned-application' })),
    ];
    assert(new Set(links.map(l => l.conceptId)).size === links.length, `${a.id}: duplicate concept mapping`);
    for (const l of links) {
      assert(nodes.has(l.conceptId), `${a.id}: unknown concept ${l.conceptId}`);
      assert((a.availability === 'planned') === (l.role === 'planned-application'), `${a.id}: activity role disagrees with availability`);
    }
    return { id: a.id, kind: a.kind, title: a.title, availability: a.availability, route: a.route, roadmapTask: a.roadmapTask, evidence: a.evidence, links };
  });
  const relationships = atlas.edges.map(e => {
    assert((nodes.has(e.from) || domains.has(e.from)) && (nodes.has(e.to) || domains.has(e.to)), `Unknown endpoint: ${e.id}`);
    return { id: e.id, from: e.from, to: e.to, type: e.type,
      kind: learningRelationshipTypes.has(e.type) ? 'learning' : 'financial',
      purpose: e.why, conditions: e.conditions, computedModelDependency: false };
  });
  const concepts = atlas.nodes.map(n => {
    const l = lessons[n.id] || {}, integrated = packageByConcept.get(n.id), selection = selected.get(n.id);
    const review = integrated?.pkg.review || policy.legacyReviews[n.id] || { state: 'not-reviewed', reviewer: null, reviewedOn: null, evidence: [] };
    const deepId = aliases[n.id] || n.id, deepNode = nodes.get(deepId);
    const links = activities.flatMap(a => a.links.filter(x => x.conceptId === n.id).map(x => ({
      id: a.id, kind: a.kind, availability: a.availability, role: x.role, route: a.route,
    })));
    const related = relationships.filter(e => e.from === n.id || e.to === n.id);
    const hasQuiz = present(l.question) && l.options?.length >= 2 && new Set(l.options).size === l.options.length && Number.isInteger(l.correct) && l.correct >= 0 && l.correct < l.options.length;
    const hasExample = present(l.detail?.workedCase?.setup) && l.detail?.workedCase?.steps?.length > 0 && present(l.detail?.workedCase?.result);
    return {
      id: n.id, title: n.title, domainId: n.domain, domainName: domains.get(n.domain)?.name,
      atlasLevel: n.level, coverageTier: policy.coverageTier, route: `#atlas/lessons/${n.id}`,
      content: {
        explanation: present(l.explanation), detailedMechanism: l.detail?.explanation?.length > 0,
        workedExample: hasExample, topicQuiz: Boolean(hasQuiz),
        deepContentSourceId: deepId,
        sources: { foundational: n.id.startsWith('A') ? 'src/data/lessons.js' : `content/lessons/${n.domain}.lesson`,
          detailed: `content/deep-lessons/${deepNode.domain}.deep#${deepId}`, question: `src/data/complete-lessons.json#${n.id}` },
      },
      standard: {
        state: integrated ? 'integrated' : 'not-converted',
        canonicalConceptId: integrated?.pkg.conceptId || null, package: integrated?.entry.file || null,
        contentVersion: integrated?.pkg.contentVersion || null,
        practiceQuestionIds: integrated?.pkg.practice.map(p => p.id) || [],
      },
      editorialReview: structuredClone(review),
      specialistScope: integrated ? { covered: integrated.pkg.scope.covered, deferred: integrated.pkg.scope.deferred }
        : { covered: ['Existing topic-specific introductory study material.'], deferred: ['Professional completeness and specialist scope have not been editorially assessed.'] },
      firstRelease: selection ? { batchId: selection.batchId, firstUse: selection.firstUse, outcomeIds: selection.outcomeIds, appliedScope: selection.appliedScope } : null,
      activities: links,
      referenceTrails: atlas.journeys.filter(j => j.nodes.includes(n.id)).map(j => j.id),
      prerequisites: { declaredConceptIds: n.prerequisites || [], incomingRecommendationEdgeIds: related.filter(e => e.type === 'RECOMMENDED_BEFORE' && e.to === n.id).map(e => e.id) },
      relationships: { learningEdgeIds: related.filter(e => e.kind === 'learning').map(e => e.id), financialEdgeIds: related.filter(e => e.kind === 'financial').map(e => e.id) },
      gaps: [
        ...(!present(l.explanation) ? ['missing-explanation'] : []), ...(!hasExample ? ['missing-worked-example'] : []), ...(!hasQuiz ? ['missing-topic-quiz'] : []),
        ...(!integrated ? ['standard-conversion'] : []), ...(review.state !== 'reviewed' ? ['editorial-review'] : []),
        ...(!links.some(a => a.availability === 'available' && a.role === 'assessed') ? ['no-playable-applied-assessment'] : []),
      ],
    };
  });
  const count = fn => concepts.filter(fn).length;
  const summary = {
    concepts: concepts.length, domains: domains.size, explanations: count(c => c.content.explanation),
    detailedMechanisms: count(c => c.content.detailedMechanism), workedExamples: count(c => c.content.workedExample), topicQuizzes: count(c => c.content.topicQuiz),
    integratedLessonPages: packageByConcept.size, canonicalIntegratedPackages: policy.packages.length,
    canonicalPracticeQuestions: policy.packages.reduce((sum, entry) => sum + packages[entry.file].practice.length, 0),
    editoriallyReviewedConcepts: count(c => c.editorialReview.state === 'reviewed'),
    selectedConcepts: selected.size, selectedIntegratedPages: count(c => c.firstRelease && c.standard.package),
    selectedReviewedConcepts: count(c => c.firstRelease && c.editorialReview.state === 'reviewed'),
    playableLabs: activities.filter(a => a.kind === 'lab' && a.availability === 'available').length,
    plannedLabs: activities.filter(a => a.kind === 'lab' && a.availability === 'planned').length,
    playableCases: activities.filter(a => a.kind === 'case' && a.availability === 'available').length,
    plannedCases: activities.filter(a => a.kind === 'case' && a.availability === 'planned').length,
    conceptsWithPlayableAppliedAssessment: count(c => c.activities.some(a => a.availability === 'available' && a.role === 'assessed')),
    conceptsWithoutPlayableAppliedAssessment: count(c => c.gaps.includes('no-playable-applied-assessment')),
    relationships: relationships.length, learningRelationships: relationships.filter(e => e.kind === 'learning').length,
    financialRelationships: relationships.filter(e => e.kind === 'financial').length, computedModelDependencies: 0,
    referenceTrails: atlas.journeys.length,
  };
  const fingerprint = createHash('sha256').update(JSON.stringify({ atlas, lessons, aliases, policy, scope, packages })).digest('hex');
  return { schemaVersion: 1, sourceFingerprint: fingerprint, notice: policy.scopeNotice, summary,
    batches: scope.batches.map(b => ({ ...b, integratedPages: b.conceptIds.filter(id => packageByConcept.has(id)).length,
      reviewedConcepts: b.conceptIds.filter(id => concepts.find(c => c.id === id).editorialReview.state === 'reviewed').length })),
    activities, concepts, relationships };
}

export function loadCoverageInputs() {
  const policy = read('content/coverage-policy.json');
  return { atlas: read('content/master-network.json'), lessons: read('src/data/complete-lessons.json'), aliases: read('content/lesson-aliases.json'),
    policy, scope: read('content/first-release-scope.json'), packages: Object.fromEntries(policy.packages.map(p => [p.file, read(p.file)])) };
}
const csv = rows => rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n') + '\n';

export function coverageOutputs(register) {
  const { summary: s } = register;
  // One record per line keeps generated diffs inspectable without a large pretty-printed tree.
  const json = '{\n' + Object.entries(register).map(([key, value]) => `  "${key}": ${Array.isArray(value) ? '[\n' + value.map(v => '    ' + JSON.stringify(v)).join(',\n') + '\n  ]' : JSON.stringify(value)}`).join(',\n') + '\n}\n';
  const rows = [['Concept ID', 'Title', 'Domain ID', 'Domain', 'Atlas level', 'Coverage tier', 'Explanation', 'Detailed mechanism', 'Worked example', 'Topic quiz', 'Standard conversion', 'Canonical package concept', 'Editorial review', 'Reviewer', 'Reviewed on', 'First release batch', 'Outcomes', 'Labs', 'Cases', 'Reference trails', 'Learning edges', 'Financial edges', 'Applied assessment gap', 'Deferred scope', 'Lesson route']];
  for (const c of register.concepts) rows.push([c.id, c.title, c.domainId, c.domainName, c.atlasLevel, c.coverageTier,
    c.content.explanation, c.content.detailedMechanism, c.content.workedExample, c.content.topicQuiz, c.standard.state, c.standard.canonicalConceptId,
    c.editorialReview.state, c.editorialReview.reviewer, c.editorialReview.reviewedOn, c.firstRelease?.batchId, c.firstRelease?.outcomeIds.join('; '),
    ...['lab', 'case'].map(kind => c.activities.filter(a => a.kind === kind).map(a => `${a.id}: ${a.availability} (${a.role})`).join('; ')),
    c.referenceTrails.join('; '), c.relationships.learningEdgeIds.length, c.relationships.financialEdgeIds.length,
    c.gaps.includes('no-playable-applied-assessment'), c.specialistScope.deferred.join(' '), c.route]);
  const edges = [['Relationship ID', 'From', 'To', 'Type', 'Kind', 'Purpose', 'Conditions', 'Computed model dependency'],
    ...register.relationships.map(e => [e.id, e.from, e.to, e.type, e.kind, e.purpose, e.conditions, e.computedModelDependency])];
  const markdown = [
    '# Topic coverage register', '',
    'Task 04.3. Generated from the master inventory, compiled lessons, explicit package integrations and first-release selection. Run `npm run prepare:content` to refresh and `npm run check:coverage` to detect stale output.', '',
    register.notice, '',
    '| Measure | Current coverage |', '| --- | ---: |',
    `| Stable concept records | ${s.concepts} |`, `| Explanations / worked examples / topic quizzes | ${s.explanations} / ${s.workedExamples} / ${s.topicQuizzes} |`,
    `| Integrated lesson pages / canonical packages | ${s.integratedLessonPages} / ${s.canonicalIntegratedPackages} |`,
    `| Distinct embedded practice questions | ${s.canonicalPracticeQuestions} |`, `| Editorially reviewed concept records | ${s.editoriallyReviewedConcepts} |`,
    `| Selected first-release concepts | ${s.selectedConcepts} |`, `| Selected integrated / reviewed | ${s.selectedIntegratedPages} / ${s.selectedReviewedConcepts} |`,
    `| Playable labs / planned labs | ${s.playableLabs} / ${s.plannedLabs} |`, `| Playable cases / planned cases | ${s.playableCases} / ${s.plannedCases} |`,
    `| Concepts with playable applied assessment | ${s.conceptsWithPlayableAppliedAssessment} |`,
    `| Concepts without playable applied assessment | ${s.conceptsWithoutPlayableAppliedAssessment} |`,
    `| Learning / financial relationships | ${s.learningRelationships} / ${s.financialRelationships} |`, `| Computed model dependencies | ${s.computedModelDependencies} |`, '',
    'A02 and T06.04 share the receivables package and three practice records. They remain two navigable concepts. Deep-content aliases describe reused reading material and do not merge concept IDs or independent question records. The separate accounting-equation authoring fixture is excluded from converted coverage; its integrated lesson has its own package.', '',
    'Review records name the reviewer and method. B1 and B2 reviews are AI content, source and arithmetic checks, not independent professional approval or learner-pilot evidence. Page totals include the receivables alias, which shares one canonical package and review.', '',
    'A playable applied assessment means an implemented case question mapped to that concept. A reference lesson or reading-trail stop does not establish applied assessment. P02 as a case and P02 as a reference trail are kept separate. Planned activities have no playable route.', '',
    '## First-release batches', '', '| Batch | Focus | Concept IDs | Integrated pages | Reviewed concepts |', '| --- | --- | --- | ---: | ---: |',
    ...register.batches.map(b => `| ${b.id} | ${b.title} | ${b.conceptIds.join(', ')} | ${b.integratedPages} | ${b.reviewedConcepts} |`), '',
    '## Domain coverage', '', '| Domain | Concepts | Existing detailed mechanisms | Integrated pages | Reviewed concepts |', '| --- | ---: | ---: | ---: | ---: |',
    ...[...new Set(register.concepts.map(c => c.domainId))].map(id => { const c = register.concepts.filter(c => c.domainId === id); return `| ${id}: ${c[0].domainName} | ${c.length} | ${c.filter(x => x.content.detailedMechanism).length} | ${c.filter(x => x.standard.package).length} | ${c.filter(x => x.editorialReview.state === 'reviewed').length} |`; }), '',
    '## Inspect individual records', '',
    '- [Concept CSV](topic-coverage.csv): filter all 698 records by domain, batch, content, review and activities.',
    '- [Relationship CSV](relationship-coverage.csv): all 2,520 stable edges with direction, conditions and learning/financial classification.',
    '- [Structured register](../content/coverage-register.json): individual source paths, package versions, practice IDs, deferred scope, prerequisites, activity roles and gaps.', '',
    'The register does not change the learner interface or progress records. Existing introductory content is not relabelled reviewed. Future reviews require explicit reviewer, date and evidence in the authored package or coverage policy. Specialist scope remains unassessed outside an explicitly scoped package. Financial edges describe conceptual relationships; none is asserted to be an implemented numerical dependency.', '',
    'Sources: `content/master-network.json`; `content/lesson-aliases.json`; authored `.lesson` and `.deep` files through `src/data/complete-lessons.json`; `content/coverage-policy.json`; `content/first-release-scope.json`; integrated packages listed in the policy. Source fingerprints and deterministic generation detect stale records.', '',
  ].join('\n');
  return new Map([['content/coverage-register.json', json], ['docs/topic-coverage.csv', csv(rows)], ['docs/relationship-coverage.csv', csv(edges)], ['docs/topic-coverage.md', markdown]]);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const register = buildCoverageRegister(loadCoverageInputs());
  for (const [path, text] of coverageOutputs(register)) {
    if (process.argv.includes('--check')) {
      assert(readFileSync(new URL(path, root), 'utf8') === text, `Stale coverage output: ${path}. Run npm run prepare:content.`);
    } else writeFileSync(new URL(path, root), text);
  }
  console.log(`${process.argv.includes('--check') ? 'Checked' : 'Prepared'} ${register.summary.concepts} coverage records, ${register.summary.relationships} relationships; ${register.summary.editoriallyReviewedConcepts} editorially reviewed concepts.`);
}
