import {PRACTICE,replayPractice} from './activities/practice.js';
import {TRANSFER,replayTransfer} from './activities/transfer.js';
const day=86400000;
export function scheduledReviews(records,now=Date.now()){
 const newest=new Map();
 records.forEach((record,index)=>{if(record.activityId!==PRACTICE)return;const r=replayPractice(record);for(const q of r.questions){const attempts=r.responses[q.id]||[],latest=attempts.at(-1);if(!latest||q.kind==='judgment')continue;const key=q.id,existing=newest.get(key);if(existing&&Date.parse(existing.latest.at)>Date.parse(latest.at))continue;const days=!latest.allCorrect?1:(attempts.some(a=>!a.allCorrect)||latest.helpBeforeAnswer)?3:7,reason=!latest.allCorrect?'Latest response needs correction.':attempts.some(a=>!a.allCorrect)?'An earlier mistake was corrected.':latest.helpBeforeAnswer?'The latest response followed requested help.':'Revisit the mechanism after a correct guided response.';let due=Math.min(Date.parse(latest.at)+days*day,8640000000000000);const deferred=r.deferrals[q.id];if(deferred&&Date.parse(deferred.at)>=Date.parse(latest.at))due=Math.max(due,Date.parse(deferred.until));newest.set(key,{activityId:PRACTICE,index,questionId:q.id,version:q.version,title:q.title,concepts:q.concepts,latest,days,reason,dueAt:new Date(due).toISOString(),due:now>=due,clockAhead:Date.parse(latest.at)>now});}});
 return [...newest.values()].sort((a,b)=>Date.parse(a.dueAt)-Date.parse(b.dueAt)||a.questionId.localeCompare(b.questionId));
}
export function transferEvidence(records){
 const packets=records.flatMap((record,index)=>record.activityId===TRANSFER?[{record,index,result:replayTransfer(record)}]:[]),responses=packets.flatMap(p=>p.result.attempts.map((a,attempt)=>({...a,index:p.index,attempt}))).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)||a.index-b.index||a.attempt-b.attempt),first=responses[0]||null,latest=responses.at(-1)||null;
 const initialUnassisted=first&&!first.assisted&&!first.priorExposure&&!first.feedbackBefore?{earned:first.earned,total:first.total,index:first.index,at:first.at}:null;
 return {packets:packets.length,first,latest,initialUnassisted,demonstratedCompetencies:[]};
}
