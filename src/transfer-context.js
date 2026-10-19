import {TRANSFER,needsTransferStudy,addTransferDecision} from './activities/transfer.js';
export const transferStudyViews=new Set(['atlas','lesson','statements','map','topics','trails','resources','practice','labs','company','missions','brief']);
export function transferStudyContext(records,view){if(!transferStudyViews.has(view))return null;const index=records.findLastIndex(r=>r.activityId===TRANSFER&&needsTransferStudy(r));return index<0?null:{index};}
export function recordTransferStudy(records,at){return records.map(r=>r.activityId===TRANSFER&&needsTransferStudy(r)?addTransferDecision(r,{type:'study',at}):r);}
