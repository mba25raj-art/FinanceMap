import { learningCounts } from './learning-session.js';

export function AttemptRecord({ responses = [], options, label = 'First answer' }) {
  if (!responses.length) return null;
  const first = responses[0];
  return <p className="attempt-record small">
    <strong>{label}:</strong> “{options[first.choice]}” — {first.correct ? 'correct' : 'not correct'}{first.hinted ? ', after a hint' : ''}.
    {' '}{responses.length} submitted {responses.length === 1 ? 'answer' : 'answers'}. Retrying keeps this record.
  </p>;
}

export default function LearningProgress({ session, explored, topicLessons = {}, topicTitle = id => id, caseSteps = {}, retention = "Current learning is in memory. Check My learning for save status." }) {
  const counts = learningCounts(session);
  return <>
    <div className="learning-stats">
      <div><strong>{explored}</strong><span>Concepts explored</span></div>
      <div><strong>{counts.topicsAnswered}</strong><span>Topic quizzes answered</span></div>
      <div><strong>{counts.cluesAnswered}</strong><span>Case clues answered</span></div>
      <div><strong>{counts.casesSolved}</strong><span>Distinct cases solved</span></div>
    </div>
    <p className="small muted">Learning totals count each concept, topic quiz, case clue and finished case once. A topic quiz in a companion lesson is separate from the case clue. Visiting a concept is exploration, not proof of mastery.</p>
    <div className="answer-summary">
      <section><h2>Topic quiz record</h2>
        <p><strong>{counts.topicsLatestCorrect} of {counts.topicsAnswered}</strong> correct on the latest submitted answer.</p>
        <p><strong>{counts.topicsFirstCorrect} of {counts.topicsAnswered}</strong> correct on the first submitted answer.</p>
      </section>
      <section><h2>Case clue record</h2>
        <p><strong>{counts.cluesLatestCorrect} of {counts.cluesAnswered}</strong> correct on the latest submitted answer.</p>
        <p><strong>{counts.cluesFirstCorrect} of {counts.cluesAnswered}</strong> correct on the first submitted answer, without a requested hint.</p>
      </section>
    </div>
    <p className="small muted">Retry clears the current selection, while these records keep your submitted answers. Replays update the latest answer and preserve the first answer in this learning record. Finishing a replay does not add another distinct case. {counts.completedRuns} completed {counts.completedRuns === 1 ? 'run' : 'runs'} in this learning record.</p>
    <p className="small muted session-note">{retention}</p>
    {!!counts.topicsAnswered && <details className="session-history"><summary>Review topic quiz answers</summary>
      {Object.entries(session.topics).map(([id, responses]) => <section key={id}>
        <h3>{topicTitle(id)}</h3>
        <AttemptRecord responses={responses} options={topicLessons[id]?.options || []}/>
        <ol>{responses.map((r, i) => <li key={i}>Answer {i+1}: {topicLessons[id]?.options[r.choice]} — {r.correct?'correct':'not correct'}</li>)}</ol>
      </section>)}
    </details>}
    {!!session.runs.length && <details className="session-history"><summary>Review case runs and first answers</summary>
      {session.runs.map((run, index) => <section key={index}>
        <h3>Case {run.id} · Run {index+1} · {run.complete?'finished':'unfinished'}</h3>
        {!Object.keys(run.responses).length && <p className="small muted">No answers submitted in this run.</p>}
        {Object.entries(run.responses).map(([step, responses]) => <div key={step}>
          <h4>Case clue {Number(step)+1}: {caseSteps[run.id]?.[step]?.title}</h4>
          <AttemptRecord responses={responses} options={caseSteps[run.id]?.[step]?.options || []} label="First answer this run"/>
          <ol>{responses.map((r, i) => <li key={i}>Answer {i+1}: {caseSteps[run.id]?.[step]?.options[r.choice]} — {r.correct?'correct':'not correct'}{r.hinted?', after a hint':''}</li>)}</ol>
        </div>)}
      </section>)}
    </details>}
  </>;
}
