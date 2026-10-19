import {validateSimulationRecord} from './registry.js';
export function commitActivityRecord(records,index,next,expectedPeriod){
 validateSimulationRecord(next);
 if(!Number.isSafeInteger(index)||index<0||index>records.length)return records;
 const current=records[index];
 if(current?(current.activityId!==next.activityId||current.period!==expectedPeriod):expectedPeriod!==0)return records;
 if(next.period!==expectedPeriod+1)return records;
 const result=[...records];result[index]=structuredClone(next);return result;
}
