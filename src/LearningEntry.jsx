import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { unfinishedCaseRuns } from './learning-session.js';

export function ResumeCard({ session, onResume }) {
  const pending = unfinishedCaseRuns(session).at(-1);
  if (!pending) return null;
  return <section className="resume-card" aria-label="Next activity">
    <span className="eyebrow">CONTINUE THIS SESSION</span>
    <h2>Your cash mystery is waiting.</h2>
    <p>Run {pending.index+1} · clue {pending.run.step+1} of {pending.run.clues.length}. Your choices, hints and earlier answers are kept.</p>
    <button className="primary" onClick={()=>onResume(pending.index)}>Resume cash mystery <ArrowRightIcon/></button>
  </section>;
}

export function AtlasEntry({ session, onResume, onBrief, onExplore, onStatements, onMap, onSources, journeys, onTrail }) {
  const pending = unfinishedCaseRuns(session).length > 0;
  return <main className="single-view entry-main">
    <span className="eyebrow">FINANCE ATLAS</span><h1>Connect the numbers to the decisions.</h1>
    <p className="lead">Learn why one finance idea leads to another. Start with a guided mystery, or explore a concept at your own pace.</p>
    <p className="small muted entry-note">No account needed. Local-save status, export, import and reset controls are in My learning.</p>
    <ResumeCard session={session} onResume={onResume}/>
    <div className="entry-options">
      <section><span className="eyebrow">GUIDED BEGINNER ROUTE</span><h2>Why can profit leave you short of cash?</h2>
        <p>Refresh the basics if needed, follow three clues, then connect the remaining cash to valuation.</p>
        <ol><li>Review accounting and cash timing.</li><li>Attempt the cash mystery, with hints when you want them.</li><li>Explain the gap between profit and cash.</li></ol>
        <button className={pending?'secondary':'primary'} onClick={onBrief}>See the mystery brief <ArrowRightIcon/></button>
      </section>
      <section><span className="eyebrow">FREE EXPLORATION</span><h2>Follow your own question.</h2>
        <p>Browse all 698 topic pages. Each has an explanation, types, examples, a topic quiz and connections.</p>
        <button className="secondary" onClick={onExplore}>Explore all finance topics <ArrowRightIcon/></button>
        <div className="entry-links"><button className="text-button" onClick={onStatements}>Open statement explorer</button><button className="text-button" onClick={onMap}>Explore the connection map</button><button className="text-button" onClick={onSources}>Sources & master documents</button></div>
      </section>
    </div>
    <h2 className="journeys-heading">Reading trails</h2><p className="muted">24 guided reference paths. Visiting their stops is exploration, separate from solving a case.</p>
    <div className="mission-grid">{journeys.map(j=><button key={j.id} className="mission-card" onClick={()=>onTrail(j)}><span className="eyebrow">{j.nodes.length} REFERENCE STOPS</span><h3>{j.name}</h3><p>{j.hook}</p><span className="mission-cta">Read the trail <ArrowRightIcon/></span></button>)}</div>
  </main>;
}

export function MysteryBrief({ session, onResume, onStart, onConcept, message }) {
  const pending = unfinishedCaseRuns(session).at(-1);
  const completed = session.completedCases.includes('P02');
  return <main className="single-view activity-brief">
    <span className="eyebrow">SIMULATIONS · THREE-CLUE MYSTERY</span><h1>Profitable. So where did the cash go?</h1>
    {message&&<p role="status" className="route-message">{message}</p>}
    <p className="lead">Explain why profit differs from cash left after reinvestment, then calculate free cash flow to the firm.</p>
    <div className="brief-meta"><span>Estimated 10–15 minutes</span><span>Untimed</span><span>Fictional company · ₹ lakh</span></div>
    <p className="small muted">Allow longer if you open the full lessons. You can explore freely and use hints without a time limit.</p>
    <section><h2>What you will do</h2><ol><li>Predict how customer-payment timing affects cash.</li><li>Distinguish a non-cash expense from an investment payment.</li><li>Put the cash bridge together and explain the result.</li></ol></section>
    <section><h2>Before you begin</h2><p>You need basic addition and subtraction, and an understanding that a sale and its cash collection can happen at different times. These refreshers are optional.</p>
      <div className="entry-links"><button className="text-button" onClick={()=>onConcept('T04.01')}>The accounting equation <ArrowRightIcon/></button><button className="text-button" onClick={()=>onConcept('T04.05')}>Cash versus accrual accounting <ArrowRightIcon/></button><button className="text-button" onClick={()=>onConcept('A02')}>Customer invoices and collections <ArrowRightIcon/></button></div>
    </section>
    <div className="brief-actions">{pending?<><button className="primary" onClick={()=>onResume(pending.index)}>Resume cash mystery <ArrowRightIcon/></button><button className="text-button" onClick={onStart}>Start another run (keeps history)</button><p className="small muted">Resume returns to run {pending.index+1}, clue {pending.run.step+1} of 3.</p></>:<button className="primary" onClick={onStart}>{completed?'Replay cash mystery':'Start cash mystery'}<ArrowRightIcon/></button>}</div>
    <p className="small muted entry-note">Your choices and first answers are kept for this open session. Refreshing or closing resets them. Starting or replaying does not count as finishing.</p>
  </main>;
}

export function SimulationEntry({ session, onResume, onBrief, onAtlas }) {
  const pending = unfinishedCaseRuns(session).length > 0;
  return <main className="single-view entry-main"><span className="eyebrow">SIMULATIONS</span><h1>Make a decision. Follow its consequences.</h1><p className="lead">Begin with the playable cash mystery. The longer company case will connect transactions, funding, investment and valuation.</p>
    <ResumeCard session={session} onResume={onResume}/>
    <section className="entry-case"><span className="eyebrow">PLAYABLE NOW · 3 CLUES</span><h2>Profitable. So where did the cash go?</h2><p>Discover how much cash remains after reinvestment, and explain the difference from profit.</p><p className="small muted">Cash after reinvestment: <strong>To discover</strong></p><button className={pending?'secondary':'primary'} onClick={onBrief}>See the mystery brief <ArrowRightIcon/></button></section>
    <section className="entry-case"><span className="eyebrow">PLANNED</span><h2>Nila Homeware: six connected rounds</h2><p>Trace transactions, reconcile cash, identify a funding gap, compare financing, evaluate an investment and explain valuation assumptions.</p></section>
    <button className="text-button" onClick={onAtlas}>Find a reading trail in the Atlas <ArrowRightIcon/></button>
  </main>;
}

export function LabsEntry({ onConcept }) {
  const labs=[['Customer collection','Explore an invoice, delayed payment and the effects of collection.','A02'],['Equipment investment','Connect equipment purchase, depreciation and project value.','A07'],['Financing comparison','Compare repayment pressure, ownership dilution and value.','A18']];
  return <main className="single-view entry-main"><span className="eyebrow">LABS</span><h1>Change one thing. Understand the effect.</h1><p className="lead">These three experiments are planned. Their reference lessons are available now.</p><div className="entry-options labs-options">{labs.map(([name,description,id])=><section key={id}><span className="eyebrow">PLANNED LAB</span><h2>{name}</h2><p>{description}</p><button className="text-button" onClick={()=>onConcept(id)}>Read the related concept <ArrowRightIcon/></button></section>)}</div></main>;
}
