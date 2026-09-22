// ORBIT client welcome screen. Shown when the link has ?c=<slug> (see js/clients.js).
// "Jump in" signs the visitor in as the client contact and opens the dashboard.
(function(){
const C = window.ORBIT_CLIENT; if(!C) { const _b=boot; boot=function(){ if(Session.user&&Session.user.client){ Session.user=null; } _b(); }; return; }
const ST = window.ORBIT_STARSONN || {name:'Starsonn',email:'hello@starsonn.com',role:'Your Starsonn point of contact'};
const first = (C.contact||'there').split(/\s+/)[0];
const accent = /^#[0-9a-f]{6}$/i.test(C.color||'') ? C.color : '#2563EB';
const css = `
.wl{--cl:${accent};--clSoft:color-mix(in srgb,var(--cl) 12%,var(--panel));--clInk:color-mix(in srgb,var(--cl) 78%,var(--ink));min-height:100%;background:var(--bg);color:var(--ink)}
.wl-top{display:flex;align-items:center;gap:16px;padding:18px clamp(16px,4vw,48px);border-bottom:1px solid var(--line);background:var(--panel);position:sticky;top:0;z-index:5}
.wl-logo{height:34px;width:auto;display:block}
.wl-logo-d{display:none}
:root[data-theme="dark"] .wl-logo-l{display:none}:root[data-theme="dark"] .wl-logo-d{display:block}
.wl-word{font:700 22px/1 Georgia,'Times New Roman',serif;letter-spacing:-.01em}
.wl-word small{display:block;font:italic 12px/1.4 Georgia,serif;color:var(--clInk);margin-top:2px}
.wl-x{color:var(--ink3);font-size:18px}
.wl-orbit{display:flex;align-items:center;gap:8px;font-weight:700;letter-spacing:.14em;font-size:13px}
.wl-orbit small{font-weight:500;letter-spacing:.02em;color:var(--ink3);font-size:12px}
.wl-top .sp{flex:1}
.wl-pill{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 10px;border-radius:99px;background:var(--clSoft);color:var(--clInk);border:1px solid color-mix(in srgb,var(--cl) 30%,transparent)}
.wl-wrap{max-width:1180px;margin:0 auto;padding:0 clamp(16px,4vw,48px)}
.wl-hero{display:grid;grid-template-columns:1.05fr .95fr;gap:48px;align-items:center;padding:56px 0 40px}
.wl-eyebrow{font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--clInk);display:flex;align-items:center;gap:8px}
.wl-eyebrow::before{content:'';width:22px;height:2px;background:var(--cl);border-radius:2px}
.wl h1{font-size:clamp(38px,5.4vw,64px);line-height:1.02;letter-spacing:-.03em;margin:14px 0 14px}
.wl h1 span{color:var(--cl)}
.wl-lead{font-size:clamp(17px,1.6vw,20px);color:var(--ink2);margin:0 0 22px;max-width:560px;line-height:1.45}
.wl-note{background:var(--panel);border:1px solid var(--line);border-left:3px solid var(--cl);border-radius:12px;padding:16px 18px;margin:0 0 26px;max-width:580px;box-shadow:var(--shadow)}
.wl-note p{margin:0 0 10px;font-size:14.5px;line-height:1.6;color:var(--ink2)}
.wl-sig{display:flex;align-items:center;gap:10px;font-size:13px}
.wl-sig .av{width:30px;height:30px;border-radius:50%;background:var(--cl);color:#fff;display:grid;place-items:center;font-weight:700;font-size:12px}
.wl-sig b{display:block}
.wl-cta{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.wl-go{display:inline-flex;align-items:center;gap:10px;background:var(--cl);color:#fff;border:0;border-radius:12px;padding:15px 26px;font-size:17px;font-weight:700;cursor:pointer;box-shadow:0 8px 24px color-mix(in srgb,var(--cl) 38%,transparent);transition:transform .15s,box-shadow .15s}
.wl-go:hover{transform:translateY(-1px);box-shadow:0 12px 30px color-mix(in srgb,var(--cl) 45%,transparent)}
.wl-go svg{width:20px;height:20px;transition:transform .2s}.wl-go:hover svg{transform:translateX(3px)}
.wl-go:focus-visible{outline:3px solid color-mix(in srgb,var(--cl) 45%,transparent);outline-offset:3px}
.wl-sec{background:transparent;border:1px solid var(--line2);color:var(--ink);border-radius:12px;padding:14px 20px;font-size:15px;font-weight:600;cursor:pointer;text-decoration:none}
.wl-sec:hover{border-color:var(--ink3)}
.wl-fine{font-size:12.5px;color:var(--ink3);margin-top:12px}
.wl-mock{background:var(--panel);border:1px solid var(--line);border-radius:18px;box-shadow:0 30px 60px -20px rgba(14,23,38,.25),var(--shadow);overflow:hidden;transform:perspective(1400px) rotateY(-4deg) rotateX(2deg)}
.wl-mock-h{display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--line);background:var(--panel2);font-size:12px;color:var(--ink3)}
.wl-mock-h i{width:9px;height:9px;border-radius:50%;background:var(--line2);display:inline-block}
.wl-mock-b{padding:16px}
.wl-kp{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
.wl-kp div{border:1px solid var(--line);border-radius:10px;padding:10px 12px}
.wl-kp small{display:block;font-size:11px;color:var(--ink3);font-weight:600}
.wl-kp b{font-size:21px;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.wl-kp b.w{color:var(--warn)}.wl-kp b.c{color:var(--cl)}
.wl-mini{border:1px solid var(--line);border-radius:10px;overflow:hidden}
.wl-mini div{display:flex;gap:8px;align-items:center;padding:8px 12px;font-size:12.5px;border-bottom:1px solid var(--line)}
.wl-mini div:last-child{border-bottom:0}
.wl-mini .t{white-space:nowrap;font-family:var(--mono);font-size:11.5px;color:var(--clInk);font-weight:600}
.wl-mini .r{margin-left:auto}
.wl-bars{display:flex;align-items:flex-end;gap:5px;height:56px;margin:12px 2px 2px}
.wl-bars span{flex:1;background:color-mix(in srgb,var(--cl) 70%,transparent);border-radius:3px 3px 0 0}
.wl-h2{font-size:clamp(24px,2.6vw,32px);letter-spacing:-.02em;margin:0 0 6px}
.wl-sub{color:var(--ink3);margin:0 0 22px;font-size:15px}
.wl-block{padding:40px 0}
.wl-feat{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.wl-f{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px}
.wl-f .ico{width:38px;height:38px;border-radius:10px;background:var(--clSoft);color:var(--clInk);display:grid;place-items:center;margin-bottom:12px}
.wl-f .ico svg{width:19px;height:19px}
.wl-f h3{margin:0 0 6px;font-size:15.5px}
.wl-f p{margin:0;font-size:13.5px;color:var(--ink2);line-height:1.55}
.wl-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;counter-reset:s}
.wl-s{position:relative;padding:18px 18px 18px 18px;border-radius:14px;background:var(--panel);border:1px solid var(--line)}
.wl-s::before{counter-increment:s;content:counter(s);width:28px;height:28px;border-radius:50%;background:var(--cl);color:#fff;display:grid;place-items:center;font-weight:700;font-size:13px;margin-bottom:10px}
.wl-s b{display:block;margin-bottom:4px;font-size:14.5px}
.wl-s span{font-size:13px;color:var(--ink2);line-height:1.5}
.wl-band{background:linear-gradient(135deg,var(--clSoft),var(--panel));border:1px solid color-mix(in srgb,var(--cl) 25%,var(--line));border-radius:18px;padding:28px;display:grid;grid-template-columns:1.3fr 1fr;gap:28px;align-items:center}
.wl-band ul{margin:0;padding-left:18px;font-size:14px;line-height:1.8;color:var(--ink2)}
.wl-contact{display:grid;grid-template-columns:1fr auto;gap:24px;align-items:center;background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:26px 28px;box-shadow:var(--shadow)}
.wl-person{display:flex;gap:16px;align-items:center}
.wl-person .av{width:56px;height:56px;border-radius:50%;background:#0D1B2E;color:#fff;display:grid;place-items:center;font-weight:700;font-size:18px;flex:none}
.wl-person small{display:block;font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3)}
.wl-person b{font-size:20px;display:block;margin:2px 0}
.wl-person a{color:var(--clInk);font-weight:600;text-decoration:none}
.wl-person a:hover{text-decoration:underline}
.wl-foot.login-card{max-width:none;padding:18px 0 8px}
.wl-anim{animation:wlUp .6s cubic-bezier(.2,.8,.2,1) both}
.wl-anim.d1{animation-delay:.08s}.wl-anim.d2{animation-delay:.16s}.wl-anim.d3{animation-delay:.24s}
@keyframes wlUp{from{opacity:0;transform:translateY(14px)}}
@media (prefers-reduced-motion:reduce){.wl-anim{animation:none}.wl-mock{transform:none}}
.wl-progress{position:fixed;top:0;left:0;right:0;height:3px;transform-origin:0 50%;transform:scaleX(0);background:var(--cl);z-index:30}
.wl-cue{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:20;display:flex;align-items:center;gap:10px;padding:9px 16px 9px 12px;border-radius:99px;background:color-mix(in srgb,var(--panel) 88%,transparent);backdrop-filter:blur(8px);border:1px solid var(--line);box-shadow:var(--shadow);color:var(--ink2);font:700 11px/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;cursor:pointer;transition:opacity .45s,transform .45s}
.wl-cue .ms{width:20px;height:32px;border:2px solid var(--ink3);border-radius:12px;position:relative;flex:none}
.wl-cue .ms::before{content:'';position:absolute;left:50%;top:6px;width:4px;height:7px;margin-left:-2px;border-radius:2px;background:var(--cl);animation:wlWheel 1.6s ease-in-out infinite}
.wl-cue svg{width:16px;height:16px;color:var(--cl);animation:wlBob 1.6s ease-in-out infinite}
.wl-cue.gone{opacity:0;transform:translate(-50%,16px);pointer-events:none}
@keyframes wlWheel{0%{opacity:0;transform:translateY(0)}30%{opacity:1}100%{opacity:0;transform:translateY(11px)}}
@keyframes wlBob{0%,100%{transform:translateY(0)}50%{transform:translateY(4px)}}
.wl-mock{transform:perspective(1400px) rotateY(calc(-4deg + var(--p,0) * 4deg)) rotateX(calc(2deg - var(--p,0) * 2deg)) translateY(calc(var(--p,0) * -18px))}
.wl-bars span{transform:scaleY(0);transform-origin:bottom;transition:transform .8s cubic-bezier(.2,.8,.2,1)}
.wl-mock.go .wl-bars span{transform:none}
.wl-mini div{opacity:0;transform:translateX(14px);transition:opacity .5s,transform .5s cubic-bezier(.2,.8,.2,1)}
.wl-mock.go .wl-mini div{opacity:1;transform:none}
.rv{opacity:0;transform:translateY(36px);transition:opacity .9s cubic-bezier(.2,.8,.2,1),transform .9s cubic-bezier(.2,.8,.2,1)}
.rv.in{opacity:1;transform:none}
.rv-i{opacity:0;transform:translateY(24px) scale(.97);transition:opacity .6s ease,transform .7s cubic-bezier(.2,.8,.2,1),box-shadow .2s,border-color .2s}
.rv.in .rv-i{opacity:1;transform:none}
.wl-f.rv-i:hover,.wl-s.rv-i:hover,.wl-stat.rv-i:hover{border-color:color-mix(in srgb,var(--cl) 45%,var(--line));box-shadow:0 10px 26px -14px color-mix(in srgb,var(--cl) 55%,transparent);transform:translateY(-3px)}
.rv li{opacity:0;transform:translateX(-14px);transition:opacity .5s,transform .6s cubic-bezier(.2,.8,.2,1)}
.rv.in li{opacity:1;transform:none}
.wl-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.wl-stat{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px 18px 16px;position:relative;overflow:hidden}
.wl-stat::after{content:'';position:absolute;left:0;bottom:0;height:3px;width:0;background:var(--cl);transition:width 1.2s cubic-bezier(.2,.8,.2,1) .2s}
.rv.in .wl-stat::after{width:100%}
.wl-stat b{display:block;font-size:clamp(30px,3.6vw,44px);line-height:1.05;letter-spacing:-.03em;color:var(--cl);font-variant-numeric:tabular-nums}
.wl-stat span{font-size:13px;color:var(--ink2)}
.wl-cat{margin-top:14px;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px 20px}
.wl-cat h3{margin:0 0 10px;font-size:14px}
.wl-cat .row{display:grid;grid-template-columns:150px 1fr 74px;gap:12px;align-items:center;font-size:13px;padding:6px 0}
.wl-cat .row em{font-style:normal;text-align:right;font-variant-numeric:tabular-nums;color:var(--ink2)}
.wl-cat .tr{height:10px;background:var(--panel2);border:1px solid var(--line);border-radius:99px;overflow:hidden}
.wl-cat .tr i{display:block;height:100%;width:0;background:linear-gradient(90deg,color-mix(in srgb,var(--cl) 65%,transparent),var(--cl));border-radius:99px;transition:width 1.2s cubic-bezier(.2,.8,.2,1)}
@media (prefers-reduced-motion:reduce){.rv,.rv-i,.rv li,.wl-mini div{opacity:1!important;transform:none!important;transition:none!important}.wl-bars span{transform:none;transition:none}.wl-cue svg,.wl-cue .ms::before{animation:none}.wl-cat .tr i{transition:none}}
@media (max-width:980px){.wl-stats{grid-template-columns:1fr 1fr}.wl-mock{transform:none}}
@media (max-width:620px){.wl-cat .row{grid-template-columns:96px 1fr 58px;gap:8px}.wl-cue{bottom:14px}}
@media (max-width:980px){.wl-hero{grid-template-columns:1fr;gap:32px;padding-top:36px}.wl-mock{transform:none}.wl-feat{grid-template-columns:1fr 1fr}.wl-steps{grid-template-columns:1fr 1fr}.wl-band{grid-template-columns:1fr}}
@media (max-width:620px){.wl-feat,.wl-steps{grid-template-columns:1fr}.wl-contact{grid-template-columns:1fr}.wl-top{gap:10px}.wl-orbit small,.wl-x,.wl-pill{display:none}.wl-go{width:100%;justify-content:center}.wl-sec{width:100%;text-align:center}}
`;
const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

function preview(){
  let out={value:0,harness:0,openSO:0,soCount:0,reorder:0,rows:[],bars:[],cats:[],nItems:0,nBoms:0,nCust:0,nTx:0,nLots:0};
  try{
    const c=calc();
    out.value=DB.items.reduce((a,i)=>a+c[i.id].value,0);
    out.harness=DB.items.filter(i=>i.type==='Finished').reduce((a,i)=>a+Math.max(0,c[i.id].onHand),0);
    const open=DB.sos.filter(s=>OPEN_SO.includes(s.status)); out.soCount=open.length;
    out.openSO=open.reduce((a,s)=>a+s.lines.reduce((b,l)=>b+(l.qty-l.shipped)*l.price,0),0);
    const need=DB.items.filter(i=>['Reorder','Short'].includes(c[i.id].status)); out.reorder=need.length;
    out.rows=need.slice(0,3).map(i=>({sku:i.sku,name:i.name,st:c[i.id].status}));
    const now=Date.now(), w=Array(12).fill(0);
    DB.txns.forEach(t=>{ const k=Math.floor((now-new Date(t.ts))/DAY/7); if(k<12&&t.qty<0&&t.type==='SHIP') w[11-k]+=-t.qty*item(t.itemId).price; });
    const mx=Math.max(...w,1); out.bars=w.map(v=>Math.max(6,Math.round(v/mx*100)));
    const cat={}; DB.items.forEach(i=>cat[i.category]=(cat[i.category]||0)+c[i.id].value);
    out.cats=Object.entries(cat).sort((a,b)=>b[1]-a[1]).slice(0,6); out.nItems=DB.items.length; out.nBoms=DB.boms.length; out.nCust=DB.customers.length; out.nTx=DB.txns.length; out.nLots=DB.stock.filter(s=>s.lot).length;
  }catch(e){}
  return out;
}
const I=n=>ic(n);
function renderWelcome(){
  const p=preview(), sys=C.currentSystem||'your current system';
  const logo=C.logo?`<img class="wl-logo wl-logo-l" src="${esc(C.logo)}" alt="${esc(C.company)}" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'wl-word',innerHTML:${esc(JSON.stringify(esc(C.company)))}}))">${C.logoDark?`<img class="wl-logo wl-logo-d" src="${esc(C.logoDark)}" alt="${esc(C.company)}" onerror="this.remove()">`:''}`:`<span class="wl-word">${esc(C.company)}${C.tagline?`<small>${esc(C.tagline)}</small>`:''}</span>`;
  const fp=C.data==='fallpro';
  const feats=fp?[
    ['box','Webbing to finished harness','Roll stock, forged hardware, thread and labels on one screen, with on hand, allocated to jobs, on order and days of supply for every part.'],
    ['layers','Lot tracking on every build','Each harness and lanyard build gets its own lot, and every roll of webbing and box of D-rings keeps its supplier lot. Oldest lot ships first, automatically.'],
    ['tree','Real bills of material','Harnesses, twin-leg lanyards, rope grabs and kits built from sewn sub-assemblies, with cost rolled up from materials and sewing labor.'],
    ['truck','Distributor orders','Every distributor order shows what\'s ready to ship and what\'s short, and one click turns a shortage into a work order.'],
    ['refresh','Reorder before you run out','When forged hardware has a three-week lead time, ORBIT flags it early and drafts the purchase order for you, grouped by vendor.'],
    ['query','Answers without a report writer','Ask "what did we ship to TowerLine this quarter?" in the Query explorer. Filter, group, chart and export to Excel in a few clicks.']
  ]:[
    ['box','Live availability','On hand, allocated, on order and QC hold in one number you can trust.'],
    ['layers','Lots & locations','FIFO picking, bin transfers and full traceability.'],
    ['tree','Bills of material','Multi-level BOMs with rolled-up cost and a live "can build" number.'],
    ['truck','Sales & shipping','See what is ready to ship, and turn shortages into work orders.'],
    ['refresh','Reorder planner','Shortages become draft POs and work orders in two clicks.'],
    ['query','Query explorer','Filter, group, chart and export any data. No SQL.']];
  const steps=fp?[
    ['Open the dashboard','See what needs attention: late POs, short parts and orders due this week.'],
    ['Ship a distributor order','Sales orders → pick an open order → Ship. Stock drops and the lots are recorded.'],
    ['Build some harnesses','Work orders → release one → report completion. Finished goods land in stock at cost.'],
    ['Tell us what\'s missing','Hit the yellow Suggest button any time. It goes straight to '+esc(ST.name.split(' ')[0])+'.']
  ]:[
    ['Open the dashboard','See what needs attention today.'],['Ship an order','Sales orders → Ship.'],['Run a query','Query explorer → pick a starter question.'],['Suggest changes','Use the yellow Suggest button.']];
  document.title=`Welcome, ${first} · ORBIT for ${C.company}`;
  document.body.innerHTML=`<div class="wl"><div class="wl-progress"></div><button class="wl-cue" id="wlCue" aria-label="Scroll to see more"><span class="ms"></span>Scroll to explore<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></button>
    <header class="wl-top">${logo}<span class="wl-x">×</span><span class="wl-orbit">${logoMark(22)} ORBIT <small>by Starsonn</small></span><span class="sp"></span><span class="wl-pill">Private demo</span></header>
    <div class="wl-wrap">
      <section class="wl-hero">
        <div>
          <div class="wl-eyebrow wl-anim">Prepared for ${esc(C.contact)} · ${esc(C.company)}</div>
          <h1 class="wl-anim d1">Welcome, <span>${esc(first)}</span>.</h1>
          <p class="wl-lead wl-anim d1">${esc(C.headline||('ORBIT, set up for '+C.company+'.'))}</p>
          ${C.note?`<div class="wl-note wl-anim d2"><p>${esc(C.note)}</p><div class="wl-sig"><span class="av">${esc(initials(ST.name))}</span><div><b>${esc(ST.name)}</b><span class="muted">${esc(ST.role)} · <a href="mailto:${esc(ST.email)}" style="color:var(--clInk);font-weight:600;text-decoration:none">${esc(ST.email)}</a></span></div></div></div>`:''}
          <div class="wl-cta wl-anim d3"><button class="wl-go" id="wlGo">Jump in <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button><a class="wl-sec" href="#wl-inside" id="wlMore">See what's inside</a></div>
          <div class="wl-fine wl-anim d3">You'll be signed in as <b>${esc(C.contact)}</b>. Sample data only. Nothing you do here leaves this browser.</div>
        </div>
        <div class="wl-mock wl-anim d2" aria-hidden="true">
          <div class="wl-mock-h"><i></i><i></i><i></i><span style="margin-left:6px">${esc(C.company)} · Dashboard</span></div>
          <div class="wl-mock-b">
            <div class="wl-kp"><div><small>Inventory value</small><b data-count="${p.value}" data-fmt="k">${fmt$k(p.value)}</b></div><div><small>${fp?'Finished goods on hand':'Units on hand'}</small><b class="c" data-count="${p.harness}">${fmtN(p.harness,0)}</b></div>
            <div><small>Open ${fp?'distributor ':''}orders</small><b data-count="${p.openSO}" data-fmt="k">${fmt$k(p.openSO)}</b></div><div><small>Parts to reorder</small><b class="w" data-count="${p.reorder}">${p.reorder}</b></div></div>
            <div class="wl-mini">${p.rows.map(r=>`<div><span class="t">${esc(r.sku)}</span><span class="muted" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.name)}</span><span class="r">${statusPill(r.st)}</span></div>`).join('')}</div>
            <div class="small muted" style="margin-top:12px">Shipments, last 12 weeks</div>
            <div class="wl-bars">${p.bars.map(h=>`<span style="height:${h}%"></span>`).join('')}</div>
          </div>
        </div>
      </section>

      <section class="wl-block rv" id="wl-data">
        <h2 class="wl-h2">Already loaded in your demo</h2>
        <p class="wl-sub">${fp?'A working fall-protection shop, from raw webbing to boxed harnesses, ready to click through.':'A working shop, ready to click through.'}</p>
        <div class="wl-stats">
          <div class="wl-stat rv-i"><b data-count="${p.nItems}">${p.nItems}</b><span>parts tracked, from ${fp?'webbing and D-rings to finished harnesses':'raw stock to finished goods'}</span></div>
          <div class="wl-stat rv-i"><b data-count="${p.nBoms}">${p.nBoms}</b><span>bills of material with rolled-up cost</span></div>
          <div class="wl-stat rv-i"><b data-count="${p.nCust}">${p.nCust}</b><span>${fp?'distributors':'customers'} with open and shipped orders</span></div>
          <div class="wl-stat rv-i"><b data-count="${p.nTx}">${fmtN(p.nTx,0)}</b><span>stock movements over 120 days, all traceable</span></div>
        </div>
        <div class="wl-cat rv-i"><h3>Where the inventory value sits</h3>${p.cats.map(c=>`<div class="row"><span>${esc(c[0])}</span><div class="tr"><i data-w="${Math.max(3,Math.round(c[1]/((p.cats[0]||[0,1])[1]||1)*100))}%"></i></div><em>${fmt$k(c[1])}</em></div>`).join('')}</div>
      </section>

      <section class="wl-block rv" id="wl-inside">
        <h2 class="wl-h2">${fp?'Built for a fall-protection shop':'What\'s inside'}</h2>
        <p class="wl-sub">${fp?'Set up with sample parts shaped like '+esc(C.company)+'\'s product lines: harnesses, lanyards, lifelines & grabs, anchorages and hardware.':'A working inventory and operations system you can click through.'}</p>
        <div class="wl-feat">${feats.map(f=>`<div class="wl-f rv-i"><div class="ico">${I(f[0])}</div><h3>${esc(f[1])}</h3><p>${esc(f[2])}</p></div>`).join('')}</div>
      </section>

      <section class="wl-block rv">
        <h2 class="wl-h2">Try it in five minutes</h2>
        <p class="wl-sub">A few things worth clicking. You can't break anything, and Settings has a reset.</p>
        <div class="wl-steps">${steps.map(s=>`<div class="wl-s rv-i"><b>${s[0]}</b><span>${s[1]}</span></div>`).join('')}</div>
      </section>

      <section class="wl-block rv">
        <div class="wl-band">
          <div><h2 class="wl-h2">Coming from ${esc(sys)}</h2>
            <p class="wl-sub" style="margin-bottom:0">Your data comes with you. ${esc(sys)} can download its screens to Excel, and ORBIT reads those files directly, matches the columns and shows you a preview before anything changes.</p></div>
          <ul><li>Parts, on-hand stock by bin and lot</li><li>Vendors and customers</li><li>Open purchase and sales orders</li><li>Bills of material</li><li>One-click undo for every import</li></ul>
        </div>
      </section>

      <section class="wl-block rv">
        <div class="wl-contact">
          <div class="wl-person"><span class="av">${esc(initials(ST.name))}</span><div><small>${esc(ST.role)}</small><b>${esc(ST.name)}</b><a href="mailto:${esc(ST.email)}?subject=${encodeURIComponent('ORBIT demo for '+C.company)}">${esc(ST.email)}</a>${ST.phone?` · <a href="tel:${esc(ST.phone)}">${esc(ST.phone)}</a>`:''}</div></div>
          <button class="wl-go" id="wlGo2">Jump in <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
        </div>
      </section>
      <div class="login-card wl-foot"></div>
    </div>
  </div>`;
  $('#wlGo').onclick=jump; $('#wlGo2').onclick=jump; motion();
  $('#wlMore').onclick=e=>{ e.preventDefault(); $('#wl-inside').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); };
}
function motion(){
  const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmtOf=el=>v=>el.dataset.fmt==='k'?fmt$k(v):fmtN(Math.round(v),0);
  const count=el=>{ const to=+el.dataset.count||0, f=fmtOf(el); if(rm){ el.textContent=f(to); return; } const t0=performance.now(), dur=1300;
    const step=t=>{ const k=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-k,3); el.textContent=f(to*e); if(k<1) requestAnimationFrame(step); }; requestAnimationFrame(step); };
  if(!rm) $$('[data-count]').forEach(el=>el.textContent=fmtOf(el)(0));
  $$('.rv').forEach(sec=>{ $$('.rv-i',sec).forEach((c,i)=>c.style.transitionDelay=(i*90)+'ms'); $$('li',sec).forEach((c,i)=>c.style.transitionDelay=(150+i*80)+'ms'); });
  $$('.wl-mini div').forEach((c,i)=>c.style.transitionDelay=(250+i*120)+'ms'); $$('.wl-bars span').forEach((c,i)=>c.style.transitionDelay=(i*45)+'ms');
  const mock=$('.wl-mock'); setTimeout(()=>{ if(mock) mock.classList.add('go'); $$('.wl-mock [data-count]').forEach(count); }, rm?0:500);
  const show=sec=>{ sec.classList.add('in'); setTimeout(()=>$$('.rv-i',sec).forEach(c=>c.style.transitionDelay=''),rm?0:1800); $$('[data-count]',sec).forEach(count); $$('.tr i',sec).forEach((i,k)=>setTimeout(()=>{ i.style.width=i.dataset.w; }, rm?0:250+k*110)); };
  if(rm||!('IntersectionObserver' in window)) $$('.rv').forEach(show);
  else { const io=new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting){ show(en.target); io.unobserve(en.target); } }),{threshold:.15,rootMargin:'0px 0px -6% 0px'}); $$('.rv').forEach(s=>io.observe(s)); }
  const bar=$('.wl-progress'), cue=$('#wlCue');
  const onS=()=>{ const h=document.documentElement.scrollHeight-innerHeight, y=scrollY; if(bar) bar.style.transform='scaleX('+(h>0?Math.min(1,y/h):0)+')'; if(cue) cue.classList.toggle('gone',y>80); if(mock&&!rm) mock.style.setProperty('--p',Math.min(1,y/520).toFixed(3)); };
  if(window.__wlS) removeEventListener('scroll',window.__wlS); window.__wlS=onS; addEventListener('scroll',onS,{passive:true}); onS();
  if(cue) cue.onclick=()=>$('#wl-data').scrollIntoView({behavior:rm?'auto':'smooth',block:'start'});
}
function jump(){
  if(window.__wlS){ removeEventListener('scroll',window.__wlS); window.__wlS=null; }
  Session.user={name:C.contact,email:C.email||'',company:C.company,title:C.title||'',client:C.slug,since:new Date().toISOString()};
  store.set('orbit.session',Session.user); store.set('orbit.name',C.contact); store.set('orbit.welcomed',1);
  if(C.company&&DB.company!==C.company){ DB.company=C.company; save(); }
  if(location.hash!=='#/dashboard') history.replaceState(null,'',location.pathname+location.search+'#/dashboard');
  window.scrollTo(0,0); _boot();
}
function theme(){ const t=store.get('orbit.theme',null); if(t) document.documentElement.dataset.theme=t; else if(matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.dataset.theme='dark'; }
const _boot=boot, _login=renderLogin;
boot=function(){ theme(); if(!Session.user||Session.user.client!==C.slug){ Session.user=null; renderWelcome(); return; } _boot(); };
renderLogin=function(){ if(Session.user) return _login(); renderWelcome(); };
window.ORBIT_WELCOME=renderWelcome;
})();
