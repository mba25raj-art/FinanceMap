import {lessonPackages} from './lesson-packages.js';
import {practiceRecord,lessonPracticeCounts} from './lesson-practice.js';
import {learningCounts,unfinishedCaseRuns} from './learning-session.js';
import scope from '../content/first-release-scope.json' with {type:'json'};

export function learningNextSteps({session,visited=[],packages=lessonPackages,edges=[],selectedIds=scope.concepts.map(c=>c.id)}){
  const reviews=new Map(),explored=new Set(visited),transfer=[];
  const add=(id,reason,priority)=>{
    const existing=reviews.get(id)||{conceptId:id,reasons:[],priority};
    if(!existing.reasons.includes(reason))existing.reasons.push(reason);
    existing.priority=Math.min(existing.priority,priority);reviews.set(id,existing);
  };
  for(const [id,responses] of Object.entries(session.topics)){
    if(!responses.length)continue;
    if(!responses.at(-1).correct)add(id,'Latest topic-quiz response was incorrect.',1);
    else if(!responses[0].correct)add(id,'Topic answer was corrected after an earlier mistake.',2);
  }
  for(const lesson of packages)for(const item of lesson.practice){
    const r=practiceRecord(session.lessonPractice,item),first=r.responses[0],latest=r.responses.at(-1);
    if(latest&&!latest.correct)add(lesson.conceptId,'Latest lesson-practice response was incorrect.',1);
    else if(first&&!first.correct)add(lesson.conceptId,'Lesson-practice answer was corrected after an earlier mistake.',2);
    if(r.hints.length)add(lesson.conceptId,'Help was requested on a lesson-practice question.',3);
    if(item.stage==='transfer'&&first?.correct&&!first.hinted)transfer.push({conceptId:lesson.conceptId,questionId:item.id,version:item.version});
  }
  // Only actual submitted clue responses are evidence. A reference-trail visit is not an assessment.
  const p02Concepts=['A05','A08','A11'];
  const caseEvidence=new Map();
  for(const run of session.runs.filter(r=>r.id==='P02'))for(const [i,responses] of Object.entries(run.responses)){
    if(!responses.length)continue;
    const prior=caseEvidence.get(i);caseEvidence.set(i,{first:prior?.first||responses[0],latest:responses.at(-1)});
  }
  for(const [i,r] of caseEvidence){const id=p02Concepts[Number(i)];if(!id)continue;
    if(!r.latest.correct)add(id,'Latest cash-mystery response was incorrect.',1);
    else if(!r.first.correct)add(id,'A cash-mystery response was corrected after an earlier mistake.',2);
    if(r.first.hinted)add(id,'The first cash-mystery response followed help.',3);
  }
  const order=new Map(selectedIds.map((id,i)=>[id,i]));
  const review=[...reviews.values()].sort((a,b)=>a.priority-b.priority||(order.get(a.conceptId)??9999)-(order.get(b.conceptId)??9999)||a.conceptId.localeCompare(b.conceptId));
  const optional=id=>[...new Set(edges.filter(e=>e.type==='RECOMMENDED_BEFORE'&&e.to===id).map(e=>e.from))].filter(id=>!explored.has(id));
  const unfinished=unfinishedCaseRuns(session);let next;
  if(unfinished.length){const {run,index}=unfinished.at(-1);next={kind:'resume',runIndex:index,step:run.step,title:`Resume cash mystery · run ${index+1}`,reason:`Continue clue ${run.step+1} of ${run.clues.length} with the recorded choices and hints.`,preparation:[]};}
  else if(review.length){const target=review[0];next={kind:'review',conceptId:target.conceptId,title:'Review a recorded difficulty',reason:target.reasons[0],preparation:optional(target.conceptId)};}
  else if(!session.completedCases.includes('P02'))next={kind:'brief',title:'Try the three-clue cash mystery',reason:'Apply profit and cash timing in the existing case. The brief explains the objective and optional preparation before Start.',preparation:['T04.01','T04.05','A02'].filter(id=>!explored.has(id))};
  else{
    const id=selectedIds.find(id=>!explored.has(id));
    next=id?{kind:'read',conceptId:id,title:'Explore the next selected concept',reason:'This topic is in the first-release learning sequence and has not been recorded as explored.',preparation:optional(id)}:{kind:'browse',title:'Choose another topic question',reason:'Continue through the wider atlas. Prior visits and corrected answers do not establish general mastery.',preparation:[]};
  }
  const counts=learningCounts(session),lesson=lessonPracticeCounts(session.lessonPractice);
  return {next,review,transfer,counts:{explored:explored.size,topics:counts.topicsAnswered,lessons:lesson.answered,caseClues:counts.cluesAnswered,transferQuestions:transfer.length,transferConcepts:new Set(transfer.map(t=>t.conceptId)).size}};
}
