import {useCallback,useEffect,useRef,useState} from 'react';
import {createLearningStorage,emptyLearningProfile,LEARNING_STORAGE_KEY,MAX_SAVE_BYTES} from './learning-save.js';
import {focusContent} from './activity-accessibility.js';

function browserStorage(){try{return window.localStorage||null;}catch{return null;}}
function download(text,name){
  const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0);
}

function Confirmation({kind,preview,onConfirm,onCancel}){
  const ref=useRef(null),cancel=useRef(null);
  useEffect(()=>{const previous=document.activeElement;ref.current.showModal();cancel.current.focus();return()=>{ref.current?.close();if(previous?.isConnected)previous.focus();};},[]);
  const reset=kind==='reset',importing=kind==='import';
  return <dialog ref={ref} className="lesson-hint-dialog" aria-labelledby="record-confirm-title" onCancel={e=>{e.preventDefault();onCancel();}}>
    <h2 id="record-confirm-title">{reset?'Reset this browser’s learning record?':importing?'Replace with this imported record?':'Load the latest saved record?'}</h2>
    <p>{reset?'This deletes saved concepts, attempts, hints and activity records from this browser and clears the open learning record. Downloaded backups and unrelated site data stay intact.':'This replaces the record currently open on this page. Export a backup first if you want to retain its changes. Records are replaced, not merged.'}</p>
    {preview&&<p>{preview.bookmarks.length} saved concepts, {Object.keys(preview.session.topics).length} topic quizzes with attempts, {Object.keys(preview.session.lessonPractice).length} lesson-practice records and {preview.session.runs.length} case runs in the import.</p>}
    <div className="hint-actions"><button className="primary" onClick={onConfirm}>{reset?'Delete local learning record':importing?'Replace this browser’s learning record':'Load latest and replace open changes'}</button><button className="secondary" ref={cancel} onClick={onCancel}>Cancel</button></div>
  </dialog>;
}

function LearningSaveControls({codec,status,onExport,onOriginal,onImport,onReset,onLatest,hasOriginal}){
  const [pending,setPending]=useState(null),[error,setError]=useState('');const request=useRef(0);
  async function selectFile(event){
    const file=event.target.files?.[0];event.target.value='';const token=++request.current;setPending(null);setError('');if(!file)return;
    try{if(file.size>MAX_SAVE_BYTES)throw new Error('Choose a JSON backup no larger than 5 MiB.');const raw=await file.text();if(token!==request.current)return;const parsed=codec.parse(raw);setPending({kind:'import',raw,preview:parsed.profile});}
    catch(e){if(token===request.current)setError(e.message);}
  }
  function confirm(){
    const result=pending.kind==='reset'?onReset():pending.kind==='import'?onImport(pending.raw):onLatest();
    if(result.ok){setPending(null);setError('');}else{setError(result.message);setPending(null);}
  }
  return <section className="learning-save-controls" aria-labelledby="local-record-title">
    <h2 id="local-record-title">Local learning record</h2>
    <p>Keep learning in this browser, or download a JSON backup to import later. No account or cloud sync. Clearing this site’s data or private browsing can remove local saves.</p>
    <p role="status">{status.message}{status.kind==='saved'&&status.savedAt&&` Saved ${new Date(status.savedAt).toLocaleString()}.`}</p>
    <div className="record-actions"><button className="secondary" onClick={onExport}>Export learning backup</button><label className="record-import">Import JSON backup<input type="file" accept="application/json,.json" onChange={selectFile}/></label><button className="text-button" onClick={()=>setPending({kind:'reset'})}>Reset local learning record</button></div>
    {['conflict','blocked','error'].includes(status.kind)&&<div className="record-actions"><button className="secondary" onClick={()=>setPending({kind:'latest'})}>Review and load latest saved record</button>{hasOriginal&&<button className="text-button" onClick={onOriginal}>Download original stored record</button>}</div>}
    {error&&<p role="alert">{error} The current learning record was not replaced.</p>}
    {pending&&<Confirmation key={pending.kind} {...pending} onConfirm={confirm} onCancel={()=>setPending(null)}/>}
  </section>;
}

export default function LearningRecord({codec,children,controlled=false}){
  const [storage]=useState(()=>createLearningStorage(controlled?null:browserStorage(),codec));
  const [restored,setRestored]=useState(storage.initial.profile),[epoch,setEpoch]=useState(0);
  const messageFor=kind=>kind==='reset'?'Local learning record cleared. New learning will start a new record.':kind==='empty'?'Learning will save in this browser after your next learning action.':kind==='ready'?'Your validated learning record is restored in this browser.':'Learning saved in this browser.';
  const [status,setStatus]=useState(()=>({...storage.initial,message:storage.initial.message||messageFor(storage.initial.kind)}));
  const live=useRef(restored),previous=useRef(JSON.stringify(restored));
  const onChange=useCallback(profile=>{
    live.current=profile;const serial=JSON.stringify(profile);if(serial===previous.current)return;previous.current=serial;
    const result=storage.save(profile);setStatus({...result,message:result.message||messageFor(result.kind)});
  },[storage]);
  useEffect(()=>{const changed=event=>{if((event.key===LEARNING_STORAGE_KEY||event.key===null)&&storage.checkConflict())setStatus({kind:'conflict',message:'Another tab changed the saved record. Current changes are in memory; export them or load the latest record.'});};window.addEventListener('storage',changed);return()=>window.removeEventListener('storage',changed);},[storage]);
  function replace(result,reset=false){
    if(!result.ok){setStatus({...result});return result;}
    live.current=result.profile;previous.current=JSON.stringify(result.profile);setRestored(result.profile);setEpoch(n=>n+1);setStatus({...result,message:messageFor(result.kind)});
    window.history.replaceState({},'',reset?'#atlas':'#learning');
    requestAnimationFrame(()=>focusContent(document.querySelector(reset?'.brand':'.learning-main'),{preventScroll:true}));return result;
  }
  function exportCurrent(){try{download(JSON.stringify(codec.encode(live.current),null,2),`Finance_Atlas_Learning_${new Date().toISOString().slice(0,10)}.json`);}catch(e){setStatus({kind:'error',message:`Export failed: ${e.message}`});}}
  const controls=<LearningSaveControls codec={codec} status={status} hasOriginal={storage.raw()!==null} onExport={exportCurrent} onOriginal={()=>download(storage.raw()||'',`Finance_Atlas_Recovery_${new Date().toISOString().slice(0,10)}.json`)} onImport={raw=>replace(storage.importRecord(raw,true))} onReset={()=>replace(storage.reset(true),true)} onLatest={()=>replace(storage.loadLatest())}/>;
  const local=['empty','ready','saved','reset'].includes(status.kind);
  const retention=local?'Learning is saved locally in this browser when storage is available. Export a backup in My learning; clearing site data removes local records.':`Current changes remain in memory. ${status.message} Export a backup in My learning before leaving.`;
  return children({restored,epoch,onChange,controls,retention,notice:local?null:retention});
}
