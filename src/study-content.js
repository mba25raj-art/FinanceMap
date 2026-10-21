import {createStudyLoader} from './study-loader.js';
const byDomain=modules=>Object.fromEntries(Object.entries(modules).map(([path,value])=>[path.split('/').at(-1).replace('.json',''),value]));
const loaders=byDomain(import.meta.glob('./data/study/*.json',{import:'default'}));
// SSR needs complete synchronous markup for the existing 698-page render checks.
// Vite removes this server-only branch and its pure JSON imports from the browser entry.
const initial=import.meta.env.SSR?byDomain(import.meta.glob('./data/study/*.json',{eager:true,import:'default'})):{};
export const studyContent=createStudyLoader({loaders,initial});
