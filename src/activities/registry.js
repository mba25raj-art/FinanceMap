import {COLLECTIONS,replayCollection} from './collections.js';
import {EQUIPMENT,replayEquipment,emptyEquipment} from './equipment.js';
import {emptyCollection} from './collections.js';
import {FINANCING,replayFinancing,emptyFinancing} from './financing.js';
export const activityDefinitions={
 [COLLECTIONS]:{title:'Customer collection',empty:emptyCollection,replay:replayCollection,stages:['setup','prediction next','result; explanation next','explanation saved']},
 [EQUIPMENT]:{title:'Equipment investment',empty:emptyEquipment,replay:replayEquipment,stages:['setup and prediction','result; explanation next','explanation saved']},
 [FINANCING]:{title:'Financing comparison',empty:emptyFinancing,replay:replayFinancing,stages:['setup and prediction','result; recommendation next','recommendation saved']},
};
export function validateSimulationRecord(record){
 const definition=record&&Object.hasOwn(activityDefinitions,record.activityId)?activityDefinitions[record.activityId]:null;
 if(definition){definition.replay(record);return structuredClone(record);}
 throw new Error('This activity scenario version has no registered replay implementation. Keep the original export.');
}
