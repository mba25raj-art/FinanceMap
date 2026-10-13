import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { mystery } from './data/lessons';

export function canRevealMysteryClue(step, answers, hints) {
  const clue = mystery.steps[step];
  const answer = answers[step];
  return !!clue && ((Number.isInteger(answer) && answer >= 0 && answer < clue.options.length) || hints[step] === true);
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

export default function CashMystery({ step, answers, hints, complete, onAnswer, onRevealHint, onNext, onExploreValuation, onRestart }) {
  const clue = mystery.steps[step];
  const answer = answers[step];
  const revealed = canRevealMysteryClue(step, answers, hints);
  const answered = Number.isInteger(answer) && answer >= 0 && answer < clue.options.length;
  const correct = answered && answer === clue.correct;
  return <>
    <div className="fact-grid">{mystery.facts.map(f=><div key={f.label}><span>{f.label}</span><strong>{f.value}</strong><small>{f.note}</small></div>)}</div>
    <div className="mission-progress"><span>{complete?'CASE SOLVED':`CLUE ${step+1} OF 3`}</span><progress max="3" value={complete?3:step}/></div>
    {complete ? <div className="case-solved">
      <CheckCircleIcon/><h2>You found the missing cash.</h2>
      <p>₹20 lakh NOPAT + ₹5 lakh depreciation − ₹8 lakh capex − ₹10 lakh invested in working capital = <strong>₹7 lakh FCFF.</strong></p>
      <p>Profit, cash, and value are connected—through reinvestment.</p>
      <button className="primary" onClick={onExploreValuation}>Follow cash into valuation <ArrowRightIcon/></button>
      <button className="text-button" onClick={onRestart}>Try the case again</button>
    </div> : <section className="mission-question">
      <h2>{clue.title}</h2><p>{clue.question}</p>
      <div className="choices" role="group" aria-label={clue.question}>{clue.options.map((option,i)=><button key={option} className={`choice ${answer===i?'chosen':''} ${answer===i&&correct?'correct':''}`} aria-pressed={answer===i} onClick={()=>onAnswer(i)}><span className="radio"/>{option}</button>)}</div>
      {revealed && <div className={`feedback ${correct?'success':'retry'}`} role="status">{answered ? `${correct?'Correct.':'Not quite.'} ${clue.why}` : `Hint revealed. ${clue.why}`}</div>}
      {!revealed && <button className="text-button" onClick={onRevealHint}>Reveal clue explanation (hint)</button>}
      {hints[step]===true && <p className="small muted">You requested a hint for this clue. Choose an answer to continue.</p>}
      <button className="primary" disabled={!correct} onClick={onNext}>{step===2?'Solve the case':'Follow the next clue'}<ArrowRightIcon/></button>
    </section>}
  </>;
}
