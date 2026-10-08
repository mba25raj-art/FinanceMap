import { readFileSync, writeFileSync } from 'node:fs';
const raw=JSON.parse(readFileSync(new URL('../content/master-network.json',import.meta.url),'utf8'));
const pick=(obj,fields)=>Object.fromEntries(fields.filter(f=>obj[f]!==undefined).map(f=>[f,obj[f]]));
const lean={
  summary:raw.summary,
  nodes:raw.nodes.map(n=>pick(n,['id','title','domain','level','focus','hook','parent'])),
  domains:raw.domains.map(n=>pick(n,['id','name','number'])),
  edges:raw.edges.map(n=>pick(n,['id','from','to','type','why','conditions'])),
  journeys:raw.journeys.map(n=>pick(n,['id','name','hook','nodes']))
};
const ids=new Set([...lean.nodes,...lean.domains].map(n=>n.id));
if(lean.nodes.length!==698||lean.domains.length!==40||lean.edges.length!==2520)throw new Error('Master content counts changed: inspect the curriculum before proceeding.');
for(const e of lean.edges)if(!ids.has(e.from)||!ids.has(e.to))throw new Error(`Broken relationship ${e.id}`);
for(const j of lean.journeys)for(const id of j.nodes)if(!ids.has(id))throw new Error(`Broken journey ${j.id}: ${id}`);
writeFileSync(new URL('../src/data/network.json',import.meta.url),JSON.stringify(lean));
console.log(`Prepared ${lean.nodes.length} concepts, ${lean.edges.length} relationships, ${lean.journeys.length} journeys.`);
