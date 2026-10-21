import {useEffect,useState} from 'react';
import DetailedLesson from './DetailedLesson.jsx';
import {studyContent} from './study-content.js';
export default function DeferredStudy({domainId,topicId,domainName}){
 const [attempt,setAttempt]=useState(0),[state,setState]=useState(()=>({domainId,bundle:studyContent.peek(domainId)}));
 const current=state.domainId===domainId?state:{domainId,bundle:studyContent.peek(domainId)},detail=topicId?current.bundle?.details[topicId]:current.bundle?.guide;
 useEffect(()=>{let active=true;if(studyContent.peek(domainId)){setState({domainId,bundle:studyContent.peek(domainId)});return;}
  setState({domainId});studyContent.load(domainId).then(bundle=>{if(active)setState({domainId,bundle});},()=>{if(active)setState({domainId,error:true});});return()=>{active=false;};
 },[domainId,attempt]);
 if(detail)return <DetailedLesson detail={detail} domainName={domainName}/>;
 const label=topicId?'topic lesson':'area study guide';
 return <section className="study-loading" aria-busy={!current.error} aria-label={`Full ${label}`}>
  {current.error?<><p role="alert">The full {label} could not be loaded. Your learning record is kept.</p><button className="secondary" onClick={()=>setAttempt(n=>n+1)}>Retry {label}</button><p className="small muted">If retry still fails after an update, export a backup in My learning before reloading this page.</p></>:<p role="status">Loading the full {label}… You can keep your place while it loads.</p>}
 </section>;
}
