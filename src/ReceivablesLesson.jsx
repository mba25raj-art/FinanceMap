import { receivables as lesson, practiceRecord, lessonPracticeCounts } from './lesson-practice.js';

function Inputs({inputs}) {
  return <table className="lesson-inputs"><caption>Scenario inputs · INR lakh</caption><thead><tr><th scope="col">Input</th><th scope="col">Amount</th></tr></thead><tbody>{inputs.map(i=><tr key={i.key}><th scope="row">{i.label}</th><td>{i.value}</td></tr>)}</tbody></table>;
}

export function LessonPractice({item,records,dispatch}) {
  const record=practiceRecord(records,item), choice=item.options.find(o=>o.id===record.choice),first=item.options.find(o=>o.id===record.responses[0]?.choice);
  const send=(type,extra={})=>dispatch({type,questionId:item.id,version:item.version,contentVersion:lesson.contentVersion,...extra});
  return <section className="lesson-practice" aria-label={`Receivables practice: ${item.id}`}>
    <span className="eyebrow">{item.stage==='checkpoint'?'PREDICT BEFORE READING ON':'TRY WITH FRESH FIGURES'} · SEPARATE NILA SCENARIO</span>
    <h3>{item.question}</h3><p>{item.setup}</p><Inputs inputs={item.inputs}/>
    <div className="choices" role="group" aria-label={item.question}>{item.options.map(o=><button key={o.id} className={`choice ${record.choice===o.id?'chosen':''}`} aria-pressed={record.choice===o.id} onClick={()=>send('lesson-answer',{choice:o.id})}><span className="radio"/>{o.text}</button>)}</div>
    {!record.revealed&&<div className="lesson-help"><button className="text-button" onClick={()=>send('lesson-hint',{hint:0})} disabled={record.hints.includes(0)}>Give me a directional hint</button><button className="text-button" onClick={()=>send('lesson-hint',{hint:1})}>Show worked solution (records help)</button></div>}
    {record.hints.includes(0)&&<p className="lesson-hint">Directional hint: {item.hints[0].text}</p>}
    {record.revealed&&<div className={`feedback ${choice?.id===item.correctOptionId?'success':'retry'}`} role="status"><p>{choice?`${choice.id===item.correctOptionId?'Correct.':'Not quite.'} ${choice.feedback}`:record.responses.length?'Selection cleared; explanation from your earlier attempt.':'Worked solution requested; no answer submitted.'}</p><p className="practice-solution">{item.solution}</p><details><summary>Explain it to the owner · self-check</summary><p>{item.reflection.prompt}</p><ul>{item.reflection.rubric.map(r=><li key={r}>{r}</li>)}</ul><p className="small">Use this rubric to check your explanation. No automatic reasoning grade is assigned.</p></details></div>}
    {record.responses.length>0&&<p className="attempt-record small"><strong>First lesson-practice answer:</strong> “{first.text}” — {record.responses[0].correct?'correct':'not correct'}{record.responses[0].hinted?', after requested help':''}. Latest submission: {record.responses.at(-1).correct?'correct':'not correct'}. {record.responses.length} submitted answer(s).</p>}
    {record.hints.length>0&&<p className="small muted">Requested help is recorded for this question. It does not submit an answer or advance a case.</p>}
    {record.choice!==null&&<button className="text-button" onClick={()=>send('lesson-retry')}>Retry this lesson question</button>}
    <p className="small muted">Lesson practice is separate from the topic quiz and case clues. Retry keeps your first response. Progress is session-only.</p>
  </section>;
}

export function LessonPracticeSummary({records}) {
  const c=lessonPracticeCounts(records);
  if(!c.answered&&!c.helped)return null;
  return <section className="lesson-practice-summary"><h2>Receivables lesson practice</h2><p>{c.answered} of {c.total} questions attempted; {c.latestCorrect} correct on the latest submission; {c.firstUnassisted} correct on the first submission without requested help.</p><p className="small muted">{c.helped} question(s) with requested help. A02 and its grouped receivables page share these records; revisiting either does not duplicate credit. These are practice observations, not mastery.</p></section>;
}

export default function ReceivablesLesson({records,dispatch,onCase,onConcept}) {
  const worked=lesson.workedExample;
  return <article className="receivables-lesson">
    <section className="lesson-orientation"><span className="eyebrow">NILA HOMEWARE · FICTIONAL TEACHING BUSINESS</span><h3>What you will be able to explain</h3><ul>{lesson.objectives.map(o=><li key={o.id}>{o.statement}</li>)}</ul><p className="small">{lesson.context.timeframe}</p><details><summary>Units, assumptions, reporting basis and abbreviations</summary><p>Units: INR lakh. {lesson.context.framework.limitations}</p><ul>{lesson.context.assumptions.map(a=><li key={a}>{a}</li>)}</ul><dl>{lesson.context.abbreviations.map(a=><div key={a.term}><dt>{a.term}</dt><dd>{a.definition}</dd></div>)}</dl></details></section>
    {lesson.mechanism.map((m,i)=><section key={m.id}><h3>{['Recognise the sale, then follow the payment','Read gross and net balances together','Separate estimates, write-offs and receipts','Reconcile the movement before interpreting cash'][i]}</h3>{m.paragraphs.map(p=><p key={p}>{p}</p>)}{lesson.practice.filter(q=>q.stage==='checkpoint'&&q.afterMechanismId===m.id).map(q=><LessonPractice key={q.id} item={q} records={records} dispatch={dispatch}/>)}</section>)}
    <section><h3>Types and important distinctions</h3><dl>{lesson.distinctions.map(d=><div key={d.name}><dt>{d.name}</dt><dd>{d.explanation}<p><strong>Why it matters:</strong> {d.whenItMatters}</p></dd></div>)}</dl></section>
    <section className="worked-case"><span className="eyebrow">TOPIC CASE · ILLUSTRATIVE · SEPARATE FROM PRACTICE</span><h3>Work through it step by step</h3><p>{worked.setup}</p><Inputs inputs={worked.inputs}/><ol>{worked.steps.map(s=><li key={s}>{s}</li>)}</ol><p><strong>Result:</strong> {worked.result}</p><p>{worked.interpretation}</p></section>
    <section><h3>Trace the statement effects</h3><p>{lesson.statementEffects.explanation}</p><ul>{lesson.statementEffects.changes.map(c=><li key={c}>{c}</li>)}</ul></section>
    {lesson.practice.filter(q=>q.stage==='transfer').map(q=><LessonPractice key={q.id} item={q} records={records} dispatch={dispatch}/>)}
    <section><h3>Watch for these misconceptions</h3><dl>{lesson.misconceptions.map(m=><div key={m.id}><dt>{m.claim}</dt><dd>{m.correction}<p><strong>Check:</strong> {m.diagnostic}</p></dd></div>)}</dl></section>
    <section><h3>Follow the next business question</h3><p>Collection timing leads into operating working capital and the profit-to-cash bridge.</p><div className="entry-links"><button className="primary" onClick={onCase}>Apply it in the cash mystery</button><button className="text-button" onClick={()=>onConcept('A05')}>Why does working capital use cash?</button><button className="text-button" onClick={()=>onConcept('A06')}>How does profit become operating cash flow?</button></div><p className="small muted">The customer-collection lab is planned. The three-clue cash mystery is available now.</p></section>
    <section><h3>Go deeper when you are ready</h3><ul>{lesson.deeper.questions.map(q=><li key={q}>{q}</li>)}</ul><p>{lesson.deeper.limitations}</p><h3>Source context and further study</h3>{lesson.sources.map(s=><div key={s.id} className="lesson-source"><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a><p className="small">{s.supports.join(' ')} Checked {s.reviewedOn}. Examples and calculations are authored teaching scenarios.</p></div>)}<p className="small muted">Sample conversion for review. Other Atlas lessons remain in their existing detailed format.</p></section>
  </article>;
}
