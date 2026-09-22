/* ORBIT Query explorer: build questions visually, get tables/charts/CSV, save & share */
const QDS = {
  items:{label:'Items & stock levels',noun:'items',rows:()=>DB.items,fields:()=>{ const c=calc(); return [
    F('sku','SKU','text',i=>i.sku),F('name','Description','text',i=>i.name),F('type','Type','enum',i=>i.type),F('category','Category','enum',i=>i.category),F('abc','ABC class','enum',i=>i.abc),F('vendor','Vendor','enum',i=>vName(i.vendorId)||'(made in-house)'),F('loc','Home bin','enum',i=>i.defaultLoc),F('uom','UoM','enum',i=>i.uom),
    F('onHand','On hand','num',i=>c[i.id].onHand),F('alloc','Allocated','num',i=>c[i.id].alloc),F('avail','Available','num',i=>c[i.id].avail),F('onOrder','On order','num',i=>c[i.id].onOrder),F('rop','Reorder point','num',i=>i.reorderPoint),F('roq','Reorder qty','num',i=>i.reorderQty),
    F('status','Stock status','enum',i=>c[i.id].status),F('used30','Used last 30d','num',i=>c[i.id].used30),F('used90','Used last 90d','num',i=>c[i.id].used90),F('dos','Days of supply','num',i=>c[i.id].dos==null?null:c[i.id].dos),F('idle','Days since last move','num',i=>c[i.id].idle),
    F('cost','Unit cost','num',i=>i.cost,true),F('price','List price','num',i=>i.price,true),F('value','Stock value','num',i=>c[i.id].value,true),F('lot','Lot tracked','enum',i=>i.lotTracked?'Yes':'No'),F('lastCount','Last counted','date',i=>i.lastCount)]; },
    cols:['sku','name','type','onHand','avail','onOrder','rop','status','value'], open:r=>openItem(r.id)},
  stock:{label:'Stock by bin & lot',noun:'stock rows',rows:()=>DB.stock,fields:()=>[
    F('sku','SKU','text',s=>item(s.itemId).sku),F('name','Description','text',s=>item(s.itemId).name),F('type','Type','enum',s=>item(s.itemId).type),F('category','Category','enum',s=>item(s.itemId).category),F('wh','Warehouse','enum',s=>(DB.locations.find(l=>l.code===s.loc)||{}).wh),F('loc','Bin','enum',s=>s.loc),F('lot','Lot','text',s=>s.lot||''),
    F('qty','Qty','num',s=>s.qty),F('received','Received','date',s=>s.received),F('age','Age (days)','num',s=>Math.round((Date.now()-new Date(s.received))/DAY)),F('value','Value','num',s=>round(s.qty*item(s.itemId).cost,2),true)],
    cols:['sku','name','loc','lot','qty','received','age','value'], open:r=>openItem(r.itemId)},
  moves:{label:'Stock movements (history)',noun:'movements',rows:()=>DB.txns,fields:()=>[
    F('ts','Date','date',t=>t.ts),F('type','Movement type','enum',t=>t.type),F('dir','Direction','enum',t=>t.qty>0?'In':'Out'),F('sku','SKU','text',t=>item(t.itemId).sku),F('name','Description','text',t=>item(t.itemId).name),F('itype','Item type','enum',t=>item(t.itemId).type),F('category','Category','enum',t=>item(t.itemId).category),
    F('qty','Qty (signed)','num',t=>t.qty),F('absQty','Qty','num',t=>Math.abs(t.qty)),F('value','Value (signed)','num',t=>round(t.qty*item(t.itemId).cost,2),true),F('absValue','Value','num',t=>round(Math.abs(t.qty)*item(t.itemId).cost,2),true),
    F('loc','Bin','enum',t=>t.loc),F('lot','Lot','text',t=>t.lot),F('ref','Reference','text',t=>t.ref),F('user','User','enum',t=>t.user),F('note','Note','text',t=>t.note)],
    cols:['ts','type','sku','name','qty','absValue','loc','ref','user'], open:r=>openItem(r.itemId)},
  polines:{label:'Purchase order lines',noun:'PO lines',rows:()=>DB.pos.flatMap(p=>p.lines.map(l=>({...l,po:p}))),fields:()=>[
    F('num','PO','text',r=>r.po.num),F('vendor','Vendor','enum',r=>vendor(r.po.vendorId).name),F('status','PO status','enum',r=>r.po.status),F('ordered','Ordered','date',r=>r.po.ordered),F('due','Due','date',r=>r.po.due),F('late','Days late','num',r=>OPEN_PO.includes(r.po.status)?Math.max(0,-daysFrom(r.po.due)):0),
    F('sku','SKU','text',r=>item(r.itemId).sku),F('name','Description','text',r=>item(r.itemId).name),F('category','Category','enum',r=>item(r.itemId).category),F('qty','Qty ordered','num',r=>r.qty),F('received','Qty received','num',r=>r.received),F('open','Qty open','num',r=>Math.max(0,r.qty-r.received)),
    F('cost','Unit cost','num',r=>r.cost,true),F('ext','Line total','num',r=>round(r.qty*r.cost,2),true),F('openVal','Open value','num',r=>OPEN_PO.includes(r.po.status)?round(Math.max(0,r.qty-r.received)*r.cost,2):0,true),F('rcvVal','Received value','num',r=>round(r.received*r.cost,2),true)],
    cols:['num','vendor','status','due','late','sku','qty','received','open','openVal'], open:r=>openPO(r.po.id)},
  solines:{label:'Sales order lines',noun:'SO lines',rows:()=>DB.sos.flatMap(s=>s.lines.map(l=>({...l,so:s}))),fields:()=>[
    F('num','SO','text',r=>r.so.num),F('customer','Customer','enum',r=>customer(r.so.customerId).name),F('status','SO status','enum',r=>r.so.status),F('ordered','Ordered','date',r=>r.so.ordered),F('due','Ship by','date',r=>r.so.due),F('late','Days late','num',r=>OPEN_SO.includes(r.so.status)?Math.max(0,-daysFrom(r.so.due)):0),
    F('sku','SKU','text',r=>item(r.itemId).sku),F('name','Description','text',r=>item(r.itemId).name),F('category','Category','enum',r=>item(r.itemId).category),F('qty','Qty ordered','num',r=>r.qty),F('shipped','Qty shipped','num',r=>r.shipped),F('open','Qty open','num',r=>Math.max(0,r.qty-r.shipped)),
    F('price','Unit price','num',r=>r.price,true),F('ext','Line total','num',r=>round(r.qty*r.price,2),true),F('openVal','Open value','num',r=>OPEN_SO.includes(r.so.status)?round((r.qty-r.shipped)*r.price,2):0,true),F('margin','Line margin $','num',r=>round(r.qty*(r.price-item(r.itemId).cost),2),true),F('marginPct','Margin %','num',r=>round(100*(1-item(r.itemId).cost/r.price),1))],
    cols:['num','customer','status','due','sku','qty','shipped','open','ext'], open:r=>openSO(r.so.id)},
  wos:{label:'Work orders',noun:'work orders',rows:()=>DB.wos,fields:()=>[
    F('num','WO','text',w=>w.num),F('sku','Item','text',w=>item(w.itemId).sku),F('name','Description','text',w=>item(w.itemId).name),F('type','Item type','enum',w=>item(w.itemId).type),F('status','Status','enum',w=>w.status),F('created','Created','date',w=>w.created),F('due','Due','date',w=>w.due),
    F('qty','Qty','num',w=>w.qty),F('done','Completed','num',w=>w.done),F('rem','Remaining','num',w=>w.qty-w.done),F('labor','Labor logged (h)','num',w=>w.laborHrs),F('estLabor','Est. labor (h)','num',w=>round((bomOf(w.itemId)||{labor:0}).labor*w.qty,2)),F('so','Sales order','text',w=>w.soRef),F('value','Std value','num',w=>round(w.qty*item(w.itemId).cost,2),true)],
    cols:['num','sku','name','status','qty','done','due','so'], open:r=>openWO(r.id)}
};
function F(k,label,type,get,money){ return {k,label,type,get,money:!!money}; }
const OPS = {
  text:[['contains','contains'],['is','is'],['not','is not'],['starts','starts with'],['empty','is empty'],['notempty','is not empty']],
  enum:[['in','is any of'],['notin','is none of']],
  num:[['gt','>'],['gte','≥'],['lt','<'],['lte','≤'],['eq','='],['neq','≠'],['between','between'],['ltf','< field'],['gtf','> field']],
  date:[['last','in the last N days'],['next','in the next N days'],['before','before'],['after','after'],['between','between']]
};
const AGG = [['count','Count of rows'],['sum','Sum of'],['avg','Average of'],['min','Min of'],['max','Max of']];
const BUCKETS = [['day','Day'],['week','Week'],['month','Month']];
const STARTERS = [
  {name:'What needs reordering?',desc:'Items at or below their reorder point',spec:{ds:'items',filters:[{f:'status',op:'in',v:'Reorder,Short'}],cols:['sku','name','vendor','avail','onOrder','rop','used30','status']}},
  {name:'Inventory value by category',desc:'Where the money sits on the shelf',spec:{ds:'items',group:'category',aggs:[{fn:'sum',f:'value'},{fn:'count'}],sort:{k:'agg0',dir:-1}}},
  {name:'Top 10 consumed, last 30 days',desc:'Biggest movers by value issued/shipped',spec:{ds:'moves',filters:[{f:'dir',op:'in',v:'Out'},{f:'type',op:'in',v:'ISSUE,SHIP,CONSUME'},{f:'ts',op:'last',v:'30'}],group:'sku',aggs:[{fn:'sum',f:'absValue'},{fn:'sum',f:'absQty'},{fn:'count'}],sort:{k:'agg0',dir:-1},limit:10}},
  {name:'Slow / dead stock',desc:'On hand but untouched 30+ days',spec:{ds:'items',filters:[{f:'idle',op:'gte',v:'30'},{f:'onHand',op:'gt',v:'0'}],cols:['sku','name','onHand','value','idle','lastCount'],sort:{k:'value',dir:-1}}},
  {name:'Late purchase order lines',desc:'Open lines past their due date',spec:{ds:'polines',filters:[{f:'late',op:'gt',v:'0'}],cols:['num','vendor','due','late','sku','open','openVal'],sort:{k:'late',dir:-1}}},
  {name:'Open sales by customer',desc:'Backlog value per customer',spec:{ds:'solines',filters:[{f:'open',op:'gt',v:'0'},{f:'status',op:'in',v:'Open,Partial'}],group:'customer',aggs:[{fn:'sum',f:'openVal'},{fn:'sum',f:'open'}],sort:{k:'agg0',dir:-1}}},
  {name:'Monthly usage value',desc:'Consumption trend over time',spec:{ds:'moves',filters:[{f:'dir',op:'in',v:'Out'}],group:'ts',bucket:'month',aggs:[{fn:'sum',f:'absValue'},{fn:'count'}],sort:{k:'key',dir:1}}},
  {name:'Cycle count variances',desc:'Adjustments from counts, last 90 days',spec:{ds:'moves',filters:[{f:'type',op:'in',v:'COUNT'},{f:'ts',op:'last',v:'90'}],cols:['ts','sku','name','qty','value','loc','user','note'],sort:{k:'ts',dir:-1}}},
  {name:'Oldest stock lots',desc:'Lots on the shelf 45+ days',spec:{ds:'stock',filters:[{f:'age',op:'gt',v:'45'},{f:'lot',op:'notempty'}],sort:{k:'age',dir:-1}}},
  {name:'Below-reorder items by vendor',desc:'Who to call today',spec:{ds:'items',filters:[{f:'avail',op:'ltf',v:'rop'}],group:'vendor',aggs:[{fn:'count'},{fn:'sum',f:'value'}],sort:{k:'agg0',dir:-1}}}
];
let QSPEC = null;
const blankSpec = ds => ({ds, match:'all', filters:[], group:'', bucket:'month', aggs:[{fn:'count'}], sort:null, limit:'', cols:QDS[ds].cols.slice(), chart:true});
function normSpec(s){ const b=blankSpec(s.ds||'items'); return {...b,...JSON.parse(JSON.stringify(s)),aggs:(s.aggs&&s.aggs.length)?s.aggs:b.aggs,cols:s.cols||b.cols}; }

function evalFilter(fl,fields,r){
  const f=fields.find(x=>x.k===fl.f); if(!f) return true; const v=f.get(r); const a=fl.v, b=fl.v2;
  switch(fl.op){
    case 'contains': return String(v??'').toLowerCase().includes(String(a??'').toLowerCase());
    case 'is': return String(v??'').toLowerCase()===String(a??'').toLowerCase();
    case 'not': return String(v??'').toLowerCase()!==String(a??'').toLowerCase();
    case 'starts': return String(v??'').toLowerCase().startsWith(String(a??'').toLowerCase());
    case 'empty': return v==null||v==='';
    case 'notempty': return !(v==null||v==='');
    case 'in': { const s=String(a||'').split(',').map(x=>x.trim()).filter(Boolean); return !s.length||s.includes(String(v)); }
    case 'notin': { const s=String(a||'').split(',').map(x=>x.trim()).filter(Boolean); return !s.includes(String(v)); }
    case 'gt': return a===''||a==null?true: v!=null&&+v>+a; case 'gte': return a===''||a==null?true: v!=null&&+v>=+a;
    case 'lt': return a===''||a==null?true: v!=null&&+v<+a; case 'lte': return a===''||a==null?true: v!=null&&+v<=+a;
    case 'eq': return a===''||a==null?true: +v===+a; case 'neq': return a===''||a==null?true: +v!==+a;
    case 'between': if(f.type==='date'){ const t=new Date(v).getTime(); return (!a||t>=new Date(a).getTime())&&(!b||t<=new Date(b).getTime()+DAY); } return v!=null&&(a===''||+v>=+a)&&(b===''||b==null||+v<=+b);
    case 'ltf': case 'gtf': { const g=fields.find(x=>x.k===a); if(!g) return true; const w=g.get(r); return fl.op==='ltf'? +v<+w : +v>+w; }
    case 'last': return a===''?true: new Date(v).getTime()>=Date.now()-(+a)*DAY && new Date(v).getTime()<=Date.now()+DAY;
    case 'next': return a===''?true: new Date(v).getTime()>=Date.now()-DAY && new Date(v).getTime()<=Date.now()+(+a)*DAY;
    case 'before': return !a||new Date(v)<new Date(a); case 'after': return !a||new Date(v)>new Date(a);
  } return true;
}
function bucketKey(iso,b){ const d=new Date(iso); if(b==='day') return isoDate(d.toISOString()); if(b==='month') return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); const m=new Date(d); m.setDate(d.getDate()-((d.getDay()+6)%7)); return 'Wk of '+isoDate(m.toISOString()); }
function runQuery(spec){
  const ds=QDS[spec.ds], fields=ds.fields(); let rows=ds.rows();
  const fl=spec.filters.filter(f=>f.f);
  if(fl.length) rows=rows.filter(r=> spec.match==='any'? fl.some(f=>evalFilter(f,fields,r)) : fl.every(f=>evalFilter(f,fields,r)));
  if(!spec.group){ return {grouped:false,rows,fields,matched:rows.length}; }
  const g=fields.find(x=>x.k===spec.group); const map=new Map();
  rows.forEach(r=>{ let k=g.get(r); if(g.type==='date') k=bucketKey(k,spec.bucket); k=k==null||k===''?'(blank)':k; if(!map.has(k)) map.set(k,[]); map.get(k).push(r); });
  const out=[...map.entries()].map(([k,rs])=>{ const o={key:k,_rows:rs}; spec.aggs.forEach((a,i)=>{ const f=fields.find(x=>x.k===a.f); const vals=a.fn==='count'?[]:rs.map(r=>+f.get(r)).filter(v=>!isNaN(v)); o['agg'+i]= a.fn==='count'?rs.length : a.fn==='sum'?round(vals.reduce((x,y)=>x+y,0),2) : a.fn==='avg'?(vals.length?round(vals.reduce((x,y)=>x+y,0)/vals.length,2):0) : a.fn==='min'?Math.min(...vals) : Math.max(...vals); }); return o; });
  return {grouped:true,rows:out,fields,matched:rows.length,gfield:g};
}
const aggLabel=(a,fields)=> a.fn==='count'?'Count':(AGG.find(x=>x[0]===a.fn)[1].replace(' of','')+' '+((fields.find(f=>f.k===a.f)||{}).label||'?').toLowerCase());
function sentence(spec){
  const ds=QDS[spec.ds], fields=ds.fields(); const b=s=>`<b>${esc(s)}</b>`;
  let s=`Show ${b(ds.label.toLowerCase())}`;
  const fl=spec.filters.filter(f=>f.f);
  if(fl.length) s+=' where '+fl.map(f=>{ const fd=fields.find(x=>x.k===f.f)||{label:f.f,type:'text'}; const op=(OPS[fd.type]||[]).find(o=>o[0]===f.op)||['',f.op]; let v=f.v;
    if(f.op==='ltf'||f.op==='gtf') v=(fields.find(x=>x.k===f.v)||{}).label; if(f.op==='between') v=`${f.v||'…'} and ${f.v2||'…'}`; if(['empty','notempty'].includes(f.op)) v=''; if(f.op==='last'||f.op==='next') return `${b(fd.label)} is ${op[1].replace('N',f.v||'N')}`;
    return `${b(fd.label)} ${esc(op[1].replace(' field',''))} ${v!==''&&v!=null?b(v):''}`; }).join(spec.match==='any'?' <i>or</i> ':' and ');
  if(spec.group){ const g=fields.find(x=>x.k===spec.group); s+=`, grouped by ${b(g.label+(g.type==='date'?' ('+spec.bucket+')':''))}, showing ${spec.aggs.map(a=>b(aggLabel(a,fields))).join(', ')}`; }
  if(spec.sort&&spec.sort.k){ const lbl=spec.sort.k==='key'?(fields.find(x=>x.k===spec.group)||{}).label:spec.sort.k.startsWith('agg')?aggLabel(spec.aggs[+spec.sort.k.slice(3)]||{fn:'count'},fields):(fields.find(x=>x.k===spec.sort.k)||{}).label; if(lbl) s+=`, sorted by ${b(lbl)} ${spec.sort.dir<0?'high → low':'low → high'}`; }
  if(spec.limit) s+=`, top ${b(spec.limit)}`;
  return s+'.';
}

V.query = el => {
  if(PARAMS.q){ try{ QSPEC=normSpec(JSON.parse(decodeURIComponent(escape(atob(PARAMS.q))))); }catch(e){} delete PARAMS.q; history.replaceState(null,'','#/query'); }
  if(!QSPEC) QSPEC=normSpec(STARTERS[0].spec);
  el.innerHTML = pageHead('Query explorer','Ask anything about your inventory and orders. Filter, group, total, chart and export — no report writer, no SQL.',`<button class="btn" id="qshare">Copy link</button><button class="btn" id="qsave">${ic('save')}Save query</button>`)+`
    <div class="qx">
      <div class="card qx-side"><div class="card-b" id="builder"></div></div>
      <div class="stack">
        <div class="card"><form class="ask" id="ask" onsubmit="return false"><input class="in" name="q" placeholder='Quick ask: "late POs", "value by category", "what did we use most", "PA100 history"…'><button class="btn pri">${ic('search')}Ask</button></form>
          <div class="sentence" id="sent"></div><div id="qchart"></div><div id="qres"></div></div>
        <div class="card"><div class="card-h"><h3>Starter questions</h3><span class="r muted small">click one to load it, then tweak</span></div><div class="card-b"><div class="starter" id="starters"></div></div></div>
        <div class="card" id="savedCard"></div>
      </div>
    </div>`;
  $('#starters',el).innerHTML=STARTERS.map((s,i)=>`<button data-s="${i}">${esc(s.name)}<small>${esc(s.desc)}</small></button>`).join('');
  $$('[data-s]',el).forEach(b=>b.onclick=()=>{ QSPEC=normSpec(STARTERS[+b.dataset.s].spec); drawBuilder(); runAndShow(); window.scrollTo({top:0,behavior:'smooth'}); });
  $('#qsave',el).onclick=()=>modal({title:'Save query',body:`<label class="f"><span>Name</span><input class="in" name="n" placeholder="e.g. Monday reorder check"></label><p class="muted small">${sentence(QSPEC)}</p>`,actions:[{label:'Cancel'},{label:'Save',pri:true,onClick:(d,f)=>{ if(!d.n) return fieldErr(f,'Name it'); (DB.savedQueries=DB.savedQueries||[]).push({id:'Q'+Date.now(),name:d.n,spec:JSON.parse(JSON.stringify(QSPEC)),ts:new Date().toISOString()}); save(); drawSaved(); toast('Query saved','ok'); }}]});
  $('#qshare',el).onclick=()=>{ const u=location.href.split('#')[0]+'#/query?q='+btoa(unescape(encodeURIComponent(JSON.stringify(QSPEC)))); navigator.clipboard&&navigator.clipboard.writeText(u).then(()=>toast('Link copied — opens this exact query','ok'),()=>prompt('Copy this link',u)); };
  $('#ask',el).onsubmit=()=>{ const q=$('#ask [name=q]',el).value; const r=quickAsk(q); if(r){ QSPEC=normSpec(r.spec); drawBuilder(); runAndShow(); toast(r.why); } else toast('Not sure how to answer that yet — try the builder, or suggest it!'); return false; };
  drawBuilder(); runAndShow(); drawSaved();
};
function drawSaved(){
  const c=$('#savedCard'); if(!c) return; const L=DB.savedQueries||[];
  c.innerHTML=`<div class="card-h"><h3>Saved queries</h3><span class="r muted small">${L.length}</span></div>`+(L.length?`<ul class="activity">${L.map((q,i)=>`<li><a class="link" data-q="${i}">${esc(q.name)}</a><span class="muted small" style="flex:1">${esc(QDS[q.spec.ds].label)}</span><button class="btn sm ghost danger" data-dq="${i}">Delete</button></li>`).join('')}</ul>`:'<div class="card-b muted">Save a query to come back to it — great for a Monday-morning check.</div>');
  $$('[data-q]',c).forEach(a=>a.onclick=()=>{ QSPEC=normSpec(L[+a.dataset.q].spec); drawBuilder(); runAndShow(); window.scrollTo({top:0,behavior:'smooth'}); });
  $$('[data-dq]',c).forEach(a=>a.onclick=()=>{ L.splice(+a.dataset.dq,1); save(); drawSaved(); });
}
function drawBuilder(){
  const el=$('#builder'); if(!el) return; const s=QSPEC; const ds=QDS[s.ds]; const fields=ds.fields(); const rows=ds.rows();
  const fOpt=(sel,filter=()=>true,blank)=>(blank?`<option value="">${blank}</option>`:'')+fields.filter(filter).map(f=>`<option value="${f.k}" ${f.k===sel?'selected':''}>${esc(f.label)}</option>`).join('');
  const enumVals=f=>[...new Set(rows.map(r=>f.get(r)).filter(v=>v!=null&&v!==''))].sort();
  el.innerHTML=`
    <div><h4>1 · Data</h4><select class="in" data-k="ds">${Object.entries(QDS).map(([k,d])=>`<option value="${k}" ${k===s.ds?'selected':''}>${esc(d.label)}</option>`).join('')}</select></div>
    <div><h4 style="display:flex;align-items:center">2 · Filters <span style="flex:1"></span>${s.filters.length>1?`<span class="seg" style="font-size:11px"><button type="button" data-match="all" class="${s.match!=='any'?'on':''}">All</button><button type="button" data-match="any" class="${s.match==='any'?'on':''}">Any</button></span>`:''}</h4>
      <div style="display:flex;flex-direction:column;gap:8px">${s.filters.map((fl,i)=>{ const f=fields.find(x=>x.k===fl.f)||fields[0]; const ops=OPS[f.type];
        let val=''; if(['empty','notempty'].includes(fl.op)) val='';
        else if(f.type==='enum'){ const cur=String(fl.v||'').split(',').filter(Boolean); val=`<div class="chips" style="max-height:120px;overflow:auto">${enumVals(f).map(v=>`<button type="button" class="chip ${cur.includes(String(v))?'on':''}" data-ev="${i}" data-v="${esc(v)}">${esc(v)}</button>`).join('')}</div>`; }
        else if(fl.op==='ltf'||fl.op==='gtf') val=`<select class="in" data-fv="${i}">${fOpt(fl.v,x=>x.type==='num'&&x.k!==f.k)}</select>`;
        else if(fl.op==='between') val=`<div class="two"><input class="in" data-fv="${i}" type="${f.type==='date'?'date':'number'}" value="${esc(fl.v||'')}" placeholder="from"><input class="in" data-fv2="${i}" type="${f.type==='date'?'date':'number'}" value="${esc(fl.v2||'')}" placeholder="to"></div>`;
        else val=`<input class="in" data-fv="${i}" type="${f.type==='num'||['last','next'].includes(fl.op)?'number':f.type==='date'?'date':'text'}" value="${esc(fl.v||'')}" placeholder="${['last','next'].includes(fl.op)?'days':'value'}">`;
        return `<div class="frow"><button type="button" class="x" data-rmf="${i}" aria-label="Remove filter">×</button><div class="two" style="padding-right:18px"><select class="in" data-ff="${i}">${fOpt(f.k)}</select><select class="in" data-fo="${i}">${ops.map(o=>`<option value="${o[0]}" ${o[0]===fl.op?'selected':''}>${esc(o[1])}</option>`).join('')}</select></div>${val}</div>`; }).join('')}
      <button type="button" class="btn sm" id="addF">${ic('plus')}Add filter</button></div></div>
    <div><h4>3 · Group & total</h4><select class="in" data-k="group">${fOpt(s.group,x=>x.type!=='num',"Don't group — list rows")}</select>
      ${s.group&&(fields.find(f=>f.k===s.group)||{}).type==='date'?`<div class="seg" style="margin-top:6px">${BUCKETS.map(b=>`<button type="button" data-bucket="${b[0]}" class="${s.bucket===b[0]?'on':''}">${b[1]}</button>`).join('')}</div>`:''}
      ${s.group?`<div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">${s.aggs.map((a,i)=>`<div class="frow" style="padding:8px"><button type="button" class="x" data-rma="${i}">×</button><div class="two" style="padding-right:18px"><select class="in" data-af="${i}">${AGG.map(g=>`<option value="${g[0]}" ${g[0]===a.fn?'selected':''}>${g[1]}</option>`).join('')}</select>${a.fn==='count'?'<span></span>':`<select class="in" data-afk="${i}">${fOpt(a.f,x=>x.type==='num')}</select>`}</div></div>`).join('')}<button type="button" class="btn sm" id="addA">${ic('plus')}Add total</button></div>`:''}</div>
    <div><h4>4 · Sort & limit</h4><div class="two" style="display:grid;grid-template-columns:1fr 90px;gap:6px"><select class="in" data-k="sort">${s.group?`<option value="">Default</option><option value="key" ${s.sort&&s.sort.k==='key'?'selected':''}>${esc((fields.find(f=>f.k===s.group)||{}).label)}</option>${s.aggs.map((a,i)=>`<option value="agg${i}" ${s.sort&&s.sort.k==='agg'+i?'selected':''}>${esc(aggLabel(a,fields))}</option>`).join('')}`:fOpt(s.sort&&s.sort.k,()=>true,'Default')}</select>
      <select class="in" data-k="dir"><option value="-1" ${s.sort&&s.sort.dir<0?'selected':''}>High→low</option><option value="1" ${!s.sort||s.sort.dir>0?'selected':''}>Low→high</option></select></div>
      <input class="in" data-k="limit" type="number" min="1" placeholder="Show all rows (or enter a limit, e.g. 10)" value="${esc(s.limit||'')}" style="margin-top:6px"></div>
    ${!s.group?`<div><h4>5 · Columns</h4><div class="chips">${fields.map(f=>`<button type="button" class="chip ${s.cols.includes(f.k)?'on':''}" data-col="${f.k}">${esc(f.label)}</button>`).join('')}</div></div>`:''}
    <button type="button" class="btn ghost small" id="qclear">Clear & start over</button>`;
  const upd=()=>{ drawBuilder(); runAndShow(); };
  $$('[data-k]',el).forEach(x=>x.onchange=()=>{ const k=x.dataset.k;
    if(k==='ds'){ QSPEC=blankSpec(x.value); }
    else if(k==='group'){ s.group=x.value; s.sort=null; if(!s.aggs.length) s.aggs=[{fn:'count'}]; }
    else if(k==='sort'){ s.sort=x.value?{k:x.value,dir:s.sort?s.sort.dir:-1}:null; }
    else if(k==='dir'){ if(s.sort) s.sort.dir=+x.value; }
    else if(k==='limit'){ s.limit=x.value; }
    upd(); });
  $$('[data-match]',el).forEach(b=>b.onclick=()=>{ s.match=b.dataset.match; upd(); });
  $$('[data-bucket]',el).forEach(b=>b.onclick=()=>{ s.bucket=b.dataset.bucket; upd(); });
  $('#addF',el).onclick=()=>{ const f=fields[0]; s.filters.push({f:f.k,op:OPS[f.type][0][0],v:''}); upd(); };
  $$('[data-rmf]',el).forEach(b=>b.onclick=()=>{ s.filters.splice(+b.dataset.rmf,1); upd(); });
  $$('[data-ff]',el).forEach(x=>x.onchange=()=>{ const f=fields.find(y=>y.k===x.value); s.filters[+x.dataset.ff]={f:f.k,op:OPS[f.type][0][0],v:''}; upd(); });
  $$('[data-fo]',el).forEach(x=>x.onchange=()=>{ const fl=s.filters[+x.dataset.fo]; fl.op=x.value; if(['ltf','gtf'].includes(fl.op)) fl.v=(fields.find(f=>f.type==='num'&&f.k!==fl.f)||{}).k; else if(['ltf','gtf'].includes(fl.op)===false&&fields.some(f=>f.k===fl.v)) fl.v=''; upd(); });
  $$('[data-fv]',el).forEach(x=>{ const i=+x.dataset.fv; const h=()=>{ s.filters[i].v=x.value; runAndShow(); }; x.oninput=h; x.onchange=h; });
  $$('[data-fv2]',el).forEach(x=>{ const i=+x.dataset.fv2; x.oninput=x.onchange=()=>{ s.filters[i].v2=x.value; runAndShow(); }; });
  $$('[data-ev]',el).forEach(b=>b.onclick=()=>{ const fl=s.filters[+b.dataset.ev]; const cur=String(fl.v||'').split(',').filter(Boolean); const v=b.dataset.v; fl.v=(cur.includes(v)?cur.filter(x=>x!==v):[...cur,v]).join(','); b.classList.toggle('on'); runAndShow(); });
  const addA=$('#addA',el); if(addA) addA.onclick=()=>{ const nf=fields.find(f=>f.type==='num'); s.aggs.push({fn:'sum',f:nf.k}); upd(); };
  $$('[data-rma]',el).forEach(b=>b.onclick=()=>{ s.aggs.splice(+b.dataset.rma,1); if(!s.aggs.length) s.aggs=[{fn:'count'}]; s.sort=null; upd(); });
  $$('[data-af]',el).forEach(x=>x.onchange=()=>{ const a=s.aggs[+x.dataset.af]; a.fn=x.value; if(a.fn!=='count'&&!a.f) a.f=fields.find(f=>f.type==='num').k; upd(); });
  $$('[data-afk]',el).forEach(x=>x.onchange=()=>{ s.aggs[+x.dataset.afk].f=x.value; upd(); });
  $$('[data-col]',el).forEach(b=>b.onclick=()=>{ const k=b.dataset.col; s.cols=s.cols.includes(k)?s.cols.filter(x=>x!==k):[...s.cols,k]; b.classList.toggle('on'); runAndShow(); });
  $('#qclear',el).onclick=()=>{ QSPEC=blankSpec(s.ds); upd(); };
}
function runAndShow(){
  const s=QSPEC, res=runQuery(s), ds=QDS[s.ds]; $('#sent').innerHTML=sentence(s)+` <span class="muted small">· ${res.matched.toLocaleString()} matching ${esc(ds.noun)}${res.grouped?` in ${res.rows.length} groups`:''}</span>`;
  let rows=res.rows.slice();
  if(s.sort&&s.sort.k){ const k=s.sort.k, dir=s.sort.dir||1; const get= res.grouped? (r=>r[k]) : ((res.fields.find(f=>f.k===k)||{get:()=>0}).get); rows.sort((a,b)=>{ const x=get(a),y=get(b); return (typeof x==='number'&&typeof y==='number'?x-y:String(x??'').localeCompare(String(y??''),undefined,{numeric:true}))*dir; }); }
  if(+s.limit>0) rows=rows.slice(0,+s.limit);
  const fmtF=(f,v)=> v==null||v===''?'—': f.type==='num'? (f.money?fmt$(v):fmtN(v)) : f.type==='date'? fmtD(v) : v;
  let cols;
  if(res.grouped){ const g=res.gfield; cols=[{k:'key',label:g.label+(g.type==='date'?' ('+s.bucket+')':''),get:r=>r.key},...s.aggs.map((a,i)=>{ const f=res.fields.find(x=>x.k===a.f); return {k:'agg'+i,label:aggLabel(a,res.fields),num:true,get:r=>r['agg'+i],fmt:v=>a.fn==='count'?fmtN(v):(f&&f.money?fmt$(v):fmtN(v)),total:a.fn==='count'||a.fn==='sum'}; })]; }
  else cols=res.fields.map(f=>({k:f.k,label:f.label,num:f.type==='num',get:f.get,fmt:v=>fmtF(f,v),total:f.type==='num'&&(f.money||['onHand','qty','absQty','open'].includes(f.k)),hide:!s.cols.includes(f.k),html:f.k==='status'&&s.ds==='items'?(r=>statusPill(f.get(r))):(f.k==='sku'?(r=>`<span class="mono">${esc(f.get(r))}</span>`):null)})).sort((a,b)=>{ const ia=s.cols.indexOf(a.k), ib=s.cols.indexOf(b.k); return (ia<0?999:ia)-(ib<0?999:ib); });
  // chart for grouped results
  const ch=$('#qchart');
  if(res.grouped&&rows.length){ const a0=s.aggs[0], f0=res.fields.find(x=>x.k===a0.f); const data=rows.slice(0,24).map(r=>({label:String(r.key),value:r.agg0}));
    const isTime=res.gfield.type==='date';
    ch.innerHTML=`<div class="card-b" style="border-bottom:1px solid var(--line)">${isTime? lineChart([{name:aggLabel(a0,res.fields),color:PAL[0],values:data.map(d=>d.value)}],data.map(d=>d.label),{money:f0&&f0.money,h:200}) : barChart(data,{money:f0&&f0.money&&a0.fn!=='count',horizontal:data.length>6})}</div>`; tipOn(ch); }
  else ch.innerHTML='';
  TState.qx=null; delete TState.qx; TState.qx={sort:null,dir:1,q:'',chip:'all',hidden:cols.filter(c=>c.hide).map(c=>c.k)};
  table($('#qres'),{key:'qx',noun:res.grouped?'groups':ds.noun,rows,columns:cols,totals:true,onRow:r=>{ if(res.grouped){ drill(r,res); } else ds.open(r); }});
  const cc=$('#qres [data-cols]'); if(cc&&!res.grouped) cc.style.display='none';
}
function drill(g,res){
  const ds=QDS[QSPEC.ds];
  modal({title:`${res.gfield.label}: ${g.key}`,sub:`${g._rows.length} ${esc(ds.noun)} in this group`,wide:true,body:`<div id="dr"></div>`,onOpen:f=>{ table($('#dr',f),{key:'drill',noun:ds.noun,rows:g._rows,columns:res.fields.map(fl=>({k:fl.k,label:fl.label,num:fl.type==='num',get:fl.get,fmt:v=>v==null?'—':fl.type==='num'?(fl.money?fmt$(v):fmtN(v)):fl.type==='date'?fmtD(v):v,hide:!ds.cols.includes(fl.k)})),onRow:r=>{ $$('.modal-wrap,.scrim').forEach(x=>x.remove()); ds.open(r); }}); },actions:[{label:'Close'}]});
}
function quickAsk(q){
  q=(q||'').toLowerCase().trim(); if(!q) return null;
  const S=i=>({spec:STARTERS[i].spec,why:'Loaded: '+STARTERS[i].name});
  const sku=DB.items.find(i=>q.includes(i.sku.toLowerCase())||q.replace(/[^a-z0-9]/g,'').includes(i.sku.toLowerCase().replace(/^(fg|mc|rm|hw|el|sl|pk|pl|cs)-/,'').replace(/[^a-z0-9]/g,'')));
  if(sku&&/(history|moves|movement|usage|used|activity)/.test(q)) return {spec:{ds:'moves',filters:[{f:'sku',op:'is',v:sku.sku}],sort:{k:'ts',dir:-1},cols:['ts','type','qty','loc','lot','ref','user']},why:'Movement history for '+sku.sku};
  if(sku&&/(where|bin|lot|location)/.test(q)) return {spec:{ds:'stock',filters:[{f:'sku',op:'is',v:sku.sku}]},why:'Where '+sku.sku+' is stored'};
  if(sku) return {spec:{ds:'items',filters:[{f:'sku',op:'is',v:sku.sku}],cols:['sku','name','onHand','alloc','avail','onOrder','rop','status','value']},why:'Stock for '+sku.sku};
  if(/reorder|low stock|running (low|out)|order more|short/.test(q)) return S(0);
  if(/value.*(categor|type)|where.*money|worth/.test(q)) return S(1);
  if(/(most|top|biggest).*(use|consum|mov)|what did we use/.test(q)) return S(2);
  if(/slow|dead|obsolete|idle|not moving/.test(q)) return S(3);
  if(/late.*(po|purchase|vendor)|(po|purchase).*late|overdue po/.test(q)) return S(4);
  if(/(backlog|open sales|open orders).*|by customer/.test(q)) return S(5);
  if(/month|trend|over time/.test(q)) return S(6);
  if(/count|variance|shrink/.test(q)) return S(7);
  if(/old|aging|age/.test(q)) return S(8);
  if(/late.*(so|sales|ship)|(so|sales).*late/.test(q)) return {spec:{ds:'solines',filters:[{f:'late',op:'gt',v:'0'}],sort:{k:'late',dir:-1}},why:'Late sales order lines'};
  const vend=DB.vendors.find(v=>q.includes(v.name.toLowerCase().split(' ')[0])); if(vend) return {spec:{ds:'polines',filters:[{f:'vendor',op:'in',v:vend.name}],sort:{k:'due',dir:-1}},why:'PO lines from '+vend.name};
  const cust=DB.customers.find(c=>q.includes(c.name.toLowerCase().split(' ')[0])); if(cust) return {spec:{ds:'solines',filters:[{f:'customer',op:'in',v:cust.name}],sort:{k:'due',dir:-1}},why:'Order lines for '+cust.name};
  return {spec:{ds:'items',filters:[{f:'name',op:'contains',v:q.replace(/^(show|find|list)\s+/,'')}]},why:'Searched item descriptions for "'+q+'"'};
}
