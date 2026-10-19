const legacy = new Set(['statements', 'map', 'topics', 'missions', 'learning', 'resources']);
const labIds = new Set(['LAB-COLLECTIONS', 'LAB-EQUIPMENT', 'LAB-FINANCING']);
const companyId='CASE-NILA-HOMEWARE',returnActivityIds=new Set([...labIds,companyId]);

function parseScreen(hash, { concepts, journeys }) {
  const base = { view: 'atlas', id: 'A02', statement: 'balance' };
  const recover = message => ({ ...base, message });
  let parts, params;
  try {
    const [path, query = ''] = hash.replace(/^#/, '').split('?');
    parts = path.split('/').filter(Boolean).map(decodeURIComponent);
    params = new URLSearchParams(query);
  } catch { return recover('This link could not be read. Choose a destination below.'); }
  if (!parts.length) return base;
  const id = candidate => concepts.has(candidate) ? candidate : 'A02';
  if (legacy.has(parts[0]) && parts.length <= 2) {
    return { ...base, view: parts[0], id: id(parts[1] || params.get('concept')) };
  }
  if (parts[0] === 'atlas') {
    if (parts.length === 1) return base;
    if (parts[1] === 'statements' && parts.length === 4 && ['balance', 'income', 'cash'].includes(parts[2]) && concepts.has(parts[3])) {
      return { ...base, view: 'statements', statement: parts[2], id: parts[3] };
    }
    const views = { map: 'map', topics: 'topics', sources: 'resources', lessons: 'lesson' };
    if (views[parts[1]] && parts.length <= 3 && (!parts[2] || concepts.has(parts[2]))) {
      return { ...base, view: views[parts[1]], id: id(parts[2]) };
    }
    if (parts[1] === 'trails' && parts.length === 3 && journeys.has(parts[2])) {
      const journey = journeys.get(parts[2]);
      const raw = params.get('stop') || '0';
      const stop = Number(raw);
      if (!/^\d+$/.test(raw) || !Number.isSafeInteger(stop) || stop >= journey.nodes.length) return recover('That reading-trail stop is unavailable.');
      return { ...base, view: 'trails', journeyId: journey.id, stop, id: id(params.get('concept') || journey.nodes[stop]) };
    }
  }
  if (parts[0] === 'labs' && parts.length <= 2 && (!parts[1] || labIds.has(parts[1]))) {
    const raw=params.get('attempt');if(raw!==null&&(!/^[1-9]\d*$/.test(raw)||!Number.isSafeInteger(Number(raw))))return {...base,view:'labs',message:'That lab run link is unavailable. Choose a lab below.'};
    return { ...base, view: 'labs',labId:parts[1],activityRun:raw===null?undefined:Number(raw)-1 };
  }
  if (parts[0] === 'simulations') {
    if (parts.length === 1) return { ...base, view: 'missions', id: id(params.get('concept')) };
    if (parts.length === 2 && parts[1] === 'P02') {
      const raw = params.get('run');
      if (raw === null) return { ...base, view: 'brief', id: id(params.get('concept')) };
      if (!/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw))) return { ...base, view: 'brief', message: 'That run link is unavailable. You can start or resume below.' };
      return { ...base, view: 'missions', journeyId: 'P02', runIndex: Number(raw)-1, id: id(params.get('concept') || 'A05') };
    }
    if(parts[1]===companyId&&parts.length===2){const raw=params.get('attempt');if(raw!==null&&(!/^[1-9]\d*$/.test(raw)||!Number.isSafeInteger(Number(raw))))return {...base,view:'missions',message:'That company record is unavailable. Open the company case below.'};return {...base,view:'company',activityRun:raw===null?undefined:Number(raw)-1};}
  }
  return recover('This destination is unavailable. Your current session record is still here.');
}

function screenHash(view, id = 'A02', { statement = 'balance', journeyId, stop = 0, runIndex,labId,activityRun } = {}) {
  const concept = encodeURIComponent(id);
  if(view==='company')return `#simulations/${companyId}${Number.isSafeInteger(activityRun)&&activityRun>=0?`?attempt=${activityRun+1}`:''}`;
  if(view==='labs')return labIds.has(labId)?`#labs/${labId}${Number.isSafeInteger(activityRun)&&activityRun>=0?`?attempt=${activityRun+1}`:''}`:'#labs';
  if (view === 'atlas' || view === 'learning') return `#${view}`;
  if (view === 'statements') return `#atlas/statements/${statement}/${concept}`;
  if (view === 'resources') return `#atlas/sources/${concept}`;
  if (view === 'lesson') return `#atlas/lessons/${concept}`;
  if (view === 'map' || view === 'topics') return `#atlas/${view}/${concept}`;
  if (view === 'trails') return `#atlas/trails/${encodeURIComponent(journeyId)}?stop=${stop}&concept=${concept}`;
  if (view === 'brief') return '#simulations/P02';
  if (view === 'missions') return Number.isInteger(runIndex)
    ? `#simulations/P02?run=${runIndex+1}&concept=${concept}` : '#simulations';
  return '#atlas';
}

export function parseRoute(hash, inventory) {
  const route = parseScreen(hash, inventory);
  const params=new URLSearchParams(hash.split('?')[1]||'');
  const returnLab=params.get('returnLab'),returnAttempt=params.get('returnAttempt');
  if(returnActivityIds.has(returnLab)&&/^[1-9]\d*$/.test(returnAttempt||'')&&Number.isSafeInteger(Number(returnAttempt))){route.returnLab=returnLab;route.returnAttempt=Number(returnAttempt)-1;}
  const raw = new URLSearchParams(hash.split('?')[1] || '').get('returnRun');
  if (raw === null) return route;
  if (!/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw))) {
    return { ...route, message: 'This return link is unavailable. Use My learning to find an existing run.' };
  }
  return { ...route, returnRun: Number(raw) - 1 };
}

export function routeHash(view, id, options = {}) {
  let hash = screenHash(view, id, options);
  if(returnActivityIds.has(options.returnLab)&&Number.isSafeInteger(options.returnAttempt)&&options.returnAttempt>=0)hash+=`${hash.includes('?')?'&':'?'}returnLab=${options.returnLab}&returnAttempt=${options.returnAttempt+1}`;
  return Number.isSafeInteger(options.returnRun) && options.returnRun >= 0
    ? `${hash}${hash.includes('?') ? '&' : '?'}returnRun=${options.returnRun + 1}` : hash;
}
