import {COLLECTIONS,replayCollection} from './collections.js';
import {EQUIPMENT,replayEquipment,emptyEquipment} from './equipment.js';
import {emptyCollection} from './collections.js';
export const activityDefinitions={
 [COLLECTIONS]:{title:'Customer collection',empty:emptyCollection,replay:replayCollection,stages:['setup','prediction next','result; explanation next','explanation saved']},
 [EQUIPMENT]:{title:'Equipment investment',empty:emptyEquipment,replay:replayEquipment,stages:['setup and prediction','result; explanation next','explanation saved']},
};
export function validateSimulationRecord(record){
 const definition=record&&Object.hasOwn(activityDefinitions,record.activityId)?activityDefinitions[record.activityId]:null;
 if(definition){definition.replay(record);return structuredClone(record);}
 throw new Error('This activity scenario version has no registered replay implementation. Keep the original export.');
}
