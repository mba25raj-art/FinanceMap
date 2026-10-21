import scenario from '../../content/model/nila.v1.json' with {type:'json'};
export {scenario as nilaScenario};
export const PAISE_PER_LAKH=10000000;
export class ModelError extends Error{constructor(code,message,field){super(message);this.name='ModelError';this.code=code;this.field=field;}}
const reject=(code,message,field)=>{throw new ModelError(code,message,field);};
export function toPaise(value,field='amount',{zero=true}={}){
  if(typeof value!=='number'||!Number.isFinite(value)||value<0||(!zero&&value===0)||value>1000000)reject('amount',`Enter a ${zero?'non-negative':'positive'} ${field} no greater than 1,000,000 INR lakh.`,field);
  const scaled=value*PAISE_PER_LAKH,rounded=Math.round(scaled);
  if(!Number.isSafeInteger(rounded)||Math.abs(scaled-rounded)>Math.max(.00001,Math.abs(scaled)*Number.EPSILON*2))reject('precision','Use a currency amount with no fraction smaller than one paise.',field);
  return rounded;
}
export const fromPaise=amount=>amount/PAISE_PER_LAKH;
export function dateNumber(value,field='date'){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))reject('date','Use a valid date in YYYY-MM-DD format.',field);
  const ms=Date.parse(value+'T00:00:00.000Z');if(!Number.isFinite(ms)||new Date(ms).toISOString().slice(0,10)!==value)reject('date','That calendar date does not exist.',field);return ms;
}
export const daysBetween=(start,end)=>(dateNumber(end)-dateNumber(start))/86400000;
export const accountIsDebit=type=>['asset','expense','contra-equity'].includes(type);
const identity=(value,field)=>{if(typeof value!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(value))reject('identity','Use a stable letters/numbers transaction reference.',field);return value;};
const rate=(value,field)=>{if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>1)reject('rate','Use a stated rate between 0 and 100%, entered as a fraction.',field);return value;};
const kinds={
  'owner-funding':['amount'], 'inventory-purchase':['amount','cashPaid','dueDate'],
  'credit-sale':['amount','cost','dueDate'], 'collection':['amount','invoiceId'],
  'supplier-payment':['amount','payableId'], 'operating-payment':['amount','accrualId'],
  'equipment-purchase':['amount','cashPaid','dueDate','residual','lifeMonths','availableDate'],
  'equipment-payment':['amount','payableId'], 'borrowing':['amount','annualRate','maturity'],
  'debt-repayment':['amount','loanId'], 'operating-accrual':['amount'],
  'interest-payment':['amount','loanId'], 'tax-payment':['amount','taxPeriod'],
  'equity-issue':['amount','preMoney','investorId'], 'dividend':['amount'],
};
export function assertTransaction(input,config=scenario){
  if(!input||typeof input!=='object'||Array.isArray(input)||!Object.hasOwn(kinds,input.type))reject('type','Choose a supported transaction type.','type');
  const allowed=new Set(['id','type','date',...kinds[input.type]]);
  if(Object.keys(input).some(k=>!allowed.has(k)))reject('field','This transaction contains an unsupported field.','transaction');
  const output={id:identity(input.id,'id'),type:input.type,date:input.date};dateNumber(input.date);
  if(input.date<config.startDate||input.date>config.endDate)reject('date','The transaction date is outside this scenario’s reporting horizon.','date');
  output.amount=toPaise(input.amount,'amount',{zero:false});
  const laterDate=(field,required=true)=>{
    if(input[field]===undefined&&!required)return;
    dateNumber(input[field],field);if(input[field]<input.date||input[field]>config.metadataEndDate)reject('date','Settlement/use/maturity must be on or after the transaction and within the stated scenario limit.',field);output[field]=input[field];
  };
  if(['inventory-purchase','equipment-purchase'].includes(input.type)){
    output.cashPaid=toPaise(input.cashPaid,'cash payment');if(output.cashPaid>output.amount)reject('amount','The payment cannot exceed the acquisition amount.','cashPaid');laterDate('dueDate',output.cashPaid<output.amount);
  }
  if(input.type==='credit-sale'){output.cost=toPaise(input.cost,'inventory cost');laterDate('dueDate');}
  if(input.type==='equipment-purchase'){
    output.residual=toPaise(input.residual,'residual value');if(output.residual>output.amount)reject('amount','Residual value cannot exceed the asset cost.','residual');
    if(!Number.isSafeInteger(input.lifeMonths)||input.lifeMonths<1||input.lifeMonths>600)reject('life','Use a whole useful life between 1 and 600 months.','lifeMonths');output.lifeMonths=input.lifeMonths;laterDate('availableDate');
  }
  if(input.type==='borrowing'){output.annualRate=rate(input.annualRate,'annualRate');laterDate('maturity');if(input.maturity===input.date)reject('date','The stated loan maturity must follow its funding date.','maturity');}
  for(const field of ['invoiceId','payableId','loanId','investorId'])if(kinds[input.type].includes(field))output[field]=identity(input[field],field);
  if(input.type==='operating-payment'&&input.accrualId!==undefined)output.accrualId=identity(input.accrualId,'accrualId');
  if(input.type==='tax-payment'){if(typeof input.taxPeriod!=='string'||!/^\d{4}-(0[1-9]|1[0-2])$/.test(input.taxPeriod))reject('period','Choose the recorded tax period to settle.','taxPeriod');output.taxPeriod=input.taxPeriod;}
  if(input.type==='equity-issue')output.preMoney=toPaise(input.preMoney,'pre-money value',{zero:false});
  return output;
}
export function validateTransaction(input,config=scenario){try{return {ok:true,value:assertTransaction(input,config)};}catch(error){return {ok:false,error:{code:error.code||'invalid',message:error.message,field:error.field||'transaction'}};}}
