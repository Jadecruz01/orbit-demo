/* ORBIT views part 1: shell, login, dashboard, inventory, item detail, stock actions, locations, transactions, reorder, counts */
const V = {};              // route -> render(el, params)
const NAV = [
  ['Overview',[['dashboard','Dashboard','home']]],
  ['Inventory',[['inventory','Items & stock','box'],['locations','Locations','map'],['transactions','Stock history','swap'],['counts','Cycle counts','count'],['reorder','Reorder planner','refresh']]],
  ['Operations',[['boms','Bills of material','tree'],['workorders','Work orders','tool'],['purchasing','Purchase orders','cart'],['sales','Sales orders','truck']]],
  ['Data',[['query','Query explorer','query'],['partners','Vendors & customers','users']]],
  ['Feedback',[['suggestions','My suggestions','inbox'],['settings','Settings','gear']]]
];
const pageName = r => { for (const [,its] of NAV) for (const [k,l] of its) if(k===r) return l; return r; };
let ROUTE = 'dashboard', PARAMS = {};

function renderLogin(){
  document.title = 'Sign in · ORBIT';
  document.body.innerHTML = `
  <div class="login">
    <section class="login-art">
      <svg class="orbits" viewBox="0 0 560 560" fill="none" stroke="#7FA7FF" stroke-width="1"><ellipse cx="280" cy="280" rx="260" ry="110" transform="rotate(-20 280 280)"/><ellipse cx="280" cy="280" rx="200" ry="200" stroke-dasharray="3 7"/><ellipse cx="280" cy="280" rx="240" ry="80" transform="rotate(35 280 280)"/><circle cx="280" cy="280" r="36" fill="#1E3A6E" stroke="#7FA7FF"/><circle cx="505" cy="190" r="7" fill="#F59E0B" stroke="none"/><circle cx="120" cy="420" r="5" fill="#34D399" stroke="none"/><circle cx="410" cy="440" r="4" fill="#7FA7FF" stroke="none"/></svg>
      <div class="brand">${logoMark(28)} ORBIT <small>by Starsonn</small> <span class="proto-tag">Prototype</span></div>
      <div style="position:relative">
        <h1>Know exactly what's on the shelf — and what it'll take to ship.</h1>
        <p>Inventory, purchasing, production and sales in one place, with a query tool that answers questions without a report writer.</p>
      </div>
      <div class="feat">
        <div><b>Live availability</b>On hand, allocated, on order and QC hold in one number you can trust.</div>
        <div><b>Lots & locations</b>FIFO picking, bin transfers and full traceability.</div>
        <div><b>Reorder planner</b>Shortages turn into draft POs and work orders in two clicks.</div>
        <div><b>Query explorer</b>Filter, group and export any data — no SQL.</div>
      </div>
    </section>
    <section class="login-form">
      <form class="login-card" id="lf">
        <h2>Sign in</h2>
        <div class="muted">to your ORBIT workspace</div>
        <div class="demo-hint">This is a demo with sample data. Use <code>demo@orbit.app</code> / <code>demo</code>, or tap <b>Use the demo account</b>.</div>
        <label class="f"><span>Email</span><input class="in" name="email" type="email" autocomplete="username" required></label>
        <label class="f"><span>Password</span><input class="in" name="pw" type="password" autocomplete="current-password" required></label>
        <div class="note bad" id="lerr" hidden></div>
        <button class="btn pri" style="width:100%;justify-content:center;padding:10px">Sign in</button>
        <button class="btn" type="button" id="demo" style="width:100%;justify-content:center;padding:10px;margin-top:8px">Use the demo account</button>
        <p class="muted small" style="margin-top:22px">Everything you do here is saved only in this browser. Nothing is sent anywhere except the suggestions you choose to email.</p>
      </form>
    </section>
  </div>`;
  const f=$('#lf');
  const go=(email)=>{ Session.user={email, name:store.get('orbit.name','')||'Demo User', since:new Date().toISOString()}; store.set('orbit.session',Session.user); boot(); };
  f.onsubmit=e=>{ e.preventDefault(); const d=formData(f); if(d.email.trim().toLowerCase()==='demo@orbit.app' && d.pw==='demo') go(d.email.trim()); else { const n=$('#lerr'); n.hidden=false; n.textContent='That email and password don\'t match. For the demo use demo@orbit.app / demo.'; } };
  $('#demo').onclick=()=>{ f.email.value='demo@orbit.app'; f.pw.value='demo'; setTimeout(()=>go('demo@orbit.app'),150); };
}
function logoMark(s=24){ return `<svg width="${s}" height="${s}" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="6" fill="#5B8CFF"/><ellipse cx="16" cy="16" rx="14" ry="6" fill="none" stroke="#9DB8FF" stroke-width="1.6" transform="rotate(-25 16 16)"/><circle cx="28" cy="10.5" r="2.2" fill="#F59E0B"/></svg>`; }

function renderShell(){
  const u=Session.user;
  document.body.innerHTML = `
  <div class="app" id="app">
    <div class="side-scrim" id="sscrim"></div>
    <aside class="side">
      <div class="brand">${logoMark(26)} ORBIT <small>by Starsonn</small></div>
      <nav class="nav" id="nav"></nav>
      <div class="side-foot"><div style="color:#fff;font-weight:600" id="coName"></div><div>${APP.version} · sample data</div></div>
    </aside>
    <div class="main">
      <header class="top">
        <button class="icon-btn menu-btn" id="menu" aria-label="Menu">${ic('menu')}</button>
        <button class="search-btn" id="sbtn">${ic('search')}<span class="lbl">Search items, orders, vendors, actions…</span><kbd>⌘K</kbd></button>
        <div class="sp"></div>
        <button class="btn-suggest" id="suggestTop" title="Tell Starsonn what to change or add">${ic('bulb')}<span class="lbl-long">Suggest changes or features</span><span class="lbl-short">Suggest</span></button>
        <button class="icon-btn" id="theme" title="Light / dark">${ic('moon')}</button>
        <button class="avatar" id="me" title="${esc(u.name)}">${esc(initials(u.name))}</button>
      </header>
      <main class="content" id="content"></main>
    </div>
  </div>`;
  $('#sbtn').onclick=openPalette;
  $('#suggestTop').onclick=()=>openSuggest();
  $('#theme').onclick=()=>{ const t=document.documentElement.dataset.theme==='dark'?'light':'dark'; document.documentElement.dataset.theme=t; store.set('orbit.theme',t); };
  $('#me').onclick=()=>modal({title:Session.user.name, sub:esc(Session.user.email), body:`<p class="muted">Signed in to the demo workspace. Your work is kept in this browser.</p>`, actions:[{label:'Change my name',onClick:()=>{ setTimeout(askName,50); }},{label:ic('logout')+'Sign out',onClick:()=>{ store.del('orbit.session'); Session.user=null; location.hash=''; renderLogin(); }}]});
  $('#menu').onclick=()=>$('#app').classList.add('nav-open');
  $('#sscrim').onclick=()=>$('#app').classList.remove('nav-open');
}
const initials = n => (n||'?').split(/\s+/).map(s=>s[0]).slice(0,2).join('').toUpperCase();
function drawNav(){
  const c=calc(); const reorder=DB.items.filter(i=>['Reorder','Short'].includes(c[i.id].status)).length;
  const lateP = DB.pos.filter(p=>OPEN_PO.includes(p.status)&&daysFrom(p.due)<0).length;
  const badge={reorder: reorder?`<span class="cnt bad">${reorder}</span>`:'', purchasing: lateP?`<span class="cnt bad">${lateP} late</span>`:'', suggestions:(DB.suggestions||[]).length?`<span class="cnt">${DB.suggestions.length}</span>`:''};
  $('#nav').innerHTML = NAV.map(([sec,its])=>`<div class="nav-sec">${sec}</div>`+its.map(([k,l,i])=>`<a href="#/${k}" class="${ROUTE===k?'on':''}">${ic(i)}${l}${badge[k]||''}</a>`).join('')).join('');
  $('#coName').textContent = DB.company;
  $$('#nav a').forEach(a=>a.onclick=()=>$('#app').classList.remove('nav-open'));
}
function pageHead(title,sub,acts='',crumb=''){
  return `<div class="ph"><div>${crumb?`<div class="crumb">${crumb}</div>`:''}<h1>${esc(title)}</h1>${sub?`<div class="sub">${sub}</div>`:''}</div><div class="acts">${acts}<button class="btn ghost" data-sug-page title="Suggest a change to this page">${ic('bulb')}Suggest for this page</button></div></div>`;
}
function bindPage(el){ $$('[data-sug-page]',el).forEach(b=>b.onclick=()=>openSuggest({area:pageName(ROUTE)})); }
function refresh(){ save(); drawNav(); route(true); }

/* ---------------- dashboard ---------------- */
V.dashboard = el => {
  const c=calc(); const its=DB.items;
  const value=its.reduce((a,i)=>a+c[i.id].value,0);
  const reorder=its.filter(i=>c[i.id].status==='Reorder'), short=its.filter(i=>c[i.id].status==='Short');
  const lateP=DB.pos.filter(p=>OPEN_PO.includes(p.status)&&daysFrom(p.due)<0);
  const openSO=DB.sos.filter(s=>OPEN_SO.includes(s.status)); const soVal=openSO.reduce((a,s)=>a+s.lines.reduce((b,l)=>b+(l.qty-l.shipped)*l.price,0),0);
  const lateSO=openSO.filter(s=>daysFrom(s.due)<0);
  const wip=DB.wos.filter(w=>['Released','In progress'].includes(w.status));
  // weekly value in/out
  const weeks=12, now=Date.now(); const inV=Array(weeks).fill(0), outV=Array(weeks).fill(0);
  DB.txns.forEach(t=>{ const w=Math.floor((now-new Date(t.ts))/DAY/7); if(w>=weeks) return; const it=item(t.itemId); const v=Math.abs(t.qty)*it.cost; if(t.qty>0&&['RECEIVE','BUILD'].includes(t.type)) inV[weeks-1-w]+=v; if(t.qty<0&&['ISSUE','SHIP','CONSUME'].includes(t.type)) outV[weeks-1-w]+=v; });
  const wl=[...Array(weeks)].map((_,i)=>{ const dt=new Date(now-(weeks-1-i)*7*DAY); return (dt.getMonth()+1)+'/'+dt.getDate(); });
  const byCat={}; its.forEach(i=>byCat[i.category]=(byCat[i.category]||0)+c[i.id].value);
  const catData=Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([k,v],i)=>({label:k,value:round(v,0),color:PAL[i%PAL.length]}));
  const attn=[
    ...short.map(i=>({ico:'!',cls:'bad',t:`<b>${esc(i.sku)}</b> is short ${fmtN(-c[i.id].avail)} ${esc(i.uom)} against open demand`,go:()=>openItem(i.id)})),
    ...lateSO.map(s=>({ico:'SO',cls:'bad',t:`<b>${esc(s.num)}</b> for ${esc(customer(s.customerId).name)} was due ${rel(s.due)}`,go:()=>openSO(s.id)})),
    ...lateP.map(p=>({ico:'PO',cls:'warn',t:`<b>${esc(p.num)}</b> from ${esc(vendor(p.vendorId).name)} is ${-daysFrom(p.due)}d late`,go:()=>openPO(p.id)})),
    ...DB.wos.filter(w=>!['Complete','Cancelled'].includes(w.status)&&daysFrom(w.due)<=2).map(w=>({ico:'WO',cls:'info',t:`<b>${esc(w.num)}</b> · ${esc(item(w.itemId).sku)} due ${rel(w.due)} (${w.done}/${w.qty} done)`,go:()=>openWO(w.id)})),
    ...reorder.slice(0,5).map(i=>({ico:'R',cls:'warn',t:`<b>${esc(i.sku)}</b> below reorder point (${fmtN(c[i.id].avail)} avail / ${fmtN(i.reorderPoint)} min)`,go:()=>openItem(i.id)}))
  ];
  const icoStyle={bad:'background:var(--badSoft);color:var(--bad)',warn:'background:var(--warnSoft);color:var(--warn)',info:'background:var(--infoSoft);color:var(--info)',ok:'background:var(--okSoft);color:var(--ok)',acc:'background:var(--accSoft);color:var(--accInk)'};
  const recent=DB.txns.slice(-9).reverse();
  const hr=new Date().getHours(); const greet=hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';
  el.innerHTML = pageHead(`${greet}, ${Session.user.name.split(' ')[0]}`, `${DB.company} · ${new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}`,
      `<button class="btn" data-act="receive">${ic('down')}Receive stock</button><button class="btn pri" onclick="location.hash='#/query'">${ic('query')}Ask a question</button>`) + `
    <div class="sug-card" style="margin-bottom:16px">${ic('bulb').replace('<svg','<svg width="30" height="30"')}<div><h3>This is your prototype — shape it.</h3><p>Click around with the sample data. Anything missing, confusing or that Q-inmass does better? Tell us and we'll build it.</p></div><button class="btn-suggest" data-sug>${ic('bulb')}Suggest changes or features</button></div>
    <div class="kpis">
      <a class="card kpi" href="#/inventory"><div class="l">Inventory value</div><div class="v">${fmt$k(value)}</div><div class="d">${its.length} active items · ${DB.stock.length} stock lots</div></a>
      <a class="card kpi ${reorder.length?'warn':''}" href="#/reorder"><div class="l">Below reorder point</div><div class="v">${reorder.length}</div><div class="d">not yet covered by open POs/WOs</div></a>
      <a class="card kpi ${short.length?'bad':''}" href="#/inventory" data-chip="short"><div class="l">Shortages</div><div class="v">${short.length}</div><div class="d">demand exceeds available</div></a>
      <a class="card kpi" href="#/sales"><div class="l">Open sales orders</div><div class="v">${fmt$k(soVal)}</div><div class="d">${openSO.length} orders · <span class="${lateSO.length?'neg':''}">${lateSO.length} late</span></div></a>
      <a class="card kpi ${lateP.length?'warn':''}" href="#/purchasing"><div class="l">Late purchase orders</div><div class="v">${lateP.length}</div><div class="d">${DB.pos.filter(p=>OPEN_PO.includes(p.status)).length} open POs</div></a>
      <a class="card kpi" href="#/workorders"><div class="l">Work orders in flight</div><div class="v">${wip.length}</div><div class="d">${DB.wos.filter(w=>w.status==='Planned').length} planned</div></a>
    </div>
    <div class="dash">
      <div class="stack">
        <div class="card"><div class="card-h"><h3>Stock flow, last 12 weeks</h3><span class="r muted small">value at standard cost</span></div><div class="card-b" id="flow">${lineChart([{name:'Received / built',color:PAL[1],values:inV.map(v=>round(v,0))},{name:'Issued / shipped',color:PAL[0],values:outV.map(v=>round(v,0))}],wl,{money:true})}</div></div>
        <div class="card"><div class="card-h"><h3>Recent stock activity</h3><div class="r"><a class="link small" href="#/transactions">All history →</a></div></div>
          <ul class="activity">${recent.map(t=>{ const it=item(t.itemId); return `<li><span class="tico" style="${icoStyle[t.qty>0?'ok':'acc']}">${esc(t.type.slice(0,3))}</span><div style="min-width:0;flex:1"><a class="link" data-item="${it.id}">${esc(it.sku)}</a> <span class="${t.qty>0?'pos':'neg'}">${t.qty>0?'+':''}${fmtN(t.qty)} ${esc(it.uom)}</span> <span class="muted">· ${esc(t.loc)}${t.lot?' · '+esc(t.lot):''} · ${esc(t.ref)}</span></div><span class="muted small">${esc(t.user)} · ${fmtDT(t.ts)}</span></li>`; }).join('')}</ul></div>
      </div>
      <div class="stack">
        <div class="card"><div class="card-h"><h3>Needs attention</h3><span class="r pill ${attn.length?'bad':'ok'}">${attn.length}</span></div><ul class="activity attn">${attn.slice(0,12).map((a,i)=>`<li data-attn="${i}"><span class="tico" style="${icoStyle[a.cls]}">${a.ico}</span><div>${a.t}</div></li>`).join('')||'<li class="muted">All clear.</li>'}</ul></div>
        <div class="card"><div class="card-h"><h3>Value by category</h3></div><div class="card-b" id="cat">${barChart(catData,{money:true,horizontal:true})}</div></div>
      </div>
    </div>`;
  $$('[data-attn]',el).forEach(li=>li.onclick=()=>attn[+li.dataset.attn].go());
  $$('[data-item]',el).forEach(a=>a.onclick=()=>openItem(a.dataset.item));
  $$('[data-sug]',el).forEach(b=>b.onclick=()=>openSuggest());
  $$('[data-act]',el).forEach(b=>b.onclick=()=>stockAction(b.dataset.act));
  $$('[data-chip]',el).forEach(a=>a.addEventListener('click',()=>{ TState.inv=TState.inv||null; if(TState.inv) TState.inv.chip=a.dataset.chip; else PARAMS.chip=a.dataset.chip; store.set('orbit.nextchip',a.dataset.chip); }));
  tipOn($('#flow',el)); tipOn($('#cat',el));
};

/* ---------------- inventory ---------------- */
const vName = id => id? (vendor(id)||{}).name||'' : '';
function itemColumns(){
  const c=calc();
  return [
    {k:'sku',label:'SKU',get:i=>i.sku,html:i=>`<span class="mono link">${esc(i.sku)}</span>`},
    {k:'name',label:'Description',get:i=>i.name,cls:'wrap'},
    {k:'type',label:'Type',get:i=>i.type},
    {k:'category',label:'Category',get:i=>i.category,hide:true},
    {k:'loc',label:'Home bin',get:i=>i.defaultLoc,html:i=>`<span class="mono">${esc(i.defaultLoc)}</span>`,hide:true},
    {k:'onHand',label:'On hand',num:true,get:i=>c[i.id].onHand,fmt:v=>fmtN(v)},
    {k:'hold',label:'QC hold',num:true,get:i=>c[i.id].hold,fmt:v=>v?fmtN(v):'—',hide:true},
    {k:'alloc',label:'Allocated',num:true,get:i=>c[i.id].alloc,fmt:v=>v?fmtN(v):'—'},
    {k:'avail',label:'Available',num:true,get:i=>c[i.id].avail,html:i=>`<b class="${c[i.id].avail<0?'neg':''}">${fmtN(c[i.id].avail)}</b>`},
    {k:'onOrder',label:'On order',num:true,get:i=>c[i.id].onOrder,fmt:v=>v?fmtN(v):'—'},
    {k:'uom',label:'UoM',get:i=>i.uom},
    {k:'rop',label:'Reorder pt',num:true,get:i=>i.reorderPoint,fmt:v=>fmtN(v)},
    {k:'cover',label:'Coverage',get:i=>i.reorderPoint?c[i.id].avail/i.reorderPoint:0,html:i=>{ const r=Math.max(0,Math.min(1,c[i.id].avail/(i.reorderPoint*2||1))); const s=c[i.id].status; return `<div class="bar ${s==='OK'?'ok':s==='Short'?'bad':'warn'}" title="Available vs. 2× reorder point"><i style="width:${r*100}%"></i></div>`; },csv:i=>round(c[i.id].avail/(i.reorderPoint||1),2)},
    {k:'dos',label:'Days supply',num:true,get:i=>c[i.id].dos==null?9999:c[i.id].dos,fmt:(v)=>v===9999?'—':fmtN(v)},
    {k:'cost',label:'Unit cost',num:true,get:i=>i.cost,fmt:v=>fmt$(v),hide:true},
    {k:'value',label:'Value',num:true,get:i=>c[i.id].value,fmt:v=>fmt$(v,0),total:true},
    {k:'status',label:'Status',get:i=>c[i.id].status,html:i=>statusPill(c[i.id].status)},
    {k:'abc',label:'ABC',get:i=>i.abc,hide:true},
    {k:'vendor',label:'Vendor',get:i=>vName(i.vendorId),hide:true},
    {k:'lot',label:'Lots',get:i=>i.lotTracked?'Yes':'No',hide:true},
    {k:'idle',label:'Days idle',num:true,get:i=>c[i.id].idle,hide:true},
    {k:'lastCount',label:'Last counted',get:i=>i.lastCount,fmt:v=>fmtD(v),hide:true}
  ];
}
V.inventory = el => {
  const c=calc();
  el.innerHTML = pageHead('Items & stock','Available = on hand − QC hold − allocated to open sales and work orders.',
    `<button class="btn" data-act="adjust">Adjust</button><button class="btn" data-act="transfer">Transfer</button><button class="btn" data-act="receive">${ic('down')}Receive</button><button class="btn pri" id="newItem">${ic('plus')}New item</button>`) + `<div class="card" id="tbl"></div>`;
  const nextChip=store.get('orbit.nextchip',null); if(nextChip){ store.del('orbit.nextchip'); (TState.inv=TState.inv||{sort:'sku',dir:1,q:'',chip:'all',hidden:null}); TState.inv.chip=nextChip; if(!TState.inv.hidden) delete TState.inv; }
  table($('#tbl',el),{key:'inv',noun:'items',rows:DB.items.filter(i=>i.active!==false),columns:itemColumns(),sort:'sku',totals:true,onRow:i=>openItem(i.id),chipDefault:nextChip||'all',
    chips:[{k:'all',label:'All'},{k:'reorder',label:'Needs reorder',test:i=>c[i.id].status==='Reorder'},{k:'short',label:'Short',test:i=>c[i.id].status==='Short'},{k:'low',label:'Low · on order',test:i=>c[i.id].status==='On order'},
      {k:'Raw',label:'Raw',test:i=>i.type==='Raw'},{k:'Purchased',label:'Purchased',test:i=>i.type==='Purchased'},{k:'Component',label:'Made parts',test:i=>i.type==='Component'},{k:'Finished',label:'Finished',test:i=>i.type==='Finished'},
      {k:'idle',label:'Idle 30d+',test:i=>c[i.id].idle>=30},{k:'hold',label:'In QC hold',test:i=>c[i.id].hold>0}]});
  $$('[data-act]',el).forEach(b=>b.onclick=()=>stockAction(b.dataset.act));
  $('#newItem',el).onclick=()=>editItem();
};

function openItem(id,tab='overview'){
  const it=item(id); if(!it) return; const x=Q(id);
  const d=drawer(`<div class="drawer-h"><div style="flex:1;min-width:0"><div class="crumb">${esc(it.type)} · ${esc(it.category)}</div><h2><span class="mono" style="font-size:16px">${esc(it.sku)}</span></h2><div class="muted">${esc(it.name)}</div></div>${statusPill(x.status)}<button class="x" data-close aria-label="Close">×</button></div>
    <div class="drawer-b">
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
        <button class="btn sm" data-a="receive">${ic('down')}Receive</button><button class="btn sm" data-a="issue">Issue</button><button class="btn sm" data-a="adjust">Adjust</button><button class="btn sm" data-a="transfer">Transfer</button><button class="btn sm" data-a="count">Count</button>
        <span style="flex:1"></span>${bomOf(id)?`<button class="btn sm" data-wo>${ic('tool')}New work order</button>`:''}${it.vendorId?`<button class="btn sm" data-po>${ic('cart')}Buy</button>`:''}<button class="btn sm ghost" data-edit>Edit</button>
      </div>
      <div class="stats">
        <div class="stat"><div class="l">On hand</div><div class="v">${fmtN(x.onHand)}</div></div>
        <div class="stat"><div class="l">Allocated</div><div class="v">${fmtN(x.alloc)}</div></div>
        <div class="stat"><div class="l">Available</div><div class="v ${x.avail<0?'neg':''}">${fmtN(x.avail)}</div></div>
        <div class="stat"><div class="l">On order</div><div class="v">${fmtN(x.onOrder)}</div></div>
        <div class="stat"><div class="l">Days supply</div><div class="v">${x.dos==null?'—':x.dos}</div></div>
        <div class="stat"><div class="l">Value</div><div class="v">${fmt$k(x.value)}</div></div>
      </div>
      <div class="tabs">${['overview:Stock & lots','history:History','orders:Open orders','bom:'+(bomOf(id)?'BOM':'Where used'),'details:Details'].map(t=>{const [k,l]=t.split(':');return `<button data-tab="${k}" class="${tab===k?'on':''}">${l}</button>`;}).join('')}</div>
      <div id="tabBody"></div>
    </div>`);
  const body=$('#tabBody',d);
  const tabs={
    overview(){
      const rows=DB.stock.filter(s=>s.itemId===id);
      body.innerHTML = (x.hold?`<div class="note warn">${fmtN(x.hold)} ${esc(it.uom)} sitting in QC hold — not counted as available until released.</div>`:'')+ `<div class="card" id="st"></div>
        <div class="card" style="margin-top:14px"><div class="card-h"><h3>Usage, last 90 days</h3><span class="r muted small">${fmtN(x.used30)} ${esc(it.uom)} last 30d · avg ${fmtN(x.daily,1)}/day</span></div><div class="card-b" id="u"></div></div>`;
      table($('#st',body),{key:'itstock',bare:true,free:true,rows,columns:[
        {k:'loc',label:'Location',get:s=>s.loc,html:s=>`<span class="mono">${esc(s.loc)}</span>${HOLD_LOCS.includes(s.loc)?' <span class="pill warn">hold</span>':''}`},
        {k:'lot',label:'Lot',get:s=>s.lot||'—',html:s=>`<span class="mono">${esc(s.lot||'—')}</span>`},
        {k:'rec',label:'Received',get:s=>s.received,fmt:v=>fmtD(v)},
        {k:'qty',label:'Qty',num:true,get:s=>s.qty,fmt:v=>fmtN(v)+' '+it.uom},
        {k:'act',label:'',get:()=>'',html:s=>`${HOLD_LOCS.includes(s.loc)?`<button class="btn sm" data-rel="${esc(s.loc)}|${esc(s.lot)}">Release</button> `:''}<button class="btn sm" data-mv="${esc(s.loc)}|${esc(s.lot)}">Move</button>`}
      ],empty:'No stock on hand.'});
      $$('[data-mv]',body).forEach(b=>b.onclick=()=>{ const [l,lt]=b.dataset.mv.split('|'); stockAction('transfer',id,{loc:l,lot:lt}); });
      $$('[data-rel]',body).forEach(b=>b.onclick=()=>{ const [l,lt]=b.dataset.rel.split('|'); const r=DB.stock.find(s=>s.itemId===id&&s.loc===l&&s.lot===lt); const e=transfer({itemId:id,qty:r.qty,from:l,to:it.defaultLoc,lot:lt,ref:'QC release',note:'Passed inspection'}); if(e) return toast(e); save(); toast('Released to '+it.defaultLoc,'ok'); openItem(id); refresh(); });
      const days=90, arr=Array(13).fill(0); const now=Date.now();
      DB.txns.forEach(t=>{ if(t.itemId!==id||t.qty>=0||!['ISSUE','SHIP','CONSUME'].includes(t.type)) return; const w=Math.floor((now-new Date(t.ts))/DAY/7); if(w<13) arr[12-w]+=-t.qty; });
      $('#u',body).innerHTML = barChart(arr.map((v,i)=>({label:'W'+(i-12||'now'),value:round(v,1)})),{h:170}); tipOn($('#u',body));
    },
    history(){
      const tx=DB.txns.filter(t=>t.itemId===id); let bal=x.onHand; const rows=[];
      for(let i=tx.length-1;i>=0;i--){ rows.push({...tx[i],bal:round(bal,3)}); bal-=tx[i].qty; }
      body.innerHTML='<div class="card" id="ht"></div>';
      table($('#ht',body),{key:'ithist',noun:'movements',rows,columns:[
        {k:'ts',label:'When',get:t=>t.ts,fmt:v=>fmtDT(v)},{k:'type',label:'Type',get:t=>t.type},{k:'qty',label:'Qty',num:true,get:t=>t.qty,html:t=>`<span class="${t.qty>0?'pos':'neg'}">${t.qty>0?'+':''}${fmtN(t.qty)}</span>`},{k:'bal',label:'Balance',num:true,get:t=>t.bal,fmt:v=>fmtN(v)},
        {k:'loc',label:'Location',get:t=>t.loc},{k:'lot',label:'Lot',get:t=>t.lot||''},{k:'ref',label:'Reference',get:t=>t.ref},{k:'user',label:'By',get:t=>t.user},{k:'note',label:'Note',get:t=>t.note,hide:true}],
        chips:[{k:'all',label:'All'},{k:'in',label:'In',test:t=>t.qty>0},{k:'out',label:'Out',test:t=>t.qty<0},{k:'adj',label:'Adjust / count',test:t=>['ADJUST','COUNT'].includes(t.type)}]});
    },
    orders(){
      const sl=[],pl=[],wl=[];
      DB.sos.filter(s=>OPEN_SO.includes(s.status)).forEach(s=>s.lines.forEach(l=>{ if(l.itemId===id&&l.qty>l.shipped) sl.push({doc:s.num,id:s.id,who:customer(s.customerId).name,due:s.due,qty:l.qty-l.shipped,k:'so'}); }));
      DB.pos.filter(p=>OPEN_PO.includes(p.status)||p.status==='Draft').forEach(p=>p.lines.forEach(l=>{ if(l.itemId===id&&l.qty>l.received) pl.push({doc:p.num,id:p.id,who:vendor(p.vendorId).name+(p.status==='Draft'?' (draft)':''),due:p.due,qty:l.qty-l.received,k:'po'}); }));
      DB.wos.filter(w=>!['Complete','Cancelled'].includes(w.status)).forEach(w=>{ if(w.itemId===id) wl.push({doc:w.num,id:w.id,who:'Makes this item',due:w.due,qty:w.qty-w.done,k:'wo'}); else if(!w.issued){ const b=bomOf(w.itemId); const ln=b&&b.lines.find(l=>l.itemId===id); if(ln) wl.push({doc:w.num,id:w.id,who:'Consumes · '+item(w.itemId).sku,due:w.due,qty:-(ln.qty*(w.qty-w.done)),k:'wo'}); } });
      const rows=[...sl.map(r=>({...r,qty:-r.qty,kind:'Sales order'})),...pl.map(r=>({...r,kind:'Purchase order'})),...wl.map(r=>({...r,kind:'Work order'}))].sort((a,b)=>a.due<b.due?-1:1);
      let run=x.onHand-x.hold; rows.forEach(r=>{ run+=r.qty; r.proj=round(run,3); });
      body.innerHTML=`<p class="muted small">Projected balance walks forward through every open order by due date, so you can see exactly when you'd run out.</p><div class="card" id="ot"></div>`;
      table($('#ot',body),{key:'itord',bare:true,free:true,rows,empty:'No open orders touch this item.',columns:[
        {k:'due',label:'Due',get:r=>r.due,html:r=>`${fmtD(r.due)} <span class="muted small">${rel(r.due)}</span>`},{k:'kind',label:'Type',get:r=>r.kind},{k:'doc',label:'Doc',get:r=>r.doc,html:r=>`<span class="link mono">${esc(r.doc)}</span>`},{k:'who',label:'For',get:r=>r.who},
        {k:'qty',label:'Qty',num:true,get:r=>r.qty,html:r=>`<span class="${r.qty>0?'pos':'neg'}">${r.qty>0?'+':''}${fmtN(r.qty)}</span>`},{k:'proj',label:'Projected',num:true,get:r=>r.proj,html:r=>`<b class="${r.proj<0?'neg':''}">${fmtN(r.proj)}</b>`}],
        onRow:r=>{ ({so:openSO,po:openPO,wo:openWO})[r.k](r.id); }});
    },
    bom(){
      const b=bomOf(id);
      if(b){ body.innerHTML=bomTreeHtml(id)+`<div style="margin-top:10px"><button class="btn sm" onclick="closeDrawer();location.hash='#/boms';setTimeout(()=>openBOM('${id}'),50)">Open BOM editor</button></div>`; }
      else { const wu=whereUsed(id); body.innerHTML = wu.length? `<div class="card"><table class="t"><thead><tr><th>Used in</th><th>Description</th><th class="num">Qty per</th></tr></thead><tbody>${wu.map(b=>{const p=item(b.itemId);const l=b.lines.find(l=>l.itemId===id);return `<tr data-id="${p.id}"><td class="mono link">${esc(p.sku)}</td><td>${esc(p.name)}</td><td class="num">${fmtN(l.qty)} ${esc(it.uom)}</td></tr>`;}).join('')}</tbody></table></div>`:'<div class="empty-state">Not used in any bill of material.</div>';
        $$('tr[data-id]',body).forEach(tr=>tr.onclick=()=>openItem(tr.dataset.id)); }
    },
    details(){
      body.innerHTML=`<dl class="kv"><dt>SKU</dt><dd class="mono">${esc(it.sku)}</dd><dt>Description</dt><dd>${esc(it.name)}</dd><dt>Type / category</dt><dd>${esc(it.type)} · ${esc(it.category)}</dd><dt>Unit of measure</dt><dd>${esc(it.uom)}</dd><dt>Standard cost</dt><dd>${fmt$(it.cost)}${bomOf(id)?' <span class="muted small">(rolled up from BOM + labor)</span>':''}</dd>${it.price?`<dt>List price</dt><dd>${fmt$(it.price)} <span class="muted small">(${round((1-it.cost/it.price)*100,1)}% margin)</span></dd>`:''}
        <dt>Reorder point / qty</dt><dd>${fmtN(it.reorderPoint)} / ${fmtN(it.reorderQty)} ${esc(it.uom)}</dd><dt>Preferred vendor</dt><dd>${esc(vName(it.vendorId)||'— made in-house')}</dd><dt>Home bin</dt><dd class="mono">${esc(it.defaultLoc)}</dd><dt>Lot tracked</dt><dd>${it.lotTracked?'Yes':'No'}</dd><dt>ABC class</dt><dd>${esc(it.abc)} <span class="muted small">(counted every ${({A:30,B:60,C:90})[it.abc]} days)</span></dd><dt>Last counted</dt><dd>${fmtD(it.lastCount)}</dd><dt>Notes</dt><dd>${esc(it.notes||'—')}</dd></dl>`;
    }
  };
  $$('[data-tab]',d).forEach(b=>b.onclick=()=>{ $$('[data-tab]',d).forEach(x=>x.classList.toggle('on',x===b)); tabs[b.dataset.tab](); });
  $$('[data-a]',d).forEach(b=>b.onclick=()=>stockAction(b.dataset.a,id));
  const e=$('[data-edit]',d); e.onclick=()=>editItem(id);
  const w=$('[data-wo]',d); if(w) w.onclick=()=>newWO(id);
  const p=$('[data-po]',d); if(p) p.onclick=()=>newPO(it.vendorId,[{itemId:id,qty:Math.max(it.reorderQty,x.suggest)}]);
  tabs[tab]();
}

function itemPicker(name='item',sel='',filter=()=>true){
  const opts=DB.items.filter(filter).map(i=>`<option value="${esc(i.sku)}">${esc(i.name)}</option>`).join('');
  const it=sel?item(sel):null;
  return `<input class="in mono" name="${name}" list="dl-${name}" placeholder="Type a SKU or name…" value="${esc(it?it.sku:'')}" autocomplete="off"><datalist id="dl-${name}">${opts}</datalist>`;
}
const locOptions=(sel,filter=()=>true)=>DB.locations.filter(filter).map(l=>`<option value="${esc(l.code)}" ${l.code===sel?'selected':''}>${esc(l.code)} — ${esc(l.desc)}</option>`).join('');

function stockAction(kind,itemId,pre={}){
  const T={receive:'Receive stock',issue:'Issue stock',adjust:'Adjust quantity',transfer:'Transfer between locations',count:'Count an item'}[kind];
  const it=itemId?item(itemId):null;
  const reasons=['Correction','Damaged','Scrap','Found','Sample / testing','Returned by customer'];
  const body=`
    <label class="f"><span>Item</span>${itemPicker('item',itemId)}</label>
    <div id="ctx" class="small muted" style="margin:-6px 0 12px"></div>
    ${kind==='transfer'?`<div class="grid2"><label class="f"><span>From</span><select class="in" name="from"></select></label><label class="f"><span>To</span><select class="in" name="to">${locOptions('')}</select></label></div>`:
      `<label class="f"><span>Location</span><select class="in" name="loc"></select></label>`}
    <div class="grid2">
      <label class="f"><span>${kind==='count'?'Counted quantity':kind==='adjust'?'Change (+ or −)':'Quantity'}</span><input class="in" name="qty" type="number" step="any" inputmode="decimal"></label>
      <label class="f" id="lotWrap"><span>Lot</span><input class="in mono" name="lot" list="dl-lots" placeholder="${kind==='receive'?'Auto-assign':'Oldest first (FIFO)'}"><datalist id="dl-lots"></datalist></label>
    </div>
    ${kind==='adjust'?`<label class="f"><span>Reason</span><select class="in" name="reason">${reasons.map(r=>`<option>${r}</option>`).join('')}</select></label>`:''}
    ${kind==='receive'?`<label class="f" style="display:flex;gap:8px;align-items:center"><input type="checkbox" name="qc"> <span style="margin:0">Send to receiving inspection (QC hold) first</span></label>`:''}
    <div class="grid2"><label class="f"><span>Reference</span><input class="in" name="ref" placeholder="${kind==='receive'?'Packing slip / PO':'WO, SO, ticket…'}"></label><label class="f"><span>Note</span><input class="in" name="note"></label></div>
    <div id="preview"></div>`;
  modal({title:T,body,actions:[{label:'Cancel'},{label:'Post',pri:true,onClick:(d,form)=>{
      const it=itemBySku(d.item); if(!it) return fieldErr(form,'Pick an item from the list.');
      const q=+d.qty; if(!(q||q===0)||(kind!=='count'&&kind!=='adjust'&&q<=0)) return fieldErr(form,'Enter a quantity greater than zero.');
      let err=null; const ref=d.ref||(kind==='adjust'?d.reason:''), note=kind==='adjust'?(d.reason+(d.note?' — '+d.note:'')):d.note;
      if(kind==='receive') err=post({type:'RECEIVE',itemId:it.id,qty:q,loc:d.qc?'MAIN-QC':d.loc,lot:d.lot,ref,note});
      if(kind==='issue') err=post({type:'ISSUE',itemId:it.id,qty:-q,loc:d.loc,lot:d.lot,ref,note});
      if(kind==='adjust'){ if(!q) return fieldErr(form,'Enter a non-zero change.'); err=post({type:'ADJUST',itemId:it.id,qty:q,loc:d.loc,lot:d.lot,ref,note}); }
      if(kind==='transfer') err=transfer({itemId:it.id,qty:q,from:d.from,to:d.to,lot:d.lot,ref,note});
      if(kind==='count'){ const sys=DB.stock.filter(s=>s.itemId===it.id&&s.loc===d.loc&&(!d.lot||s.lot===d.lot)).reduce((a,s)=>a+s.qty,0); const v=round(q-sys,3); if(v) err=post({type:'COUNT',itemId:it.id,qty:v,loc:d.loc,lot:d.lot,ref:ref||'Spot count',note:note||`System ${fmtN(sys)}, counted ${fmtN(q)}`}); it.lastCount=new Date().toISOString(); if(!err) toast(v?`Count posted · variance ${v>0?'+':''}${fmtN(v)} ${it.uom}`:'Count matches — no adjustment needed','ok'); }
      if(err) return fieldErr(form,err);
      if(kind!=='count') toast(`${T.split(' ')[0]} posted · ${it.sku}`,'ok');
      refresh(); if(_drawer&&$('.drawer h2')) openItem(it.id);
    }}],
    onOpen:form=>{
      const upd=()=>{
        const it=itemBySku(form.item.value); const ctx=$('#ctx',form);
        if(!it){ ctx.textContent=''; return; }
        const x=Q(it.id); ctx.innerHTML=`${esc(it.name)} · on hand <b>${fmtN(x.onHand)}</b> ${esc(it.uom)} · available <b>${fmtN(x.avail)}</b>`;
        const here=[...new Set(DB.stock.filter(s=>s.itemId===it.id).map(s=>s.loc))];
        const sel=form.loc||form.from; const cur=pre.loc||sel.value;
        if(kind==='receive') sel.innerHTML=locOptions(cur||it.defaultLoc);
        else { const list=here.length?here:[it.defaultLoc]; if(kind==='count'||kind==='adjust') list.push(...DB.locations.map(l=>l.code).filter(c=>!list.includes(c))); sel.innerHTML=list.map(l=>`<option ${l===(cur||it.defaultLoc)?'selected':''} value="${esc(l)}">${esc(l)} ${here.includes(l)?'· '+fmtN(DB.stock.filter(s=>s.itemId===it.id&&s.loc===l).reduce((a,s)=>a+s.qty,0))+' '+esc(it.uom):''}</option>`).join(''); }
        $('#lotWrap',form).hidden=!it.lotTracked;
        const lots=DB.stock.filter(s=>s.itemId===it.id&&s.lot&&s.loc===sel.value); $('#dl-lots',form).innerHTML=lots.map(s=>`<option value="${esc(s.lot)}">${fmtN(s.qty)} ${esc(it.uom)} · rec ${fmtD(s.received)}</option>`).join('');
        if(pre.lot&&!form.lot.value) form.lot.value=pre.lot;
        if(kind==='count'){ const sys=DB.stock.filter(s=>s.itemId===it.id&&s.loc===sel.value).reduce((a,s)=>a+s.qty,0); $('#preview',form).innerHTML=`<div class="note info">System says <b>${fmtN(sys)} ${esc(it.uom)}</b> in ${esc(sel.value)}. Enter what's physically there; the difference posts as a count adjustment.</div>`; }
      };
      form.item.addEventListener('change',upd); form.item.addEventListener('input',()=>{ if(itemBySku(form.item.value)) upd(); });
      (form.loc||form.from).addEventListener('change',upd);
      upd();
    }});
}

function editItem(id){
  const it=id?item(id):{sku:'',name:'',type:'Purchased',category:'',uom:'ea',cost:0,price:0,reorderPoint:0,reorderQty:0,vendorId:'',lotTracked:false,abc:'C',defaultLoc:'MAIN-B-01',notes:''};
  const cats=[...new Set(DB.items.map(i=>i.category))];
  modal({title:id?'Edit '+it.sku:'New item',wide:true,body:`
    <div class="grid3"><label class="f"><span>SKU</span><input class="in mono" name="sku" value="${esc(it.sku)}" ${id?'':'placeholder="e.g. HW-SHCS-M8-25"'}></label>
    <label class="f" style="grid-column:span 2"><span>Description</span><input class="in" name="name" value="${esc(it.name)}"></label></div>
    <div class="grid3"><label class="f"><span>Type</span><select class="in" name="type">${['Raw','Purchased','Component','Finished','Consumable'].map(t=>`<option ${t===it.type?'selected':''}>${t}</option>`).join('')}</select></label>
    <label class="f"><span>Category</span><input class="in" name="category" list="dl-cat" value="${esc(it.category)}"><datalist id="dl-cat">${cats.map(c=>`<option>${esc(c)}</option>`).join('')}</datalist></label>
    <label class="f"><span>Unit of measure</span><input class="in" name="uom" value="${esc(it.uom)}"></label></div>
    <div class="grid3"><label class="f"><span>Standard cost ($)</span><input class="in" type="number" step="any" name="cost" value="${it.cost}"></label><label class="f"><span>List price ($)</span><input class="in" type="number" step="any" name="price" value="${it.price}"></label>
    <label class="f"><span>Preferred vendor</span><select class="in" name="vendorId"><option value="">— none / made in-house</option>${DB.vendors.map(v=>`<option value="${v.id}" ${v.id===it.vendorId?'selected':''}>${esc(v.name)}</option>`).join('')}</select></label></div>
    <div class="grid3"><label class="f"><span>Reorder point</span><input class="in" type="number" step="any" name="reorderPoint" value="${it.reorderPoint}"></label><label class="f"><span>Reorder qty</span><input class="in" type="number" step="any" name="reorderQty" value="${it.reorderQty}"></label>
    <label class="f"><span>Home bin</span><select class="in" name="defaultLoc">${locOptions(it.defaultLoc)}</select></label></div>
    <div class="grid3"><label class="f"><span>ABC class</span><select class="in" name="abc">${['A','B','C'].map(t=>`<option ${t===it.abc?'selected':''}>${t}</option>`).join('')}</select></label><label class="f" style="display:flex;gap:8px;align-items:center;margin-top:22px"><input type="checkbox" name="lotTracked" ${it.lotTracked?'checked':''}> Lot tracked</label></div>
    <label class="f"><span>Notes</span><textarea class="in" name="notes" rows="2">${esc(it.notes||'')}</textarea></label>`,
    actions:[{label:'Cancel'},{label:id?'Save':'Create item',pri:true,onClick:(d,form)=>{
      if(!d.sku.trim()||!d.name.trim()) return fieldErr(form,'SKU and description are required.');
      const dup=itemBySku(d.sku.trim()); if(dup&&dup.id!==id) return fieldErr(form,'That SKU already exists.');
      const o={...it,...d,sku:d.sku.trim().toUpperCase(),cost:+d.cost||0,price:+d.price||0,reorderPoint:+d.reorderPoint||0,reorderQty:+d.reorderQty||0};
      if(id) Object.assign(item(id),o); else { o.id='I'+(1000+DB.items.length+Math.floor(Math.random()*900)); o.active=true; o.lastCount=new Date().toISOString(); DB.items.push(o); }
      toast(id?'Item saved':'Item created','ok'); refresh(); openItem(id||o.id);
    }}]});
}

/* ---------------- locations ---------------- */
V.locations = el => {
  const c=calc();
  const rows=DB.locations.map(l=>{ const s=DB.stock.filter(x=>x.loc===l.code); return {...l, skus:new Set(s.map(x=>x.itemId)).size, lots:s.length, value:s.reduce((a,x)=>a+x.qty*item(x.itemId).cost,0)}; });
  el.innerHTML = pageHead('Locations','Warehouses and bins. Click a bin to see exactly what is in it.',`<button class="btn" data-act="transfer">Transfer</button><button class="btn pri" id="newLoc">${ic('plus')}New location</button>`)+`<div class="card" id="lt"></div>`;
  table($('#lt',el),{key:'locs',noun:'locations',rows,totals:true,columns:[
    {k:'code',label:'Code',get:l=>l.code,html:l=>`<span class="mono link">${esc(l.code)}</span>${HOLD_LOCS.includes(l.code)?' <span class="pill warn">hold</span>':''}`},{k:'wh',label:'Warehouse',get:l=>l.wh},{k:'zone',label:'Zone',get:l=>l.zone},{k:'desc',label:'Description',get:l=>l.desc},
    {k:'skus',label:'Items',num:true,get:l=>l.skus},{k:'lots',label:'Stock rows',num:true,get:l=>l.lots},{k:'value',label:'Value',num:true,get:l=>l.value,fmt:v=>fmt$(v,0),total:true}],onRow:l=>openLoc(l.code)});
  $('[data-act]',el).onclick=()=>stockAction('transfer');
  $('#newLoc',el).onclick=()=>modal({title:'New location',body:`<div class="grid2"><label class="f"><span>Code</span><input class="in mono" name="code" placeholder="MAIN-E-01"></label><label class="f"><span>Warehouse</span><input class="in" name="wh" value="Main"></label></div><div class="grid2"><label class="f"><span>Zone</span><input class="in" name="zone"></label><label class="f"><span>Description</span><input class="in" name="desc"></label></div>`,actions:[{label:'Cancel'},{label:'Create',pri:true,onClick:(d,f)=>{ if(!d.code) return fieldErr(f,'Code required'); if(DB.locations.some(l=>l.code===d.code.toUpperCase())) return fieldErr(f,'Code exists'); DB.locations.push({...d,code:d.code.toUpperCase()}); refresh(); }}]});
};
function openLoc(code){
  const l=DB.locations.find(x=>x.code===code); const rows=DB.stock.filter(s=>s.loc===code);
  const d=drawer(`<div class="drawer-h"><div style="flex:1"><div class="crumb">${esc(l.wh)} · ${esc(l.zone)}</div><h2 class="mono">${esc(code)}</h2><div class="muted">${esc(l.desc)}</div></div><button class="x" data-close>×</button></div><div class="drawer-b"><div class="card" id="lc"></div></div>`);
  table($('#lc',d),{key:'locc',noun:'stock rows',rows,totals:true,columns:[{k:'sku',label:'SKU',get:s=>item(s.itemId).sku,html:s=>`<span class="mono link">${esc(item(s.itemId).sku)}</span>`},{k:'name',label:'Item',get:s=>item(s.itemId).name,cls:'wrap'},{k:'lot',label:'Lot',get:s=>s.lot||'—'},{k:'qty',label:'Qty',num:true,get:s=>s.qty,fmt:(v,s)=>fmtN(v)+' '+item(s.itemId).uom},{k:'value',label:'Value',num:true,get:s=>s.qty*item(s.itemId).cost,fmt:v=>fmt$(v,0),total:true}],onRow:s=>openItem(s.itemId),empty:'Empty bin.'});
}

/* ---------------- transactions ---------------- */
V.transactions = el => {
  const days=+(PARAMS.days||store.get('orbit.txdays',30));
  const since=Date.now()-days*DAY; const rows=DB.txns.filter(t=>days>=9999||new Date(t.ts)>=since).slice().reverse();
  el.innerHTML = pageHead('Stock history','Every movement, who did it and why — the audit trail.',`<div class="seg" id="rng">${[7,30,90,9999].map(n=>`<button data-d="${n}" class="${n===days?'on':''}">${n===9999?'All':n+' days'}</button>`).join('')}</div>`)+`<div class="card" id="tt"></div>`;
  const types=['RECEIVE','ISSUE','SHIP','BUILD','CONSUME','ADJUST','TRANSFER','COUNT'];
  table($('#tt',el),{key:'tx',noun:'movements',rows,columns:[
    {k:'ts',label:'When',get:t=>t.ts,fmt:v=>fmtDT(v)},{k:'type',label:'Type',get:t=>t.type,html:t=>`<span class="pill ${t.qty>0?'ok':'acc'}">${esc(t.type)}</span>`},
    {k:'sku',label:'SKU',get:t=>item(t.itemId).sku,html:t=>`<span class="mono link">${esc(item(t.itemId).sku)}</span>`},{k:'name',label:'Item',get:t=>item(t.itemId).name,hide:true},
    {k:'qty',label:'Qty',num:true,get:t=>t.qty,html:t=>`<span class="${t.qty>0?'pos':'neg'}">${t.qty>0?'+':''}${fmtN(t.qty)}</span> <span class="muted small">${esc(item(t.itemId).uom)}</span>`},
    {k:'value',label:'Value',num:true,get:t=>round(t.qty*item(t.itemId).cost,2),fmt:v=>fmt$(v)},
    {k:'loc',label:'Location',get:t=>t.loc,html:t=>`<span class="mono">${esc(t.loc)}</span>`},{k:'lot',label:'Lot',get:t=>t.lot},{k:'ref',label:'Reference',get:t=>t.ref},{k:'user',label:'By',get:t=>t.user},{k:'note',label:'Note',get:t=>t.note,hide:true}],
    chips:[{k:'all',label:'All'},...types.map(t=>({k:t,label:t[0]+t.slice(1).toLowerCase(),test:x=>x.type===t}))],onRow:t=>openItem(t.itemId)});
  $$('#rng button',el).forEach(b=>b.onclick=()=>{ store.set('orbit.txdays',+b.dataset.d); PARAMS.days=b.dataset.d; route(true); });
};

/* ---------------- reorder planner ---------------- */
V.reorder = el => {
  const c=calc(); const need=DB.items.filter(i=>['Reorder','Short'].includes(c[i.id].status));
  const buy=need.filter(i=>i.vendorId), make=need.filter(i=>!i.vendorId&&bomOf(i.id));
  const byV={}; buy.forEach(i=>(byV[i.vendorId]=byV[i.vendorId]||[]).push(i));
  el.innerHTML = pageHead('Reorder planner','Items where available + on order ≤ reorder point. Suggested qty tops you back up past the reorder point.',
    `<button class="btn" id="mkWO" ${make.length?'':'disabled'}>${ic('tool')}Create work orders</button><button class="btn pri" id="mkPO" ${buy.length?'':'disabled'}>${ic('cart')}Create draft POs</button>`) +
    (need.length?'':'<div class="card empty-state">Nothing needs reordering. Nice.</div>') +
    Object.entries(byV).map(([vid,its])=>{ const v=vendor(vid); const tot=its.reduce((a,i)=>a+c[i.id].suggest*i.cost,0); return `<div class="card" style="margin-bottom:14px"><div class="card-h"><input type="checkbox" checked data-vgrp="${vid}"><h3>${esc(v.name)}</h3><span class="muted small">lead time ${v.lead}d · ${esc(v.terms)}</span><div class="r"><b>${fmt$(tot)}</b></div></div>
      <div class="twrap free"><table class="t"><thead><tr><th></th><th>SKU</th><th>Description</th><th class="num">Avail</th><th class="num">On order</th><th class="num">Reorder pt</th><th class="num">Used 30d</th><th class="num">Order qty</th><th class="num">Ext.</th><th>Status</th></tr></thead><tbody>
      ${its.map(i=>`<tr><td><input type="checkbox" checked data-buy="${i.id}"></td><td class="mono link" data-open="${i.id}">${esc(i.sku)}</td><td>${esc(i.name)}</td><td class="num ${c[i.id].avail<0?'neg':''}">${fmtN(c[i.id].avail)}</td><td class="num">${fmtN(c[i.id].onOrder)}</td><td class="num">${fmtN(i.reorderPoint)}</td><td class="num">${fmtN(c[i.id].used30)}</td><td class="num"><input class="in num" style="width:90px;padding:4px 6px" type="number" data-q="${i.id}" value="${c[i.id].suggest}"></td><td class="num">${fmt$(c[i.id].suggest*i.cost)}</td><td>${statusPill(c[i.id].status)}</td></tr>`).join('')}</tbody></table></div></div>`; }).join('') +
    (make.length?`<div class="card"><div class="card-h"><h3>Make in-house</h3><span class="muted small">made parts & finished goods — creates planned work orders</span></div><div class="twrap free"><table class="t"><thead><tr><th></th><th>SKU</th><th>Description</th><th class="num">Avail</th><th class="num">In production</th><th class="num">Reorder pt</th><th class="num">Build qty</th><th class="num">Can build now</th><th>Status</th></tr></thead><tbody>
      ${make.map(i=>`<tr><td><input type="checkbox" checked data-make="${i.id}"></td><td class="mono link" data-open="${i.id}">${esc(i.sku)}</td><td>${esc(i.name)}</td><td class="num ${c[i.id].avail<0?'neg':''}">${fmtN(c[i.id].avail)}</td><td class="num">${fmtN(c[i.id].onOrder)}</td><td class="num">${fmtN(i.reorderPoint)}</td><td class="num"><input class="in num" style="width:80px;padding:4px 6px" type="number" data-q="${i.id}" value="${c[i.id].suggest}"></td><td class="num">${fmtN(canBuild(i.id))}</td><td>${statusPill(c[i.id].status)}</td></tr>`).join('')}</tbody></table></div></div>`:'');
  $$('[data-open]',el).forEach(t=>t.onclick=()=>openItem(t.dataset.open));
  $$('[data-vgrp]',el).forEach(cb=>cb.onchange=()=>$$(`[data-buy]`,cb.closest('.card')).forEach(x=>x.checked=cb.checked));
  const q=id=>+$(`[data-q="${id}"]`,el).value||0;
  const b=$('#mkPO',el); b.onclick=()=>{ let n=0; Object.keys(byV).forEach(vid=>{ const lines=byV[vid].filter(i=>$(`[data-buy="${i.id}"]`,el).checked&&q(i.id)>0).map(i=>({itemId:i.id,qty:q(i.id),received:0,cost:i.cost})); if(lines.length){ createPO(vid,lines,'Draft'); n++; } }); if(n){ toast(`${n} draft PO${n>1?'s':''} created — review and submit them in Purchase orders`,'ok'); save(); location.hash='#/purchasing'; } };
  const w=$('#mkWO',el); w.onclick=()=>{ let n=0; make.forEach(i=>{ if($(`[data-make="${i.id}"]`,el).checked&&q(i.id)>0){ createWO(i.id,q(i.id)); n++; } }); if(n){ toast(`${n} planned work order${n>1?'s':''} created`,'ok'); save(); location.hash='#/workorders'; } };
};
function canBuild(id){ const b=bomOf(id); if(!b) return 0; return Math.max(0,Math.min(...b.lines.map(l=>Math.floor(Math.max(0,Q(l.itemId).onHand-Q(l.itemId).hold)/l.qty)))); }

/* ---------------- cycle counts ---------------- */
V.counts = el => {
  const freq={A:30,B:60,C:90};
  const due=DB.items.map(i=>({i,age:Math.round((Date.now()-new Date(i.lastCount))/DAY)})).map(r=>({...r,over:r.age-freq[r.i.abc]})).sort((a,b)=>b.over-a.over);
  const overdue=due.filter(r=>r.over>=0);
  const hist=(DB.counts||[]).slice().reverse();
  const acc = hist.length? round(100*hist.reduce((a,s)=>a+s.lines.filter(l=>!l.var).length,0)/Math.max(1,hist.reduce((a,s)=>a+s.lines.length,0)),1):null;
  el.innerHTML = pageHead('Cycle counts','Count a few items every week instead of shutting down for a full physical. A items monthly, B every 60 days, C quarterly.',`<button class="btn" data-act="count">Spot count</button><button class="btn pri" id="start">${ic('play')}Start count session</button>`)+
   `<div class="kpis"><div class="card kpi"><div class="l">Due or overdue</div><div class="v ${overdue.length?'':''}">${overdue.length}</div><div class="d">of ${DB.items.length} items</div></div><div class="card kpi"><div class="l">Sessions posted</div><div class="v">${hist.length}</div><div class="d">this browser</div></div><div class="card kpi"><div class="l">Count accuracy</div><div class="v">${acc==null?'—':acc+'%'}</div><div class="d">lines with zero variance</div></div></div>
   <div class="card" id="due" style="margin-bottom:16px"></div>${hist.length?`<div class="card"><div class="card-h"><h3>Posted sessions</h3></div><div id="ch"></div></div>`:''}`;
  table($('#due',el),{key:'ccdue',noun:'items',rows:due,chips:[{k:'all',label:'All'},{k:'due',label:'Due now',test:r=>r.over>=0},{k:'A',label:'A',test:r=>r.i.abc==='A'},{k:'B',label:'B',test:r=>r.i.abc==='B'},{k:'C',label:'C',test:r=>r.i.abc==='C'}],chipDefault:'due',columns:[
    {k:'sku',label:'SKU',get:r=>r.i.sku,html:r=>`<span class="mono link">${esc(r.i.sku)}</span>`},{k:'name',label:'Description',get:r=>r.i.name,cls:'wrap'},{k:'abc',label:'ABC',get:r=>r.i.abc},{k:'loc',label:'Bin',get:r=>r.i.defaultLoc},
    {k:'last',label:'Last counted',get:r=>r.i.lastCount,fmt:v=>fmtD(v)},{k:'age',label:'Days since',num:true,get:r=>r.age},{k:'over',label:'Status',get:r=>r.over,html:r=>r.over>=0?`<span class="pill ${r.over>30?'bad':'warn'}">${r.over?r.over+'d overdue':'due'}</span>`:`<span class="pill ok">in ${-r.over}d</span>`}],onRow:r=>openItem(r.i.id)});
  if(hist.length) table($('#ch',el),{key:'cch',bare:true,free:true,rows:hist,columns:[{k:'num',label:'Session',get:s=>s.num},{k:'date',label:'Posted',get:s=>s.date,fmt:v=>fmtDT(v)},{k:'by',label:'By',get:s=>s.by},{k:'n',label:'Lines',num:true,get:s=>s.lines.length},{k:'v',label:'With variance',num:true,get:s=>s.lines.filter(l=>l.var).length},{k:'val',label:'Net $ variance',num:true,get:s=>s.value,html:s=>`<span class="${s.value<0?'neg':s.value>0?'pos':''}">${fmt$(s.value)}</span>`}],onRow:s=>showCount(s)});
  $('[data-act]',el).onclick=()=>stockAction('count');
  $('#start',el).onclick=()=>startCount(overdue.slice(0,12).map(r=>r.i.id));
};
function startCount(ids){
  const lines=[]; ids.forEach(id=>{ const locs=[...new Set(DB.stock.filter(s=>s.itemId===id).map(s=>s.loc))]; (locs.length?locs:[item(id).defaultLoc]).forEach(l=>lines.push({itemId:id,loc:l,sys:round(DB.stock.filter(s=>s.itemId===id&&s.loc===l).reduce((a,s)=>a+s.qty,0),3)})); });
  modal({title:'Count session',wide:true,sub:`${lines.length} bins to count. Blind count hides system quantities so counters aren't influenced.`,body:`<label style="display:flex;gap:8px;align-items:center;margin-bottom:10px"><input type="checkbox" id="blind" checked> Blind count</label>
    <div class="twrap free"><table class="t"><thead><tr><th>Bin</th><th>SKU</th><th>Description</th><th class="num sys">System</th><th class="num">Counted</th><th class="num sys">Variance</th></tr></thead><tbody>${lines.map((l,i)=>{const it=item(l.itemId);return `<tr><td class="mono">${esc(l.loc)}</td><td class="mono">${esc(it.sku)}</td><td>${esc(it.name)}</td><td class="num sys">${fmtN(l.sys)}</td><td class="num"><input class="in num" style="width:90px;padding:4px 6px" type="number" step="any" name="c${i}" placeholder="${esc(it.uom)}"></td><td class="num sys" data-v="${i}">—</td></tr>`;}).join('')}</tbody></table></div>`,
    onOpen:form=>{ const bl=$('#blind',form); const tog=()=>$$('.sys',form).forEach(x=>x.style.display=bl.checked?'none':''); bl.onchange=tog; tog();
      lines.forEach((l,i)=>{ form['c'+i].oninput=()=>{ const v=form['c'+i].value===''?null:round(+form['c'+i].value-l.sys,3); $(`[data-v="${i}"]`,form).innerHTML=v==null?'—':`<span class="${v<0?'neg':v>0?'pos':''}">${v>0?'+':''}${fmtN(v)}</span>`; }; }); },
    actions:[{label:'Cancel'},{label:'Post counts',pri:true,onClick:(d,form)=>{
      const done=lines.map((l,i)=>({...l,counted:d['c'+i]})).filter(l=>l.counted!=='');
      if(!done.length) return fieldErr(form,'Enter at least one counted quantity.');
      const num='CC-'+(DB.nextNums.cc++); let val=0; const out=[];
      for(const l of done){ const v=round(+l.counted-l.sys,3); if(v){ const e=post({type:'COUNT',itemId:l.itemId,qty:v,loc:l.loc,ref:num,note:`System ${fmtN(l.sys)}, counted ${fmtN(+l.counted)}`}); if(e) return fieldErr(form,e); val+=v*item(l.itemId).cost; } item(l.itemId).lastCount=new Date().toISOString(); out.push({itemId:l.itemId,loc:l.loc,sys:l.sys,counted:+l.counted,var:v}); }
      (DB.counts=DB.counts||[]).push({num,date:new Date().toISOString(),by:Session.user.name,lines:out,value:round(val,2)});
      toast(`${num} posted · ${out.filter(l=>l.var).length} variance${out.filter(l=>l.var).length===1?'':'s'}`,'ok'); refresh();
    }}]});
}
function showCount(s){ modal({title:s.num,sub:`${fmtDT(s.date)} · ${esc(s.by)}`,wide:true,body:`<table class="t"><thead><tr><th>Bin</th><th>SKU</th><th class="num">System</th><th class="num">Counted</th><th class="num">Variance</th></tr></thead><tbody>${s.lines.map(l=>`<tr><td class="mono">${esc(l.loc)}</td><td class="mono">${esc(item(l.itemId).sku)}</td><td class="num">${fmtN(l.sys)}</td><td class="num">${fmtN(l.counted)}</td><td class="num ${l.var<0?'neg':l.var>0?'pos':''}">${l.var>0?'+':''}${fmtN(l.var)}</td></tr>`).join('')}</tbody></table>`}); }
