const legacy = new Set(['statements', 'map', 'topics', 'missions', 'learning', 'resources']);
const labIds = new Set(['LAB-COLLECTIONS', 'LAB-EQUIPMENT', 'LAB-FINANCING']);

export function parseRoute(hash, { concepts, journeys }) {
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
    const views = { map: 'map', topics: 'topics', sources: 'resources' };
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
  if (parts[0] === 'labs' && parts.length <= 2 && (!parts[1] || labIds.has(parts[1]))) return { ...base, view: 'labs' };
  if (parts[0] === 'simulations') {
    if (parts.length === 1) return { ...base, view: 'missions', id: id(params.get('concept')) };
    if (parts.length === 2 && parts[1] === 'P02') {
      const raw = params.get('run');
      if (raw === null) return { ...base, view: 'brief', id: id(params.get('concept')) };
      if (!/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw))) return { ...base, view: 'brief', message: 'That run link is unavailable. You can start or resume below.' };
      return { ...base, view: 'missions', journeyId: 'P02', runIndex: Number(raw)-1, id: id(params.get('concept') || 'A05') };
    }
    if (parts[1] === 'CASE-NILA-HOMEWARE' && parts.length === 2) return { ...base, view: 'missions', message: 'The six-round company case is planned. Try the three-clue mystery below.' };
  }
  return recover('This destination is unavailable. Your current session record is still here.');
}

export function routeHash(view, id = 'A02', { statement = 'balance', journeyId, stop = 0, runIndex } = {}) {
  const concept = encodeURIComponent(id);
  if (view === 'atlas' || view === 'labs' || view === 'learning') return `#${view}`;
  if (view === 'statements') return `#atlas/statements/${statement}/${concept}`;
  if (view === 'resources') return `#atlas/sources/${concept}`;
  if (view === 'map' || view === 'topics') return `#atlas/${view}/${concept}`;
  if (view === 'trails') return `#atlas/trails/${encodeURIComponent(journeyId)}?stop=${stop}&concept=${concept}`;
  if (view === 'brief') return '#simulations/P02';
  if (view === 'missions') return Number.isInteger(runIndex)
    ? `#simulations/P02?run=${runIndex+1}&concept=${concept}` : '#simulations';
  return '#atlas';
}
