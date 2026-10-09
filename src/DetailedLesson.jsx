export default function DetailedLesson({detail,domainName}) {
  if(!detail) return null;
  return <div className="detailed-lesson">
    <section><h3>{domainName?'How '+domainName+' fits together':'Understand the mechanism'}</h3>{detail.explanation.map((p,i)=><p key={i}>{p}</p>)}</section>
    <section><h3>{domainName?'Methods and distinctions in this area':'Types and important distinctions'}</h3><dl>{detail.types.map(t=><div key={t.name}><dt>{t.name}</dt><dd>{t.explanation}</dd></div>)}</dl></section>
    <section className="worked-case"><span className="eyebrow">{domainName?'BROADER DOMAIN CASE · ILLUSTRATIVE':'TOPIC CASE · ILLUSTRATIVE'}</span><h3>Work through it step by step</h3><p>{detail.workedCase.setup}</p><ol>{detail.workedCase.steps.map((s,i)=><li key={i}>{s}</li>)}</ol><p className="case-result"><strong>Result: </strong>{detail.workedCase.result}</p><p>{detail.workedCase.interpretation}</p></section>
    <section><h3>{domainName?'Analyse this area':'Apply the concept'}</h3><ol>{detail.analysis.map((s,i)=><li key={i}>{s}</li>)}</ol></section>
  </div>;
}
