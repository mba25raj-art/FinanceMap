const responseTypes=new Set(['predict','prediction','answer','attempt']);
export function preferredScrollBehavior(reduced){return reduced?'auto':'smooth';}
export function focusContent(target,{preventScroll=false}={}){
 if(!target?.focus)return false;
 // Preserve the browser's normal Tab order for inputs, selects and textareas.
 if(target.tabIndex<0&&!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');
 target.focus({preventScroll});return true;
}
export function activityAnnouncement(record,previousRevision){
 if(record.decisions.length<=previousRevision)return '';
 const last=record.decisions.at(-1);
 if(last.type==='hint')return `Hint ${last.stage} recorded${last.stage===3?'; worked answer revealed':''}.`;
 if(responseTypes.has(last.type))return `Response ${record.decisions.filter(d=>responseTypes.has(d.type)).length} saved. Feedback is available.`;
 if(last.type==='explain'||last.type==='explanation')return `Explanation ${record.decisions.filter(d=>d.type==='explain'||d.type==='explanation').length} saved for self-review; it is ungraded.`;
 if(last.type==='finish')return 'This record is finished. Completion does not award competency.';
 if(last.type==='commit')return 'Choice saved. Explain your decision.';
 if(last.type==='sale')return 'Credit sale saved. Continue to the collection prediction.';
 if(last.type==='setup')return 'Activity started. The current task is ready.';
 return '';
}
