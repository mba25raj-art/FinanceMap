import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseRoute, routeHash } from '../src/routes.js';
const network=JSON.parse(readFileSync(new URL('../content/master-network.json',import.meta.url),'utf8'));
const inventory={concepts:new Set(network.nodes.map(n=>n.id)),journeys:new Map(network.journeys.map(j=>[j.id,j]))};
const parse=hash=>parseRoute(hash,inventory);

test('all six legacy views and all 698 concept IDs remain valid',()=>{
  for(const view of ['statements','map','topics','missions','learning','resources']){
    for(const {id} of network.nodes){const r=parse(`#${view}/${id}`);assert.equal(r.view,view);assert.equal(r.id,id);assert.equal(r.runIndex,undefined);}
  }
  assert.equal(parse('').view,'atlas');
  assert.equal(parse('#missions/A02').journeyId,undefined,'Legacy mission link starts a case');
});

test('canonical concepts, statements and exact master trail stops round-trip',()=>{
  for(const {id} of network.nodes){
    for(const view of ['map','topics','resources'])assert.equal(parse(routeHash(view,id)).id,id);
    for(const statement of ['balance','income','cash']){
      const r=parse(routeHash('statements',id,{statement}));assert.equal(r.id,id);assert.equal(r.statement,statement);
    }
  }
  for(const j of network.journeys)for(let stop=0;stop<j.nodes.length;stop++){
    const r=parse(routeHash('trails',j.nodes[stop],{journeyId:j.id,stop}));assert.equal(r.journeyId,j.id);assert.equal(r.stop,stop);assert.equal(r.id,j.nodes[stop]);
  }
  assert.equal(parse('#atlas/trails/P02?stop=7').view,'trails','P02 reference route becomes a simulation');
  assert.equal(parse('#atlas/trails/P02?stop=8').view,'atlas');
});

test('briefs and run links select screens without fabricating progress; invalid routes recover',()=>{
  assert.equal(parse('#simulations/P02').view,'brief');
  assert.equal(parse('#simulations/P02?run=2').runIndex,1);
  assert.equal(parse(routeHash('missions','A08',{runIndex:0})).runIndex,0);
  assert.equal(parse('#simulations/CASE-NILA-HOMEWARE').view,'missions');
  for(const raw of ['0','-1','1.5','NaN','9007199254740992'])assert.equal(parse(`#simulations/P02?run=${raw}`).view,'brief');
  for(const hash of ['#atlas/map/not-a-concept','#atlas/trails/P99','#atlas/trails/P01?stop=-1','#unknown','#atlas/map/%broken'])assert.ok(parse(hash).message);
  for(const id of ['LAB-COLLECTIONS','LAB-EQUIPMENT','LAB-FINANCING'])assert.equal(parse(`#labs/${id}`).view,'labs');
});
