import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateLessonPackage } from '../scripts/lesson-standard.mjs';
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const atlas=read('../content/master-network.json');
const example=read('../content/standards/examples/accounting-equation.v1.json');
const check=changes=>{const x=structuredClone(example);changes(x);return validateLessonPackage(x,atlas).join('\n');};

test('populated authoring fixture reconciles independent scenarios and remains an unpublished draft',()=>{
  assert.deepEqual(validateLessonPackage(example,atlas),[]);
  assert.equal(example.review.state,'draft');
  const worked=Object.fromEntries(example.workedExample.inputs.map(i=>[i.key,i.value]));
  assert.equal(worked.openingCash-worked.machineCost+worked.machineCost,100);
  const [checkpoint,transfer]=example.practice;
  const c=Object.fromEntries(checkpoint.inputs.map(i=>[i.key,i.value]));
  const t=Object.fromEntries(transfer.inputs.map(i=>[i.key,i.value]));
  assert.equal(checkpoint.correctOptionId,`assets-${c.openingCash-c.machineCost+c.machineCost}`);
  assert.equal(transfer.correctOptionId,`assets-${t.openingCash+t.inventoryCost}`);
  assert.equal(t.openingCash+t.inventoryCost,t.inventoryCost+t.openingCash);
  assert.equal(new Set([example.workedExample.scenarioId,checkpoint.scenarioId,transfer.scenarioId]).size,3);
});

test('unfinished author template and unsupported identities cannot masquerade as converted lessons',()=>{
  const template=read('../content/standards/lesson-package.v1.template.json');
  assert.match(validateLessonPackage(template,atlas).join('\n'),/unfinished author placeholders/);
  assert.match(check(x=>x.conceptId='NEW-RECEIVABLES'),/master inventory/);
  assert.match(check(x=>x.schemaVersion=2),/unsupported lesson contract/);
  assert.match(check(x=>x.objectives[0].id=x.objectives[1].id),/duplicate IDs/);
  assert.match(check(x=>x.practice[0].objectiveIds=['missing-objective']),/unknown objective/);
  assert.ok(validateLessonPackage(null,atlas).length);
});

test('practice must have visible inputs, independent data, placement and a protected solution',()=>{
  assert.match(check(x=>x.practice[0].inputs=[]),/practice\[0\].inputs/);
  assert.match(check(x=>x.practice[0].scenarioId=x.workedExample.scenarioId),/distinct scenario/);
  assert.match(check(x=>x.practice[0].revealPolicy='always'),/after-attempt-or-hint/);
  assert.match(check(x=>x.practice[0].afterMechanismId='after-quiz'),/unknown mechanism placement/);
  assert.match(check(x=>x.practice=x.practice.slice(0,1)),/requires a transfer/);
  assert.match(check(x=>x.practice[0].correctOptionId='not-an-option'),/correctOptionId/);
  assert.match(check(x=>x.practice[0].options[1].feedback=''),/option.feedback/);
  assert.match(check(x=>x.practice[0].hints[0].answerRevealing=null),/assistance label/);
  assert.match(check(x=>x.context.units=42),/context.units/);
});

test('connections keep master topology, relationship kind and separate domain guidance',()=>{
  assert.match(check(x=>x.connections[0].kind='financial'),/classification disagrees/);
  assert.match(check(x=>x.connections[0].computed=true),/calculated model dependencies/);
  assert.match(check(x=>x.connections[0].to='A19'),/exact concept and destination/);
  assert.match(check(x=>x.domainContext.role='topic-mechanism'),/broader-domain-guidance/);
  assert.match(check(x=>x.domainContext.guideId='D17'),/this concept's domain/);
});

test('framework-specific claims and editorial approval need explicit evidence metadata',()=>{
  assert.match(check(x=>x.context.framework.basis='reporting-specific'),/framework-specific rules need reviewed primary support/);
  assert.match(check(x=>x.review.state='reviewed'),/review.reviewer/);
  assert.match(check(x=>x.sources[0].reviewedOn='2026-02-31'),/valid YYYY-MM-DD/);
  assert.match(check(x=>x.scope.coverageTier='professional-mastery'),/introductory-study/);
  assert.match(check(x=>x.sources[0].url='javascript:alert(1)'),/HTTPS/);
});

test('planned labs and company case cannot be declared available by authoring a link',()=>{
  assert.match(check(x=>x.activityLinks[0].availability='available'),/availability must match/);
  assert.match(check(x=>x.activityLinks[0].kind='lab'),/wrong activity kind/);
  assert.match(check(x=>x.activityLinks[0].id='CASE-NEW'),/availability must match/);
  assert.equal(check(x=>x.activityLinks=[{id:'LAB-COLLECTIONS',kind:'lab',availability:'planned',purpose:'Future collection practice'}]),'');
});
