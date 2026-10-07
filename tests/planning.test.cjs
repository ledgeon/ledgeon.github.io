const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html','utf8');
const context = vm.createContext({console,Date,Math,Number,String,parseFloat,parseInt,Set});
for (const name of ['startOfDay','isoDate','parseISODate','moneyValue','nextBillDate','getPaycheckPlan','incomeOccurrences']) {
 const start = html.indexOf(`function ${name}(`);
 const end = html.indexOf('\n}',start)+2;
 vm.runInContext(html.slice(start,end),context);
}
vm.runInContext(`
function todayStart(){return new Date(2026,9,6);}
function detectPayPeriodType(){return 'weekly';}
let state;
`,context);
function run(state, expr) {
 context.input=state;
 vm.runInContext('state=input',context);
 return vm.runInContext(expr,context);
}
const seed = (bills=[],cashPlan={})=>({income:[{id:'i1',source:'Work',amount:1000,receivedAt:'2026-10-06',frequency:'once'}],bills,cashPlan});
let s=seed([{id:'b1',name:'Rent',amount:1200,dueDate:'2026-11-01',recurring:'monthly'}],{nextPayDate:'2026-10-13'});
assert.equal(run(s,'getPaycheckPlan().reserve'),300);
s.cashPlan.reserves={'b1:2026-11-01':400};
assert.equal(run(s,'getPaycheckPlan().reserve'),200);
assert.equal(run(s,'getPaycheckPlan().left'),800);
s=seed([{id:'b1',amount:200,dueDate:'2026-10-13',recurring:'monthly'}],{nextPayDate:'2026-10-13'});
assert.equal(run(s,'getPaycheckPlan().reserve'),200,'same-day bill funded before payday');
s=seed([{id:'b1',amount:100,dueDate:'2026-10-07',recurring:'weekly'}],{nextPayDate:'2026-11-06',cadence:'monthly'});
assert.equal(run(s,'getPaycheckPlan().reserve'),500,'all weekly bills before next monthly paycheck');
s=seed([{id:'b1',amount:100,dueDate:'2026-09-06',recurring:'monthly'}],{nextPayDate:'2026-10-13'});
assert.equal(run(s,'getPaycheckPlan().reserve'),200,'overdue installment retained alongside current bill');
s=seed([{id:'b1',amount:100,recurring:'monthly'}]);
assert.equal(run(s,'getPaycheckPlan().reserve'),100,'undated bill fully reserved');
s=seed([{id:'b1',amount:100,recurring:'once',paid:true}]);
assert.equal(run(s,'getPaycheckPlan().reserve'),0);
s=seed([],{paycheckId:'old',paycheckAmount:42});
assert.equal(run(s,'getPaycheckPlan().available'),1000,'old override not applied to new paycheck');
s.income.push({id:'future',amount:5000,receivedAt:'2026-10-30'});
assert.equal(run(s,'getPaycheckPlan().check.id'),'i1');
assert.equal(run(seed(),'isoDate(nextBillDate(new Date(2026,0,31),"monthly",31))'),'2026-02-28');
assert.equal(run(seed(),'isoDate(nextBillDate(new Date(2026,1,28),"monthly",31))'),'2026-03-31');
// Verify the actual monthly-average source block, including months without a paycheck.
const avgStart=html.indexOf('  const monthStart =',html.indexOf('function renderSourceDetail'));
const avgEnd=html.indexOf('  const avgPaycheck',avgStart);
const average=vm.runInContext('(entries)=>{'+html.slice(avgStart,avgEnd)+'return avgMonthlyTakeHome;}',context);
assert.equal(average([{amount:1000,receivedAt:'2026-07-01',frequency:'once'},{amount:500,receivedAt:'2026-09-15',frequency:'once'},{amount:9000,receivedAt:'2026-10-01',frequency:'once'}]),500);
assert.equal(average([{amount:1000,receivedAt:'2026-10-01',frequency:'once'}]),null);
console.log('Planning checks passed: allocation, savings, overdue and repeated bills, new checks, month-end dates, source averages.');
const actionStart=html.indexOf("  if (act === 'pay-bill' || act === 'roll-bill')");
const actionEnd=html.indexOf("  if (act === 'toggle-menu')",actionStart);
vm.runInContext(`function nextId(){return 'pm'+(state.payments.length+1)}; function saveState(){}; function render(){}; function openModal(){}; function alert(msg){throw Error(msg)}; function confirm(){return true}`,context);
const action=vm.runInContext('(act,btn)=>{'+html.slice(actionStart,actionEnd)+'}',context);
s=seed([{id:'b1',name:'Rent',amount:100,dueDate:'2026-01-31',recurring:'monthly'}]); s.payments=[];
run(s,'state');
action('pay-bill',{dataset:{id:'b1'}});
assert.equal(s.bills[0].dueDate,'2026-02-28');
assert.equal(s.payments.length,1);
action('undo-bill',{dataset:{id:'pm1'}});
assert.equal(s.bills[0].dueDate,'2026-01-31');
assert.equal(s.payments.length,0);
action('roll-bill',{dataset:{id:'b1'}});
assert.equal(s.bills[0].dueDate,'2026-10-31');
assert.equal(s.payments.length,0,'schedule change does not fabricate payments');
console.log('Payment checks passed: record, advance, undo, and explicitly skip old schedule.');
