import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCoverageRegister, loadCoverageInputs, coverageOutputs, learningRelationshipTypes } from '../scripts/prepare-coverage.mjs';
import { mystery } from '../src/data/lessons.js';
import { parseRoute } from '../src/routes.js';
const inputs = loadCoverageInputs();
const register = buildCoverageRegister(inputs);
const byId = id => register.concepts.find(c => c.id === id);

test('every stable ID has content, scoped coverage and independently tracked review; historical mapped flags are not current evidence', () => {
  assert.equal(register.concepts.length, 698);
  assert.deepEqual(register.concepts.map(c => c.id), inputs.atlas.nodes.map(n => n.id));
  assert.equal(new Set(register.concepts.map(c => c.id)).size, 698);
  for (const c of register.concepts) {
    assert.equal(c.content.explanation, true, c.id); assert.equal(c.content.detailedMechanism, true, c.id);
    assert.equal(c.content.workedExample, true, c.id); assert.equal(c.content.topicQuiz, true, c.id);
    assert.equal(c.coverageTier, 'introductory-study');
    assert.ok(c.specialistScope.deferred.length, c.id);
    if(c.editorialReview.state==='reviewed'){assert.ok(c.editorialReview.reviewer);assert.ok(c.editorialReview.reviewedOn);assert.ok(c.editorialReview.evidence.length);assert.ok(!c.gaps.includes('editorial-review'));}else assert.ok(c.gaps.includes('editorial-review'),c.id);
  }
  assert.equal(register.summary.editoriallyReviewedConcepts, 31);
  assert.equal(register.summary.selectedReviewedConcepts, 30);
  assert.equal(byId('T04.01').standard.state,'integrated');
  assert.equal(byId('T04.01').standard.package,'content/lesson-packages/accounting-equation.v1.json','The separate authoring fixture is not the rendered package');
  assert.equal(byId('T04.01').editorialReview.state, 'reviewed');
});

test('the 20 deep-reading aliases preserve IDs; two integrated pages share one package and three practice identities', () => {
  assert.equal(Object.keys(inputs.aliases).length, 20);
  for (const [id, target] of Object.entries(inputs.aliases)) assert.equal(byId(id).content.deepContentSourceId, target);
  const anchor = byId('A02'), grouped = byId('T06.04');
  assert.equal(anchor.standard.canonicalConceptId, 'A02');
  assert.deepEqual(grouped.standard, anchor.standard);
  assert.equal(anchor.editorialReview.state, 'reviewed');
  assert.equal(register.summary.integratedLessonPages, 31);
  assert.equal(register.summary.canonicalIntegratedPackages, 30);
  assert.equal(register.summary.canonicalPracticeQuestions, 61);
  assert.equal(register.summary.selectedIntegratedPages, 30);
  assert.ok(anchor.firstRelease); assert.equal(grouped.firstRelease, null);
});

test('the 30 selected concepts retain exact titles, six five-concept batches, outcomes and scope', () => {
  assert.equal(register.batches.length, 6);
  const ids = register.batches.flatMap(b => b.conceptIds);
  assert.equal(new Set(ids).size, 30);
  assert.deepEqual(ids, inputs.scope.concepts.map(c => c.id));
  for (const c of inputs.scope.concepts) {
    assert.equal(byId(c.id).title, c.title);
    assert.deepEqual(byId(c.id).firstRelease.outcomeIds, c.outcomeIds);
    assert.equal(byId(c.id).firstRelease.appliedScope, c.appliedScope);
  }
  const bad = structuredClone(inputs); bad.scope.concepts[0].title = 'A stale title';
  assert.throws(() => buildCoverageRegister(bad), /title does not match/);
});

test('available case assessment matches implemented clues; reference trails, support and future labs do not count as playable assessments', () => {
  const available = register.activities.filter(a => a.availability === 'available');
  assert.equal(available.length, 2); assert.equal(available[0].id, 'P02');
  assert.deepEqual(available[0].links.filter(l => l.role === 'assessed').map(l => l.conceptId), mystery.steps.map(s => s.concept));
  const inventory = { concepts: new Set(inputs.atlas.nodes.map(n => n.id)), journeys: new Map(inputs.atlas.journeys.map(j => [j.id, j])) };
  assert.equal(parseRoute(available[0].route, inventory).view, 'brief');
  for (const a of register.activities.filter(a => a.availability === 'planned')) assert.equal(a.route, null);
  assert.equal(register.summary.playableLabs, 1); assert.equal(register.summary.plannedLabs, 2);
  assert.equal(register.summary.playableCases, 1); assert.equal(register.summary.plannedCases, 1);
  assert.equal(register.summary.conceptsWithPlayableAppliedAssessment, 6);
  assert.equal(register.summary.conceptsWithoutPlayableAppliedAssessment, 692);
  assert.ok(!byId('A02').gaps.includes('no-playable-applied-assessment'), 'Collection prediction now assesses receivables');
  assert.ok(byId('T14.03').referenceTrails.includes('P02'));
  assert.ok(byId('T14.03').gaps.includes('no-playable-applied-assessment'), 'A reference-trail stop is not a case question');
  const bad = structuredClone(inputs); bad.policy.activities[2].route = '#labs/LAB-EQUIPMENT';
  assert.throws(() => buildCoverageRegister(bad), /cannot promise playable routes/);
});

test('all 2,520 directed edges preserve master conditions, with learning links separate from financial model claims', () => {
  assert.equal(register.relationships.length, 2520);
  for (let i = 0; i < inputs.atlas.edges.length; i++) {
    const expected = inputs.atlas.edges[i], actual = register.relationships[i];
    assert.deepEqual([actual.id, actual.from, actual.to, actual.type, actual.conditions], [expected.id, expected.from, expected.to, expected.type, expected.conditions]);
    assert.equal(actual.kind, learningRelationshipTypes.has(expected.type) ? 'learning' : 'financial');
    assert.equal(actual.computedModelDependency, false);
  }
  assert.equal(register.summary.learningRelationships + register.summary.financialRelationships, 2520);
  assert.equal(register.summary.computedModelDependencies, 0);
  for (const c of register.concepts) for (const id of c.prerequisites.incomingRecommendationEdgeIds) {
    const e = register.relationships.find(e => e.id === id);
    assert.equal(e.to, c.id); assert.equal(e.type, 'RECOMMENDED_BEFORE');
  }
});

test('missing content is exposed as a gap; review cannot be inferred from content or structural checks', () => {
  const modified = structuredClone(inputs);
  delete modified.lessons['T04.02'].detail; delete modified.lessons['T04.02'].question;
  let r = buildCoverageRegister(modified).concepts.find(c => c.id === 'T04.02');
  assert.equal(r.content.workedExample, false); assert.equal(r.content.topicQuiz, false);
  assert.ok(r.gaps.includes('missing-worked-example')); assert.ok(r.gaps.includes('missing-topic-quiz'));
  assert.equal(r.editorialReview.state, 'not-reviewed');
  modified.policy.legacyReviews['T04.02'] = { state: 'reviewed', reviewer: null, reviewedOn: null, evidence: [] };
  assert.throws(() => buildCoverageRegister(modified), /reviewed status requires/);
  const bad = structuredClone(inputs); bad.policy.packages[0].renderedConceptIds.push('T04.02');
  assert.throws(() => buildCoverageRegister(bad), /unsupported package alias/);
});

test('generated JSON, reviewer CSVs and summary are deterministic and up to date', () => {
  for (const [path, expected] of coverageOutputs(register)) assert.equal(readFileSync(new URL('../' + path, import.meta.url), 'utf8'), expected, path);
  assert.equal(JSON.parse(coverageOutputs(register).get('content/coverage-register.json')).sourceFingerprint, register.sourceFingerprint);
  const changed = structuredClone(inputs); changed.lessons['T04.01'].explanation += ' Source edited.';
  assert.notEqual(buildCoverageRegister(changed).sourceFingerprint, register.sourceFingerprint);
});
