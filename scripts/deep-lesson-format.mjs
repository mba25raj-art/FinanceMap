export function parseDeepLessons(text) {
  const result = {};
  for (const line of text.split(/\r?\n/).filter(s => s.trim() && !s.startsWith('#'))) {
    const cells = line.split('|').map(s => s.trim());
    if (cells.length !== 5) throw new Error('Deep lesson needs ID, explanation, types, case, analysis: ' + cells[0]);
    const [id, explanation, categories, workedCase, analysis] = cells;
    const types = categories.split(';;').map(s => { const i = s.indexOf(':'); if(i<1) throw new Error('Missing type definition: '+id); return {name:s.slice(0,i).trim(),explanation:s.slice(i+1).trim()}; });
    const parts = workedCase.split('~~').map(s=>s.trim());
    if(parts.length<4) throw new Error('Worked case needs setup, steps, result and interpretation: '+id);
    if(result[id]) throw new Error('Duplicate deep lesson '+id);
    result[id] = {explanation:explanation.split('~~').map(s=>s.trim()),types,workedCase:{setup:parts[0],steps:parts[1].split(';;').map(s=>s.trim()),result:parts[2],interpretation:parts.slice(3).join(' ')},analysis:analysis.split(';;').map(s=>s.trim())};
  }
  return result;
}
