import {useEffect,useRef,useState} from 'react';
import {activityAnnouncement,focusContent} from './activity-accessibility.js';
export {preferredScrollBehavior} from './activity-accessibility.js';
export default function ActivityAccessibility({record,children}){
 const holder=useRef(null),revision=useRef(record.decisions.length),[message,setMessage]=useState('');
 useEffect(()=>{const changed=record.decisions.length>revision.current,type=changed?record.decisions.at(-1)?.type:null;
  setMessage(activityAnnouncement(record,revision.current));revision.current=record.decisions.length;
  const frame=requestAnimationFrame(()=>{const root=holder.current;if(!root)return;let target;
  if(type==='hint')target=[...root.querySelectorAll('[data-hint]')].at(-1);
  else if(['predict','prediction','answer','attempt'].includes(type))target=root.querySelector('[data-feedback]');
  else if(type==='commit')target=root.querySelector('textarea');
  else if(type==='explanation')target=root.querySelector('[data-reflection]');
  target??=root.querySelector('[data-task-heading]')||root.querySelector('h1');focusContent(target);
 });return()=>cancelAnimationFrame(frame);},[record.activityId,record.decisions.length]);
 return <div ref={holder} className="activity-frame"><p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{message}</p>{children}</div>;
}
