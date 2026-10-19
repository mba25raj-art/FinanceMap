import { createLearningSession } from './learning-session.js';

export const LEARNING_STORAGE_KEY='finance-atlas.learning.v1';
export const MAX_SAVE_BYTES=5*1024*1024;
const fail=message=>{throw new Error(message);};
const shape=(v,keys,label)=>{
  if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==keys.length||!keys.every(k=>Object.hasOwn(v,k)))fail(`${label}: unsupported or missing fields.`);
  return v;
};
const list=(v,max,label)=>{if(!Array.isArray(v)||v.length>max)fail(`${label}: invalid or oversized list.`);return v;};
const str=(v,max,label)=>{if(typeof v!=='string'||!v.length||v.length>max)fail(`${label}: invalid text.`);return v;};
const integer=(v,min,max,label)=>{if(!Number.isSafeInteger(v)||v<min||v>max)fail(`${label}: invalid number.`);return v;};
const bool=(v,label)=>{if(typeof v!=='boolean')fail(`${label}: invalid flag.`);return v;};
const unique=(items,label)=>{if(new Set(items).size!==items.length)fail(`${label}: duplicate identity.`);return items;};
const choice=(v,count,label)=>integer(v,0,count-1,label);
const rawSize=text=>new TextEncoder().encode(text).length;
export const emptyLearningProfile=()=>({session:{...createLearningSession(),lessonPractice:{}},bookmarks:[],visited:[],trail:[],navigation:'#atlas',simulations:[]});
export const hasLearningRecord=p=>Boolean(p.bookmarks.length||p.visited.length||Object.keys(p.session.topics).length||Object.keys(p.session.lessonPractice||{}).length||p.session.runs.length||p.simulations?.length);

// The catalog is trusted authored code. Imported scores, answer keys and account balances are never used.
export function createSaveCodec({conceptIds,topics,topicVersions,packages,cases,validateSimulation}){
  const concepts=new Set(conceptIds),questions=new Map();
  for(const lesson of packages)for(const item of lesson.practice){
    const key=`${lesson.conceptId}@${lesson.contentVersion}:${item.id}@${item.version}`;
    questions.set(key,{lesson,item});
  }
  const ids=(v,max,label,dedupe=true)=>{
    const result=list(v,max,label).map(id=>{if(!concepts.has(id))fail(`${label}: unavailable concept.`);return id;});
    return dedupe?unique(result,label):result;
  };
  function decode(document){
    if(!document||typeof document!=='object'||Array.isArray(document))fail('This is not a valid Finance Atlas learning record.');
    if(document.format!=='finance-atlas-learning')fail('This is not a Finance Atlas learning record.');
    if(document.schemaVersion!==1)fail(`Save version ${String(document.schemaVersion)} is unsupported. Your original record has not been replaced.`);
    shape(document,['format','schemaVersion','savedAt','progress'],'Save');
    if(typeof document.savedAt!=='string'||document.savedAt.length>40||!Number.isFinite(Date.parse(document.savedAt))||new Date(document.savedAt).toISOString()!==document.savedAt)fail('Invalid saved date.');
    const p=shape(document.progress,['concepts','topics','lessonPractice','cases','activeRun','simulations','navigation'],'Progress');
    const c=shape(p.concepts,['saved','explored','recent'],'Concepts');
    const profile=emptyLearningProfile(),session=profile.session;
    profile.bookmarks=ids(c.saved,1000,'Saved concepts');profile.visited=ids(c.explored,1000,'Explored concepts');profile.trail=ids(c.recent,20,'Recent concepts',false);
    const seenTopics=new Set();
    for(const record of list(p.topics,1000,'Topic records')){
      shape(record,['conceptId','questionVersion','selectedChoice','attempts'],'Topic');
      const id=record.conceptId,definition=topics[id];
      if(!concepts.has(id)||!definition||record.questionVersion!==topicVersions[id])fail(`Topic ${String(id)} has an unavailable question version. Keep the original export for recovery.`);
      if(seenTopics.has(id))fail('Duplicate topic record.');seenTopics.add(id);
      const attempts=list(record.attempts,10000,'Topic attempts');if(!attempts.length)fail('A topic record needs a submitted answer.');
      const responses=attempts.map(a=>({choice:choice(a,definition.options.length,'Topic choice'),correct:a===definition.correct}));
      session.topics[id]=responses;
      if(record.selectedChoice!==null){choice(record.selectedChoice,definition.options.length,'Topic selection');if(record.selectedChoice!==attempts.at(-1))fail('Topic selection does not match its latest attempt.');session.answers[id]=record.selectedChoice;}
    }
    for(const record of list(p.lessonPractice,1000,'Lesson records')){
      shape(record,['conceptId','contentVersion','questionId','questionVersion','selectedChoice','hints','attempts'],'Lesson practice');
      const key=`${record.conceptId}@${record.contentVersion}:${record.questionId}@${record.questionVersion}`,definition=questions.get(key);
      if(!definition)fail('A lesson-practice version is unavailable. Keep the original export for recovery.');
      if(Object.hasOwn(session.lessonPractice,key))fail('Duplicate canonical lesson-practice record.');
      const {item}=definition,options=new Set(item.options.map(o=>o.id));
      const hints=unique(list(record.hints,100,'Lesson hints').map(h=>integer(h,0,item.hints.length-1,'Hint index')),'Lesson hints');
      const attempts=list(record.attempts,10000,'Lesson attempts').map(a=>{if(!options.has(a))fail('Invalid lesson choice.');return a;});
      if(!hints.length&&!attempts.length)fail('Empty lesson record.');
      if(record.selectedChoice!==null&&(!options.has(record.selectedChoice)||record.selectedChoice!==attempts.at(-1)))fail('Lesson selection does not match its latest attempt.');
      session.lessonPractice[key]={choice:record.selectedChoice,hints,responses:attempts.map(a=>({choice:a,correct:a===item.correctOptionId,hinted:hints.length>0})),revealed:attempts.length>0||hints.some(h=>item.hints[h].answerRevealing)};
    }
    for(const record of list(p.cases,1000,'Case runs')){
      shape(record,['activityId','scenarioVersion','definitionVersion','step','selectedChoices','hints','attempts','finished'],'Case run');
      const definition=Object.hasOwn(cases,record.activityId)?cases[record.activityId]:null;
      if(!definition||record.scenarioVersion!==definition.version||record.definitionVersion!==definition.fingerprint)fail('This case scenario version is unavailable. Keep the original export for recovery.');
      const step=integer(record.step,0,definition.clues.length-1,'Current clue');
      const clueMap=new Map(definition.clues.map((clue,index)=>[clue.id,{...clue,index}]));
      const clueFor=id=>{const clue=clueMap.get(id);if(!clue||clue.index>step)fail('Unavailable or not-yet-reached case clue.');return clue;};
      const run={id:record.activityId,clues:definition.clues.map(c=>({correct:c.correct,optionCount:c.options.length})),step,answers:{},hints:{},responses:{},complete:false};
      for(const id of unique(list(record.hints,1000,'Case hints'),'Case hints'))run.hints[clueFor(id).index]=true;
      let lastClue=-1;const assisted=new Set();
      for(const a of list(record.attempts,10000,'Case attempts')){
        shape(a,['clueId','choice','helpBeforeAnswer'],'Case attempt');const clue=clueFor(a.clueId),i=clue.index;
        if(i<lastClue)fail('Case attempts are not in progression order.');lastClue=i;
        const selected=choice(a.choice,clue.options.length,'Case choice'),hinted=bool(a.helpBeforeAnswer,'Help observation');
        if((hinted&&!run.hints[i])||(!hinted&&assisted.has(i)))fail('Inconsistent case hint history.');if(hinted)assisted.add(i);
        (run.responses[i]??=[]).push({choice:selected,correct:selected===clue.correct,hinted});
      }
      for(const a of list(record.selectedChoices,1000,'Case selections')){
        shape(a,['clueId','choice'],'Case selection');const clue=clueFor(a.clueId),i=clue.index;
        if(Object.hasOwn(run.answers,i))fail('Duplicate case selection.');
        choice(a.choice,clue.options.length,'Case selection');if(run.responses[i]?.at(-1).choice!==a.choice)fail('Case selection does not match its latest attempt.');run.answers[i]=a.choice;
      }
      for(let i=0;i<step;i++)if(run.answers[i]!==run.clues[i].correct)fail('Case progression requires correct earlier current choices.');
      if(bool(record.finished,'Finish flag')){
        if(step!==run.clues.length-1||!run.clues.every((c,i)=>run.answers[i]===c.correct))fail('Case Finish lacks the required current answers.');
        run.complete=true;if(!session.completedCases.includes(run.id))session.completedCases.push(run.id);
      }
      session.runs.push(run);
    }
    session.activeRun=integer(p.activeRun,-1,session.runs.length-1,'Active run');
    profile.simulations=list(p.simulations,1000,'Simulation records').map(record=>{
      if(!validateSimulation)fail('This simulation save version has no registered replay implementation yet. Keep the original export.');
      return validateSimulation(record);
    });
    profile.navigation=str(p.navigation,2048,'Saved route');if(!profile.navigation.startsWith('#'))fail('Saved route must be a local application hash.');
    return profile;
  }
  function encode(profile,date=new Date()){
    const s=profile.session;
    const progress={
      concepts:{saved:profile.bookmarks,explored:profile.visited,recent:profile.trail.slice(-20)},
      topics:Object.entries(s.topics).map(([conceptId,attempts])=>({conceptId,questionVersion:topicVersions[conceptId],selectedChoice:s.answers[conceptId]??null,attempts:attempts.map(a=>a.choice)})),
      lessonPractice:Object.entries(s.lessonPractice||{}).map(([key,record])=>{
        const definition=questions.get(key);if(!definition)fail('Cannot save an unknown lesson-practice version.');
        return {conceptId:definition.lesson.conceptId,contentVersion:definition.lesson.contentVersion,questionId:definition.item.id,questionVersion:definition.item.version,selectedChoice:record.choice,hints:record.hints,attempts:record.responses.map(a=>a.choice)};
      }),
      cases:s.runs.map(run=>{
        const definition=cases[run.id];if(!definition)fail('Cannot save an unregistered case version.');
        return {activityId:run.id,scenarioVersion:definition.version,definitionVersion:definition.fingerprint,step:run.step,selectedChoices:Object.entries(run.answers).map(([i,choice])=>({clueId:definition.clues[i].id,choice})),hints:Object.keys(run.hints).filter(i=>run.hints[i]).map(i=>definition.clues[i].id),attempts:Object.entries(run.responses).flatMap(([i,answers])=>answers.map(a=>({clueId:definition.clues[i].id,choice:a.choice,helpBeforeAnswer:a.hinted}))),finished:run.complete};
      }),
      activeRun:s.activeRun,simulations:structuredClone(profile.simulations||[]),navigation:profile.navigation||'#atlas',
    };
    const document={format:'finance-atlas-learning',schemaVersion:1,savedAt:date.toISOString(),progress};
    decode(document);return document;
  }
  const parse=text=>{
    if(typeof text!=='string'||rawSize(text)>MAX_SAVE_BYTES)fail('The learning record exceeds the 5 MiB import limit.');
    let document;try{document=JSON.parse(text);}catch{fail('The learning record is not valid JSON. The current record is unchanged.');}
    return {document,profile:decode(document)};
  };
  return {decode,encode,parse};
}

// Storage writes compare the last-read bytes. Conflicting tabs do not silently replace history.
export function createLearningStorage(storage,codec){
  let baseRaw=null,blocked=false;
  const empty=emptyLearningProfile();let initial;
  try{
    if(!storage)throw new Error('Browser storage is unavailable.');
    baseRaw=storage.getItem(LEARNING_STORAGE_KEY);
    initial=baseRaw===null?{kind:'empty',profile:empty}:{kind:'ready',profile:codec.parse(baseRaw).profile};
  }catch(error){blocked=true;initial={kind:baseRaw===null?'unavailable':'blocked',message:error.message,profile:empty};}
  const resultError=(kind,error)=>({ok:false,kind,message:error instanceof Error?error.message:String(error)});
  function write(profile,explicit=false){
    if(blocked&&!explicit)return resultError('blocked','Automatic saving is paused. Export the current record or review recovery in My learning.');
    try{
      if(!storage)throw new Error('Browser storage is unavailable; changes remain in memory.');
      if(storage.getItem(LEARNING_STORAGE_KEY)!==baseRaw){blocked=true;return resultError('conflict','Another tab changed this browser’s learning record. Export current changes or load the latest saved record.');}
      const document=codec.encode(profile),raw=JSON.stringify(document);
      if(rawSize(raw)>MAX_SAVE_BYTES)throw new Error('This record exceeds the supported save size. Export a backup; current changes remain in memory.');
      storage.setItem(LEARNING_STORAGE_KEY,raw);baseRaw=raw;blocked=false;return {ok:true,kind:'saved',savedAt:document.savedAt};
    }catch(error){return resultError('error',error);}
  }
  return {
    initial,
    raw:()=>baseRaw,
    save:profile=>hasLearningRecord(profile)?write(profile):{ok:true,kind:'empty'},
    importRecord:(raw,confirmed=false)=>{
      if(!confirmed)return resultError('confirmation','Confirm replacement after reviewing the import.');
      try{const parsed=codec.parse(raw),result=write(parsed.profile,true);return result.ok?{...result,profile:parsed.profile}:result;}catch(error){return resultError('invalid',error);}
    },
    reset:(confirmed=false)=>{
      if(!confirmed)return resultError('confirmation','Confirm deletion of this browser’s learning record.');
      try{
        if(!storage)throw new Error('Browser storage is unavailable; the stored record could not be removed.');
        if(storage.getItem(LEARNING_STORAGE_KEY)!==baseRaw){blocked=true;return resultError('conflict','The saved record changed in another tab. Load and review it before resetting.');}
        storage.removeItem(LEARNING_STORAGE_KEY);baseRaw=null;blocked=false;return {ok:true,kind:'reset',profile:emptyLearningProfile()};
      }catch(error){return resultError('error',error);}
    },
    loadLatest:()=>{
      try{const raw=storage.getItem(LEARNING_STORAGE_KEY),profile=raw===null?emptyLearningProfile():codec.parse(raw).profile;baseRaw=raw;blocked=false;return {ok:true,kind:raw===null?'empty':'ready',profile};}catch(error){blocked=true;return resultError('blocked',error);}
    },
    checkConflict:()=>{try{if(storage.getItem(LEARNING_STORAGE_KEY)!==baseRaw){blocked=true;return true;}}catch{blocked=true;return true;}return false;},
  };
}
