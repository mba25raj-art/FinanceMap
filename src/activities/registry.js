import {COLLECTIONS,replayCollection} from './collections.js';
export function validateSimulationRecord(record){
 if(record?.activityId===COLLECTIONS){replayCollection(record);return structuredClone(record);}
 throw new Error('This activity scenario version has no registered replay implementation. Keep the original export.');
}
