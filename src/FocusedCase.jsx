import { useEffect, useRef } from 'react';

export function LessonHintDialog({ pending, onRead, onCancel }) {
  const dialog = useRef(null), cancelButton = useRef(null);
  useEffect(() => {
    if (!pending) return;
    const previous = document.activeElement;
    dialog.current.showModal();
    cancelButton.current?.focus({ preventScroll: true });
    return () => { dialog.current?.close(); previous?.focus?.({ preventScroll: true }); };
  }, [pending]);
  return <dialog ref={dialog} className="lesson-hint-dialog" aria-labelledby="hint-title" onCancel={e => { e.preventDefault(); onCancel(); }}>
    <h2 id="hint-title">Read this as a hint?</h2>
    <p>{pending?.transferIndex!==undefined?'Worked study or another activity can help with your unanswered transfer packet. Opening it records study help for unfinished transfer packets. Your submitted history is kept; choose Keep trying to return without revealing it.':'A worked lesson can reveal the answer to your current clue. Opening it will record a requested hint for this clue, while keeping your choices and run.'}</p>
    <div className="hint-actions"><button className="primary" onClick={onRead}>Open lesson as a hint</button><button className="secondary" ref={cancelButton} onClick={onCancel}>Keep trying</button></div>
  </dialog>;
}

export default function FocusedCase({ title, intro, runNumber, step, complete, topicTitle, hinted, revealed, onCatalogue, onLesson, paneRef, supportRef, children }) {
  const reading = <div className="task-reading"><span className="eyebrow">EXPLORE THE IDEA</span><h2>{topicTitle}</h2><p>{revealed ? 'Open the full explanation, types and worked examples. Your current clue will be here when you return.' : 'Try the clue first, or read the worked lesson as a hint. Reading does not answer or advance the clue.'}</p><button className="secondary" onClick={onLesson}>{revealed ? 'Open full lesson' : 'Open lesson as a hint'}</button>{hinted && <p className="small">Requested hint recorded for this clue.</p>}</div>;
  return <div className="focused-workspace"><main className="task-pane" ref={paneRef} tabIndex={-1} aria-label="Current cash mystery task">
    <nav className="task-breadcrumb" aria-label="Activity location"><button onClick={onCatalogue}>Simulations</button><span> / Cash mystery / Run {runNumber} / {complete ? 'Debrief' : `Clue ${step+1} of 3`}</span></nav>
    <div className="page-heading"><span className="eyebrow">SIMULATIONS · CASH MYSTERY</span><h1>{title}</h1><p className="lead">{intro}</p></div>
    <div className="task-mobile-reading">{reading}</div>{children}
  </main><aside ref={supportRef} className="task-support" aria-label="Lesson support">{reading}<section className="task-orientation"><h3>One decision at a time</h3><p>Choose an answer to get feedback. Retry keeps your first response. Continue unlocks when the current choice is correct.</p><p>Concept links let you follow the financial web. Use Return to cash mystery to come back to this run and its current clue.</p><p className="small muted">This is a three-clue practice case. See My learning for local-save status and backup controls.</p><button className="text-button" onClick={onCatalogue}>All simulations (keeps this run)</button></section></aside></div>;
}
