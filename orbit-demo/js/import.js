// ORBIT import: bring data in from Q-inmass (or any system) using the spreadsheets it downloads.
// Self-contained: adds the "Import data" page to the menu, a card to Settings, and its own styles.
(function(){
const XLSX_URL='https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
const css=`
.imp-drop{border:2px dashed var(--line2);border-radius:14px;padding:34px 20px;text-align:center;background:var(--panel);cursor:pointer;transition:border-color .15s,background .15s}
.imp-drop:hover,.imp-drop.over{border-color:var(--acc);background:var(--accSoft)}
.imp-drop h3{margin:8px 0 4px;font-size:17px}
.imp-drop svg{width:34px;height:34px;color:var(--acc)}
.imp-ds{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px;margin-bottom:14px}
.imp-ds button{text-align:left;border:1px solid var(--line);background:var(--panel);border-radius:10px;padding:10px 12px;cursor:pointer;color:var(--ink)}
.imp-ds button.on{border-color:var(--acc);box-shadow:0 0 0 3px color-mix(in srgb,var(--acc) 18%,transparent)}
.imp-ds button b{display:block;font-size:13.5px}
.imp-ds button small{color:var(--ink3);font-size:11.5px}
.imp-map{display:grid;grid-template-columns:minmax(150px,1fr) minmax(170px,1.3fr) minmax(120px,1fr);gap:6px 12px;align-items:center;font-size:13px}
.imp-map .h{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink3);font-weight:600}
.imp-map .samp{color:var(--ink3);font-family:var(--mono);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.imp-req{color:var(--bad);margin-left:2px}
.imp-steps{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px}
.imp-steps span{padding:4px 11px;border-radius:99px;font-size:12px;border:1px solid var(--line2);color:var(--ink3)}
.imp-steps span.on{background:var(--acc);border-color:var(--acc);color:#fff}
.imp-steps span.done{background:var(--okSoft);color:var(--ok);border-color:transparent}
.imp-grid{display:grid;grid-template-columns:1.6fr 1fr;gap:16px;align-items:start}
@media (max-width:1000px){.imp-grid{grid-template-columns:1fr}.imp-map{grid-template-columns:1fr 1.2fr}.imp-map .samp{display:none}}
@media (max-width:600px){.imp-grid .card-h{flex-wrap:wrap}.imp-grid .card-h .r{margin-left:0;flex-wrap:wrap}}
.imp-grid>*{min-width:0}
ol.imp-how{margin:0;padding-left:18px;font-size:13px;line-height:1.6}
`;
const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

// ---------- what can be imported ----------
const T = (k,label,opt={}) => ({k,label,req:!!opt.req,type:opt.type||'text',syn:opt.syn||[],hint:opt.hint||''});
const SETS = {
  items:{label:'Items & on-hand stock',desc:'Part list with quantities, costs, bins',fields:[
    T('sku','SKU / part number',{req:1,syn:['part number','part no','part #','part','item number','item no','item #','item','item code','sku','part id','product code','stock code']}),
    T('name','Description',{syn:['description','part description','desc','item description','name','part name']}),
    T('type','Item type',{syn:['item type','type','source','make/buy','make buy','class type'],hint:'Make / Buy / Raw / Finished…'}),
    T('category','Category',{syn:['category','product line','class','group','product group','commodity','family']}),
    T('uom','Unit of measure',{syn:['u/m','uom','unit','units','unit of measure','stock um','um']}),
    T('onHand','Qty on hand',{type:'num',syn:['qty on hand','on hand','qoh','quantity on hand','onhand','qty','quantity','in stock','qty avail','stock']}),
    T('loc','Location / bin',{syn:['location','bin','loc','bin location','warehouse','whse','stock location']}),
    T('lot','Lot / batch',{syn:['lot','lot number','lot #','batch','heat','heat number','serial']}),
    T('cost','Unit cost',{type:'num',syn:['std cost','standard cost','unit cost','cost','avg cost','average cost','last cost']}),
    T('price','Sell price',{type:'num',syn:['sell price','price','list price','unit price','sales price']}),
    T('rop','Reorder point',{type:'num',syn:['reorder point','reorder pt','rop','min','min qty','minimum','safety stock']}),
    T('roq','Reorder qty',{type:'num',syn:['reorder qty','order qty','eoq','reorder quantity','lot size','max','order quantity']}),
    T('vendor','Preferred vendor',{syn:['primary vendor','vendor','supplier','vendor name','preferred vendor','vendor id']}),
    T('abc','ABC class',{syn:['abc','abc class','abc code']}),
    T('notes','Notes',{syn:['notes','comment','comments','memo']})]},
  vendors:{label:'Vendors',desc:'Suppliers, contacts, terms, lead times',fields:[
    T('name','Vendor name',{req:1,syn:['vendor name','vendor','supplier','name','company']}),
    T('id','Vendor ID',{syn:['vendor id','vendor #','vendor no','vendor code','code','id']}),
    T('contact','Contact',{syn:['contact','contact name','attention','attn']}),
    T('phone','Phone',{syn:['phone','telephone','phone number','tel']}),
    T('email','Email',{syn:['email','e-mail','email address']}),
    T('terms','Terms',{syn:['terms','payment terms']}),
    T('lead','Lead time (days)',{type:'num',syn:['lead time','lead days','lead','lead time days']})]},
  customers:{label:'Customers',desc:'Customer list and terms',fields:[
    T('name','Customer name',{req:1,syn:['customer name','customer','name','company','bill to','sold to']}),
    T('id','Customer ID',{syn:['customer id','customer #','customer no','cust #','cust id','code','id']}),
    T('contact','Contact',{syn:['contact','contact name','buyer','attention']}),
    T('city','City / location',{syn:['city','location','city, st','city state','ship to city']}),
    T('terms','Terms',{syn:['terms','payment terms']})]},
  polines:{label:'Open purchase orders',desc:'One row per PO line',fields:[
    T('num','PO number',{req:1,syn:['po number','po #','po no','po','purchase order','order #','order number']}),
    T('vendor','Vendor',{req:1,syn:['vendor','vendor name','supplier','vendor id']}),
    T('sku','SKU / part number',{req:1,syn:['part number','part #','part','item','item number','sku','part no']}),
    T('qty','Qty ordered',{req:1,type:'num',syn:['qty ordered','order qty','quantity','qty','ordered']}),
    T('received','Qty received',{type:'num',syn:['qty received','received','rec qty','qty rec']}),
    T('cost','Unit cost',{type:'num',syn:['unit cost','cost','price','unit price']}),
    T('ordered','Order date',{type:'date',syn:['order date','po date','date','date ordered']}),
    T('due','Due date',{type:'date',syn:['due date','promise date','required date','due','req date','expected']})]},
  solines:{label:'Open sales orders',desc:'One row per SO line',fields:[
    T('num','SO number',{req:1,syn:['so number','so #','so no','sales order','order #','order number','so']}),
    T('customer','Customer',{req:1,syn:['customer','customer name','sold to','bill to','customer id']}),
    T('sku','SKU / part number',{req:1,syn:['part number','part #','part','item','item number','sku','part no']}),
    T('qty','Qty ordered',{req:1,type:'num',syn:['qty ordered','order qty','quantity','qty','ordered']}),
    T('shipped','Qty shipped',{type:'num',syn:['qty shipped','shipped','ship qty']}),
    T('price','Unit price',{type:'num',syn:['unit price','price','sell price']}),
    T('custPO','Customer PO',{syn:['customer po','cust po','po number','po #','customer po #']}),
    T('ordered','Order date',{type:'date',syn:['order date','date','so date','date ordered']}),
    T('due','Ship-by date',{type:'date',syn:['ship date','due date','promise date','required date','due','ship by','req date']})]},
  boms:{label:'Bills of material',desc:'Parent, component, qty per',fields:[
    T('parent','Parent part',{req:1,syn:['parent','parent part','assembly','parent item','top level','finished part','bom']}),
    T('comp','Component part',{req:1,syn:['component','component part','child','child part','material','part number','part','item']}),
    T('qty','Qty per',{req:1,type:'num',syn:['qty per','quantity per','qty','quantity','usage']})]}
};

// ---------- parsing ----------
function loadXLSX(){ return window.XLSX?Promise.resolve(window.XLSX):new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=XLSX_URL; s.onload=()=>res(window.XLSX); s.onerror=()=>rej(new Error('Could not load the Excel reader (no internet?). Save the file as CSV in Excel and try again.')); document.head.appendChild(s); }); }
function parseCSV(text){
  text=text.replace(/^\uFEFF/,'');
  const first=text.split(/\r?\n/).slice(0,5).join('\n');
  const cnt=ch=>(first.match(new RegExp(ch==='\t'?'\t':'\\'+ch,'g'))||[]).length;
  const delim=[',','\t',';','|'].sort((a,b)=>cnt(b)-cnt(a))[0];
  const rows=[]; let row=[], f='', q=false;
  for(let i=0;i<text.length;i++){ const c=text[i];
    if(q){ if(c==='"'){ if(text[i+1]==='"'){ f+='"'; i++; } else q=false; } else f+=c; }
    else if(c==='"') q=true; else if(c===delim){ row.push(f); f=''; }
    else if(c==='\n'||c==='\r'){ if(c==='\r'&&text[i+1]==='\n') i++; row.push(f); rows.push(row); row=[]; f=''; }
    else f+=c; }
  if(f!==''||row.length){ row.push(f); rows.push(row); }
  return rows.filter(r=>r.some(v=>String(v).trim()!==''));
}
async function readFile(file){
  const name=file.name, ext=(name.split('.').pop()||'').toLowerCase();
  if(['xlsx','xls','xlsm','ods'].includes(ext)){
    const X=await loadXLSX(); const wb=X.read(await file.arrayBuffer(),{type:'array',cellDates:true});
    const sheets=wb.SheetNames.map(n=>({name:n,rows:X.utils.sheet_to_json(wb.Sheets[n],{header:1,raw:true,defval:''}).filter(r=>r.some(v=>String(v).trim()!==''))})).filter(s=>s.rows.length);
    if(!sheets.length) throw new Error('That workbook looks empty.');
    return {name,sheets};
  }
  if(['csv','txt','tsv','tab'].includes(ext)||!ext) return {name,sheets:[{name:'Sheet1',rows:parseCSV(await file.text())}]};
  throw new Error('Unsupported file type ".'+ext+'". Use Excel (.xlsx / .xls) or CSV.');
}
const norm=s=>String(s==null?'':s).toLowerCase().replace(/[_.\-]+/g,' ').replace(/\s+/g,' ').trim();
function guessHeaderRow(rows){
  let best=0,score=-1;
  rows.slice(0,15).forEach((r,i)=>{ const cells=r.filter(v=>String(v).trim()!==''); const text=cells.filter(v=>isNaN(+String(v).replace(/[$,]/g,''))&&!(v instanceof Date)).length; const s=text*2+cells.length-(cells.length<2?99:0); if(s>score){score=s;best=i;} });
  return best;
}
function autoMap(ds,headers){
  const m={}, used=new Set(), H=headers.map(norm), F=SETS[ds].fields;
  const generic=['date','qty','item','part','cost','price','id','code','name','type','unit','lead','due','so','po','min','max','class','group','bin','loc','stock','quantity','location'];
  const take=(f,idx)=>{ if(idx>=0&&m[f.k]==null){ m[f.k]=idx; used.add(idx); } };
  F.forEach(f=>{ for(const s of f.syn){ const i=H.findIndex((h,j)=>!used.has(j)&&h===s); if(i>=0){ take(f,i); break; } } });
  F.forEach(f=>{ if(m[f.k]!=null) return; const i=H.findIndex((h,j)=>!used.has(j)&&h===norm(f.label)); take(f,i); });
  F.forEach(f=>{ if(m[f.k]!=null) return; for(const s of f.syn){ if(generic.includes(s)) continue; const i=H.findIndex((h,j)=>!used.has(j)&&(h.startsWith(s+' ')||h.endsWith(' '+s)||h.replace(/[^a-z0-9]/g,'')===s.replace(/[^a-z0-9]/g,''))); if(i>=0){ take(f,i); break; } } });
  return m;
}
function guessSet(headers){
  const H=headers.map(norm).join('|'); let best='items',sc=-1;
  Object.keys(SETS).forEach(k=>{ const m=autoMap(k,headers); const req=SETS[k].fields.filter(f=>f.req); const hit=req.filter(f=>m[f.k]!=null).length; let s=hit*10+Object.keys(m).length-(hit<req.length?50:0);
    if(k==='polines'&&/\bpo\b|purchase/.test(H)) s+=6; if(k==='solines'&&/\bso\b|sales order/.test(H)) s+=6; if(k==='boms'&&/parent|component|assembly/.test(H)) s+=6;
    if((k==='vendors'||k==='customers')&&/part|item|sku/.test(H)) s-=20; if(s>sc){sc=s;best=k;} });
  return best;
}
function num(v){ if(v==null||v==='') return null; if(typeof v==='number') return v; let s=String(v).trim(); const neg=/^\(.*\)$/.test(s); s=s.replace(/[()$,\s]/g,'').replace(/[a-z]+$/i,''); if(s===''||isNaN(+s)) return NaN; return neg?-(+s):+s; }
function date(v){ if(v==null||v==='') return null; if(v instanceof Date) return isNaN(v)?NaN:v.toISOString(); if(typeof v==='number'&&v>20000&&v<80000) return new Date(Math.round((v-25569)*86400000)+12*3600000).toISOString(); const d=new Date(String(v)); return isNaN(d)?NaN:new Date(d.getTime()+(String(v).length<=10?12*3600000:0)).toISOString(); }
const str=v=>v instanceof Date?isoDate(v.toISOString()):String(v==null?'':v).trim();

// ---------- turning rows into records ----------
function records(){
  const f=SETS[S.ds].fields, out=[];
  S.rows.slice(S.hdr+1).forEach((r,ri)=>{ const o={_row:S.hdr+ri+2}; let any=false;
    f.forEach(x=>{ const i=S.map[x.k]; if(i==null||i==='') return; const raw=r[+i]; const v=x.type==='num'?num(raw):x.type==='date'?date(raw):str(raw); if(v!==null&&v!=='') any=true; o[x.k]=v; });
    if(any) out.push(o); });
  return out;
}
const findVendor=v=>{ const n=norm(v); return DB.vendors.find(x=>norm(x.id)===n||norm(x.name)===n); };
const findCustomer=v=>{ const n=norm(v); return DB.customers.find(x=>norm(x.id)===n||norm(x.name)===n); };
function typeOf(v,fallback){ const s=norm(v); if(!s) return fallback||'Purchased';
  if(/raw|material|stock/.test(s)) return 'Raw'; if(/finish|fg|assembl|end item|saleable|top/.test(s)) return 'Finished'; if(/make|manuf|component|sub|wip|fab|machin/.test(s)) return 'Component';
  if(/consum|supply|supplies|expense|pack/.test(s)) return 'Consumable'; return 'Purchased'; }
function check(recs){
  const fileSkus=new Set(S.ds==='items'?recs.map(r=>norm(r.sku)):[]);
  const known=s=>!!itemBySku(s)||fileSkus.has(norm(s));
  return recs.map(r=>{ const e=[];
    SETS[S.ds].fields.forEach(f=>{ if(f.req&&(r[f.k]==null||r[f.k]==='')) e.push(f.label+' is blank'); if(f.type==='num'&&Number.isNaN(r[f.k])) e.push(f.label+' isn\'t a number'); if(f.type==='date'&&Number.isNaN(r[f.k])) e.push(f.label+' isn\'t a date'); });
    let st='New';
    if(S.ds==='items'){ if(r.sku&&itemBySku(r.sku)&&!S.wipe) st='Update'; if(r.onHand!=null&&r.onHand<0) e.push('Negative on-hand'); }
    if(S.ds==='vendors'&&r.name&&findVendor(r.id||r.name)&&!S.wipe) st='Update';
    if(S.ds==='customers'&&r.name&&findCustomer(r.id||r.name)&&!S.wipe) st='Update';
    if(S.ds==='polines'||S.ds==='solines'){ if(r.sku&&!(S.wipe?false:!!itemBySku(r.sku))) e.push('Unknown SKU '+r.sku+' — import items first'); if(r.num&&(S.ds==='polines'?DB.pos:DB.sos).some(p=>norm(p.num)===norm(r.num))&&!S.wipe) st='Replace'; }
    if(S.ds==='boms'){ if(r.parent&&!itemBySku(r.parent)) e.push('Unknown parent '+r.parent); if(r.comp&&!itemBySku(r.comp)) e.push('Unknown component '+r.comp); if(r.parent&&bomOf((itemBySku(r.parent)||{}).id)) st='Replace'; }
    return {...r,_st:e.length?'Error':st,_err:e.join('; ')}; });
}
function wipeSample(){
  DB.items=[];DB.stock=[];DB.txns=[];DB.pos=[];DB.sos=[];DB.wos=[];DB.boms=[];DB.counts=[];DB.vendors=[];DB.customers=[];DB.savedQueries=DB.savedQueries||[];
  DB.locations=[{code:'MAIN',wh:'Main',zone:'General',desc:'Main stock room'},{code:'MAIN-QC',wh:'Main',zone:'Quality',desc:'Receiving inspection hold'}];
  DB.company=DB.company==='Halvorsen Machine Works'?'My company':DB.company; DB.sampleCleared=true;
}
function ensureLoc(code){ code=String(code).trim().toUpperCase().replace(/\s+/g,'-'); if(!code) return null; if(!DB.locations.some(l=>l.code===code)) DB.locations.push({code,wh:code.split('-')[0]||'Main',zone:'Imported',desc:'Added by import'}); return code; }
function ensureVendor(v){ if(!v) return ''; let x=findVendor(v); if(!x){ x={id:'V'+(900+DB.vendors.length+Math.floor(Math.random()*90)),name:String(v).trim(),contact:'',phone:'',email:'',terms:'Net 30',lead:7,rating:0}; DB.vendors.push(x); } return x.id; }
function ensureCustomer(v){ let x=findCustomer(v); if(!x){ x={id:'C'+(900+DB.customers.length+Math.floor(Math.random()*90)),name:String(v).trim(),city:'',terms:'Net 30',contact:''}; DB.customers.push(x); } return x.id; }
function setStock(it,loc,lot,qty){
  const cur=DB.stock.filter(s=>s.itemId===it.id&&s.loc===loc&&(!lot||s.lot===lot)).reduce((a,s)=>a+s.qty,0); const d=round(qty-cur,3); if(!d) return null;
  return post({type:'ADJUST',itemId:it.id,qty:d,loc,lot:lot||undefined,ref:'IMPORT',note:'Opening balance from '+S.file});
}
function apply(rows){
  const good=rows.filter(r=>r._st!=='Error'); const res={created:0,updated:0,errors:[]}; const bump=s=>s==='New'?res.created++:res.updated++;
  if(S.ds==='items'){ good.forEach((r,i)=>{ let it=itemBySku(r.sku); const isNew=!it;
      if(isNew){ it={id:'I'+Date.now().toString(36)+i,sku:String(r.sku).trim().toUpperCase(),name:r.sku,type:'Purchased',category:'General',uom:'ea',cost:0,price:0,reorderPoint:0,reorderQty:0,vendorId:'',lotTracked:false,abc:'C',defaultLoc:(DB.locations[0]||{}).code||'MAIN',active:true,notes:'',lastCount:new Date().toISOString()}; DB.items.push(it); }
      if(r.name) it.name=r.name; if(r.type) it.type=typeOf(r.type,it.type); else if(isNew&&r.vendor) it.type='Purchased';
      if(r.category) it.category=r.category; if(r.uom) it.uom=String(r.uom).toLowerCase(); if(r.cost!=null) it.cost=r.cost; if(r.price!=null) it.price=r.price;
      if(r.rop!=null) it.reorderPoint=r.rop; if(r.roq!=null) it.reorderQty=r.roq; if(r.vendor) it.vendorId=ensureVendor(r.vendor); if(r.abc) it.abc=String(r.abc).toUpperCase().slice(0,1); if(r.notes) it.notes=r.notes;
      if(r.lot) it.lotTracked=true; const loc=r.loc?ensureLoc(r.loc):it.defaultLoc; if(r.loc&&isNew) it.defaultLoc=loc;
      if(r.onHand!=null){ const e=setStock(it,loc,r.lot,r.onHand); if(e) res.errors.push('Row '+r._row+': '+e); }
      bump(isNew?'New':'Update'); }); }
  if(S.ds==='vendors') good.forEach(r=>{ let v=findVendor(r.id||r.name); const isNew=!v; if(isNew){ v={id:r.id||('V'+(900+DB.vendors.length)),name:r.name,contact:'',phone:'',email:'',terms:'Net 30',lead:7,rating:0}; DB.vendors.push(v); }
    ['name','contact','phone','email','terms'].forEach(k=>{ if(r[k]) v[k]=r[k]; }); if(r.lead!=null) v.lead=r.lead; bump(isNew?'New':'Update'); });
  if(S.ds==='customers') good.forEach(r=>{ let c=findCustomer(r.id||r.name); const isNew=!c; if(isNew){ c={id:r.id||('C'+(900+DB.customers.length)),name:r.name,city:'',terms:'Net 30',contact:''}; DB.customers.push(c); }
    ['name','contact','city','terms'].forEach(k=>{ if(r[k]) c[k]=r[k]; }); bump(isNew?'New':'Update'); });
  if(S.ds==='polines'||S.ds==='solines'){ const isPO=S.ds==='polines', list=isPO?DB.pos:DB.sos, groups=new Map();
    good.forEach(r=>{ const k=String(r.num).trim(); if(!groups.has(k)) groups.set(k,[]); groups.get(k).push(r); });
    groups.forEach((ls,numb)=>{ const r0=ls[0]; const old=list.findIndex(p=>norm(p.num)===norm(numb)); if(old>=0) list.splice(old,1);
      const lines=ls.map(r=>{ const it=itemBySku(r.sku); return isPO?{itemId:it.id,qty:r.qty,received:Math.min(r.qty,r.received||0),cost:r.cost!=null?r.cost:it.cost}:{itemId:it.id,qty:r.qty,shipped:Math.min(r.qty,r.shipped||0),price:r.price!=null?r.price:it.price}; });
      const done=lines.every(l=>(isPO?l.received:l.shipped)>=l.qty), some=lines.some(l=>(isPO?l.received:l.shipped)>0);
      const now=new Date().toISOString();
      if(isPO){ const vid=ensureVendor(r0.vendor); const v=vendor(vid); DB.pos.push({id:'PO'+Date.now().toString(36)+list.length,num:numb,vendorId:vid,status:done?'Received':some?'Partial':'Open',ordered:r0.ordered||now,due:r0.due||new Date(Date.now()+(v.lead||7)*DAY).toISOString(),buyer:'Imported',notes:'Imported from '+S.file,lines}); }
      else { const cid=ensureCustomer(r0.customer); DB.sos.push({id:'SO'+Date.now().toString(36)+list.length,num:numb,customerId:cid,status:done?'Shipped':some?'Partial':'Open',ordered:r0.ordered||now,due:r0.due||new Date(Date.now()+10*DAY).toISOString(),custPO:r0.custPO||'',rep:'Imported',notes:'Imported from '+S.file,lines}); }
      bump(old>=0?'Update':'New'); }); }
  if(S.ds==='boms'){ const groups=new Map(); good.forEach(r=>{ const p=itemBySku(r.parent).id; if(!groups.has(p)) groups.set(p,[]); groups.get(p).push({itemId:itemBySku(r.comp).id,qty:r.qty}); });
    groups.forEach((lines,pid)=>{ const b=bomOf(pid); if(b){ b.lines=lines; bump('Update'); } else { DB.boms.push({itemId:pid,rev:'A',labor:0,lines}); const it=item(pid); if(it.type==='Purchased') it.type='Component'; bump('New'); } });
    if(typeof rollCost==='function') rollCost(); }
  return res;
}

// ---------- page ----------
let S={step:1,ds:null,file:'',sheets:null,sheet:0,rows:[],hdr:0,map:{},wipe:false,result:null};
const reset=()=>{ S={step:1,ds:null,file:'',sheets:null,sheet:0,rows:[],hdr:0,map:{},wipe:false,result:null}; };
function steps(){ return '<div class="imp-steps">'+['1 · Choose a file','2 · Match columns','3 · Done'].map((t,i)=>'<span class="'+(S.step===i+1?'on':S.step>i+1?'done':'')+'">'+t+'</span>').join('')+'</div>'; }
V.import = el => {
  const hist=(DB.imports||[]).slice().reverse(); const undo=store.get('orbit.preimport',null);
  const head=pageHead('Import data','Bring your parts, stock, vendors, customers and open orders over from Q-inmass — or any system that can save a spreadsheet.',
    (undo?'<button class="btn" id="impUndo">'+ic('refresh')+'Undo last import</button>':'')+'<button class="btn" id="impTpl">'+ic('down')+'Blank templates</button>');
  if(S.step===1){
    el.innerHTML=head+steps()+`<div class="imp-grid"><div>
      <div class="card"><div class="card-b">
        <div class="muted small" style="margin-bottom:8px">What's in the file? <span class="muted">(ORBIT guesses from the column names — change it if it guesses wrong)</span></div>
        <div class="imp-ds">${Object.entries(SETS).map(([k,s])=>`<button data-ds="${k}" class="${S.ds===k?'on':''}"><b>${esc(s.label)}</b><small>${esc(s.desc)}</small></button>`).join('')}</div>
        <label class="imp-drop" id="impDrop">${ic('down')}<h3>Drop your Q-inmass export here</h3><div class="muted">Excel (.xlsx, .xls) or CSV · or <span class="link">choose a file</span></div><input type="file" id="impFile" accept=".xlsx,.xls,.xlsm,.csv,.txt,.tsv,.ods" hidden></label>
        <div id="impErr"></div>
        <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="muted small">No file handy?</span><button class="btn sm" id="impDemo">Try an example Q-inmass inventory export</button></div>
      </div></div>
      ${hist.length?`<div class="card" style="margin-top:16px"><div class="card-h"><h3>Import history</h3><span class="r muted small">this browser</span></div><div id="impHist"></div></div>`:''}
    </div><div class="stack">
      <div class="card"><div class="card-h"><h3>Getting data out of Q-inmass</h3></div><div class="card-b"><ol class="imp-how">
        <li>Open the list you want in Q-inmass — e.g. the <b>inventory / parts</b> screen, <b>vendors</b>, <b>customers</b>, or <b>open POs / SOs</b>.</li>
        <li>Use its <b>download to spreadsheet</b> (Excel) option. Q-inmass says every screen can be downloaded this way; its Excel reports work too.</li>
        <li>Drop the file here. ORBIT matches the columns for you, shows a preview, and only imports what you approve.</li></ol>
        <div class="note info" style="margin:12px 0 0">Best order: <b>items</b> first, then vendors & customers, then open POs, SOs and BOMs (those need the part numbers to exist).</div></div></div>
      <div class="card"><div class="card-h"><h3>Safe to try</h3></div><div class="card-b small muted" style="line-height:1.6">Everything stays in this browser. Before each import ORBIT keeps a snapshot, so <b>Undo last import</b> puts things back exactly. Nothing is sent to Starsonn or anyone else.</div></div>
    </div></div>`;
    $$('[data-ds]',el).forEach(b=>b.onclick=()=>{ S.ds=b.dataset.ds; S.picked=true; $$('[data-ds]',el).forEach(x=>x.classList.toggle('on',x===b)); });
    const drop=$('#impDrop',el), inp=$('#impFile',el);
    inp.onchange=()=>inp.files[0]&&load(inp.files[0]);
    ['dragenter','dragover'].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.add('over');}));
    ['dragleave','drop'].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.remove('over');}));
    drop.addEventListener('drop',ev=>{ const f=ev.dataTransfer.files[0]; if(f) load(f); });
    $('#impDemo',el).onclick=()=>{ const f=new File([demoCSV()],'Q-inmass Inventory List.csv',{type:'text/csv'}); S.ds='items'; S.picked=true; load(f); };
    if(hist.length) table($('#impHist',el),{key:'imph',bare:true,free:true,rows:hist,columns:[{k:'ts',label:'When',get:h=>h.ts,fmt:v=>fmtDT(v)},{k:'file',label:'File',get:h=>h.file},{k:'ds',label:'Type',get:h=>(SETS[h.ds]||{}).label||h.ds},{k:'c',label:'Added',num:true,get:h=>h.created},{k:'u',label:'Updated',num:true,get:h=>h.updated},{k:'e',label:'Skipped',num:true,get:h=>h.skipped}]});
  }
  if(S.step===2) drawMap(el,head);
  if(S.step===3){ const r=S.result;
    el.innerHTML=head+steps()+`<div class="card"><div class="card-b" style="text-align:center;padding:34px 20px">
      <div style="font-size:40px;line-height:1">✓</div><h2 style="margin:10px 0 4px">Imported ${esc(S.file)}</h2>
      <p class="muted">${r.created} added · ${r.updated} updated · ${r.skipped} skipped${r.errors.length?' · '+r.errors.length+' warnings':''}</p>
      ${r.errors.length?`<div class="note warn" style="text-align:left;max-width:640px;margin:12px auto">${r.errors.slice(0,8).map(esc).join('<br>')}</div>`:''}
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px">
        <a class="btn pri" href="${({items:'#/inventory',vendors:'#/partners',customers:'#/partners?tab=customers',polines:'#/purchasing',solines:'#/sales',boms:'#/boms'})[S.ds]}">View ${esc(SETS[S.ds].label.toLowerCase())}</a>
        <button class="btn" id="impAgain">Import another file</button><a class="btn" href="#/query">Explore it in the Query explorer</a><button class="btn ghost" id="impUndo2">Undo this import</button></div></div></div>`;
    $('#impAgain',el).onclick=()=>{ reset(); route(true); };
    $('#impUndo2',el).onclick=doUndo;
  }
  const u=$('#impUndo',el); if(u) u.onclick=doUndo;
  $('#impTpl',el).onclick=()=>modal({title:'Blank templates',sub:'CSV files with the column names ORBIT recognizes. Handy if you\'re typing data in by hand.',body:Object.entries(SETS).map(([k,s])=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)"><div style="flex:1"><b>${esc(s.label)}</b><div class="muted small">${s.fields.map(f=>esc(f.label)+(f.req?'*':'')).join(', ')}</div></div><button type="button" class="btn sm" data-tpl="${k}">${ic('down')}CSV</button></div>`).join(''),
    onOpen:f=>$$('[data-tpl]',f).forEach(b=>b.onclick=()=>{ const s=SETS[b.dataset.tpl]; const line=s.fields.map(x=>'"'+x.label+'"').join(','); const blob=new Blob([line+'\n'],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='orbit-template-'+b.dataset.tpl+'.csv'; document.body.appendChild(a); a.click(); a.remove(); })});
};
async function load(file){
  const err=$('#impErr'); if(err) err.innerHTML='<div class="muted small" style="margin-top:10px">Reading '+esc(file.name)+'…</div>';
  try{ const r=await readFile(file); S.file=r.name; S.sheets=r.sheets; S.sheet=0; pickSheet(); S.step=2; route(true); }
  catch(e){ if(err) err.innerHTML='<div class="note bad" style="margin-top:10px">'+esc(e.message)+'</div>'; }
}
function pickSheet(keepDs){ S.rows=S.sheets[S.sheet].rows; S.hdr=guessHeaderRow(S.rows); const hd=S.rows[S.hdr]||[]; if(!keepDs&&!S.picked) S.ds=guessSet(hd); if(!S.ds) S.ds=guessSet(hd); S.picked=false; S.map=autoMap(S.ds,hd); }
function drawMap(el,head){
  const hd=(S.rows[S.hdr]||[]).map((h,i)=>str(h)||('Column '+(i+1)));
  if(S.ds!=='items') S.wipe=false;
  const recs=check(records()); const bad=recs.filter(r=>r._st==='Error').length; const set=SETS[S.ds];
  const missing=set.fields.filter(f=>f.req&&(S.map[f.k]==null||S.map[f.k]===''));
  const sample=k=>{ const i=S.map[k]; if(i==null||i==='') return ''; const v=(S.rows[S.hdr+1]||[])[+i]; return str(v); };
  el.innerHTML=head+steps()+`<div class="imp-grid"><div class="stack">
    <div class="card"><div class="card-h"><h3>${esc(S.file)}</h3><span class="r muted small">${S.rows.length-S.hdr-1} data rows</span></div><div class="card-b">
      <div class="grid3">
        <label class="f"><span>This file contains</span><select class="in" id="mDs">${Object.entries(SETS).map(([k,s])=>`<option value="${k}" ${k===S.ds?'selected':''}>${esc(s.label)}</option>`).join('')}</select></label>
        ${S.sheets.length>1?`<label class="f"><span>Sheet</span><select class="in" id="mSheet">${S.sheets.map((s,i)=>`<option value="${i}" ${i===S.sheet?'selected':''}>${esc(s.name)} (${s.rows.length})</option>`).join('')}</select></label>`:''}
        <label class="f"><span>Column names are on row</span><select class="in" id="mHdr">${S.rows.slice(0,15).map((r,i)=>`<option value="${i}" ${i===S.hdr?'selected':''}>Row ${i+1}: ${esc(r.filter(v=>str(v)).slice(0,3).map(str).join(', ').slice(0,40))}</option>`).join('')}</select></label>
      </div>
      <div class="imp-map"><div class="h">ORBIT field</div><div class="h">Column in your file</div><div class="h samp">First value</div>
      ${set.fields.map(f=>`<div>${esc(f.label)}${f.req?'<span class="imp-req">*</span>':''}${f.hint?`<div class="muted small">${esc(f.hint)}</div>`:''}</div>
        <select class="in" data-mf="${f.k}"><option value="">— skip —</option>${hd.map((h,i)=>`<option value="${i}" ${String(S.map[f.k])===String(i)?'selected':''}>${esc(h)}</option>`).join('')}</select><div class="samp">${esc(sample(f.k))}</div>`).join('')}</div>
    </div></div>
    <div class="card"><div class="card-h"><h3>Preview</h3><div class="r"><span class="pill ok">${recs.filter(r=>r._st==='New').length} new</span><span class="pill acc">${recs.filter(r=>r._st==='Update'||r._st==='Replace').length} update</span><span class="pill ${bad?'bad':'neu'}">${bad} will be skipped</span></div></div><div id="mPrev"></div></div>
  </div><div class="stack">
    <div class="card"><div class="card-h"><h3>Ready?</h3></div><div class="card-b">
      ${missing.length?`<div class="note bad">Match a column for: ${missing.map(f=>esc(f.label)).join(', ')}</div>`:''}
      ${DB.sampleCleared||S.ds!=='items'?'':`<label style="display:flex;gap:10px;align-items:flex-start;margin-bottom:12px"><input type="checkbox" id="mWipe" ${S.wipe?'checked':''} style="margin-top:3px"><span><b>Remove the sample data first</b><div class="muted small">Clears the demo shop (items, stock, orders, vendors, customers) so only your data is left. Undo still works.</div></span></label>`}
      <p class="small muted" style="margin-top:0">${S.ds==='items'?'On-hand quantities are set to exactly what the file says, per bin, and logged in Stock history as an opening balance.':S.ds==='polines'||S.ds==='solines'?'Lines are grouped into orders by order number. An order number that already exists is replaced.':S.ds==='boms'?'Rows are grouped by parent part; an existing BOM for that parent is replaced and costs are rolled up.':'Matching names or IDs are updated; new ones are added.'}</p>
      <button class="btn pri" id="mGo" style="width:100%;justify-content:center;padding:10px" ${missing.length||!(recs.length-bad)?'disabled':''}>Import ${recs.length-bad} row${recs.length-bad===1?'':'s'}</button>
      <button class="btn ghost" id="mBack" style="width:100%;justify-content:center;margin-top:6px">Choose a different file</button>
    </div></div></div></div>`;
  const cols=[{k:'_row',label:'Row',num:true,get:r=>r._row},{k:'_st',label:'Result',get:r=>r._st,html:r=>`<span class="pill ${r._st==='Error'?'bad':r._st==='New'?'ok':'acc'}">${r._st==='Error'?'Skip':r._st}</span>`},
    ...set.fields.filter(f=>S.map[f.k]!=null&&S.map[f.k]!=='').map(f=>({k:f.k,label:f.label,num:f.type==='num',get:r=>r[f.k],fmt:v=>v==null||v===''?'—':Number.isNaN(v)?'??':f.type==='date'?fmtD(v):f.type==='num'?fmtN(v):v})),
    {k:'_err',label:'Problem',get:r=>r._err,cls:'wrap'}];
  table($('#mPrev',el),{key:'impprev',noun:'rows',rows:recs,columns:cols,chips:[{k:'all',label:'All'},{k:'err',label:'Skipped',test:r=>r._st==='Error'},{k:'ok',label:'Will import',test:r=>r._st!=='Error'}]});
  $('#mDs',el).onchange=e=>{ S.ds=e.target.value; S.map=autoMap(S.ds,S.rows[S.hdr]||[]); route(true); };
  const sh=$('#mSheet',el); if(sh) sh.onchange=e=>{ S.sheet=+e.target.value; pickSheet(true); route(true); };
  $('#mHdr',el).onchange=e=>{ S.hdr=+e.target.value; S.map=autoMap(S.ds,S.rows[S.hdr]||[]); route(true); };
  $$('[data-mf]',el).forEach(s=>s.onchange=()=>{ if(s.value==='') delete S.map[s.dataset.mf]; else S.map[s.dataset.mf]=+s.value; route(true); });
  const w=$('#mWipe',el); if(w) w.onchange=()=>{ S.wipe=w.checked; route(true); };
  $('#mBack',el).onclick=()=>{ reset(); route(true); };
  $('#mGo',el).onclick=()=>{
    try{ store.set('orbit.preimport',JSON.stringify(DB)); }catch(e){}
    if(S.wipe) wipeSample();
    const rows=check(records()); const res=apply(rows); res.skipped=rows.filter(r=>r._st==='Error').length;
    rows.filter(r=>r._st==='Error').forEach(r=>res.errors.push('Row '+r._row+' skipped: '+r._err));
    (DB.imports=DB.imports||[]).push({ts:new Date().toISOString(),file:S.file,ds:S.ds,created:res.created,updated:res.updated,skipped:res.skipped});
    S.result=res; S.step=3; save(); toast('Import complete','ok'); refresh();
  };
}
function doUndo(){ const snap=store.get('orbit.preimport',null); if(!snap) return toast('Nothing to undo');
  modal({title:'Undo last import?',body:'<p>Puts all data back exactly as it was right before the last import.</p>',actions:[{label:'Cancel'},{label:'Undo import',danger:true,onClick:()=>{ try{ DB=JSON.parse(snap); }catch(e){ return toast('Could not read the snapshot'); } store.del('orbit.preimport'); save(); reset(); S.step=1; toast('Import undone','ok'); refresh(); }}]}); }
function demoCSV(){
  const rows=[['Inventory List','','','','','','','','','','',''],['Printed 9/21/2026','','','','','','','','','','',''],
    ['Part Number','Description','Item Type','Product Line','U/M','Qty On Hand','Location','Std Cost','Sell Price','Reorder Point','Reorder Qty','Primary Vendor'],
    ['10-4455-A','Hydraulic fitting, 1/2 NPT, brass','Buy','Fittings','EA','412','MAIN-B-03','$1.84','','150','500','Allied Fastener Co.'],
    ['10-4460-A','Hydraulic fitting, 3/4 NPT, brass','Buy','Fittings','EA','96','MAIN-B-03','$2.65','','100','400','Allied Fastener Co.'],
    ['22-1180','Cylinder tube, 2.5" bore, honed','Raw','Tube','FT','38.5','MAIN-A-02','$11.20','','40','120','Midwest Metals Supply'],
    ['35-0200-B','Piston rod, chromed, 1.25"','Make','Machined','EA','24','MAIN-C-01','$18.75','','20','40',''],
    ['35-0210','Gland nut, machined 6061','Make','Machined','EA','61','MAIN-C-01','$9.40','','30','60',''],
    ['50-HC250','HC-250 Hydraulic Cylinder Assembly','Finished Good','Cylinders','EA','7','MAIN-D-01','$212.00','$489.00','5','12',''],
    ['60-SEALKIT-25','Seal kit, 2.5" cylinder','Buy','Seals','KIT','55','MAIN-B-01','$6.10','$24.00','25','100','Precision Seal & Gasket'],
    ['70-LABEL-01','Serial label, polyester','Supplies','Packaging','EA','1,250','MAIN-D-01','$0.06','','500','2,000','Delta Packaging'],
    ['','Totals','','','','2,043.5','','','','','','']];
  return rows.map(r=>r.map(v=>/[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v).join(',')).join('\r\n');
}

// ---------- hook into the app ----------
const dataSec=NAV.find(s=>s[0]==='Data'); if(dataSec&&!dataSec[1].some(x=>x[0]==='import')) dataSec[1].push(['import','Import data','down']);
const origSettings=V.settings;
V.settings=el=>{ origSettings(el); const st2=$('.dash .stack',el); if(st2){ const c=document.createElement('div'); c.className='card'; c.innerHTML='<div class="card-h"><h3>Bring your own data</h3></div><div class="card-b"><p class="muted" style="margin-top:0">Import parts, stock, vendors, customers, open orders and BOMs from Q-inmass spreadsheets (Excel or CSV).</p><a class="btn pri" href="#/import">'+ic('down')+'Import data</a></div>'; st2.prepend(c); } };
})();
