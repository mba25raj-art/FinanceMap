import {COLLECTIONS,replayCollection} from './collections.js';
import {EQUIPMENT,replayEquipment,emptyEquipment} from './equipment.js';
import {emptyCollection} from './collections.js';
import {FINANCING,replayFinancing,emptyFinancing} from './financing.js';
import {COMPANY,replayCompany,emptyCompany} from './company.js';
import {PRACTICE,emptyPractice,replayPractice} from './practice.js';
import {TRANSFER,emptyTransfer,replayTransfer} from './transfer.js';
export const activityDefinitions={
 [TRANSFER]:{title:"Tamarind Catering transfer",empty:emptyTransfer,replay:replayTransfer,stageLabel:r=>r.period?"packet submitted":"packet not submitted",isUnfinished:r=>!replayTransfer(r).finished},
 [PRACTICE]:{title:"Mixed finance practice",empty:emptyPractice,replay:replayPractice,stageLabel:r=>`${r.period}/8 tasks submitted`,isUnfinished:r=>!replayPractice(r).finished},
 [COLLECTIONS]:{title:'Customer collection',empty:emptyCollection,replay:replayCollection,stages:['setup','prediction next','result; explanation next','explanation saved']},
 [EQUIPMENT]:{title:'Equipment investment',empty:emptyEquipment,replay:replayEquipment,stages:['setup and prediction','result; explanation next','explanation saved']},
 [FINANCING]:{title:'Financing comparison',empty:emptyFinancing,replay:replayFinancing,stages:['setup and prediction','result; recommendation next','recommendation saved']},
 [COMPANY]:{title:'Nila Homeware · six connected rounds',empty:emptyCompany,replay:replayCompany,stageLabel:r=>`${r.period}/6 rounds explained`,isUnfinished:r=>!replayCompany(r).finished},
};
export function activityUnfinished(record){const d=activityDefinitions[record.activityId];return d.isUnfinished?d.isUnfinished(record):record.period<d.stages.length-1;}
export function validateSimulationRecord(record){
 const definition=record&&Object.hasOwn(activityDefinitions,record.activityId)?activityDefinitions[record.activityId]:null;
 if(definition){definition.replay(record);return structuredClone(record);}
 throw new Error('This activity scenario version has no registered replay implementation. Keep the original export.');
}
