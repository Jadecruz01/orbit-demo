// ORBIT sample data for a fall-protection manufacturer (used for client demos with data:'fallpro').
// Invented part numbers, vendors and distributors. Nothing here is a real company's data.
(function(){
  function rng(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; var t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
  const R = rng(20260921);
  const pick = a => a[Math.floor(R()*a.length)];
  const ri = (a,b) => Math.floor(a + R()*(b-a+1));
  const DAY = 86400000;
  const today = new Date(); today.setHours(9,0,0,0);
  const d = n => new Date(today.getTime() + n*DAY).toISOString();

  const users = [
    {id:'u1', name:'Demo User', role:'Administrator', email:'demo@orbit.app'},
    {id:'u2', name:'Maria Lopez', role:'Warehouse Lead'},
    {id:'u3', name:'Dan Whitfield', role:'Purchasing'},
    {id:'u4', name:'Keisha Grant', role:'Sewing Supervisor'},
    {id:'u5', name:'Tom Reyes', role:'Shipping'}
  ];

  const locations = [
    {code:'MAIN-A-01', wh:'Main', zone:'Webbing', desc:'Webbing roll rack'},
    {code:'MAIN-A-02', wh:'Main', zone:'Rope & cable', desc:'Rope, cable and absorber stock'},
    {code:'MAIN-B-01', wh:'Main', zone:'Hardware', desc:'D-rings, buckles, hooks'},
    {code:'MAIN-B-02', wh:'Main', zone:'Thread & labels', desc:'Thread spools, ID labels'},
    {code:'MAIN-C-01', wh:'Main', zone:'Sewing WIP', desc:'Sub-assemblies between sewing and assembly'},
    {code:'MAIN-D-01', wh:'Main', zone:'Finished goods', desc:'Bagged and boxed product'},
    {code:'MAIN-QC',   wh:'Main', zone:'Quality', desc:'Receiving inspection hold'},
    {code:'SAT-01',    wh:'Satellite', zone:'Overflow', desc:'Overflow finished goods'}
  ];

  const vendors = [
    {id:'V100', name:'Blue Ridge Narrow Fabrics', contact:'Greg Hall', phone:'(555) 201-4410', email:'orders@blueridgenf.example', terms:'Net 30', lead:14, rating:4.6},
    {id:'V110', name:'Tri-County Forge & Hardware', contact:'Priya Nair', phone:'(555) 201-8821', email:'sales@tricountyforge.example', terms:'Net 30', lead:21, rating:4.4},
    {id:'V120', name:'Gulf Thread & Supply', contact:'Ben Ortiz', phone:'(555) 330-1177', email:'ben@gulfthread.example', terms:'Net 30', lead:5, rating:4.8},
    {id:'V130', name:'Cumberland Cable & Rope', contact:'Amy Chen', phone:'(555) 440-9021', email:'amy@cumberlandrope.example', terms:'Net 45', lead:10, rating:4.1},
    {id:'V140', name:'Precision Label Co.', contact:'Luis Mendez', phone:'(555) 118-3300', email:'orders@precisionlabel.example', terms:'Net 15', lead:7, rating:4.5},
    {id:'V150', name:'Delta Packaging', contact:'Sara Bloom', phone:'(555) 772-6604', email:'sara@deltapack.example', terms:'Net 30', lead:5, rating:4.7}
  ];

  const customers = [
    {id:'C200', name:'Summit Safety Supply', city:'Birmingham, AL', terms:'Net 30', contact:'Rob Kline'},
    {id:'C210', name:'TowerLine Distributors', city:'Tulsa, OK', terms:'Net 45', contact:'Jen Olsen'},
    {id:'C220', name:'Gulf Coast Industrial Safety', city:'Mobile, AL', terms:'Net 30', contact:'Chris Duhon'},
    {id:'C230', name:'Midwest Height Safety', city:'Des Moines, IA', terms:'Net 30', contact:'Alan Park'},
    {id:'C240', name:'Keystone Safety Co.', city:'Harrisburg, PA', terms:'Net 30', contact:'Nina Patel'},
    {id:'C250', name:'Pacific Climb Gear', city:'Boise, ID', terms:'Net 30', contact:'Mark Yoder'}
  ];

  // type: Raw, Component (made in-house), Purchased (bought part), Finished, Consumable
  const items = [
    ['RM-WEB-175-BLK','Polyester webbing 1-3/4", black','Raw','Webbing','yd',0.92,0,600,2000,'V100',true,'A','MAIN-A-01'],
    ['RM-WEB-175-YEL','Polyester webbing 1-3/4", hi-vis yellow','Raw','Webbing','yd',1.05,0,400,1500,'V100',true,'A','MAIN-A-01'],
    ['RM-WEB-100-ORG','Polyester webbing 1", orange (lanyard)','Raw','Webbing','yd',0.58,0,500,1500,'V100',true,'A','MAIN-A-01'],
    ['RM-WEB-TEAR','Energy-absorber tear webbing','Raw','Webbing','yd',2.40,0,150,500,'V100',true,'A','MAIN-A-02'],
    ['RM-THREAD-B92','Bonded polyester thread, tex 90','Raw','Thread','spool',14.50,0,20,60,'V120',true,'B','MAIN-B-02'],
    ['RM-ROPE-58','Polyester kernmantle rope, 5/8"','Raw','Rope & cable','ft',0.64,0,600,2000,'V130',true,'B','MAIN-A-02'],
    ['RM-CABLE-316','Galvanized cable, 3/16"','Raw','Rope & cable','ft',0.38,0,500,1500,'V130',true,'C','MAIN-A-02'],
    ['RM-FOAM-PAD','Back pad foam, die-cut blank','Raw','Padding','ea',1.85,0,120,400,'V150',false,'C','MAIN-A-02'],
    ['HW-DRING-FRG','Forged steel dorsal D-ring','Purchased','Hardware','ea',2.35,0,400,1200,'V110',true,'A','MAIN-B-01'],
    ['HW-DRING-SIDE','Side D-ring, forged steel','Purchased','Hardware','ea',1.90,0,300,1000,'V110',true,'A','MAIN-B-01'],
    ['HW-BUCKLE-QC','Quick-connect buckle set','Purchased','Hardware','ea',3.10,0,300,1000,'V110',true,'A','MAIN-B-01'],
    ['HW-BUCKLE-TB','Tongue buckle with grommet strap','Purchased','Hardware','ea',1.45,0,200,800,'V110',false,'B','MAIN-B-01'],
    ['HW-ADJ-FRICT','Friction adjuster, chest strap','Purchased','Hardware','ea',0.62,0,400,1500,'V110',false,'C','MAIN-B-01'],
    ['HW-SNAP-34','Snap hook 3/4", double-locking','Purchased','Hardware','ea',2.20,0,400,1200,'V110',true,'A','MAIN-B-01'],
    ['HW-REBAR-214','Rebar hook 2-1/4", aluminum','Purchased','Hardware','ea',6.80,0,150,500,'V110',true,'A','MAIN-B-01'],
    ['HW-CARAB-STL','Steel carabiner, triple-lock','Purchased','Hardware','ea',3.95,0,150,500,'V110',true,'B','MAIN-B-01'],
    ['HW-RG-BODY','Rope grab body, stainless','Purchased','Hardware','ea',18.50,0,40,120,'V110',true,'A','MAIN-B-01'],
    ['HW-THIMBLE','Cable thimble & sleeve set','Purchased','Hardware','ea',0.48,0,200,800,'V130',false,'C','MAIN-B-01'],
    ['PL-LABEL-HAR','Harness ID & warning label set','Purchased','Labels','ea',0.34,0,800,3000,'V140',false,'B','MAIN-B-02'],
    ['PL-LABEL-LAN','Lanyard ID & warning label set','Purchased','Labels','ea',0.22,0,800,3000,'V140',false,'C','MAIN-B-02'],
    ['PL-SLEEVE','Absorber pack cover sleeve','Purchased','Labels','ea',0.41,0,400,1500,'V140',false,'C','MAIN-B-02'],
    ['PK-BAG-HAR','Harness poly bag, printed','Consumable','Packaging','ea',0.28,0,500,2000,'V150',false,'C','MAIN-D-01'],
    ['PK-BOX-CASE','Shipping carton, 6-pack','Consumable','Packaging','ea',1.15,0,150,500,'V150',false,'C','MAIN-D-01'],
    ['PK-MANUAL','User instruction manual','Consumable','Packaging','ea',0.19,0,800,3000,'V140',false,'C','MAIN-D-01'],
    ['MC-DORSAL-ASM','Dorsal D-ring & pad assembly, sewn','Component','Sewn sub-assembly','ea',0,0,80,200,'',true,'A','MAIN-C-01'],
    ['MC-LEG-STRAP','Leg strap assembly, sewn','Component','Sewn sub-assembly','ea',0,0,150,400,'',true,'A','MAIN-C-01'],
    ['MC-ABSORBER','Energy absorber pack, sewn','Component','Sewn sub-assembly','ea',0,0,100,300,'',true,'A','MAIN-C-01'],
    ['MC-LANYARD-LEG','Lanyard leg, 6 ft, sewn','Component','Sewn sub-assembly','ea',0,0,150,400,'',true,'A','MAIN-C-01'],
    ['FG-HAR-CONST','Construction harness, 1 D-ring, universal','Finished','Harnesses','ea',0,79.00,60,150,'',true,'A','MAIN-D-01'],
    ['FG-HAR-TOWER','Tower climbing harness, 4 D-ring, padded','Finished','Harnesses','ea',0,289.00,20,50,'',true,'A','MAIN-D-01'],
    ['FG-HAR-HIVIS','Hi-vis harness, 1 D-ring','Finished','Harnesses','ea',0,92.00,40,100,'',true,'A','MAIN-D-01'],
    ['FG-LAN-6SA','6 ft shock-absorbing lanyard, single leg','Finished','Lanyards','ea',0,44.00,80,200,'',true,'A','MAIN-D-01'],
    ['FG-LAN-6TW','6 ft twin-leg lanyard, rebar hooks','Finished','Lanyards','ea',0,118.00,30,80,'',true,'A','MAIN-D-01'],
    ['FG-RG-50','Rope grab with 50 ft lifeline','Finished','Lifelines & grabs','ea',0,165.00,15,40,'',true,'A','MAIN-D-01'],
    ['FG-ANC-CROSS','Cross-arm strap anchor, 6 ft','Finished','Anchorages','ea',0,38.00,40,100,'',true,'B','MAIN-D-01'],
    ['FG-KIT-ROOF','Roofer\'s kit: harness, lanyard, anchor, bag','Finished','Kits','ea',0,169.00,20,50,'',false,'B','MAIN-D-01']
  ].map((r,i)=>({id:'I'+(1000+i), sku:r[0], name:r[1], type:r[2], category:r[3], uom:r[4], cost:r[5], price:r[6], reorderPoint:r[7], reorderQty:r[8], vendorId:r[9], lotTracked:r[10], abc:r[11], defaultLoc:r[12], active:true, notes:''}));

  const bySku = s => items.find(i=>i.sku===s);

  const boms = [
    {sku:'MC-DORSAL-ASM', lines:[['HW-DRING-FRG',1],['RM-WEB-175-BLK',0.5],['RM-FOAM-PAD',1],['RM-THREAD-B92',0.01]], labor:0.12},
    {sku:'MC-LEG-STRAP', lines:[['RM-WEB-175-BLK',1.2],['HW-BUCKLE-QC',0.5],['RM-THREAD-B92',0.006]], labor:0.08},
    {sku:'MC-ABSORBER', lines:[['RM-WEB-TEAR',0.8],['PL-SLEEVE',1],['RM-THREAD-B92',0.012]], labor:0.15},
    {sku:'MC-LANYARD-LEG', lines:[['RM-WEB-100-ORG',2.4],['RM-THREAD-B92',0.005]], labor:0.06},
    {sku:'FG-HAR-CONST', lines:[['MC-DORSAL-ASM',1],['MC-LEG-STRAP',2],['RM-WEB-175-BLK',3.2],['HW-ADJ-FRICT',1],['HW-BUCKLE-QC',1],['PL-LABEL-HAR',1],['PK-BAG-HAR',1],['PK-MANUAL',1],['RM-THREAD-B92',0.02]], labor:0.45},
    {sku:'FG-HAR-TOWER', lines:[['MC-DORSAL-ASM',1],['MC-LEG-STRAP',2],['RM-WEB-175-BLK',4.5],['HW-DRING-SIDE',3],['HW-BUCKLE-QC',2],['RM-FOAM-PAD',2],['PL-LABEL-HAR',1],['PK-BAG-HAR',1],['PK-MANUAL',1],['RM-THREAD-B92',0.035]], labor:1.1},
    {sku:'FG-HAR-HIVIS', lines:[['MC-DORSAL-ASM',1],['MC-LEG-STRAP',2],['RM-WEB-175-YEL',3.2],['HW-ADJ-FRICT',1],['HW-BUCKLE-QC',1],['PL-LABEL-HAR',1],['PK-BAG-HAR',1],['PK-MANUAL',1],['RM-THREAD-B92',0.02]], labor:0.5},
    {sku:'FG-LAN-6SA', lines:[['MC-LANYARD-LEG',1],['MC-ABSORBER',1],['HW-SNAP-34',2],['PL-LABEL-LAN',1],['PK-MANUAL',1]], labor:0.2},
    {sku:'FG-LAN-6TW', lines:[['MC-LANYARD-LEG',2],['MC-ABSORBER',1],['HW-SNAP-34',1],['HW-REBAR-214',2],['PL-LABEL-LAN',1],['PK-MANUAL',1]], labor:0.35},
    {sku:'FG-RG-50', lines:[['HW-RG-BODY',1],['RM-ROPE-58',50],['HW-SNAP-34',1],['HW-CARAB-STL',1],['PL-LABEL-LAN',1],['PK-MANUAL',1]], labor:0.4},
    {sku:'FG-ANC-CROSS', lines:[['RM-WEB-175-BLK',2.2],['HW-DRING-SIDE',2],['PL-LABEL-LAN',1],['RM-THREAD-B92',0.01]], labor:0.15},
    {sku:'FG-KIT-ROOF', lines:[['FG-HAR-CONST',1],['FG-LAN-6SA',1],['FG-ANC-CROSS',1],['PK-BOX-CASE',0.17]], labor:0.1}
  ].map(b=>({itemId:bySku(b.sku).id, rev:'A', labor:b.labor, lines:b.lines.map(l=>({itemId:bySku(l[0]).id, qty:l[1]}))}));

  // roll up standard cost for made items
  const bomOf = id => boms.find(b=>b.itemId===id);
  const LABOR_RATE = 34;
  function roll(id){ const it=items.find(i=>i.id===id); const b=bomOf(id); if(!b) return it.cost;
    let c=b.labor*LABOR_RATE; b.lines.forEach(l=>c+=roll(l.itemId)*l.qty); it.cost=Math.round(c*100)/100; return it.cost; }
  items.forEach(i=>{ if(bomOf(i.id)) roll(i.id); });

  // current stock
  const stock = [];
  const lotNo = (it,n) => (it.type==='Finished'||it.type==='Component' ? 'B' : 'L') + '26' + String(ri(100,999)) + (n||'');
  items.forEach(it=>{
    let base = it.reorderPoint * ((it.type==='Finished'||it.type==='Component') ? (1.3 + R()*1.6) : (0.5 + R()*2.1));
    if (['HW-REBAR-214','RM-WEB-175-YEL','HW-RG-BODY','FG-HAR-TOWER','FG-LAN-6TW','MC-ABSORBER'].includes(it.sku)) base = it.reorderPoint * (0.25 + R()*0.35); // intentionally low
    let q = it.uom==='ea' ? Math.round(base) : Math.round(base*10)/10;
    if (it.lotTracked && q>4) {
      const a = it.uom==='ea' ? Math.round(q*0.65) : Math.round(q*6.5)/10;
      stock.push({itemId:it.id, loc:it.defaultLoc, lot:lotNo(it,'A'), qty:a, received:d(-ri(20,60))});
      stock.push({itemId:it.id, loc:it.defaultLoc, lot:lotNo(it,'B'), qty:Math.round((q-a)*10)/10, received:d(-ri(2,19))});
    } else stock.push({itemId:it.id, loc:it.defaultLoc, lot:'', qty:q, received:d(-ri(5,40))});
    if (it.type==='Finished' && R()>0.4) stock.push({itemId:it.id, loc:'SAT-01', lot:it.lotTracked?lotNo(it,'C'):'', qty:ri(2,8), received:d(-ri(10,40))});
  });
  // an item sitting in QC hold
  stock.push({itemId:bySku('HW-DRING-FRG').id, loc:'MAIN-QC', lot:'L26877Q', qty:250, received:d(-1)});

  // purchase orders
  let poN = 4410; const pos = [];
  function mkPO(vendorId, daysAgo, status, lines){
    const v = vendors.find(x=>x.id===vendorId);
    pos.push({id:'PO'+poN, num:'PO-'+(poN++), vendorId, status, ordered:d(-daysAgo), due:d(-daysAgo+v.lead), buyer:'Dan Whitfield', notes:'',
      lines:lines.map(l=>{const it=bySku(l[0]); return {itemId:it.id, qty:l[1], received:l[2]||0, cost:it.cost};})});
  }
  mkPO('V100',3,'Open',[['RM-WEB-175-BLK',2000],['RM-WEB-100-ORG',1500]]);
  mkPO('V110',30,'Partial',[['HW-REBAR-214',500,150],['HW-SNAP-34',1200,1200]]);
  mkPO('V110',8,'Open',[['HW-RG-BODY',120],['HW-CARAB-STL',500]]);
  mkPO('V120',9,'Open',[['RM-THREAD-B92',60]]);
  mkPO('V150',14,'Received',[['PK-BAG-HAR',2000,2000],['PK-BOX-CASE',500,500]]);
  mkPO('V140',12,'Open',[['PL-LABEL-HAR',3000],['PL-LABEL-LAN',3000]]);
  mkPO('V130',30,'Closed',[['RM-ROPE-58',2000,2000],['RM-CABLE-316',1500,1500]]);
  mkPO('V100',1,'Draft',[['RM-WEB-175-YEL',1500],['RM-WEB-TEAR',500]]);

  // sales orders
  let soN = 7120; const sos = [];
  function mkSO(custId, daysAgo, dueIn, status, lines){
    sos.push({id:'SO'+soN, num:'SO-'+(soN++), customerId:custId, status, ordered:d(-daysAgo), due:d(dueIn), custPO:'CPO-'+ri(10000,99999), rep:'Demo User', notes:'',
      lines:lines.map(l=>{const it=bySku(l[0]); return {itemId:it.id, qty:l[1], shipped:l[2]||0, price:it.price};})});
  }
  mkSO('C200',6,4,'Open',[['FG-HAR-CONST',48],['FG-LAN-6SA',48]]);
  mkSO('C210',12,-1,'Partial',[['FG-HAR-TOWER',24,12],['FG-RG-50',10,10]]);
  mkSO('C220',3,10,'Open',[['FG-HAR-HIVIS',36],['FG-ANC-CROSS',36]]);
  mkSO('C230',20,-8,'Shipped',[['FG-KIT-ROOF',12,12]]);
  mkSO('C240',2,14,'Open',[['FG-LAN-6TW',30],['FG-HAR-CONST',24]]);
  mkSO('C250',1,21,'Open',[['FG-HAR-TOWER',12],['FG-LAN-6TW',12],['FG-RG-50',6]]);
  mkSO('C200',25,-12,'Shipped',[['FG-HAR-CONST',60,60]]);
  mkSO('C230',8,2,'Open',[['FG-KIT-ROOF',20]]);

  // work orders
  let woN = 3050; const wos = [];
  function mkWO(sku, qty, status, createdAgo, dueIn, done, soRef){
    wos.push({id:'WO'+woN, num:'WO-'+(woN++), itemId:bySku(sku).id, qty, done:done||0, status, created:d(-createdAgo), due:d(dueIn), soRef:soRef||'', issued:status==='In progress', laborHrs: status==='In progress'? Math.round(qty*bomOf(bySku(sku).id).labor*0.4*10)/10 : 0, notes:''});
  }
  mkWO('FG-HAR-CONST',60,'Released',2,5,0,'SO-7120');
  mkWO('FG-HAR-HIVIS',36,'Planned',1,8,0,'SO-7122');
  mkWO('MC-LEG-STRAP',200,'In progress',4,2,80);
  mkWO('FG-HAR-TOWER',24,'In progress',5,1,10,'SO-7121');
  mkWO('FG-LAN-6TW',40,'Released',1,6,0,'SO-7124');
  mkWO('MC-LANYARD-LEG',300,'Complete',10,-3,300);
  mkWO('FG-KIT-ROOF',20,'Planned',0,6,0,'SO-7127');
  mkWO('MC-ABSORBER',150,'Planned',0,4,0);

  // 120 days of history; running balances are derived backwards from current on-hand in the app
  const txns = []; let tN = 90000;
  const onHandNow = id => stock.filter(s=>s.itemId===id).reduce((a,s)=>a+s.qty,0);
  const who = ['Maria Lopez','Tom Reyes','Keisha Grant','Dan Whitfield'];
  items.forEach(it=>{
    const weekly = it.reorderQty/ (it.abc==='A'?4:it.abc==='B'?6:9);
    const idle = ['RM-CABLE-316','HW-THIMBLE','HW-BUCKLE-TB','RM-FOAM-PAD'].includes(it.sku) ? -ri(35,70) : 1;
    for (let day=-120; day<=0; day++){
      if (day>idle) break;
      const dt = new Date(today.getTime()+day*DAY); if (dt.getDay()===0||dt.getDay()===6) continue;
      if (R() < 0.33) {
        const q = it.uom==='ea' ? Math.max(1,Math.round(weekly/3*(0.4+R()*1.2))) : Math.round(weekly/3*(0.4+R()*1.2)*10)/10;
        const type = it.type==='Finished' ? 'SHIP' : (it.type==='Component' || it.type==='Raw' || it.type==='Purchased' || it.type==='Consumable') ? 'ISSUE' : 'ISSUE';
        txns.push({id:'T'+(tN++), ts:new Date(dt.getTime()+ri(1,8)*3600000+ri(0,59)*60000).toISOString(), type, itemId:it.id, qty:-q, loc:it.defaultLoc, lot:'', ref: type==='SHIP'?'SO-'+ri(6800,7119):'WO-'+ri(2900,3049), user:pick(who), note:''});
      }
      if (R() < 0.045) {
        const q = it.uom==='ea' ? Math.round(it.reorderQty*(0.6+R()*0.6)) : Math.round(it.reorderQty*(0.6+R()*0.6)*10)/10;
        const type = (it.type==='Finished'||it.type==='Component') ? 'BUILD' : 'RECEIVE';
        txns.push({id:'T'+(tN++), ts:new Date(dt.getTime()+ri(1,8)*3600000).toISOString(), type, itemId:it.id, qty:q, loc:it.defaultLoc, lot:it.lotTracked?lotNo(it):'', ref: type==='BUILD'?'WO-'+ri(2900,3049):'PO-'+ri(4200,4409), user:pick(who), note:''});
      }
      if (R() < 0.006) {
        const q = it.uom==='ea' ? (R()>0.5?1:-1)*ri(1,6) : Math.round((R()-0.5)*40)/10;
        txns.push({id:'T'+(tN++), ts:new Date(dt.getTime()+ri(1,8)*3600000).toISOString(), type:'COUNT', itemId:it.id, qty:q, loc:it.defaultLoc, lot:'', ref:'CC-'+ri(100,199), user:'Maria Lopez', note:'Cycle count variance'});
      }
    }
  });
  txns.sort((a,b)=>a.ts<b.ts?-1:1);
  // last-counted dates
  items.forEach(it=>{ const c=txns.filter(t=>t.itemId===it.id&&t.type==='COUNT').pop(); it.lastCount = c? c.ts : d(-ri(40,150)); });

  const SEED_FP = function(){ return JSON.parse(JSON.stringify({version:3, company:(window.ORBIT_CLIENT&&window.ORBIT_CLIENT.company)||'Fall-protection demo', dataset:'fallpro', users, locations, vendors, customers, items, boms, stock, pos, sos, wos, txns, nextNums:{po:poN, so:soN, wo:woN, txn:tN, cc:200}, laborRate:LABOR_RATE, savedQueries:[], suggestions:[], counts:[]})); };
  if (window.ORBIT_CLIENT && window.ORBIT_CLIENT.data==='fallpro') window.ORBIT_SEED = SEED_FP;
  window.ORBIT_SEED_FALLPRO = SEED_FP;
})();
