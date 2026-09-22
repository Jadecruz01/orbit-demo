/* ORBIT core: store, inventory math, UI helpers */
const SUGGEST_TO = 'jadecruz@starsonn.com';   // where "Suggest a change" emails go
const APP = { name:'ORBIT', version:'0.1 prototype' };
const KEY = 'orbit.db.v3'+(window.ORBIT_CLIENT?'.'+window.ORBIT_CLIENT.slug:'');

const $ = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>[...el.querySelectorAll(s)];
const esc = s => String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const h = (strings,...vals)=>strings.reduce((a,s,i)=>a+s+(i<vals.length?(vals[i]&&vals[i].__raw!==undefined?vals[i].__raw:esc(vals[i])):''),'');
const raw = s => ({__raw:s});
const DAY = 86400000;
const round = (n,p=2)=>Math.round((+n||0)*10**p)/10**p;
const fmtN = (n,dp) => { n=+n||0; const d = dp!=null?dp:(Number.isInteger(round(n,3))?0:(Math.abs(n)<10?2:1)); return n.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}); };
const fmt$ = (n,dp=2)=> (n<0?'-':'')+'$'+Math.abs(+n||0).toLocaleString('en-US',{minimumFractionDigits:dp,maximumFractionDigits:dp});
const fmt$k = n => Math.abs(n)>=1e6? '$'+round(n/1e6,2)+'M' : Math.abs(n)>=1e4? '$'+round(n/1e3,1)+'k' : fmt$(n,0);
const fmtD = iso => iso? new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric',year: new Date(iso).getFullYear()!==new Date().getFullYear()?'numeric':undefined}) : '—';
const fmtDT = iso => iso? new Date(iso).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}) : '—';
const daysFrom = iso => Math.round((new Date(iso).setHours(0,0,0,0) - new Date().setHours(0,0,0,0))/DAY);
const rel = iso => { const n=daysFrom(iso); return n===0?'today':n===1?'tomorrow':n===-1?'yesterday':n>0?`in ${n}d`:`${-n}d ago`; };
const isoDate = iso => (iso||new Date().toISOString()).slice(0,10);
const store = { get(k,d){ try{ const v=localStorage.getItem(k); return v==null?d:JSON.parse(v);}catch(e){return d;} }, set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }, del(k){ try{localStorage.removeItem(k);}catch(e){} } };

/* ---------------- database ---------------- */
let DB = store.get(KEY,null);
if (!DB || DB.version!==3) DB = ORBIT_SEED();
let _cache = null;
function save(){ _cache=null; store.set(KEY,DB); }
function resetDemo(){ const keepSug = DB.suggestions||[]; DB = ORBIT_SEED(); DB.suggestions = keepSug; save(); }
const HOLD_LOCS = ['MAIN-QC'];
const item = id => DB.items.find(i=>i.id===id);
const itemBySku = s => DB.items.find(i=>i.sku.toLowerCase()===String(s).toLowerCase());
const vendor = id => DB.vendors.find(v=>v.id===id);
const customer = id => DB.customers.find(c=>c.id===id);
const bomOf = id => DB.boms.find(b=>b.itemId===id);
const whereUsed = id => DB.boms.filter(b=>b.lines.some(l=>l.itemId===id));
const OPEN_SO = ['Open','Partial'];
const OPEN_PO = ['Open','Partial'];

function calc(){
  if (_cache) return _cache;
  const c = {};
  DB.items.forEach(i=>c[i.id]={onHand:0,hold:0,alloc:0,onOrder:0,used30:0,used90:0,locs:{}, lastMove:null});
  DB.stock.forEach(s=>{ const x=c[s.itemId]; if(!x) return; x.onHand+=s.qty; if(HOLD_LOCS.includes(s.loc)) x.hold+=s.qty; x.locs[s.loc]=(x.locs[s.loc]||0)+s.qty; });
  DB.sos.forEach(so=>{ if(!OPEN_SO.includes(so.status)) return; so.lines.forEach(l=>{ c[l.itemId].alloc += Math.max(0,l.qty-l.shipped); }); });
  DB.pos.forEach(po=>{ if(!OPEN_PO.includes(po.status)) return; po.lines.forEach(l=>{ c[l.itemId].onOrder += Math.max(0,l.qty-l.received); }); });
  DB.wos.forEach(wo=>{ if(wo.status==='Complete'||wo.status==='Cancelled') return; const rem=Math.max(0,wo.qty-wo.done); c[wo.itemId].onOrder += rem;
    if(!wo.issued){ const b=bomOf(wo.itemId); if(b) b.lines.forEach(l=>{ c[l.itemId].alloc += l.qty*rem; }); } });
  const now=Date.now();
  DB.txns.forEach(t=>{ const x=c[t.itemId]; if(!x) return; const age=(now-new Date(t.ts))/DAY; if(t.qty<0 && ['ISSUE','SHIP','CONSUME'].includes(t.type)){ if(age<=30)x.used30+=-t.qty; if(age<=90)x.used90+=-t.qty; } if(!x.lastMove||t.ts>x.lastMove) x.lastMove=t.ts; });
  DB.items.forEach(i=>{ const x=c[i.id];
    ['onHand','hold','alloc','onOrder','used30','used90'].forEach(k=>x[k]=round(x[k],3));
    x.avail = round(x.onHand - x.hold - x.alloc,3);
    x.value = round(x.onHand*i.cost,2);
    x.daily = x.used90/90;
    x.dos = x.daily>0 ? Math.round(Math.max(0,x.avail)/x.daily) : null;
    x.status = x.avail<0 ? 'Short' : (x.avail + x.onOrder <= i.reorderPoint ? 'Reorder' : (x.avail <= i.reorderPoint ? 'On order' : 'OK'));
    x.suggest = x.status==='Reorder'||x.status==='Short' ? Math.max(i.reorderQty, Math.ceil(i.reorderPoint - (x.avail + x.onOrder) + i.reorderQty*0.5)) : 0;
    x.idle = x.lastMove ? Math.round((now-new Date(x.lastMove))/DAY) : 999;
  });
  _cache = c; return c;
}
const Q = id => calc()[id];
const statusPill = s => ({'OK':'<span class="pill ok">OK</span>','On order':'<span class="pill acc">Low · on order</span>','Reorder':'<span class="pill warn">Reorder</span>','Short':'<span class="pill bad">Short</span>'}[s]||esc(s));
const docPill = s => { const m={Draft:'neu',Open:'acc',Planned:'neu',Released:'acc','In progress':'info',Partial:'warn',Received:'ok',Shipped:'ok',Complete:'ok',Closed:'neu',Cancelled:'neu',Late:'bad'}; return `<span class="pill ${m[s]||'neu'}">${esc(s)}</span>`; };

/* Post a stock movement. qty>0 adds, qty<0 removes (FIFO by lot within location). Returns error string or null. */
function post({type,itemId,qty,loc,lot,ref,note,ts}){
  const it=item(itemId); if(!it) return 'Unknown item';
  qty = round(+qty,3); if(!qty) return 'Quantity is zero';
  loc = loc || it.defaultLoc;
  const user = (Session.user&&Session.user.name)||'Demo User';
  const stamp = ts || new Date().toISOString();
  const mk = (q,l,lt)=>DB.txns.push({id:'T'+(DB.nextNums.txn++), ts:stamp, type, itemId, qty:round(q,3), loc:l, lot:lt||'', ref:ref||'', user, note:note||''});
  if (qty>0){
    if (it.lotTracked && !lot) lot = 'L'+new Date().toISOString().slice(2,10).replace(/-/g,'')+String(Math.floor(Math.random()*90+10));
    let row = DB.stock.find(s=>s.itemId===itemId&&s.loc===loc&&(s.lot||'')===(lot||''));
    if (row) row.qty=round(row.qty+qty,3); else DB.stock.push({itemId,loc,lot:lot||'',qty,received:stamp});
    mk(qty,loc,lot);
  } else {
    let need=-qty;
    let rows = DB.stock.filter(s=>s.itemId===itemId && s.loc===loc && s.qty>0 && (!lot || s.lot===lot)).sort((a,b)=>a.received<b.received?-1:1);
    const have = rows.reduce((a,s)=>a+s.qty,0);
    if (have+1e-9 < need) return `Only ${fmtN(have)} ${it.uom} of ${it.sku} in ${loc}${lot?' lot '+lot:''}. Inventory can't go negative.`;
    for (const r of rows){ if(need<=0) break; const take=Math.min(r.qty,need); r.qty=round(r.qty-take,3); need=round(need-take,3); mk(-take,r.loc,r.lot); }
    DB.stock = DB.stock.filter(s=>s.qty>0.0001);
  }
  return null;
}
/* Remove qty from wherever it is (default loc first, then others, skipping QC hold) */
function consumeAnywhere(o){
  const it=item(o.itemId); let need=o.qty;
  const locs=[...new Set([it.defaultLoc,...DB.stock.filter(s=>s.itemId===it.id&&!HOLD_LOCS.includes(s.loc)).map(s=>s.loc)])];
  const total = DB.stock.filter(s=>s.itemId===it.id&&!HOLD_LOCS.includes(s.loc)).reduce((a,s)=>a+s.qty,0);
  if (total+1e-9<need) return `${it.sku}: need ${fmtN(need)} ${it.uom}, only ${fmtN(total)} usable on hand.`;
  for (const l of locs){ if(need<=0)break; const have=DB.stock.filter(s=>s.itemId===it.id&&s.loc===l).reduce((a,s)=>a+s.qty,0); const take=round(Math.min(have,need),3); if(take>0){ const e=post({...o,qty:-take,loc:l}); if(e) return e; need=round(need-take,3);} }
  return null;
}

/* ---------------- session ---------------- */
const Session = { user: store.get('orbit.session',null) };

/* ---------------- icons ---------------- */
const ICONS = {
  home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  box:'<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  swap:'<path d="M7 7h13l-4-4M17 17H4l4 4"/>',
  clip:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
  cart:'<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l3 12h11l2-8H6"/>',
  truck:'<path d="M2 6h11v10H2zM13 10h5l3 3v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  tool:'<path d="M14 6a4 4 0 0 0 5 5l2 2-8 8-2-2a4 4 0 0 0-5-5L3 11l8-8z"/>',
  tree:'<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 7v5M5 17v-5h14v5"/>',
  refresh:'<path d="M20 11a8 8 0 0 0-14-5l-2 2M4 13a8 8 0 0 0 14 5l2-2M4 4v4h4M20 20v-4h-4"/>',
  users:'<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 3a4 4 0 0 1 0 8M22 21a7 7 0 0 0-5-6.7"/>',
  query:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M8 11h6M11 8v6"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  bulb:'<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', down:'<path d="M12 4v12M6 10l6 6 6-6M4 20h16"/>', filter:'<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  cols:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/>', moon:'<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>', check:'<path d="M5 12l5 5L20 7"/>', count:'<path d="M4 4h16v16H4zM4 9h16M9 4v16"/>',
  logout:'<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l-5-5 5-5M5 12h11"/>', inbox:'<path d="M3 13l3-8h12l3 8v6H3z"/><path d="M3 13h5l1 3h6l1-3h5"/>',
  save:'<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h8M8 21v-7h8v7"/>', play:'<path d="M6 4l14 8-14 8z"/>', map:'<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>'
};
const ic = (n,cls='')=>`<svg class="${cls}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]||''}</svg>`;

/* ---------------- toast / modal / drawer ---------------- */
function toast(msg,kind=''){ let w=$('.toasts'); if(!w){w=document.createElement('div');w.className='toasts';document.body.appendChild(w);} const t=document.createElement('div'); t.className='toast '+kind; t.textContent=msg; w.appendChild(t); setTimeout(()=>t.remove(),3200); }

function modal({title,sub,body,actions=[],wide=false,onOpen}){
  const scrim=document.createElement('div'); scrim.className='scrim';
  const wrap=document.createElement('div'); wrap.className='modal-wrap';
  wrap.innerHTML=`<div class="modal ${wide?'wide':''}" role="dialog" aria-modal="true"><div class="modal-h"><div><h2>${esc(title)}</h2>${sub?`<div class="muted small">${sub}</div>`:''}</div><button class="x" aria-label="Close">×</button></div><form class="modal-b" onsubmit="return false">${body}</form><div class="modal-f"></div></div>`;
  const close=()=>{scrim.remove();wrap.remove();document.removeEventListener('keydown',kd);};
  const kd=e=>{ if(e.key==='Escape') close(); };
  document.addEventListener('keydown',kd);
  wrap.addEventListener('mousedown',e=>{ if(e.target===wrap) close(); });
  $('.x',wrap).onclick=close;
  const f=$('.modal-f',wrap);
  actions = actions.length?actions:[{label:'Close'}];
  actions.forEach(a=>{ const b=document.createElement('button'); b.type='button'; b.className='btn '+(a.pri?'pri':'')+(a.danger?' danger':''); b.innerHTML=a.label; b.onclick=()=>{ if(!a.onClick){close();return;} const r=a.onClick(formData($('form',wrap)),$('form',wrap),close); if(r!==false) close(); }; f.appendChild(b); });
  document.body.append(scrim,wrap);
  const first=$('input:not([type=hidden]),select,textarea',wrap); if(first) setTimeout(()=>first.focus(),30);
  if(onOpen) onOpen($('form',wrap),close);
  return {el:wrap,close};
}
function formData(form){ const o={}; $$('[name]',form).forEach(e=>{ if(e.type==='checkbox') o[e.name]=e.checked; else if(e.type==='radio'){ if(e.checked) o[e.name]=e.value; } else o[e.name]=e.value; }); return o; }
function fieldErr(form,msg){ let n=$('.note.bad',form); if(!n){ n=document.createElement('div'); n.className='note bad'; form.prepend(n);} n.textContent=msg; return false; }

let _drawer=null;
function drawer(html,{onClose}={}){
  closeDrawer();
  const scrim=document.createElement('div'); scrim.className='scrim';
  const d=document.createElement('aside'); d.className='drawer'; d.innerHTML=html;
  const close=()=>{ scrim.remove(); d.remove(); document.removeEventListener('keydown',kd); _drawer=null; onClose&&onClose(); };
  const kd=e=>{ if(e.key==='Escape' && !$('.modal-wrap')) close(); };
  document.addEventListener('keydown',kd); scrim.onclick=close;
  document.body.append(scrim,d); _drawer={el:d,close};
  $$('[data-close]',d).forEach(b=>b.onclick=close);
  return d;
}
function closeDrawer(){ if(_drawer) _drawer.close(); }

/* ---------------- data table ---------------- */
const TState = {};
function table(el,cfg){
  const st = TState[cfg.key] = TState[cfg.key] || {sort:cfg.sort||null, dir:cfg.dir||1, q:'', chip:cfg.chipDefault||'all', hidden: store.get('orbit.cols.'+cfg.key, cfg.columns.filter(c=>c.hide).map(c=>c.k))};
  const draw=()=>{
    let rows = cfg.rows.slice();
    if (cfg.chips){ const ch=cfg.chips.find(c=>c.k===st.chip); if(ch&&ch.test) rows=rows.filter(ch.test); }
    if (st.q){ const qs=st.q.toLowerCase().split(/\s+/).filter(Boolean); rows=rows.filter(r=>{ const s=cfg.columns.map(c=>{const v=c.get(r);return v==null?'':String(v);}).join(' ').toLowerCase(); return qs.every(q=>s.includes(q)); }); }
    if (st.sort){ const col=cfg.columns.find(c=>c.k===st.sort); if(col){ rows.sort((a,b)=>{ let x=col.get(a),y=col.get(b); if(x==null)x=''; if(y==null)y=''; return (typeof x==='number'&&typeof y==='number'? x-y : String(x).localeCompare(String(y),undefined,{numeric:true}))*st.dir; }); } }
    const cols = cfg.columns.filter(c=>!st.hidden.includes(c.k));
    const chipHtml = cfg.chips? `<div class="chips">${cfg.chips.map(c=>`<button class="chip ${st.chip===c.k?'on':''}" data-chip="${c.k}">${esc(c.label)}<span class="n">${c.test?cfg.rows.filter(c.test).length:cfg.rows.length}</span></button>`).join('')}</div>`:'';
    const shown = rows.slice(0, cfg.limit||500);
    el.innerHTML = `
      ${cfg.bare?'':`<div class="tbar">${cfg.search===false?'':`<input class="in q" placeholder="Filter ${esc(cfg.noun||'rows')}…" value="${esc(st.q)}" aria-label="Filter">`}${chipHtml}
        <div class="r">${cfg.tools||''}<button class="btn sm ghost" data-cols title="Choose columns">${ic('cols')}Columns</button><button class="btn sm ghost" data-csv title="Download as CSV">${ic('down')}CSV</button></div></div>`}
      <div class="twrap ${cfg.free?'free':''}">${rows.length?`<table class="t"><thead><tr>${cols.map(c=>`<th class="${c.num?'num':''} ${st.sort===c.k?'sorted':''}" data-sort="${c.k}">${esc(c.label)}<span class="ar">${st.sort===c.k?(st.dir>0?'▲':'▼'):'↕'}</span></th>`).join('')}</tr></thead>
      <tbody>${shown.map((r,i)=>`<tr data-i="${i}">${cols.map(c=>`<td class="${c.num?'num':''} ${c.cls||''}">${c.html?c.html(r):esc(c.fmt?c.fmt(c.get(r),r):c.get(r))}</td>`).join('')}</tr>`).join('')}</tbody>
      ${cfg.totals?`<tfoot><tr>${cols.map((c,i)=>`<td class="${c.num?'num':''}">${c.total?esc(c.fmt?c.fmt(rows.reduce((a,r)=>a+(+c.get(r)||0),0)):fmtN(rows.reduce((a,r)=>a+(+c.get(r)||0),0))):(i===0?'Total':'')}</td>`).join('')}</tr></tfoot>`:''}</table>`:`<div class="t-empty">${cfg.empty||'Nothing matches.'}</div>`}</div>
      ${cfg.bare?'':`<div class="tcount">${rows.length.toLocaleString()} of ${cfg.rows.length.toLocaleString()} ${esc(cfg.noun||'rows')}${rows.length>shown.length?` · showing first ${shown.length}`:''}</div>`}`;
    const qi=$('.q',el); if(qi){ qi.oninput=()=>{ st.q=qi.value; const p=qi.selectionStart; draw(); const n=$('.q',el); n.focus(); n.setSelectionRange(p,p); }; }
    $$('[data-chip]',el).forEach(b=>b.onclick=()=>{ st.chip=b.dataset.chip; draw(); });
    $$('th[data-sort]',el).forEach(th=>th.onclick=()=>{ const k=th.dataset.sort; if(st.sort===k) st.dir*=-1; else {st.sort=k; st.dir=1;} draw(); });
    $$('tbody tr',el).forEach(tr=>tr.onclick=(e)=>{ if(e.target.closest('a,button,input')) return; cfg.onRow&&cfg.onRow(shown[+tr.dataset.i]); });
    const cb=$('[data-csv]',el); if(cb) cb.onclick=()=>downloadCSV((cfg.noun||'export').replace(/\s+/g,'-')+'.csv', cols, rows);
    const cc=$('[data-cols]',el); if(cc) cc.onclick=()=>modal({title:'Columns', sub:'Pick which columns show. Remembered in this browser.', body:cfg.columns.map(c=>`<label style="display:flex;gap:8px;align-items:center;padding:4px 0"><input type="checkbox" name="${c.k}" ${st.hidden.includes(c.k)?'':'checked'}> ${esc(c.label)}</label>`).join(''), actions:[{label:'Cancel'},{label:'Apply',pri:true,onClick:(d)=>{ st.hidden=cfg.columns.filter(c=>!d[c.k]).map(c=>c.k); store.set('orbit.cols.'+cfg.key,st.hidden); draw(); }}]});
    cfg.after&&cfg.after(el);
  };
  draw(); return {redraw:draw, state:st};
}
function downloadCSV(name, cols, rows){
  const q=v=>{ v=v==null?'':String(v); return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; };
  const lines=[cols.map(c=>q(c.label)).join(',')].concat(rows.map(r=>cols.map(c=>q(c.csv?c.csv(r):c.get(r))).join(',')));
  const blob=new Blob([lines.join('\n')],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  toast(`Downloaded ${name} (${rows.length} rows)`);
}

/* ---------------- charts (tiny SVG) ---------------- */
const PAL = ['#2563EB','#0EA5A4','#F59E0B','#8B5CF6','#EF4444','#10B981','#EC4899','#64748B'];
function tipOn(el){ let t=$('.tip'); if(!t){t=document.createElement('div');t.className='tip';t.hidden=true;document.body.appendChild(t);} 
  el.addEventListener('mousemove',e=>{ const g=e.target.closest('[data-tip]'); if(!g){t.hidden=true;return;} t.hidden=false; t.innerHTML=g.dataset.tip; t.style.left=Math.min(e.clientX+12,innerWidth-t.offsetWidth-8)+'px'; t.style.top=(e.clientY-34)+'px'; });
  el.addEventListener('mouseleave',()=>t.hidden=true); }
function barChart(data,{h=220,money=false,color=PAL[0],horizontal=false}={}){
  if(!data.length) return '<div class="empty-state">No data</div>';
  const f = v=> money?fmt$k(v):fmtN(v);
  if (horizontal){
    const max=Math.max(...data.map(d=>d.value),1), rowH=24, W=440, lw=110, H=data.length*rowH+8;
    return `<svg class="chart" style="max-width:${W*1.35}px" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMinYMin meet">${data.map((d,i)=>{ const w=(W-lw-70)*d.value/max; return `<g data-tip="${esc(d.label)}: <b>${esc(f(d.value))}</b>"><text x="${lw-8}" y="${i*rowH+17}" text-anchor="end">${esc(d.label.length>16?d.label.slice(0,15)+'…':d.label)}</text><rect x="${lw}" y="${i*rowH+5}" width="${Math.max(2,w)}" height="16" rx="4" fill="${d.color||color}"/><text x="${lw+w+6}" y="${i*rowH+17}">${esc(f(d.value))}</text></g>`; }).join('')}</svg>`;
  }
  const W=600,H=h,pl=48,pb=28,pt=10; const max=Math.max(...data.map(d=>d.value),1)*1.1; const bw=(W-pl-10)/data.length;
  const ticks=[0,.25,.5,.75,1].map(t=>t*max);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${ticks.map(t=>{const y=H-pb-(H-pb-pt)*t/max;return `<line class="grid" x1="${pl}" x2="${W}" y1="${y}" y2="${y}"/><text x="${pl-6}" y="${y+4}" text-anchor="end">${esc(f(t))}</text>`}).join('')}
    ${data.map((d,i)=>{ const bh=(H-pb-pt)*d.value/max; const x=pl+i*bw+bw*.15; return `<g data-tip="${esc(d.label)}: <b>${esc(f(d.value))}</b>"><rect x="${x}" y="${H-pb-bh}" width="${bw*.7}" height="${Math.max(1,bh)}" rx="4" fill="${d.color||color}"/><text x="${x+bw*.35}" y="${H-10}" text-anchor="middle">${esc(d.label.length>10?d.label.slice(0,9)+'…':d.label)}</text></g>`; }).join('')}</svg>`;
}
function lineChart(series,labels,{h=220,money=false}={}){
  const W=640,H=h,pl=48,pb=26,pt=10,pr=10; const all=series.flatMap(s=>s.values); const max=Math.max(...all,1)*1.1; const n=labels.length;
  const X=i=>pl+(W-pl-pr)*i/Math.max(1,n-1), Y=v=>H-pb-(H-pb-pt)*v/max; const f=v=>money?fmt$k(v):fmtN(v,0);
  const ticks=[0,.25,.5,.75,1].map(t=>t*max);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${ticks.map(t=>`<line class="grid" x1="${pl}" x2="${W-pr}" y1="${Y(t)}" y2="${Y(t)}"/><text x="${pl-6}" y="${Y(t)+4}" text-anchor="end">${esc(f(t))}</text>`).join('')}
    ${labels.map((l,i)=> i%Math.ceil(n/8)===0?`<text x="${X(i)}" y="${H-8}" text-anchor="middle">${esc(l)}</text>`:'').join('')}
    ${series.map(s=>`<path d="${s.values.map((v,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)).join(' ')}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round"/>`).join('')}
    ${labels.map((l,i)=>`<rect x="${X(i)-(W-pl)/n/2}" y="${pt}" width="${(W-pl)/n}" height="${H-pb-pt}" fill="transparent" data-tip="<b>${esc(l)}</b><br>${series.map(s=>`${esc(s.name)}: ${esc(f(s.values[i]))}`).join('<br>')}"/>`).join('')}</svg>
    <div class="legend">${series.map(s=>`<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>`;
}

/* Move stock between bins, keeping lot identity and received date. */
function transfer({itemId,qty,from,to,lot,ref,note}){
  const it=item(itemId); qty=round(+qty,3); if(!(qty>0)) return 'Quantity must be greater than zero';
  if(from===to) return 'From and To are the same location';
  const rows=DB.stock.filter(s=>s.itemId===itemId&&s.loc===from&&s.qty>0&&(!lot||s.lot===lot)).sort((a,b)=>a.received<b.received?-1:1);
  const have=rows.reduce((a,s)=>a+s.qty,0); if(have+1e-9<qty) return `Only ${fmtN(have)} ${it.uom} in ${from}${lot?' lot '+lot:''}.`;
  const user=(Session.user&&Session.user.name)||'Demo User', ts=new Date().toISOString(); let need=qty;
  for(const r of rows){ if(need<=0) break; const take=round(Math.min(r.qty,need),3); r.qty=round(r.qty-take,3); need=round(need-take,3);
    let dst=DB.stock.find(s=>s.itemId===itemId&&s.loc===to&&s.lot===r.lot); if(dst) dst.qty=round(dst.qty+take,3); else DB.stock.push({itemId,loc:to,lot:r.lot,qty:take,received:r.received});
    DB.txns.push({id:'T'+(DB.nextNums.txn++),ts,type:'TRANSFER',itemId,qty:-take,loc:from,lot:r.lot,ref:ref||'Transfer',user,note:note||('To '+to)});
    DB.txns.push({id:'T'+(DB.nextNums.txn++),ts,type:'TRANSFER',itemId,qty:take,loc:to,lot:r.lot,ref:ref||'Transfer',user,note:note||('From '+from)}); }
  DB.stock=DB.stock.filter(s=>s.qty>0.0001); return null;
}
