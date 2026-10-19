export default function LearningNextActions({plan,title,onResume,onBrief,onConcept,onBrowse}){
  const {next,review,counts}=plan;
  const act=()=>next.kind==='resume'?onResume(next.runIndex):next.kind==='brief'?onBrief():next.conceptId?onConcept(next.conceptId):onBrowse(true);
  return <section className="learning-next" aria-labelledby="learning-next-title">
    <span className="eyebrow">NEXT ACTION</span><h2 id="learning-next-title">{next.title}</h2><p>{next.reason}</p>
    {next.conceptId&&<p><strong>{title(next.conceptId)}</strong></p>}
    <div className="record-actions"><button className="primary" onClick={act}>{next.kind==='resume'?'Resume this run':next.kind==='brief'?'Open the case brief':next.kind==='review'?'Review this concept':next.kind==='read'?'Open this lesson':'Find an unanswered question'}</button><button className="text-button" onClick={()=>onBrowse(false)}>Browse all topics</button></div>
    {!!next.preparation.length&&<details><summary>Optional preparation not yet explored</summary><p>These are reading suggestions. They do not block the task, and a visit does not prove understanding.</p>{next.preparation.map(id=><button key={id} className="saved-item" onClick={()=>onConcept(id)}>{title(id)}</button>)}</details>}
    <h3>What the record shows</h3>
    <table className="lesson-inputs"><thead><tr><th scope="col">Evidence</th><th scope="col">Observation</th></tr></thead><tbody>
      <tr><th scope="row">Explored</th><td>{counts.explored} distinct concepts visited. Reading alone is not practice or mastery.</td></tr>
      <tr><th scope="row">Practised</th><td>{counts.topics} topic quizzes, {counts.lessons} lesson questions and {counts.caseClues} case clues with submitted answers. These categories keep separate records.</td></tr>
      <tr><th scope="row">Independent transfer results</th><td>{counts.transferQuestions} transfer questions correct on the first response without help, across {counts.transferConcepts} canonical concepts. This evidence is limited to those questions.</td></tr>
      <tr><th scope="row">Demonstrated on a task</th><td>Requires an independent result plus a reviewed explanation. Current self-check reflections are ungraded, so these answer checks alone do not award demonstrated understanding.</td></tr>
    </tbody></table>
    <p className="small muted">Correcting an answer does not erase the first attempt. The self-check explanation rubric is not automatically graded. None of these observations certifies general mastery.</p>
    <details className="review-next" open={review.length>0}><summary>Concepts to revisit ({review.length})</summary>{review.length?<ul>{review.map(r=><li key={r.conceptId}><button className="text-button" onClick={()=>onConcept(r.conceptId)}>{title(r.conceptId)}</button><p className="small">{r.reasons.join(' ')}</p></li>)}</ul>:<p>No submitted mistake or requested lesson help is recorded yet. That is not proof that unattempted topics are understood.</p>}</details>
  </section>;
}
