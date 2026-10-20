const isDetail=d=>d&&Array.isArray(d.explanation)&&Array.isArray(d.types)&&d.workedCase&&Array.isArray(d.workedCase.steps)&&Array.isArray(d.analysis);
export function createStudyLoader({loaders,initial={}}){
 const cache=new Map(),pending=new Map();
 function validate(domain,bundle){
  if(bundle?.domain!==domain||!isDetail(bundle.guide)||!bundle.details||!Object.keys(bundle.details).length||!Object.values(bundle.details).every(isDetail))throw new Error('Unsupported study material.');
  return bundle;
 }
 for(const [domain,bundle] of Object.entries(initial))cache.set(domain,validate(domain,bundle));
 return {
  peek:domain=>cache.get(domain),
  load(domain){
   if(cache.has(domain))return Promise.resolve(cache.get(domain));
   if(pending.has(domain))return pending.get(domain);
   if(!loaders[domain])return Promise.reject(new Error('That study area is unavailable.'));
   const request=Promise.resolve().then(()=>loaders[domain]()).then(bundle=>{const checked=validate(domain,bundle);cache.set(domain,checked);pending.delete(domain);return checked;},error=>{pending.delete(domain);throw error;}).catch(error=>{pending.delete(domain);throw error;});
   pending.set(domain,request);return request;
  },
 };
}
