import { practiceRecord, lessonPracticeCounts } from './lesson-practice.js';
import { lessonPackages, lessonPackageForQuestion } from './lesson-packages.js';

function Inputs({inputs}) {
  return <table className="lesson-inputs"><caption>Scenario inputs · each unit is shown</caption><thead><tr><th scope="col">Input</th><th scope="col">Value</th><th scope="col">Unit</th></tr></thead><tbody>{inputs.map(i=><tr key={i.key}><th scope="row">{i.label}</th><td>{i.value}</td><td>{i.unit}</td></tr>)}</tbody></table>;
}

export function LessonPractice({item,records,dispatch}) {
  const lesson=lessonPackageForQuestion(item);
  if(!lesson)return null;
  const record=practiceRecord(records,item), choice=item.options.find(o=>o.id===record.choice),first=item.options.find(o=>o.id===record.responses[0]?.choice);
  const send=(type,extra={})=>dispatch({type,conceptId:lesson.conceptId,questionId:item.id,version:item.version,contentVersion:lesson.contentVersion,...extra});
  return <section className="lesson-practice" aria-label={`Lesson practice: ${item.id}`}>
    <span className="eyebrow">{item.stage==='checkpoint'?'PREDICT BEFORE READING ON':'TRY WITH FRESH FIGURES'} · SEPARATE NILA SCENARIO</span>
    <h3>{item.question}</h3><p>{item.setup}</p><Inputs inputs={item.inputs}/>
    <div className="choices" role="group" aria-label={item.question}>{item.options.map(o=><button key={o.id} className={`choice ${record.choice===o.id?'chosen':''}`} aria-pressed={record.choice===o.id} onClick={()=>send('lesson-answer',{choice:o.id})}><span className="radio"/>{o.text}</button>)}</div>
    {!record.revealed&&<div className="lesson-help">{item.hints.map((hint,index)=><button key={index} className="text-button" onClick={()=>send('lesson-hint',{hint:index})} disabled={record.hints.includes(index)}>{hint.answerRevealing?'Show worked solution (records help)':'Give me a directional hint'}</button>)}</div>}
    {record.hints.filter(index=>!item.hints[index].answerRevealing).map(index=><p key={index} className="lesson-hint">Directional hint: {item.hints[index].text}</p>)}
    {record.revealed&&<div className={`feedback ${choice?.id===item.correctOptionId?'success':'retry'}`} role="status"><p>{choice?`${choice.id===item.correctOptionId?'Correct.':'Not quite.'} ${choice.feedback}`:record.responses.length?'Selection cleared; explanation from your earlier attempt.':'Worked solution requested; no answer submitted.'}</p><p className="practice-solution">{item.solution}</p><details><summary>Explain it to the owner · self-check</summary><p>{item.reflection.prompt}</p><ul>{item.reflection.rubric.map(r=><li key={r}>{r}</li>)}</ul><p className="small">Use this rubric to check your explanation. No automatic reasoning grade is assigned.</p></details></div>}
    {record.responses.length>0&&<p className="attempt-record small"><strong>First lesson-practice answer:</strong> “{first.text}” — {record.responses[0].correct?'correct':'not correct'}{record.responses[0].hinted?', after requested help':''}. Latest submission: {record.responses.at(-1).correct?'correct':'not correct'}. {record.responses.length} submitted answer(s).</p>}
    {record.hints.length>0&&<p className="small muted">Requested help is recorded for this question. It does not submit an answer or advance a case.</p>}
    {record.choice!==null&&<button className="text-button" onClick={()=>send('lesson-retry')}>Retry this lesson question</button>}
    <p className="small muted">Lesson practice is separate from the topic quiz and case clues. Retry keeps your first response. Progress is session-only.</p>
  </section>;
}

export function LessonPracticeSummary({records,onConcept,conceptTitle=id=>id}) {
  const c=lessonPracticeCounts(records);
  if(!c.answered&&!c.helped)return null;
  return <section className="lesson-practice-summary"><h2>Lesson practice</h2><p>{c.answered} of {c.total} questions attempted; {c.latestCorrect} correct on the latest submission; {c.firstUnassisted} correct on the first submission without requested help.</p><ul>{lessonPackages.map(lesson=>({lesson,counts:lessonPracticeCounts(records,lesson)})).filter(p=>p.counts.answered||p.counts.helped).map(({lesson,counts})=><li key={lesson.conceptId}>{onConcept?<button className="text-button" onClick={()=>onConcept(lesson.conceptId)}>{conceptTitle(lesson.conceptId)}</button>:conceptTitle(lesson.conceptId)}: {counts.answered} of {counts.total} attempted, {counts.latestCorrect} latest correct.</li>)}</ul><p className="small muted">{c.helped} question(s) with requested help. The two receivables pages share one set of records. Questions from different lessons remain separate. These are practice observations, not mastery.</p></section>;
}

export default function StandardLesson({lesson,records,dispatch,onCase,onConcept,conceptTitle=id=>id}) {
  const worked=lesson.workedExample;
  return <article className="receivables-lesson standard-lesson" data-lesson-concept={lesson.conceptId}>
    <section className="lesson-orientation"><span className="eyebrow">NILA HOMEWARE · FICTIONAL TEACHING BUSINESS</span><h3>What you will be able to explain</h3><ul>{lesson.objectives.map(o=><li key={o.id}>{o.statement}</li>)}</ul><p className="small">{lesson.context.timeframe}</p><details><summary>Units, assumptions, reporting basis and abbreviations</summary><p>Units: {lesson.context.units.join(", ")}. {lesson.context.framework.limitations}</p>{lesson.context.framework.basis==='reporting-specific'&&<p>{lesson.context.framework.name}. {lesson.context.framework.jurisdiction}. {lesson.context.framework.period}.</p>}<ul>{lesson.context.assumptions.map(a=><li key={a}>{a}</li>)}</ul><dl>{lesson.context.abbreviations.map(a=><div key={a.term}><dt>{a.term}</dt><dd>{a.definition}</dd></div>)}</dl></details></section>
    {lesson.mechanism.map(m=><section key={m.id}><h3>{m.title||m.id.replaceAll('-',' ')}</h3>{m.paragraphs.map(p=><p key={p}>{p}</p>)}{lesson.practice.filter(q=>q.stage==='checkpoint'&&q.afterMechanismId===m.id).map(q=><LessonPractice key={q.id} item={q} records={records} dispatch={dispatch}/>)}</section>)}
    <section><h3>Types and important distinctions</h3><dl>{lesson.distinctions.map(d=><div key={d.name}><dt>{d.name}</dt><dd>{d.explanation}<p><strong>Why it matters:</strong> {d.whenItMatters}</p></dd></div>)}</dl></section>
    <section className="worked-case"><span className="eyebrow">A worked example · illustrative · separate from practice</span><h3>Work through it step by step</h3><p>{worked.setup}</p><Inputs inputs={worked.inputs}/><ol>{worked.steps.map(s=><li key={s}>{s}</li>)}</ol><p><strong>Result:</strong> {worked.result}</p><p>{worked.interpretation}</p></section>
    <section><h3>Trace the statement effects</h3><p>{lesson.statementEffects.explanation}</p><ul>{lesson.statementEffects.changes.map(c=><li key={c}>{c}</li>)}</ul></section>
    {lesson.practice.filter(q=>q.stage==='transfer').map(q=><LessonPractice key={q.id} item={q} records={records} dispatch={dispatch}/>)}
    <section><h3>Watch for these misconceptions</h3><dl>{lesson.misconceptions.map(m=><div key={m.id}><dt>{m.claim}</dt><dd>{m.correction}<p><strong>Check:</strong> {m.diagnostic}</p></dd></div>)}</dl></section>
    <section><h3>Follow the next business question</h3>{lesson.activityLinks.some(a=>a.id==='P02'&&a.availability==='available')&&<button className="primary" onClick={onCase}>Apply it in the cash mystery</button>}<div className="lesson-connections">{lesson.connections.map(c=><p key={c.edgeId}><button className="text-button" onClick={()=>onConcept(c.to)}>{conceptTitle(c.to)}</button><br/>{c.purpose} <span className="small">{c.conditions}</span></p>)}</div>{lesson.activityLinks.filter(a=>a.availability==='planned').map(a=><p className="small muted" key={a.id}>{a.id==='LAB-COLLECTIONS'?'The customer-collection lab is planned.':a.id==='CASE-NILA-HOMEWARE'?'The six-round Nila company case is planned.':'This lab is planned.'} {a.purpose}</p>)}</section>
    <section><h3>Go deeper when you are ready</h3><ul>{lesson.deeper.questions.map(q=><li key={q}>{q}</li>)}</ul><p>{lesson.deeper.limitations}</p><details><summary>Scope still to study</summary><ul>{lesson.scope.deferred.map(item=><li key={item}>{item}</li>)}</ul></details><h3>Source context and further study</h3>{lesson.sources.map(s=><div key={s.id} className="lesson-source"><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a><p className="small">{s.supports.join(' ')}{s.reviewedOn&&` Checked ${s.reviewedOn}.`} Examples and calculations are authored teaching scenarios.</p></div>)}</section>
  </article>;
}
