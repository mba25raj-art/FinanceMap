import {useEffect,useRef} from 'react';
export function preferredScrollBehavior(reduced){return reduced?'auto':'smooth';}
export default function ActivityAccessibility({record,children}){
 const holder=useRef(null),last=record.decisions.at(-1),type=last?.type;
 useEffect(()=>{const frame=requestAnimationFrame(()=>{const root=holder.current;if(!root)return;let target;
  if(type==='hint')target=[...root.querySelectorAll('[data-hint]')].at(-1);
  else if(['predict','prediction','answer','attempt'].includes(type))target=root.querySelector('[data-feedback]');
  else if(type==='commit')target=root.querySelector('textarea');
  target??=root.querySelector('[data-task-heading]')||root.querySelector('h1');if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:false});}
 });return()=>cancelAnimationFrame(frame);},[record.activityId,record.decisions.length]);
 const message=type==='hint'?`Hint ${last.stage} recorded${last.stage===3?'; worked answer revealed':''}.`:['predict','prediction','answer','attempt'].includes(type)?'Response saved. Feedback is available.':type==='explain'||type==='explanation'?'Explanation saved for self-review; it is ungraded.':type==='finish'?'This record is finished. Completion does not award competency.':'';
 return <div ref={holder} className="activity-frame"><p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{message}</p>{children}</div>;
}
