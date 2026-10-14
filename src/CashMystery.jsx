import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { mystery } from './data/lessons';
import { AttemptRecord } from './LearningProgress.jsx';

export function canRevealMysteryClue(step, answers, hints, responses = {}) {
  const clue = mystery.steps[step];
  const answer = answers[step];
  return !!clue && ((Number.isInteger(answer) && answer >= 0 && answer < clue.options.length) || hints[step] === true || !!responses[step]?.length);
}

// Do not mount worked examples or the companion quiz before the learner opts in.
// Hiding them with CSS would leave the answer in accessibility text.
export function MysteryLessonGate({ revealed, topicTitle, onRevealHint, children }) {
  if (revealed) return children;
  return <aside className="detail">
    <h2>{topicTitle}</h2>
    <p className="concept-hook">Try the clue before opening its worked explanation.</p>
    <p className="definition">The full lesson includes examples that may reveal the answer. You can open it as a hint, then return to your choice.</p>
    <button className="primary" onClick={onRevealHint}>Open full lesson (reveals hint)<ArrowRightIcon/></button>
    <p className="small muted">Opening the lesson does not answer the clue or advance the case.</p>
  </aside>;
}

export default function CashMystery({ step, answers, hints, responses = {}, runNumber = 1, complete, onAnswer, onRevealHint, onRetry, onNext, onExploreValuation, onRestart }) {
  const clue = mystery.steps[step];
  const answer = answers[step];
  const revealed = canRevealMysteryClue(step, answers, hints, responses);
  const answered = Number.isInteger(answer) && answer >= 0 && answer < clue.options.length;
  const correct = answered && answer === clue.correct;
  return <>
    <div className="fact-grid">{mystery.facts.map(f=><div key={f.label}><span>{f.label}</span><strong>{f.value}</strong><small>{f.note}</small></div>)}</div>
    <div className="mission-progress"><span>{complete?'CASE SOLVED':`CASE CLUE ${step+1} OF ${mystery.steps.length}`} · RUN {runNumber}</span><progress aria-label="Case clues answered correctly in this run" max={mystery.steps.length} value={complete?mystery.steps.length:step+(correct?1:0)}/></div>
    {complete ? <div className="case-solved">
      <CheckCircleIcon/><h2>You found the missing cash.</h2>
      <p>₹20 lakh NOPAT + ₹5 lakh depreciation − ₹8 lakh capex − ₹10 lakh invested in working capital = <strong>₹7 lakh FCFF.</strong></p>
      <p>Profit, cash, and value are connected—through reinvestment.</p>
      <button className="primary" onClick={onExploreValuation}>Follow cash into valuation <ArrowRightIcon/></button>
      <p className="small muted">This case counts once as solved in this session. Replay keeps your earlier answers and completion record.</p>
      <button className="text-button" onClick={onRestart}>Replay case (keeps your record)</button>
    </div> : <section className="mission-question">
      <h2>{clue.title}</h2><p>{clue.question}</p>
      <div className="choices" role="group" aria-label={clue.question}>{clue.options.map((option,i)=><button key={option} className={`choice ${answer===i?'chosen':''} ${answer===i&&correct?'correct':''}`} aria-pressed={answer===i} onClick={()=>onAnswer(i)}><span className="radio"/>{option}</button>)}</div>
      {revealed && <div className={`feedback ${correct?'success':'retry'}`} role="status">{answered ? `${correct?'Correct.':'Not quite.'} ${clue.why}` : `${responses[step]?.length?'Explanation from your earlier attempt.':'Hint revealed.'} ${clue.why}`}</div>}
      {!revealed && <button className="text-button" onClick={onRevealHint}>Reveal clue explanation (hint)</button>}
      {hints[step]===true && <p className="small muted">You requested a hint for this clue in this run.</p>}
      <AttemptRecord responses={responses[step]} options={clue.options} label="First answer this run"/>
      {answered && <button className="text-button" onClick={onRetry}>Retry this case clue</button>}
      <p className="small muted progression-note">{correct
        ? step===mystery.steps.length-1?'All clues are correct. Finish to record this case as solved.':`Continue to case clue ${step+2}; your answers stay in this run.`
        : 'Choose the correct answer to continue. You can change your choice or retry; earlier answers stay in your record.'}</p>
      <button className="primary" disabled={!correct} onClick={onNext}>{step===mystery.steps.length-1?'Finish case':`Continue to case clue ${step+2} of ${mystery.steps.length}`}<ArrowRightIcon/></button>
    </section>}
  </>;
}
