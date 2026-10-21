import { receivables, lessonPackages, lessonPackageForQuestion } from './lesson-packages.js';
export { receivables };
export const practiceKey = item => {
  const lesson=lessonPackageForQuestion(item);
  return lesson?`${lesson.conceptId}@${lesson.contentVersion}:${item.id}@${item.version}`:null;
};
export const practiceRecord = (records, item) => records?.[practiceKey(item)] || { choice: null, hints: [], responses: [], revealed: false };

// Definitions are trusted authored content; actions cannot supply a score or answer key.
export function lessonPracticeReducer(records = {}, action) {
  // Preserve the original receivables action contract; new lessons name their canonical owner.
  const lesson=lessonPackages.find(p=>p.conceptId===(action.conceptId??receivables.conceptId));
  const item=lesson?.practice.find(q=>q.id===action.questionId);
  if(!item||action.contentVersion!==lesson.contentVersion||action.version!==item.version)return records;
  const key=practiceKey(item), record=practiceRecord(records,item);
  let next;
  if(action.type==='lesson-answer'){
    if(!item.options.some(o=>o.id===action.choice)||record.choice===action.choice)return records;
    next={...record,choice:action.choice,revealed:true,responses:[...record.responses,{choice:action.choice,correct:action.choice===item.correctOptionId,hinted:record.hints.length>0}]};
  }else if(action.type==='lesson-hint'){
    if(!Number.isInteger(action.hint)||!item.hints[action.hint]||record.hints.includes(action.hint)||record.revealed)return records;
    next={...record,hints:[...record.hints,action.hint],revealed:item.hints[action.hint].answerRevealing};
  }else if(action.type==='lesson-retry'){
    if(record.choice===null)return records;next={...record,choice:null};
  }else return records;
  return {...records,[key]:next};
}

export function lessonPracticeCounts(records = {}, lesson) {
  const items=(lesson?[lesson]:lessonPackages).flatMap(p=>p.practice).map(q=>practiceRecord(records,q)), submitted=items.filter(r=>r.responses.length);
  return { answered:submitted.length,latestCorrect:submitted.filter(r=>r.responses.at(-1).correct).length,firstUnassisted:submitted.filter(r=>r.responses[0].correct&&!r.responses[0].hinted).length,helped:items.filter(r=>r.hints.length).length,total:items.length };
}
