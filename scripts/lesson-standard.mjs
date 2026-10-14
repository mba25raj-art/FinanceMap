import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Authoring checks only. The current lesson compiler does not consume these packages.
export function validateLessonPackage(value, atlas) {
  const errors=[];
  const fail=(path,message)=>errors.push(`${path}: ${message}`);
  const object=(x,path)=>{if(!x||typeof x!=='object'||Array.isArray(x)){fail(path,'expected an object');return {};}return x;};
  const list=(x,path,min=1)=>{if(!Array.isArray(x)){fail(path,'expected an array');return [];}if(x.length<min)fail(path,`requires at least ${min} item(s)`);return x;};
  const text=(x,path)=>{if(typeof x!=='string'||!x.trim())fail(path,'requires non-empty text');};
  const texts=(x,path,min=1)=>list(x,path,min).forEach((v,i)=>text(v,`${path}[${i}]`));
  const oneOf=(x,values,path)=>{if(!values.includes(x))fail(path,`expected ${values.join(', ')}`);};
  const unique=(items,path)=>{const ids=items.map(i=>i?.id);ids.forEach((id,i)=>text(id,`${path}[${i}].id`));if(new Set(ids).size!==ids.length)fail(path,'duplicate IDs');return new Set(ids);};
  const version=(x,path)=>{if(typeof x!=='string'||!/^\d+\.\d+\.\d+$/.test(x))fail(path,'expected semantic version');};
  const date=(x,path)=>{if(typeof x!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(x)||!Number.isFinite(Date.parse(x))||new Date(x).toISOString().slice(0,10)!==x)fail(path,'expected a valid YYYY-MM-DD date');};
  const lesson=object(value,'lesson'), nodes=new Map(atlas.nodes.map(n=>[n.id,n])), edges=new Map(atlas.edges.map(e=>[e.id,e]));
  if(lesson.schemaVersion!==1)fail('schemaVersion','unsupported lesson contract');
  if(!nodes.has(lesson.conceptId))fail('conceptId','must exist in the master inventory');
  version(lesson.contentVersion,'contentVersion');
  if(JSON.stringify(lesson).includes('<AUTHOR:'))fail('lesson','unfinished author placeholders');
  const scope=object(lesson.scope,'scope');oneOf(scope.coverageTier,['introductory-study'],'scope.coverageTier');texts(scope.covered,'scope.covered');texts(scope.deferred,'scope.deferred',0);
  text(lesson.hoverDefinition,'hoverDefinition');
  const objectives=list(lesson.objectives,'objectives'), objectiveIds=unique(objectives,'objectives');
  objectives.forEach((o,i)=>{const p=`objectives[${i}]`;o=object(o,p);text(o.statement,p+'.statement');text(o.evidence,p+'.evidence');list(o.outcomeIds,p+'.outcomeIds',0).forEach(id=>oneOf(id,['LO1','LO2','LO3','LO4','LO5','LO6'],p+'.outcomeIds'));});
  const context=object(lesson.context,'context');text(context.entity,'context.entity');if(typeof context.fictional!=='boolean')fail('context.fictional','must declare whether the entity is fictional');
  oneOf(context.exampleRole,['isolated-example','shared-case'],'context.exampleRole');texts(context.units,'context.units');const units=new Set(Array.isArray(context.units)?context.units:[]);text(context.timeframe,'context.timeframe');texts(context.assumptions,'context.assumptions');
  list(context.abbreviations,'context.abbreviations',0).forEach((a,i)=>{a=object(a,`abbreviations[${i}]`);text(a.term,'abbreviation.term');text(a.definition,'abbreviation.definition');});
  const framework=object(context.framework,'context.framework');oneOf(framework.basis,['conceptual','reporting-specific'],'context.framework.basis');text(framework.limitations,'context.framework.limitations');
  if(framework.basis==='reporting-specific')for(const key of ['name','jurisdiction','period'])text(framework[key],`context.framework.${key}`);
  const mechanism=list(lesson.mechanism,'mechanism'), mechanismIds=unique(mechanism,'mechanism');
  mechanism.forEach((m,i)=>texts(object(m,`mechanism[${i}]`).paragraphs,`mechanism[${i}].paragraphs`));
  list(lesson.distinctions,'distinctions').forEach((d,i)=>{d=object(d,`distinctions[${i}]`);for(const key of ['name','explanation','whenItMatters'])text(d[key],`distinctions[${i}].${key}`);});
  const inputs=(values,path)=>{const rows=list(values,path),keys=new Set();rows.forEach((v,i)=>{v=object(v,`${path}[${i}]`);text(v.key,`${path}[${i}].key`);if(keys.has(v.key))fail(path,'duplicate input keys');keys.add(v.key);text(v.label,`${path}[${i}].label`);text(v.unit,`${path}[${i}].unit`);if(!units.has(v.unit))fail(path,'input unit must be declared in context.units');if(typeof v.value==='number'?!Number.isFinite(v.value):typeof v.value!=='string'||!v.value.trim())fail(path,'input value must be finite or explicitly stated');});};
  const worked=object(lesson.workedExample,'workedExample');for(const key of ['id','scenarioId','setup','result','interpretation'])text(worked[key],`workedExample.${key}`);inputs(worked.inputs,'workedExample.inputs');texts(worked.steps,'workedExample.steps');
  const effects=object(lesson.statementEffects,'statementEffects');oneOf(effects.applicability,['direct','indirect','not-applicable'],'statementEffects.applicability');text(effects.explanation,'statementEffects.explanation');texts(effects.changes,'statementEffects.changes',effects.applicability==='not-applicable'?0:1);
  const misconceptions=list(lesson.misconceptions,'misconceptions'), misconceptionIds=unique(misconceptions,'misconceptions');
  misconceptions.forEach((m,i)=>{m=object(m,`misconceptions[${i}]`);for(const key of ['claim','correction','diagnostic'])text(m[key],`misconceptions[${i}].${key}`);});
  const practice=list(lesson.practice,'practice',2);unique(practice,'practice');
  const scenarios=new Set([worked.scenarioId]),coveredObjectives=new Set();
  for(const stage of ['checkpoint','transfer'])if(!practice.some(p=>p?.stage===stage))fail('practice',`requires a ${stage}`);
  practice.forEach((p,i)=>{
    const path=`practice[${i}]`;p=object(p,path);version(p.version,path+'.version');oneOf(p.stage,['checkpoint','transfer'],path+'.stage');
    if(!mechanismIds.has(p.afterMechanismId))fail(path+'.afterMechanismId','unknown mechanism placement');
    text(p.scenarioId,path+'.scenarioId');if(scenarios.has(p.scenarioId))fail(path+'.scenarioId','independent practice needs a distinct scenario');scenarios.add(p.scenarioId);
    list(p.objectiveIds,path+'.objectiveIds').forEach(id=>{if(!objectiveIds.has(id))fail(path+'.objectiveIds','unknown objective');coveredObjectives.add(id);});
    text(p.setup,path+'.setup');inputs(p.inputs,path+'.inputs');text(p.question,path+'.question');oneOf(p.responseType,['single-choice'],path+'.responseType');
    const options=list(p.options,path+'.options',2),optionIds=unique(options,path+'.options');if(!optionIds.has(p.correctOptionId))fail(path+'.correctOptionId','must match exactly one option ID');
    if(new Set(options.map(o=>o?.text)).size!==options.length)fail(path+'.options','choice texts must be distinct');
    options.forEach((o,j)=>{o=object(o,`${path}.options[${j}]`);text(o.text,path+'.option.text');text(o.feedback,path+'.option.feedback');if(o.misconceptionId!==null&&!misconceptionIds.has(o.misconceptionId))fail(path+'.option.misconceptionId','unknown misconception');});
    text(p.solution,path+'.solution');oneOf(p.revealPolicy,['after-attempt-or-hint'],path+'.revealPolicy');
    list(p.hints,path+'.hints').forEach(h=>{h=object(h,path+'.hint');text(h.text,path+'.hint.text');if(typeof h.answerRevealing!=='boolean')fail(path+'.hint.answerRevealing','requires an explicit assistance label');});
    const reflection=object(p.reflection,path+'.reflection');text(reflection.prompt,path+'.reflection.prompt');texts(reflection.rubric,path+'.reflection.rubric');oneOf(reflection.grading,['self-check'],path+'.reflection.grading');
  });
  for(const id of objectiveIds)if(!coveredObjectives.has(id))fail('practice','every objective needs assessment evidence');
  const learningTypes=new Set(['PART_OF','EXPLORE_WITH','RECOMMENDED_BEFORE','DEEPENS']);
  list(lesson.connections,'connections').forEach((c,i)=>{
    const path=`connections[${i}]`;c=object(c,path);const edge=edges.get(c.edgeId);
    if(!edge||!((edge.from===lesson.conceptId&&edge.to===c.to)||(edge.to===lesson.conceptId&&edge.from===c.to)))fail(path,'edge must connect this exact concept and destination in the master inventory');
    if(!nodes.has(c.to))fail(path+'.to','unknown concept');
    if(edge&&c.kind!==(learningTypes.has(edge.type)?'learning':'financial'))fail(path+'.kind','relationship classification disagrees with master edge');
    text(c.purpose,path+'.purpose');text(c.conditions,path+'.conditions');if(c.computed!==false)fail(path+'.computed','version 1 does not assert calculated model dependencies');
  });
  const domain=object(lesson.domainContext,'domainContext');if(domain.guideId!==nodes.get(lesson.conceptId)?.domain)fail('domainContext.guideId','must reference this concept\'s domain');oneOf(domain.role,['broader-domain-guidance'],'domainContext.role');
  const deeper=object(lesson.deeper,'deeper');texts(deeper.questions,'deeper.questions');list(deeper.conceptIds,'deeper.conceptIds').forEach(id=>{if(!nodes.has(id))fail('deeper.conceptIds','unknown concept');});text(deeper.limitations,'deeper.limitations');
  const activities=new Map([['P02','available'],['CASE-NILA-HOMEWARE','planned'],['LAB-COLLECTIONS','planned'],['LAB-EQUIPMENT','planned'],['LAB-FINANCING','planned']]);
  list(lesson.activityLinks,'activityLinks',0).forEach(a=>{a=object(a,'activityLink');oneOf(a.kind,['case','lab'],'activityLink.kind');if(activities.get(a.id)!==a.availability)fail('activityLink','activity availability must match the implemented release');if(a.kind!==((typeof a.id==='string'&&a.id.startsWith('LAB-'))?'lab':'case'))fail('activityLink.kind','wrong activity kind');text(a.purpose,'activityLink.purpose');});
  const sources=list(lesson.sources,'sources');unique(sources,'sources');
  sources.forEach(s=>{s=object(s,'source');text(s.title,'source.title');try{if(new URL(s.url).protocol!=='https:')throw Error();}catch{fail('source.url','requires an HTTPS URL');}oneOf(s.role,['primary-support','further-reading'],'source.role');texts(s.supports,'source.supports',s.role==='primary-support'?1:0);if(s.reviewedOn!==null)date(s.reviewedOn,'source.reviewedOn');});
  if(framework.basis==='reporting-specific'&&!sources.some(s=>s?.role==='primary-support'&&s.reviewedOn))fail('sources','framework-specific rules need reviewed primary support');
  const review=object(lesson.review,'review');oneOf(review.state,['draft','reviewed'],'review.state');texts(review.evidence,'review.evidence',review.state==='reviewed'?1:0);
  if(review.state==='reviewed'){text(review.reviewer,'review.reviewer');date(review.reviewedOn,'review.reviewedOn');}
  return errors;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try{
    if(!process.argv[2])throw Error('Supply a populated lesson-package JSON path.');
    const atlas=JSON.parse(readFileSync(new URL('../content/master-network.json',import.meta.url),'utf8'));
    const lesson=JSON.parse(readFileSync(process.argv[2],'utf8')),errors=validateLessonPackage(lesson,atlas);
    if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
    else console.log(`Structure valid for ${lesson.conceptId}; editorial status: ${lesson.review.state}. This is not publication or financial review approval.`);
  }catch(error){console.error(error.message);process.exitCode=1;}
}
