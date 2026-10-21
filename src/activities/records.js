import {validateSimulationRecord} from './registry.js';
export function commitActivityRecord(records,index,next,expectedRevision){
 validateSimulationRecord(next);
 if(!Number.isSafeInteger(index)||index<0||index>records.length)return records;
 const current=records[index];
 if(current?(current.activityId!==next.activityId||current.decisions.length!==expectedRevision):expectedRevision!==0)return records;
 if(next.decisions.length!==expectedRevision+1)return records;
 const result=[...records];result[index]=structuredClone(next);return result;
}
