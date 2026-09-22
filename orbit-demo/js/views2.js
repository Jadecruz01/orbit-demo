/* ORBIT views part 2: BOMs, work orders, purchasing, sales, partners, suggestions, settings, palette, router */

/* ---------------- BOMs ---------------- */
function bomTreeHtml(id,qty=1){
  const rows=[]; const walk=(pid,q,depth)=>{ const b=bomOf(pid); if(!b) return; b.lines.forEach(l=>{ const it=item(l.itemId); const need=l.qty*q; rows.push({it,need,depth,ext:need*it.cost,sub:!!bomOf(l.itemId)}); walk(l.itemId,need,depth+1); }); };
  walk(id,qty,0); const b=bomOf(id);
  const mat=b.lines.reduce((a,l)=>a+l.qty*item(l.itemId).cost,0)*qty, lab=b.labor*DB.laborRate*qty;
  return `<div class="card bomtree"><div class="row h"><div>Component</div><div class="num">Qty</div><div class="num">Avail</div><div class="num">Ext. cost</div></div>
    ${rows.map(r=>`<div class="row" style="padding-left:${10+r.depth*22}px"><div>${r.depth?'<span class="muted">└ </span>':''}<a class="link mono" data-open="${r.it.id}">${esc(r.it.sku)}</a> <span class="muted small">${esc(r.it.name)}</span></div><div class="num">${fmtN(r.need)} ${esc(r.it.uom)}</div><div class="num ${Q(r.it.id).avail<r.need?'neg':''}">${fmtN(Q(r.it.id).avail)}</div><div class="num ${r.depth?'muted':''}">${fmt$(r.ext)}</div></div>`).join('')}
    <div class="row"><div class="muted">Labor · ${fmtN(b.labor*qty,2)} h @ ${fmt$(DB.laborRate,0)}/h</div><div></div><div></div><div class="num">${fmt$(lab)}</div></div>
    <div class="row" style="font-weight:700"><div>Rolled-up cost ${qty>1?'× '+qty:''}</div><div></div><div></div><div class="num">${fmt$(mat+lab)}</div></div></div>`;
}
V.boms = el => {
  el.innerHTML = pageHead('Bills of material','Multi-level BOMs with rolled-up cost and a live "can build" number.',`<button class="btn pri" id="nb">${ic('plus')}New BOM</button>`)+`<div class="card" id="bt"></div>`;
  table($('#bt',el),{key:'boms',noun:'BOMs',rows:DB.boms,columns:[
    {k:'sku',label:'Parent',get:b=>item(b.itemId).sku,html:b=>`<span class="mono link">${esc(item(b.itemId).sku)}</span>`},{k:'name',label:'Description',get:b=>item(b.itemId).name,cls:'wrap'},{k:'type',label:'Type',get:b=>item(b.itemId).type},{k:'rev',label:'Rev',get:b=>b.rev},
    {k:'lines',label:'Components',num:true,get:b=>b.lines.length},{k:'labor',label:'Labor h',num:true,get:b=>b.labor},{k:'cost',label:'Std cost',num:true,get:b=>item(b.itemId).cost,fmt:v=>fmt$(v)},
    {k:'can',label:'Can build now',num:true,get:b=>canBuild(b.itemId),html:b=>{const n=canBuild(b.itemId);return `<b class="${n?'':'neg'}">${fmtN(n)}</b>`;}},{k:'avail',label:'FG avail',num:true,get:b=>Q(b.itemId).avail,fmt:v=>fmtN(v)}],onRow:b=>openBOM(b.itemId)});
  $('#nb',el).onclick=()=>modal({title:'New BOM',body:`<label class="f"><span>Parent item (made in-house, no BOM yet)</span>${itemPicker('item','',i=>!bomOf(i.id)&&['Component','Finished'].includes(i.type))}</label><p class="muted small">Tip: create the item first in Items & stock if it doesn't exist.</p>`,actions:[{label:'Cancel'},{label:'Create',pri:true,onClick:(d,f)=>{ const it=itemBySku(d.item); if(!it) return fieldErr(f,'Pick an item'); if(bomOf(it.id)) return fieldErr(f,'Already has a BOM'); DB.boms.push({itemId:it.id,rev:'A',labor:0,lines:[]}); save(); route(true); setTimeout(()=>openBOM(it.id),30); }}]});
};
function openBOM(id){
  const b=bomOf(id), it=item(id);
  const d=drawer(`<div class="drawer-h"><div style="flex:1"><div class="crumb">Bill of material · rev ${esc(b.rev)}</div><h2 class="mono">${esc(it.sku)}</h2><div class="muted">${esc(it.name)}</div></div><button class="x" data-close>×</button></div>
    <div class="drawer-b"><div class="stats"><div class="stat"><div class="l">Can build now</div><div class="v">${fmtN(canBuild(id))}</div></div><div class="stat"><div class="l">Std cost</div><div class="v">${fmt$(it.cost)}</div></div><div class="stat"><div class="l">Labor</div><div class="v">${fmtN(b.labor,2)} h</div></div></div>
    <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center"><span class="muted small">Explode for qty</span><input class="in" id="xq" type="number" value="1" min="1" style="width:90px"><span style="flex:1"></span><button class="btn sm" id="edit">Edit components</button><button class="btn sm pri" id="wo">${ic('tool')}New work order</button></div>
    <div id="tree">${bomTreeHtml(id)}</div></div>`);
  const bind=()=>$$('[data-open]',d).forEach(a=>a.onclick=()=>openItem(a.dataset.open));
  $('#xq',d).oninput=()=>{ $('#tree',d).innerHTML=bomTreeHtml(id,Math.max(1,+$('#xq',d).value||1)); bind(); }; bind();
  $('#wo',d).onclick=()=>newWO(id,Math.max(1,+$('#xq',d).value||1));
  $('#edit',d).onclick=()=>{
    const rowsHtml=ls=>ls.map((l,i)=>`<tr><td>${itemPicker('c'+i,l.itemId,x=>x.id!==id)}</td><td><input class="in num" name="q${i}" type="number" step="any" value="${l.qty}" style="width:100px"></td><td><button type="button" class="btn sm ghost danger" data-rm="${i}">Remove</button></td></tr>`).join('');
    let lines=b.lines.map(l=>({...l}));
    const m=modal({title:'Edit BOM · '+it.sku,wide:true,body:`<div class="grid3"><label class="f"><span>Revision</span><input class="in" name="rev" value="${esc(b.rev)}"></label><label class="f"><span>Labor hours per unit</span><input class="in" name="labor" type="number" step="any" value="${b.labor}"></label></div><table class="t"><thead><tr><th>Component</th><th>Qty per</th><th></th></tr></thead><tbody id="bl">${rowsHtml(lines)}</tbody></table><button type="button" class="btn sm" id="addl" style="margin-top:8px">${ic('plus')}Add component</button>`,
      onOpen:form=>{ const sync=()=>{ lines=lines.map((l,i)=>({itemId:(itemBySku(form['c'+i]?.value)||{}).id||l.itemId,qty:+(form['q'+i]?.value||l.qty)})); };
        const wire=()=>$$('[data-rm]',form).forEach(x=>x.onclick=()=>{ sync(); lines.splice(+x.dataset.rm,1); $('#bl',form).innerHTML=rowsHtml(lines); wire(); });
        $('#addl',form).onclick=()=>{ sync(); lines.push({itemId:'',qty:1}); $('#bl',form).innerHTML=rowsHtml(lines); wire(); }; wire(); },
      actions:[{label:'Cancel'},{label:'Save BOM',pri:true,onClick:(dd,form)=>{ const out=[]; for(let i=0;form['c'+i];i++){ const c=itemBySku(dd['c'+i]); if(!c) { if(dd['c'+i]) return fieldErr(form,'Unknown SKU: '+dd['c'+i]); continue; } if(c.id===id) return fieldErr(form,'An item cannot contain itself.'); out.push({itemId:c.id,qty:+dd['q'+i]||1}); }
        b.lines=out; b.rev=dd.rev||b.rev; b.labor=+dd.labor||0; rollCost(); toast('BOM saved · cost rolled up','ok'); refresh(); openBOM(id); }}]});
  };
}
function rollCost(){ const seen={}; const r=id=>{ const it=item(id), b=bomOf(id); if(!b) return it.cost; if(seen[id]) return it.cost; seen[id]=1; let c=b.labor*DB.laborRate; b.lines.forEach(l=>c+=r(l.itemId)*l.qty); it.cost=round(c,2); return it.cost; }; DB.boms.forEach(b=>r(b.itemId)); }

/* ---------------- work orders ---------------- */
function createWO(itemId,qty,{due,soRef}={}){ const wo={id:'WO'+DB.nextNums.wo,num:'WO-'+(DB.nextNums.wo++),itemId,qty:+qty,done:0,status:'Planned',created:new Date().toISOString(),due:due||new Date(Date.now()+7*DAY).toISOString(),soRef:soRef||'',issued:false,laborHrs:0,notes:''}; DB.wos.push(wo); return wo; }
function newWO(itemId,qty){
  modal({title:'New work order',body:`<label class="f"><span>Item to build</span>${itemPicker('item',itemId,i=>!!bomOf(i.id))}</label><div class="grid2"><label class="f"><span>Quantity</span><input class="in" name="qty" type="number" value="${qty||''}"></label><label class="f"><span>Due</span><input class="in" name="due" type="date" value="${isoDate(new Date(Date.now()+7*DAY).toISOString())}"></label></div><label class="f"><span>For sales order (optional)</span><select class="in" name="so"><option value="">—</option>${DB.sos.filter(s=>OPEN_SO.includes(s.status)).map(s=>`<option>${esc(s.num)}</option>`).join('')}</select></label><div id="chk"></div>`,
    onOpen:f=>{ const u=()=>{ const it=itemBySku(f.item.value); const q=+f.qty.value; if(!it||!q){ $('#chk',f).innerHTML=''; return; } const sh=bomOf(it.id).lines.filter(l=>Q(l.itemId).avail<l.qty*q); $('#chk',f).innerHTML= sh.length?`<div class="note warn"><b>Short on ${sh.length} component${sh.length>1?'s':''}:</b> ${sh.map(l=>esc(item(l.itemId).sku)+' (need '+fmtN(l.qty*q)+', avail '+fmtN(Q(l.itemId).avail)+')').join(', ')}</div>`:`<div class="note ok">All components available for ${fmtN(q)}.</div>`; }; f.item.onchange=u; f.qty.oninput=u; u(); },
    actions:[{label:'Cancel'},{label:'Create',pri:true,onClick:(d,f)=>{ const it=itemBySku(d.item); if(!it||!bomOf(it.id)) return fieldErr(f,'Pick an item that has a BOM.'); if(!(+d.qty>0)) return fieldErr(f,'Quantity?'); const wo=createWO(it.id,d.qty,{due:new Date(d.due+'T12:00').toISOString(),soRef:d.so}); toast(wo.num+' created','ok'); save(); if(ROUTE!=='workorders') location.hash='#/workorders'; else refresh(); setTimeout(()=>openWO(wo.id),60); }}]});
}
V.workorders = el => {
  el.innerHTML = pageHead('Work orders','Plan → release → issue materials → report completions. Finished goods land in stock at rolled-up cost.',`<button class="btn pri" id="nw">${ic('plus')}New work order</button>`)+`<div class="card" id="wt"></div>`;
  table($('#wt',el),{key:'wos',noun:'work orders',rows:DB.wos.slice().reverse(),chipDefault:'open',columns:[
    {k:'num',label:'WO',get:w=>w.num,html:w=>`<span class="mono link">${esc(w.num)}</span>`},{k:'sku',label:'Item',get:w=>item(w.itemId).sku,html:w=>`<span class="mono">${esc(item(w.itemId).sku)}</span>`},{k:'name',label:'Description',get:w=>item(w.itemId).name,cls:'wrap'},
    {k:'qty',label:'Qty',num:true,get:w=>w.qty},{k:'done',label:'Done',num:true,get:w=>w.done},{k:'prog',label:'Progress',get:w=>w.done/w.qty,html:w=>`<div class="bar ${w.done>=w.qty?'ok':''}"><i style="width:${Math.min(100,w.done/w.qty*100)}%"></i></div>`},
    {k:'status',label:'Status',get:w=>w.status,html:w=>docPill(w.status)+(!['Complete','Cancelled'].includes(w.status)&&daysFrom(w.due)<0?' '+docPill('Late'):'')},{k:'due',label:'Due',get:w=>w.due,html:w=>`${fmtD(w.due)} <span class="muted small">${rel(w.due)}</span>`},{k:'so',label:'Sales order',get:w=>w.soRef},
    {k:'mat',label:'Materials',get:w=>w.issued?'Issued':woShort(w).length?'Short':'Ready',html:w=>w.issued?'<span class="pill ok">Issued</span>':['Complete','Cancelled'].includes(w.status)?'':woShort(w).length?`<span class="pill bad">${woShort(w).length} short</span>`:'<span class="pill acc">Ready</span>'}],
    chips:[{k:'open',label:'Open',test:w=>!['Complete','Cancelled'].includes(w.status)},...['Planned','Released','In progress','Complete'].map(s=>({k:s,label:s,test:w=>w.status===s})),{k:'all',label:'All'}],onRow:w=>openWO(w.id)});
  $('#nw',el).onclick=()=>newWO();
};
function woShort(w){ const b=bomOf(w.itemId); if(!b||w.issued) return []; const rem=w.qty-w.done; return b.lines.filter(l=>Math.max(0,Q(l.itemId).onHand-Q(l.itemId).hold)<l.qty*rem); }
function openWO(id){
  const w=DB.wos.find(x=>x.id===id), it=item(w.itemId), b=bomOf(w.itemId); const rem=w.qty-w.done;
  const steps=['Planned','Released','In progress','Complete']; const si=steps.indexOf(w.status);
  const d=drawer(`<div class="drawer-h"><div style="flex:1"><div class="crumb">Work order${w.soRef?' · for '+esc(w.soRef):''}</div><h2 class="mono">${esc(w.num)}</h2><div class="muted">${fmtN(w.qty)} × ${esc(it.sku)} — ${esc(it.name)}</div></div>${docPill(w.status)}<button class="x" data-close>×</button></div>
   <div class="drawer-b">
    <div class="flow">${steps.map((s,i)=>`<span class="${i<si?'done':i===si?'cur':''}">${s}</span>${i<3?'<i>→</i>':''}`).join('')}</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
      ${w.status==='Planned'?'<button class="btn sm pri" data-do="release">Release to floor</button>':''}
      ${['Planned','Released'].includes(w.status)&&!w.issued?'<button class="btn sm pri" data-do="issue">Issue materials</button>':''}
      ${['Released','In progress'].includes(w.status)?'<button class="btn sm pri" data-do="complete">Report completion</button><button class="btn sm" data-do="labor">Log labor</button>':''}
      ${!['Complete','Cancelled'].includes(w.status)?'<button class="btn sm ghost danger" data-do="cancel">Cancel WO</button>':''}
      <span style="flex:1"></span><button class="btn sm ghost" data-it>View item</button></div>
    <div class="stats"><div class="stat"><div class="l">Ordered</div><div class="v">${fmtN(w.qty)}</div></div><div class="stat"><div class="l">Completed</div><div class="v">${fmtN(w.done)}</div></div><div class="stat"><div class="l">Due</div><div class="v" style="font-size:15px">${fmtD(w.due)}</div></div><div class="stat"><div class="l">Labor logged</div><div class="v">${fmtN(w.laborHrs,1)} h</div></div><div class="stat"><div class="l">Est. labor</div><div class="v">${fmtN(b.labor*w.qty,1)} h</div></div></div>
    <div class="card"><div class="card-h"><h3>Material requirements</h3><span class="r small muted">${w.issued?'materials issued to this job':'for remaining '+fmtN(rem)}</span></div>
     <table class="t"><thead><tr><th>Component</th><th class="num">Per</th><th class="num">Required</th><th class="num">Usable on hand</th><th>Status</th></tr></thead><tbody>
     ${b.lines.map(l=>{ const c=item(l.itemId); const need=l.qty*(w.issued?w.qty:rem); const oh=Math.max(0,Q(c.id).onHand-Q(c.id).hold); return `<tr data-open="${c.id}"><td><span class="mono link">${esc(c.sku)}</span> <span class="muted small">${esc(c.name)}</span></td><td class="num">${fmtN(l.qty)}</td><td class="num">${fmtN(need)} ${esc(c.uom)}</td><td class="num">${fmtN(oh)}</td><td>${w.issued?'<span class="pill ok">Issued</span>':oh>=need?'<span class="pill ok">OK</span>':`<span class="pill bad">Short ${fmtN(need-oh)}</span>`}</td></tr>`; }).join('')}</tbody></table></div>
    <div class="card" style="margin-top:14px"><div class="card-h"><h3>Job history</h3></div><div id="jh"></div></div>
   </div>`);
  $$('[data-open]',d).forEach(r=>r.onclick=()=>openItem(r.dataset.open));
  $('[data-it]',d).onclick=()=>openItem(it.id);
  const tx=DB.txns.filter(t=>t.ref===w.num).slice().reverse();
  table($('#jh',d),{key:'wojh',bare:true,free:true,rows:tx,empty:'No stock moved on this job yet.',columns:[{k:'ts',label:'When',get:t=>t.ts,fmt:v=>fmtDT(v)},{k:'type',label:'Type',get:t=>t.type},{k:'sku',label:'Item',get:t=>item(t.itemId).sku},{k:'qty',label:'Qty',num:true,get:t=>t.qty,html:t=>`<span class="${t.qty>0?'pos':'neg'}">${t.qty>0?'+':''}${fmtN(t.qty)}</span>`},{k:'lot',label:'Lot',get:t=>t.lot},{k:'user',label:'By',get:t=>t.user}]});
  const act={
    release(){ w.status='Released'; toast(w.num+' released','ok'); refresh(); openWO(id); },
    issue(){ const sh=woShort(w); if(sh.length) return modal({title:'Not enough material',body:`<div class="note bad">Can't issue — short on: ${sh.map(l=>esc(item(l.itemId).sku)).join(', ')}.</div><p class="muted">Receive or build the missing parts first, or reduce the WO quantity. (Partial issue is a good candidate for a suggestion!)</p>`});
      const snap=JSON.stringify({s:DB.stock,t:DB.txns.length});
      for(const l of b.lines){ const e=consumeAnywhere({type:'CONSUME',itemId:l.itemId,qty:round(l.qty*rem,3),ref:w.num,note:'Issued to job'}); if(e){ const o=JSON.parse(snap); DB.stock=o.s; DB.txns.length=o.t; return toast(e); } }
      w.issued=true; w.status='In progress'; toast('Materials issued to '+w.num,'ok'); refresh(); openWO(id); },
    complete(){ modal({title:'Report completion · '+w.num,body:`<div class="grid2"><label class="f"><span>Good quantity</span><input class="in" name="q" type="number" value="${rem}" max="${rem}"></label><label class="f"><span>Put away to</span><select class="in" name="loc">${locOptions(it.defaultLoc)}</select></label></div>${it.lotTracked?`<label class="f"><span>Batch / lot</span><input class="in mono" name="lot" placeholder="Auto-assign"></label>`:''}<label class="f"><span>Labor hours for this run (optional)</span><input class="in" name="hrs" type="number" step="any"></label>${!w.issued?'<div class="note info">Materials haven\'t been issued, so they\'ll be backflushed (consumed automatically) for this quantity.</div>':''}`,
      actions:[{label:'Cancel'},{label:'Post completion',pri:true,onClick:(dd,f)=>{ const q=+dd.q; if(!(q>0)||q>rem) return fieldErr(f,`Enter 1–${rem}.`);
        if(!w.issued){ for(const l of b.lines){ const e=consumeAnywhere({type:'CONSUME',itemId:l.itemId,qty:round(l.qty*q,3),ref:w.num,note:'Backflush'}); if(e) return fieldErr(f,e); } }
        post({type:'BUILD',itemId:it.id,qty:q,loc:dd.loc,lot:dd.lot,ref:w.num,note:'Completed on job'}); w.done+=q; w.laborHrs=round(w.laborHrs+(+dd.hrs||0),2);
        if(w.done>=w.qty){ w.status='Complete'; w.completed=new Date().toISOString(); } else w.status='In progress';
        toast(`+${q} ${it.sku} to stock`,'ok'); refresh(); openWO(id); }}]}); },
    labor(){ modal({title:'Log labor · '+w.num,body:`<label class="f"><span>Hours</span><input class="in" name="h" type="number" step="0.25"></label><label class="f"><span>Employee</span><select class="in" name="who">${DB.users.map(u=>`<option>${esc(u.name)}</option>`).join('')}</select></label>`,actions:[{label:'Cancel'},{label:'Log',pri:true,onClick:(dd,f)=>{ if(!(+dd.h>0)) return fieldErr(f,'Hours?'); w.laborHrs=round(w.laborHrs+ +dd.h,2); toast(`${dd.h} h logged for ${dd.who}`,'ok'); refresh(); openWO(id); }}]}); },
    cancel(){ modal({title:'Cancel '+w.num+'?',body:'<p>Allocated materials are freed. Stock already issued stays consumed.</p>',actions:[{label:'Keep it'},{label:'Cancel WO',danger:true,onClick:()=>{ w.status='Cancelled'; refresh(); openWO(id); }}]}); }
  };
  $$('[data-do]',d).forEach(bt=>bt.onclick=()=>act[bt.dataset.do]());
}

/* ---------------- purchasing ---------------- */
function createPO(vendorId,lines,status='Draft'){ const v=vendor(vendorId); const po={id:'PO'+DB.nextNums.po,num:'PO-'+(DB.nextNums.po++),vendorId,status,ordered:new Date().toISOString(),due:new Date(Date.now()+v.lead*DAY).toISOString(),buyer:Session.user.name,notes:'',lines:lines.map(l=>({itemId:l.itemId,qty:+l.qty,received:0,cost:l.cost!=null?+l.cost:item(l.itemId).cost}))}; DB.pos.push(po); return po; }
const poTotal=p=>p.lines.reduce((a,l)=>a+l.qty*l.cost,0);
function lineEditor(kind,lines){
  const rows=ls=>ls.map((l,i)=>`<tr><td style="min-width:220px">${itemPicker('i'+i,l.itemId,kind==='po'?(x=>x.type!=='Finished'):(x=>x.price>0))}</td><td><input class="in num" name="q${i}" type="number" step="any" value="${l.qty||''}" style="width:90px"></td><td><input class="in num" name="p${i}" type="number" step="any" value="${l.price??l.cost??''}" style="width:100px"></td><td><button type="button" class="btn sm ghost danger" data-rm="${i}">×</button></td></tr>`).join('');
  return {html:`<table class="t"><thead><tr><th>Item</th><th>Qty</th><th>${kind==='po'?'Unit cost':'Unit price'}</th><th></th></tr></thead><tbody id="le">${rows(lines)}</tbody></table><button type="button" class="btn sm" id="addLine" style="margin-top:8px">${ic('plus')}Add line</button>`,
    wire(form){ const sync=()=>{ lines=lines.map((l,i)=>({itemId:(itemBySku(form['i'+i]?.value)||{}).id||'',qty:form['q'+i]?.value,[kind==='po'?'cost':'price']:form['p'+i]?.value})); };
      const w=()=>{ $$('[data-rm]',form).forEach(x=>x.onclick=()=>{ sync(); lines.splice(+x.dataset.rm,1); $('#le',form).innerHTML=rows(lines); w(); });
        lines.forEach((l,i)=>{ form['i'+i].onchange=()=>{ const it=itemBySku(form['i'+i].value); if(it&&!form['p'+i].value) form['p'+i].value=kind==='po'?it.cost:it.price; }; }); };
      $('#addLine',form).onclick=()=>{ sync(); lines.push({itemId:'',qty:''}); $('#le',form).innerHTML=rows(lines); w(); }; w(); },
    read(d){ const out=[]; for(let i=0;i<200;i++){ if(!(('i'+i) in d)) break; const it=itemBySku(d['i'+i]); if(!it){ if(d['i'+i]) return 'Unknown SKU: '+d['i'+i]; continue; } if(!(+d['q'+i]>0)) return 'Quantity missing for '+it.sku; out.push({itemId:it.id,qty:+d['q'+i],cost:+d['p'+i]||it.cost,price:+d['p'+i]||it.price}); } return out.length?out:'Add at least one line.'; }};
}
function newPO(vendorId,lines){
  const le=lineEditor('po',(lines||[{itemId:'',qty:''}]).map(l=>({...l,cost:l.cost??(l.itemId?item(l.itemId).cost:'')})));
  modal({title:'New purchase order',wide:true,body:`<div class="grid2"><label class="f"><span>Vendor</span><select class="in" name="v">${DB.vendors.map(v=>`<option value="${v.id}" ${v.id===vendorId?'selected':''}>${esc(v.name)} · ${v.lead}d lead</option>`).join('')}</select></label><label class="f"><span>Status</span><select class="in" name="st"><option>Draft</option><option>Open</option></select></label></div>${le.html}`,onOpen:le.wire,
    actions:[{label:'Cancel'},{label:'Create PO',pri:true,onClick:(d,f)=>{ const ls=le.read(d); if(typeof ls==='string') return fieldErr(f,ls); const po=createPO(d.v,ls,d.st); toast(po.num+' created','ok'); save(); if(ROUTE!=='purchasing') location.hash='#/purchasing'; else refresh(); setTimeout(()=>openPO(po.id),60); }}]});
}
V.purchasing = el => {
  el.innerHTML = pageHead('Purchase orders','Receive against POs line by line, with partials, lot capture and optional QC hold.',`<button class="btn" onclick="location.hash='#/reorder'">${ic('refresh')}Reorder planner</button><button class="btn pri" id="np">${ic('plus')}New PO</button>`)+`<div class="card" id="pt"></div>`;
  table($('#pt',el),{key:'pos',noun:'purchase orders',rows:DB.pos.slice().reverse(),chipDefault:'open',totals:true,columns:[
    {k:'num',label:'PO',get:p=>p.num,html:p=>`<span class="mono link">${esc(p.num)}</span>`},{k:'vendor',label:'Vendor',get:p=>vendor(p.vendorId).name},{k:'status',label:'Status',get:p=>p.status,html:p=>docPill(p.status)+(OPEN_PO.includes(p.status)&&daysFrom(p.due)<0?' '+docPill('Late'):'')},
    {k:'ordered',label:'Ordered',get:p=>p.ordered,fmt:v=>fmtD(v)},{k:'due',label:'Due',get:p=>p.due,html:p=>`${fmtD(p.due)} <span class="muted small">${OPEN_PO.includes(p.status)?rel(p.due):''}</span>`},{k:'lines',label:'Lines',num:true,get:p=>p.lines.length},
    {k:'rcv',label:'Received',get:p=>p.lines.reduce((a,l)=>a+l.received,0)/p.lines.reduce((a,l)=>a+l.qty,0),html:p=>{const r=p.lines.reduce((a,l)=>a+l.received,0)/p.lines.reduce((a,l)=>a+l.qty,0);return `<div class="bar ${r>=1?'ok':''}"><i style="width:${r*100}%"></i></div>`;}},
    {k:'total',label:'Total',num:true,get:p=>poTotal(p),fmt:v=>fmt$(v),total:true},{k:'buyer',label:'Buyer',get:p=>p.buyer,hide:true}],
    chips:[{k:'open',label:'Open',test:p=>OPEN_PO.includes(p.status)},{k:'late',label:'Late',test:p=>OPEN_PO.includes(p.status)&&daysFrom(p.due)<0},{k:'Draft',label:'Drafts',test:p=>p.status==='Draft'},{k:'done',label:'Received / closed',test:p=>['Received','Closed'].includes(p.status)},{k:'all',label:'All'}],onRow:p=>openPO(p.id)});
  $('#np',el).onclick=()=>newPO();
};
function openPO(id){
  const p=DB.pos.find(x=>x.id===id), v=vendor(p.vendorId);
  const d=drawer(`<div class="drawer-h"><div style="flex:1"><div class="crumb">Purchase order · ${esc(v.name)}</div><h2 class="mono">${esc(p.num)}</h2><div class="muted">Ordered ${fmtD(p.ordered)} · due ${fmtD(p.due)} (${rel(p.due)}) · ${esc(v.terms)}</div></div>${docPill(p.status)}<button class="x" data-close>×</button></div>
   <div class="drawer-b"><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
     ${p.status==='Draft'?'<button class="btn sm pri" data-do="submit">Submit to vendor</button><button class="btn sm" data-do="edit">Edit lines</button>':''}
     ${OPEN_PO.includes(p.status)?'<button class="btn sm pri" data-do="receive">'+ic('down')+'Receive</button><button class="btn sm" data-do="close">Close short</button>':''}
     <button class="btn sm ghost" data-do="print">Print / PDF</button></div>
    <div class="stats"><div class="stat"><div class="l">Total</div><div class="v">${fmt$(poTotal(p))}</div></div><div class="stat"><div class="l">Received value</div><div class="v">${fmt$(p.lines.reduce((a,l)=>a+l.received*l.cost,0))}</div></div><div class="stat"><div class="l">Vendor rating</div><div class="v">${v.rating} ★</div></div></div>
    <div class="card"><table class="t"><thead><tr><th>Item</th><th class="num">Ordered</th><th class="num">Received</th><th class="num">Open</th><th class="num">Cost</th><th class="num">Ext.</th></tr></thead><tbody>${p.lines.map(l=>{const it=item(l.itemId);return `<tr data-open="${it.id}"><td><span class="mono link">${esc(it.sku)}</span> <span class="muted small">${esc(it.name)}</span></td><td class="num">${fmtN(l.qty)}</td><td class="num">${fmtN(l.received)}</td><td class="num">${fmtN(l.qty-l.received)}</td><td class="num">${fmt$(l.cost)}</td><td class="num">${fmt$(l.qty*l.cost)}</td></tr>`;}).join('')}</tbody></table></div>
    <div class="card" style="margin-top:14px"><div class="card-h"><h3>Vendor</h3></div><div class="card-b"><dl class="kv"><dt>Contact</dt><dd>${esc(v.contact)}</dd><dt>Phone</dt><dd>${esc(v.phone)}</dd><dt>Email</dt><dd>${esc(v.email)}</dd><dt>Buyer</dt><dd>${esc(p.buyer)}</dd></dl></div></div></div>`);
  $$('[data-open]',d).forEach(r=>r.onclick=()=>openItem(r.dataset.open));
  const act={
    submit(){ p.status='Open'; p.ordered=new Date().toISOString(); p.due=new Date(Date.now()+v.lead*DAY).toISOString(); toast(p.num+' submitted','ok'); refresh(); openPO(id); },
    close(){ p.status='Closed'; toast(p.num+' closed','ok'); refresh(); openPO(id); },
    edit(){ const le=lineEditor('po',p.lines.map(l=>({...l}))); modal({title:'Edit '+p.num,wide:true,body:le.html,onOpen:le.wire,actions:[{label:'Cancel'},{label:'Save',pri:true,onClick:(dd,f)=>{ const ls=le.read(dd); if(typeof ls==='string') return fieldErr(f,ls); p.lines=ls.map(l=>({itemId:l.itemId,qty:l.qty,received:0,cost:l.cost})); refresh(); openPO(id); }}]}); },
    print(){ printDoc('Purchase Order',p.num,v.name,[v.contact,v.phone,v.email],p.lines.map(l=>({sku:item(l.itemId).sku,name:item(l.itemId).name,qty:l.qty,uom:item(l.itemId).uom,price:l.cost})),`Due ${fmtD(p.due)} · Terms ${v.terms}`); },
    receive(){ const open=p.lines.map((l,i)=>({...l,i})).filter(l=>l.qty>l.received);
      modal({title:'Receive '+p.num,wide:true,sub:'Enter what actually arrived. Leave a line at 0 for a partial.',body:`<label style="display:flex;gap:8px;align-items:center;margin-bottom:10px"><input type="checkbox" name="qc"> Put everything in receiving inspection (QC hold)</label><table class="t"><thead><tr><th>Item</th><th class="num">Open</th><th>Receive</th><th>To bin</th><th>Lot</th></tr></thead><tbody>${open.map(l=>{const it=item(l.itemId);return `<tr><td><span class="mono">${esc(it.sku)}</span><div class="muted small">${esc(it.name)}</div></td><td class="num">${fmtN(l.qty-l.received)}</td><td><input class="in num" style="width:90px" type="number" step="any" name="r${l.i}" value="${l.qty-l.received}"></td><td><select class="in" name="l${l.i}" style="min-width:150px">${locOptions(it.defaultLoc)}</select></td><td>${it.lotTracked?`<input class="in mono" name="lot${l.i}" placeholder="vendor lot" style="width:120px">`:'<span class="muted small">n/a</span>'}</td></tr>`;}).join('')}</tbody></table><label class="f" style="margin-top:12px"><span>Packing slip #</span><input class="in" name="slip"></label>`,
        actions:[{label:'Cancel'},{label:'Post receipt',pri:true,onClick:(dd,f)=>{ let n=0; for(const l of open){ const q=+dd['r'+l.i]||0; if(q<0) return fieldErr(f,'Negative qty'); if(!q) continue; const e=post({type:'RECEIVE',itemId:l.itemId,qty:q,loc:dd.qc?'MAIN-QC':dd['l'+l.i],lot:dd['lot'+l.i],ref:p.num,note:dd.slip?'Slip '+dd.slip:''}); if(e) return fieldErr(f,e); p.lines[l.i].received=round(p.lines[l.i].received+q,3); n++; }
          if(!n) return fieldErr(f,'Nothing to receive.'); p.status=p.lines.every(l=>l.received>=l.qty)?'Received':'Partial'; toast(`${p.num}: ${n} line${n>1?'s':''} received`,'ok'); refresh(); openPO(id); }}]}); }
  };
  $$('[data-do]',d).forEach(b=>b.onclick=()=>act[b.dataset.do]());
}
function printDoc(kind,num,to,toLines,lines,foot){
  const w=window.open('','_blank'); if(!w) return toast('Allow pop-ups to print');
  const tot=lines.reduce((a,l)=>a+l.qty*l.price,0);
  w.document.write(`<!doctype html><title>${esc(num)}</title><style>body{font:13px system-ui;margin:40px;color:#111}h1{margin:0;font-size:22px}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{padding:8px;border-bottom:1px solid #ddd;text-align:left}td.n,th.n{text-align:right}.top{display:flex;justify-content:space-between}</style><div class="top"><div><b>${esc(DB.company)}</b><br>1200 Industrial Pkwy<br>Anytown, USA</div><div style="text-align:right"><h1>${esc(kind)}</h1><div>${esc(num)}</div><div>${new Date().toLocaleDateString()}</div></div></div><p style="margin-top:24px"><b>To:</b> ${esc(to)}<br>${toLines.map(esc).join('<br>')}</p><table><tr><th>SKU</th><th>Description</th><th class="n">Qty</th><th class="n">Unit</th><th class="n">Amount</th></tr>${lines.map(l=>`<tr><td>${esc(l.sku)}</td><td>${esc(l.name)}</td><td class="n">${fmtN(l.qty)} ${esc(l.uom)}</td><td class="n">${fmt$(l.price)}</td><td class="n">${fmt$(l.qty*l.price)}</td></tr>`).join('')}<tr><td colspan="4" class="n"><b>Total</b></td><td class="n"><b>${fmt$(tot)}</b></td></tr></table><p>${esc(foot)}</p><p style="color:#888;margin-top:40px">Generated by ORBIT prototype — sample data.</p><script>print()<\/script>`);
  w.document.close();
}

/* ---------------- sales ---------------- */
const soTotal=s=>s.lines.reduce((a,l)=>a+l.qty*l.price,0);
V.sales = el => {
  el.innerHTML = pageHead('Sales orders','Availability is checked per line. Shipping picks oldest lots first.',`<button class="btn pri" id="ns">${ic('plus')}New sales order</button>`)+`<div class="card" id="st"></div>`;
  const ready=s=>s.lines.every(l=>l.qty-l.shipped<=Math.max(0,Q(l.itemId).onHand-Q(l.itemId).hold));
  table($('#st',el),{key:'sos',noun:'sales orders',rows:DB.sos.slice().reverse(),chipDefault:'open',totals:true,columns:[
    {k:'num',label:'SO',get:s=>s.num,html:s=>`<span class="mono link">${esc(s.num)}</span>`},{k:'cust',label:'Customer',get:s=>customer(s.customerId).name},{k:'cpo',label:'Cust. PO',get:s=>s.custPO,hide:true},
    {k:'status',label:'Status',get:s=>s.status,html:s=>docPill(s.status)+(OPEN_SO.includes(s.status)&&daysFrom(s.due)<0?' '+docPill('Late'):'')},{k:'due',label:'Ship by',get:s=>s.due,html:s=>`${fmtD(s.due)} <span class="muted small">${OPEN_SO.includes(s.status)?rel(s.due):''}</span>`},
    {k:'ready',label:'Stock',get:s=>OPEN_SO.includes(s.status)?(ready(s)?'Ready':'Short'):'',html:s=>OPEN_SO.includes(s.status)?(ready(s)?'<span class="pill ok">Ready to ship</span>':'<span class="pill warn">Waiting on stock</span>'):''},
    {k:'total',label:'Total',num:true,get:s=>soTotal(s),fmt:v=>fmt$(v),total:true},{k:'rep',label:'Rep',get:s=>s.rep,hide:true}],
    chips:[{k:'open',label:'Open',test:s=>OPEN_SO.includes(s.status)},{k:'late',label:'Late',test:s=>OPEN_SO.includes(s.status)&&daysFrom(s.due)<0},{k:'ready',label:'Ready to ship',test:s=>OPEN_SO.includes(s.status)&&ready(s)},{k:'Shipped',label:'Shipped',test:s=>s.status==='Shipped'},{k:'all',label:'All'}],onRow:s=>openSO(s.id)});
  $('#ns',el).onclick=()=>{ const le=lineEditor('so',[{itemId:'',qty:''}]); modal({title:'New sales order',wide:true,body:`<div class="grid3"><label class="f"><span>Customer</span><select class="in" name="c">${DB.customers.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></label><label class="f"><span>Customer PO</span><input class="in" name="cpo"></label><label class="f"><span>Ship by</span><input class="in" type="date" name="due" value="${isoDate(new Date(Date.now()+10*DAY).toISOString())}"></label></div>${le.html}`,onOpen:le.wire,
    actions:[{label:'Cancel'},{label:'Create order',pri:true,onClick:(d,f)=>{ const ls=le.read(d); if(typeof ls==='string') return fieldErr(f,ls); const so={id:'SO'+DB.nextNums.so,num:'SO-'+(DB.nextNums.so++),customerId:d.c,status:'Open',ordered:new Date().toISOString(),due:new Date(d.due+'T12:00').toISOString(),custPO:d.cpo,rep:Session.user.name,notes:'',lines:ls.map(l=>({itemId:l.itemId,qty:l.qty,shipped:0,price:l.price}))}; DB.sos.push(so); toast(so.num+' created','ok'); refresh(); setTimeout(()=>openSO(so.id),60); }}]}); };
};
function openSO(id){
  const s=DB.sos.find(x=>x.id===id), c=customer(s.customerId);
  const d=drawer(`<div class="drawer-h"><div style="flex:1"><div class="crumb">Sales order · ${esc(c.name)}</div><h2 class="mono">${esc(s.num)}</h2><div class="muted">Cust. PO ${esc(s.custPO)} · ship by ${fmtD(s.due)} (${rel(s.due)}) · ${esc(c.terms)}</div></div>${docPill(s.status)}<button class="x" data-close>×</button></div>
   <div class="drawer-b"><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">${OPEN_SO.includes(s.status)?`<button class="btn sm pri" data-do="ship">${ic('truck')}Ship</button><button class="btn sm" data-do="wo">${ic('tool')}Make shortages</button>`:''}<button class="btn sm ghost" data-do="print">Pick list / packing slip</button></div>
   <div class="stats"><div class="stat"><div class="l">Order total</div><div class="v">${fmt$(soTotal(s))}</div></div><div class="stat"><div class="l">Shipped</div><div class="v">${fmt$(s.lines.reduce((a,l)=>a+l.shipped*l.price,0))}</div></div><div class="stat"><div class="l">Margin</div><div class="v">${round(100*(1-s.lines.reduce((a,l)=>a+l.qty*item(l.itemId).cost,0)/soTotal(s)),1)}%</div></div></div>
   <div class="card"><table class="t"><thead><tr><th>Item</th><th class="num">Ordered</th><th class="num">Shipped</th><th class="num">Open</th><th class="num">On hand</th><th class="num">Price</th><th>Stock</th></tr></thead><tbody>${s.lines.map(l=>{const it=item(l.itemId), o=l.qty-l.shipped, oh=Math.max(0,Q(it.id).onHand-Q(it.id).hold);return `<tr data-open="${it.id}"><td><span class="mono link">${esc(it.sku)}</span> <span class="muted small">${esc(it.name)}</span></td><td class="num">${fmtN(l.qty)}</td><td class="num">${fmtN(l.shipped)}</td><td class="num">${fmtN(o)}</td><td class="num">${fmtN(oh)}</td><td class="num">${fmt$(l.price)}</td><td>${!o?'<span class="pill ok">Shipped</span>':oh>=o?'<span class="pill ok">In stock</span>':`<span class="pill warn">Short ${fmtN(o-oh)}</span>`}</td></tr>`;}).join('')}</tbody></table></div>
   <div class="card" style="margin-top:14px"><div class="card-h"><h3>Customer</h3></div><div class="card-b"><dl class="kv"><dt>Contact</dt><dd>${esc(c.contact)}</dd><dt>Location</dt><dd>${esc(c.city)}</dd><dt>Linked WOs</dt><dd>${DB.wos.filter(w=>w.soRef===s.num).map(w=>`<a class="link mono" data-wo="${w.id}">${esc(w.num)}</a> ${docPill(w.status)}`).join(' ')||'—'}</dd></dl></div></div></div>`);
  $$('[data-open]',d).forEach(r=>r.onclick=()=>openItem(r.dataset.open));
  $$('[data-wo]',d).forEach(a=>a.onclick=()=>openWO(a.dataset.wo));
  const act={
    ship(){ const open=s.lines.map((l,i)=>({...l,i})).filter(l=>l.qty>l.shipped);
      modal({title:'Ship '+s.num,wide:true,sub:'Defaults to what\'s available. Stock is picked oldest-lot-first across bins (QC hold excluded).',body:`<table class="t"><thead><tr><th>Item</th><th class="num">Open</th><th class="num">Usable</th><th>Ship now</th></tr></thead><tbody>${open.map(l=>{const it=item(l.itemId); const oh=Math.max(0,Q(it.id).onHand-Q(it.id).hold); return `<tr><td class="mono">${esc(it.sku)}</td><td class="num">${fmtN(l.qty-l.shipped)}</td><td class="num">${fmtN(oh)}</td><td><input class="in num" style="width:90px" type="number" name="s${l.i}" value="${Math.min(oh,l.qty-l.shipped)}"></td></tr>`;}).join('')}</tbody></table><div class="grid2" style="margin-top:12px"><label class="f"><span>Carrier</span><select class="in" name="car"><option>UPS Ground</option><option>FedEx Freight</option><option>Customer pickup</option><option>LTL — R+L</option></select></label><label class="f"><span>Tracking #</span><input class="in" name="trk"></label></div>`,
        actions:[{label:'Cancel'},{label:'Post shipment',pri:true,onClick:(dd,f)=>{ let n=0; for(const l of open){ const q=+dd['s'+l.i]||0; if(!q) continue; if(q>l.qty-l.shipped) return fieldErr(f,'Can\'t ship more than ordered.'); const e=consumeAnywhere({type:'SHIP',itemId:l.itemId,qty:q,ref:s.num,note:dd.car+(dd.trk?' · '+dd.trk:'')}); if(e) return fieldErr(f,e); s.lines[l.i].shipped+=q; n++; }
          if(!n) return fieldErr(f,'Nothing to ship.'); s.status=s.lines.every(l=>l.shipped>=l.qty)?'Shipped':'Partial'; toast(`${s.num} ${s.status==='Shipped'?'shipped complete':'partially shipped'}`,'ok'); refresh(); openSO(id); }}]}); },
    wo(){ let n=0; s.lines.forEach(l=>{ const it=item(l.itemId); const o=l.qty-l.shipped; const short=o-Math.max(0,Q(it.id).avail+o) ; const need=Math.max(0,o-(Math.max(0,Q(it.id).onHand-Q(it.id).hold))-DB.wos.filter(w=>w.itemId===it.id&&!['Complete','Cancelled'].includes(w.status)).reduce((a,w)=>a+w.qty-w.done,0)); if(need>0&&bomOf(it.id)){ createWO(it.id,need,{due:new Date(new Date(s.due)-2*DAY).toISOString(),soRef:s.num}); n++; } });
      if(n){ toast(`${n} work order${n>1?'s':''} created for ${s.num}`,'ok'); refresh(); openSO(id);} else toast('No shortages that need a work order (existing WOs already cover it).'); },
    print(){ printDoc('Packing Slip',s.num,c.name,[c.contact,c.city,'Cust. PO '+s.custPO],s.lines.map(l=>({sku:item(l.itemId).sku,name:item(l.itemId).name+' · bin '+item(l.itemId).defaultLoc,qty:l.qty-l.shipped||l.qty,uom:item(l.itemId).uom,price:l.price})),`Ship by ${fmtD(s.due)}`); }
  };
  $$('[data-do]',d).forEach(b=>b.onclick=()=>act[b.dataset.do]());
}

/* ---------------- partners ---------------- */
V.partners = el => {
  const tab=PARAMS.tab||'vendors';
  el.innerHTML = pageHead('Vendors & customers','',`<div class="seg" id="pt">${['vendors','customers'].map(t=>`<button data-t="${t}" class="${t===tab?'on':''}">${t[0].toUpperCase()+t.slice(1)}</button>`).join('')}</div>`)+`<div class="card" id="ptb"></div>`;
  $$('#pt button',el).forEach(b=>b.onclick=()=>{ PARAMS.tab=b.dataset.t; route(true); });
  if(tab==='vendors') table($('#ptb',el),{key:'vend',noun:'vendors',rows:DB.vendors,columns:[{k:'id',label:'ID',get:v=>v.id},{k:'name',label:'Vendor',get:v=>v.name},{k:'contact',label:'Contact',get:v=>v.contact},{k:'phone',label:'Phone',get:v=>v.phone},{k:'terms',label:'Terms',get:v=>v.terms},{k:'lead',label:'Lead days',num:true,get:v=>v.lead},{k:'items',label:'Items',num:true,get:v=>DB.items.filter(i=>i.vendorId===v.id).length},{k:'open',label:'Open PO $',num:true,get:v=>DB.pos.filter(p=>p.vendorId===v.id&&OPEN_PO.includes(p.status)).reduce((a,p)=>a+poTotal(p),0),fmt:x=>fmt$(x,0)},{k:'rating',label:'Rating',num:true,get:v=>v.rating}],onRow:v=>partnerDrawer('v',v.id)});
  else table($('#ptb',el),{key:'cust',noun:'customers',rows:DB.customers,columns:[{k:'id',label:'ID',get:c=>c.id},{k:'name',label:'Customer',get:c=>c.name},{k:'contact',label:'Contact',get:c=>c.contact},{k:'city',label:'Location',get:c=>c.city},{k:'terms',label:'Terms',get:c=>c.terms},{k:'open',label:'Open SO $',num:true,get:c=>DB.sos.filter(s=>s.customerId===c.id&&OPEN_SO.includes(s.status)).reduce((a,s)=>a+soTotal(s),0),fmt:x=>fmt$(x,0)},{k:'all',label:'Lifetime $',num:true,get:c=>DB.sos.filter(s=>s.customerId===c.id).reduce((a,s)=>a+soTotal(s),0),fmt:x=>fmt$(x,0)}],onRow:c=>partnerDrawer('c',c.id)});
};
function partnerDrawer(k,id){
  const p=k==='v'?vendor(id):customer(id); const docs=k==='v'?DB.pos.filter(x=>x.vendorId===id):DB.sos.filter(x=>x.customerId===id);
  const d=drawer(`<div class="drawer-h"><div style="flex:1"><div class="crumb">${k==='v'?'Vendor':'Customer'} · ${esc(p.id)}</div><h2>${esc(p.name)}</h2><div class="muted">${esc(p.contact)} · ${esc(p.phone||p.city)}</div></div><button class="x" data-close>×</button></div><div class="drawer-b"><div class="card" id="pd"></div>${k==='v'?'<div class="card" style="margin-top:14px"><div class="card-h"><h3>Items supplied</h3></div><div id="pi"></div></div>':''}</div>`);
  table($('#pd',d),{key:'pdocs',bare:true,free:true,rows:docs.slice().reverse(),columns:[{k:'num',label:k==='v'?'PO':'SO',get:x=>x.num},{k:'st',label:'Status',get:x=>x.status,html:x=>docPill(x.status)},{k:'due',label:'Due',get:x=>x.due,fmt:v=>fmtD(v)},{k:'t',label:'Total',num:true,get:x=>k==='v'?poTotal(x):soTotal(x),fmt:v=>fmt$(v)}],onRow:x=>k==='v'?openPO(x.id):openSO(x.id)});
  if(k==='v') table($('#pi',d),{key:'pitems',bare:true,free:true,rows:DB.items.filter(i=>i.vendorId===id),columns:[{k:'sku',label:'SKU',get:i=>i.sku},{k:'n',label:'Item',get:i=>i.name},{k:'c',label:'Cost',num:true,get:i=>i.cost,fmt:v=>fmt$(v)},{k:'s',label:'Status',get:i=>Q(i.id).status,html:i=>statusPill(Q(i.id).status)}],onRow:i=>openItem(i.id)});
}

/* ---------------- suggestions ---------------- */
function openSuggest(pre={}){
  const areas=['General / whole app',...NAV.flatMap(([,its])=>its.map(i=>i[1])),'Reports & printing','Integrations (QuickBooks, shipping, etc.)','Mobile / barcode scanning'];
  const area=pre.area||(ROUTE&&ROUTE!=='dashboard'?pageName(ROUTE):'General / whole app');
  modal({title:'Suggest changes or features',sub:`Goes straight to the Starsonn team building this. Be as blunt as you like — "Q-inmass does X and I need it" is perfect.`,wide:true,body:`
    <label class="f"><span>What kind of feedback?</span><div class="seg" id="kind">${['Missing feature','Change something','Something\'s broken','Question'].map((k,i)=>`<button type="button" class="${i===0?'on':''}" data-k="${esc(k)}">${esc(k)}</button>`).join('')}</div><input type="hidden" name="kind" value="Missing feature"></label>
    <div class="grid2"><label class="f"><span>Which part of the app?</span><select class="in" name="area">${areas.map(a=>`<option ${a===area?'selected':''}>${esc(a)}</option>`).join('')}</select></label>
    <label class="f"><span>How important?</span><select class="in" name="pri"><option>Nice to have</option><option selected>Important</option><option>Must have before we'd switch</option></select></label></div>
    <label class="f"><span>Short summary</span><input class="in" name="title" placeholder="e.g. Scan barcodes to receive POs"></label>
    <label class="f"><span>Details</span><textarea class="in" name="body" rows="6" placeholder="What are you trying to do? How do you do it today (in Q-inmass or on paper)? What would make it better?"></textarea></label>
    <div class="grid2"><label class="f"><span>Your name</span><input class="in" name="name" value="${esc(Session.user.name==='Demo User'?'':Session.user.name)}"></label><label class="f"><span>Best way to reach you (optional)</span><input class="in" name="contact" placeholder="email or phone"></label></div>`,
    onOpen:f=>{ $$('#kind button',f).forEach(b=>b.onclick=()=>{ $$('#kind button',f).forEach(x=>x.classList.toggle('on',x===b)); f.kind.value=b.dataset.k; }); },
    actions:[{label:'Cancel'},{label:'Copy text',onClick:(d,f)=>{ if(!d.title&&!d.body) return fieldErr(f,'Write a summary or some details first.'); const s=mkSug(d); navigator.clipboard&&navigator.clipboard.writeText(sugText(s)).then(()=>toast('Copied — paste it into a text or email to Starsonn','ok'),()=>toast('Copy failed')); }},
      {label:ic('bulb')+'Send to Starsonn',pri:true,onClick:(d,f)=>{ if(!d.title&&!d.body) return fieldErr(f,'Write a summary or some details first.'); const s=mkSug(d); sendSug(s); setTimeout(()=>modal({title:'Thanks — your email app should be open',body:`<p>We filled in an email to <b>${esc(SUGGEST_TO)}</b> with your suggestion. <b>Hit send</b> in your email app and it's on its way.</p><p class="muted small">Nothing opened? Use <b>My suggestions</b> in the menu to copy it or try again. Saved there either way.</p>`,actions:[{label:'View my suggestions',onClick:()=>{location.hash='#/suggestions';}},{label:'Done',pri:true}]}),200); }}]});
}
function mkSug(d){ if(d.name&&Session.user.name!==d.name){ Session.user.name=d.name; store.set('orbit.session',Session.user); store.set('orbit.name',d.name); const a=$('#me'); if(a) a.textContent=initials(d.name); }
  const s={id:'S'+Date.now(),ts:new Date().toISOString(),kind:d.kind,area:d.area,pri:d.pri,title:d.title||'(no summary)',body:d.body,name:d.name,contact:d.contact,page:location.hash||'#/dashboard',sent:false};
  (DB.suggestions=DB.suggestions||[]).push(s); save(); drawNav(); return s; }
const sugText=s=>`${s.kind.toUpperCase()} — ${s.title}\n\nArea: ${s.area}\nPriority: ${s.pri}\nFrom: ${s.name||'(not given)'}${s.contact?' · '+s.contact:''}\nCompany: ${DB.company}\nWas on page: ${s.page}\n\n${s.body||''}\n\n—\nSent from the ORBIT prototype (${APP.version}) · ${new Date(s.ts).toLocaleString()}\n${location.href.split('#')[0]}`;
function sendSug(s){ const subj=`[ORBIT feedback] ${s.kind}: ${s.title}`.slice(0,140); let body=sugText(s); if(body.length>1800) body=body.slice(0,1800)+'\n…(trimmed)'; s.sent=true; save(); location.href=`mailto:${SUGGEST_TO}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`; }
V.suggestions = el => {
  const list=(DB.suggestions||[]).slice().reverse();
  el.innerHTML = pageHead('My suggestions',`Everything you've suggested from this browser. Each one is emailed to ${esc(SUGGEST_TO)}.`,`<button class="btn-suggest" id="ns">${ic('bulb')}New suggestion</button>`)+
   (list.length?`<div class="card" id="sl"></div>`:`<div class="card empty-state"><p style="font-size:15px;color:var(--ink)"><b>No suggestions yet.</b></p><p>Tell us what's missing compared to Q-inmass, what's confusing, or what would save you time. Ideas to get you started:</p><div class="starter" style="max-width:760px;margin:16px auto 0">${['Barcode / QR scanning on a phone','QuickBooks or accounting sync','Serial number tracking','Custom fields on items','Multi-level approvals on POs','Customer price lists','Shipping labels (UPS/FedEx)','Scheduled email reports'].map(t=>`<button data-idea="${esc(t)}">${esc(t)}<small>Suggest this →</small></button>`).join('')}</div></div>`);
  $('#ns',el).onclick=()=>openSuggest();
  $$('[data-idea]',el).forEach(b=>b.onclick=()=>{ openSuggest(); setTimeout(()=>{ const t=$('.modal [name=title]'); if(t) t.value=b.dataset.idea; },40); });
  if(list.length) table($('#sl',el),{key:'sug',noun:'suggestions',rows:list,columns:[{k:'ts',label:'When',get:s=>s.ts,fmt:v=>fmtDT(v)},{k:'kind',label:'Type',get:s=>s.kind,html:s=>`<span class="pill ${s.kind==='Something\'s broken'?'bad':s.kind==='Missing feature'?'acc':'info'}">${esc(s.kind)}</span>`},{k:'title',label:'Summary',get:s=>s.title,cls:'wrap'},{k:'area',label:'Area',get:s=>s.area},{k:'pri',label:'Priority',get:s=>s.pri},{k:'sent',label:'Email',get:s=>s.sent?'Opened':'Not sent',html:s=>s.sent?'<span class="pill ok">Email opened</span>':'<span class="pill warn">Not sent</span>'}],
    onRow:s=>modal({title:s.title,sub:`${esc(s.kind)} · ${esc(s.area)} · ${esc(s.pri)}`,body:`<pre style="white-space:pre-wrap;font:13px/1.5 var(--sans);margin:0">${esc(sugText(s))}</pre>`,actions:[{label:'Delete',danger:true,onClick:()=>{ DB.suggestions=DB.suggestions.filter(x=>x.id!==s.id); refresh(); }},{label:'Copy',onClick:()=>{ navigator.clipboard&&navigator.clipboard.writeText(sugText(s)); toast('Copied','ok'); return false; }},{label:'Email again',pri:true,onClick:()=>sendSug(s)}]})});
};

/* ---------------- settings ---------------- */
V.settings = el => {
  el.innerHTML = pageHead('Settings','Prototype settings — kept in this browser.')+`<div class="dash"><div class="card"><div class="card-h"><h3>Company</h3></div><form class="card-b" id="sf" onsubmit="return false">
    <label class="f"><span>Company name</span><input class="in" name="company" value="${esc(DB.company)}"></label>
    <label class="f"><span>Shop labor rate ($/h, used in BOM cost roll-up)</span><input class="in" name="rate" type="number" value="${DB.laborRate}"></label>
    <label class="f"><span>Your name</span><input class="in" name="name" value="${esc(Session.user.name)}"></label>
    <button class="btn pri" id="sv">Save</button></form></div>
    <div class="stack"><div class="card"><div class="card-h"><h3>Demo data</h3></div><div class="card-b"><p class="muted">Made a mess? Put everything back to the original sample data. Your suggestions are kept.</p><button class="btn danger" id="rs">${ic('refresh')}Reset demo data</button> <button class="btn" id="ex">${ic('down')}Export all data (JSON)</button></div></div>
    <div class="card"><div class="card-h"><h3>About this prototype</h3></div><div class="card-b"><p style="margin-top:0">${APP.name} ${APP.version} — built by Starsonn to explore what a better inventory system could look like for your shop. It runs entirely in your browser; there is no server and nothing is shared.</p><p class="muted small">Keyboard: <kbd>⌘K</kbd>/<kbd>Ctrl K</kbd> search · <kbd>/</kbd> search · <kbd>Esc</kbd> close panels.</p><button class="btn-suggest" id="sg" style="animation:none">${ic('bulb')}Suggest changes or features</button></div></div></div></div>`;
  $('#sv',el).onclick=()=>{ const d=formData($('#sf',el)); DB.company=d.company||DB.company; DB.laborRate=+d.rate||DB.laborRate; rollCost(); if(d.name){ Session.user.name=d.name; store.set('orbit.session',Session.user); store.set('orbit.name',d.name); $('#me').textContent=initials(d.name);} toast('Saved','ok'); refresh(); };
  $('#rs',el).onclick=()=>modal({title:'Reset demo data?',body:'<p>All items, orders and stock history go back to the starting sample. This can\'t be undone.</p>',actions:[{label:'Cancel'},{label:'Reset',danger:true,onClick:()=>{ resetDemo(); toast('Demo data reset','ok'); refresh(); }}]});
  $('#ex',el).onclick=()=>{ const b=new Blob([JSON.stringify(DB,null,1)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='orbit-data.json'; a.click(); };
  $('#sg',el).onclick=()=>openSuggest();
};

/* ---------------- command palette ---------------- */
function openPalette(){
  if($('.pal')) return;
  const pages=NAV.flatMap(([,its])=>its.map(([k,l])=>({g:'Pages',t:l,k:'page',go:()=>location.hash='#/'+k})));
  const acts=[['Receive stock',()=>stockAction('receive')],['Issue stock',()=>stockAction('issue')],['Adjust quantity',()=>stockAction('adjust')],['Transfer stock',()=>stockAction('transfer')],['Spot count',()=>stockAction('count')],['New purchase order',()=>newPO()],['New work order',()=>newWO()],['New item',()=>editItem()],['Suggest changes or features',()=>openSuggest()]].map(([t,go])=>({g:'Actions',t,k:'action',go}));
  const recs=[...DB.items.map(i=>({g:'Items',t:`${i.sku} — ${i.name}`,k:Q(i.id).status,go:()=>openItem(i.id)})),...DB.pos.map(p=>({g:'Purchase orders',t:`${p.num} · ${vendor(p.vendorId).name}`,k:p.status,go:()=>openPO(p.id)})),...DB.sos.map(s=>({g:'Sales orders',t:`${s.num} · ${customer(s.customerId).name} · ${s.custPO}`,k:s.status,go:()=>openSO(s.id)})),...DB.wos.map(w=>({g:'Work orders',t:`${w.num} · ${item(w.itemId).sku}`,k:w.status,go:()=>openWO(w.id)})),...DB.vendors.map(v=>({g:'Vendors',t:v.name,k:'vendor',go:()=>partnerDrawer('v',v.id)})),...DB.customers.map(c=>({g:'Customers',t:c.name,k:'customer',go:()=>partnerDrawer('c',c.id)})),...[...new Set(DB.stock.filter(s=>s.lot).map(s=>s.lot))].map(l=>({g:'Lots',t:'Lot '+l+' · '+item(DB.stock.find(s=>s.lot===l).itemId).sku,k:'lot',go:()=>openItem(DB.stock.find(s=>s.lot===l).itemId,'overview')}))];
  const all=[...acts,...pages,...recs];
  const p=document.createElement('div'); p.className='pal'; p.innerHTML=`<div class="scrim" style="z-index:-1"></div><div class="pal-box"><input placeholder="Search SKUs, POs, lots, customers… or type an action" aria-label="Search"><div class="pal-list"></div></div>`;
  document.body.appendChild(p); const inp=$('input',p), list=$('.pal-list',p); let sel=0, res=[];
  const close=()=>p.remove();
  const draw=()=>{ const q=inp.value.trim().toLowerCase(); const qs=q.split(/\s+/).filter(Boolean);
    res = q? all.filter(r=>qs.every(x=>r.t.toLowerCase().includes(x))).slice(0,40) : [...acts.slice(0,5),...pages];
    sel=Math.min(sel,Math.max(0,res.length-1)); let g=''; 
    list.innerHTML=res.map((r,i)=>{ const hd=r.g!==g?`<div class="pal-grp">${esc(g=r.g)}</div>`:''; return hd+`<div class="pal-it ${i===sel?'on':''}" data-i="${i}">${esc(r.t)}<span class="k">${esc(r.k)}</span></div>`; }).join('')||'<div class="empty-state">No matches. Try the Query explorer for deeper questions.</div>';
    $$('.pal-it',list).forEach(el=>el.onclick=()=>{ close(); res[+el.dataset.i].go(); }); const on=$('.pal-it.on',list); on&&on.scrollIntoView({block:'nearest'}); };
  inp.oninput=()=>{sel=0;draw();};
  inp.onkeydown=e=>{ if(e.key==='ArrowDown'){sel=Math.min(res.length-1,sel+1);draw();e.preventDefault();} else if(e.key==='ArrowUp'){sel=Math.max(0,sel-1);draw();e.preventDefault();} else if(e.key==='Enter'&&res[sel]){ close(); res[sel].go(); } else if(e.key==='Escape') close(); };
  $('.scrim',p).onclick=close; draw(); inp.focus();
}

/* ---------------- router & boot ---------------- */
function route(keepDrawer){
  const hs=(location.hash||'#/dashboard').slice(2).split('?'); const r=hs[0]||'dashboard';
  if(r!==ROUTE){ PARAMS={}; }
  if(hs[1]) new URLSearchParams(hs[1]).forEach((v,k)=>PARAMS[k]=v);
  ROUTE = V[r]? r : 'dashboard';
  if(!keepDrawer) closeDrawer();
  const ap=$('#app'); if(ap) ap.classList.remove('nav-open');
  const el=$('#content'); if(!el) return;
  const y=keepDrawer?window.scrollY:0;
  try{ V[ROUTE](el); }catch(e){ console.error(e); el.innerHTML=`<div class="card empty-state"><b>Something broke on this page.</b><br>${esc(e.message)}<br><br><button class="btn-suggest" onclick="openSuggest({area:'${esc(pageName(ROUTE))}'})">Report it</button></div>`; }
  bindPage(el); drawNav(); document.title=pageName(ROUTE)+' · ORBIT'; if(!keepDrawer) window.scrollTo(0,0); else window.scrollTo(0,y);
}
function askName(first){
  modal({title:first?'Welcome to ORBIT':'Your name',sub:first?'A working prototype, built for you to try.':'',body:`${first?`<p style="margin-top:0">Everything here is <b>sample data</b> for a fictional shop and lives only in this browser, so click anything — receive a PO, ship an order, build a work order, run a query. You can't break it (and Settings has a reset).</p><div class="note info" style="display:flex;gap:10px;align-items:flex-start">${ic('bulb').replace('<svg','<svg width="22" height="22" style="flex:none"')}<div>The yellow <b>Suggest changes or features</b> button is always at the top. Use it whenever something's missing, wrong, or Q-inmass does it better.</div></div>`:''}<label class="f"><span>What should we call you?</span><input class="in" name="name" value="${esc(Session.user.name==='Demo User'?'':Session.user.name)}" placeholder="Your name"></label>`,
    actions:[{label:first?'Let\'s go':'Save',pri:true,onClick:d=>{ if(d.name){ Session.user.name=d.name.trim(); store.set('orbit.name',Session.user.name); } store.set('orbit.session',Session.user); store.set('orbit.welcomed',1); renderShell(); route(); }}]});
}
function boot(){
  const t=store.get('orbit.theme',null); if(t) document.documentElement.dataset.theme=t; else if(matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.dataset.theme='dark';
  if(!Session.user){ renderLogin(); return; }
  renderShell(); route();
  if(!store.get('orbit.welcomed',0)) askName(true);
}
window.addEventListener('hashchange',()=>{ if(Session.user) route(); });
document.addEventListener('keydown',e=>{ if(!Session.user) return; if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){ e.preventDefault(); openPalette(); } else if(e.key==='/'&&!e.target.closest('input,textarea,select')){ e.preventDefault(); openPalette(); } });
