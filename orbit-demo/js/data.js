/* ORBIT demo data — generated deterministically so every visitor sees the same starting point. */
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
    {id:'u4', name:'Keisha Grant', role:'Production Supervisor'},
    {id:'u5', name:'Tom Reyes', role:'Shipping'}
  ];

  const locations = [
    {code:'MAIN-A-01', wh:'Main', zone:'Raw stock', desc:'Bar & sheet rack'},
    {code:'MAIN-A-02', wh:'Main', zone:'Raw stock', desc:'Tube rack'},
    {code:'MAIN-B-01', wh:'Main', zone:'Hardware', desc:'Fastener bins'},
    {code:'MAIN-B-02', wh:'Main', zone:'Electronics', desc:'ESD cabinet'},
    {code:'MAIN-C-01', wh:'Main', zone:'WIP', desc:'Machined parts shelf'},
    {code:'MAIN-D-01', wh:'Main', zone:'Finished goods', desc:'FG pallet rack'},
    {code:'MAIN-QC',   wh:'Main', zone:'Quality', desc:'Receiving inspection hold'},
    {code:'SAT-01',    wh:'Satellite', zone:'Overflow', desc:'Leased unit, overflow FG'}
  ];

  const vendors = [
    {id:'V100', name:'Midwest Metals Supply', contact:'Greg Hall', phone:'(555) 201-4410', email:'orders@midwestmetals.example', terms:'Net 30', lead:7, rating:4.6},
    {id:'V110', name:'Allied Fastener Co.', contact:'Priya Nair', phone:'(555) 201-8821', email:'sales@alliedfastener.example', terms:'Net 30', lead:4, rating:4.8},
    {id:'V120', name:'Circuitline Electronics', contact:'Ben Ortiz', phone:'(555) 330-1177', email:'ben@circuitline.example', terms:'Net 45', lead:14, rating:4.1},
    {id:'V130', name:'Gulf Coast Plastics', contact:'Amy Chen', phone:'(555) 440-9021', email:'amy@gcplastics.example', terms:'Net 30', lead:10, rating:3.9},
    {id:'V140', name:'Precision Seal & Gasket', contact:'Luis Mendez', phone:'(555) 118-3300', email:'orders@psg.example', terms:'Net 15', lead:6, rating:4.4},
    {id:'V150', name:'Delta Packaging', contact:'Sara Bloom', phone:'(555) 772-6604', email:'sara@deltapack.example', terms:'Net 30', lead:5, rating:4.7}
  ];

  const customers = [
    {id:'C200', name:'Apex Hydraulics', city:'Tulsa, OK', terms:'Net 30', contact:'Rob Kline'},
    {id:'C210', name:'Northstar Ag Equipment', city:'Fargo, ND', terms:'Net 45', contact:'Jen Olsen'},
    {id:'C220', name:'Bayou Marine Systems', city:'Mobile, AL', terms:'Net 30', contact:'Chris Duhon'},
    {id:'C230', name:'Summit Aerospace Services', city:'Wichita, KS', terms:'Net 60', contact:'Alan Park'},
    {id:'C240', name:'Riverbend Controls', city:'Huntsville, AL', terms:'Net 30', contact:'Nina Patel'},
    {id:'C250', name:'Keystone Fluid Power', city:'Pittsburgh, PA', terms:'Net 30', contact:'Mark Yoder'}
  ];

  // type: Raw, Component (made in-house), Purchased (bought part), Finished, Consumable
  const items = [
    ['RM-AL6061-100','6061-T6 aluminum round bar, 1.00" dia','Raw','Metals','ft',4.85,0,120,300,'V100',true,'A','MAIN-A-01'],
    ['RM-AL6061-200','6061-T6 aluminum round bar, 2.00" dia','Raw','Metals','ft',15.40,0,80,200,'V100',true,'A','MAIN-A-01'],
    ['RM-SS304-SHT','304 stainless sheet, 16 ga, 48x96','Raw','Metals','sheet',142.00,0,6,12,'V100',true,'A','MAIN-A-01'],
    ['RM-ST-TUBE-15','A513 steel tube, 1.5" OD x .120 wall','Raw','Metals','ft',3.10,0,100,240,'V100',false,'B','MAIN-A-02'],
    ['RM-BR360-075','360 brass hex bar, .75"','Raw','Metals','ft',9.75,0,40,120,'V100',true,'B','MAIN-A-01'],
    ['RM-DELRIN-10','Acetal (Delrin) rod, 1.0" dia','Raw','Plastics','ft',6.20,0,30,90,'V130',false,'C','MAIN-A-02'],
    ['HW-SHCS-1032','Socket head cap screw, #10-32 x 1/2", SS','Purchased','Hardware','ea',0.14,0,1500,5000,'V110',false,'C','MAIN-B-01'],
    ['HW-SHCS-M6-20','Socket head cap screw, M6 x 20, SS','Purchased','Hardware','ea',0.22,0,1000,4000,'V110',false,'C','MAIN-B-01'],
    ['HW-NUT-M6','Hex nylock nut, M6, SS','Purchased','Hardware','ea',0.09,0,1000,4000,'V110',false,'C','MAIN-B-01'],
    ['HW-WASH-M6','Flat washer, M6, SS','Purchased','Hardware','ea',0.04,0,1000,5000,'V110',false,'C','MAIN-B-01'],
    ['HW-DOWEL-4','Dowel pin, 4mm x 16mm','Purchased','Hardware','ea',0.31,0,400,1000,'V110',false,'C','MAIN-B-01'],
    ['HW-BRG-6202','Ball bearing 6202-2RS','Purchased','Hardware','ea',3.45,0,60,200,'V110',true,'B','MAIN-B-01'],
    ['SL-ORING-214','O-ring AS568-214, Viton','Purchased','Seals','ea',0.62,0,300,1000,'V140',true,'B','MAIN-B-01'],
    ['SL-ORING-120','O-ring AS568-120, Buna-N','Purchased','Seals','ea',0.18,0,400,1500,'V140',false,'C','MAIN-B-01'],
    ['SL-GSK-VB300','Gasket, valve body cover','Purchased','Seals','ea',1.90,0,80,250,'V140',false,'B','MAIN-B-01'],
    ['EL-PCB-CT200','PCB, controller main board rev D','Purchased','Electronics','ea',38.50,0,25,60,'V120',true,'A','MAIN-B-02'],
    ['EL-PCB-SM10','PCB, sensor module rev B','Purchased','Electronics','ea',12.20,0,40,120,'V120',true,'A','MAIN-B-02'],
    ['EL-MCU-32','Microcontroller, 32-bit ARM, QFP-64','Purchased','Electronics','ea',6.80,0,50,150,'V120',true,'A','MAIN-B-02'],
    ['EL-CONN-M12','M12 connector, 4-pin, panel mount','Purchased','Electronics','ea',7.95,0,60,150,'V120',false,'B','MAIN-B-02'],
    ['EL-WIRE-22','Hook-up wire, 22 AWG, stranded','Purchased','Electronics','ft',0.11,0,500,2000,'V120',false,'C','MAIN-B-02'],
    ['EL-XDCR-P100','Pressure transducer, 0-100 psi','Purchased','Electronics','ea',44.00,0,20,50,'V120',true,'A','MAIN-B-02'],
    ['EL-DISP-OLED','OLED display, 1.3", I2C','Purchased','Electronics','ea',9.40,0,20,60,'V120',false,'B','MAIN-B-02'],
    ['PL-ENC-CT200','Enclosure, ABS, controller','Purchased','Plastics','ea',11.25,0,25,60,'V130',false,'B','MAIN-B-02'],
    ['PK-BOX-SM','Shipping box, small, 8x6x4','Consumable','Packaging','ea',0.85,0,150,500,'V150',false,'C','MAIN-D-01'],
    ['PK-BOX-LG','Shipping box, large, 16x12x10','Consumable','Packaging','ea',1.95,0,80,250,'V150',false,'C','MAIN-D-01'],
    ['PK-FOAM-IN','Foam insert, pump assembly','Consumable','Packaging','ea',2.40,0,40,120,'V150',false,'C','MAIN-D-01'],
    ['CS-PAINT-BLK','Powder coat, gloss black','Consumable','Finishing','lb',8.60,0,25,75,'V100',false,'C','MAIN-A-02'],
    ['MC-SHAFT-P100','Pump shaft, machined, 416 SS','Component','Machined','ea',0,0,30,60,'',true,'A','MAIN-C-01'],
    ['MC-HSG-P100','Pump housing, machined, 6061','Component','Machined','ea',0,0,20,40,'',true,'A','MAIN-C-01'],
    ['MC-IMP-P100','Impeller, machined brass','Component','Machined','ea',0,0,20,40,'',true,'A','MAIN-C-01'],
    ['MC-BRKT-MK50','Mounting bracket, formed steel','Component','Fabricated','ea',0,0,40,100,'',false,'B','MAIN-C-01'],
    ['MC-BODY-VB300','Valve body, machined 6061','Component','Machined','ea',0,0,15,40,'',true,'A','MAIN-C-01'],
    ['MC-SPOOL-VB300','Valve spool, machined 304 SS','Component','Machined','ea',0,0,15,40,'',true,'A','MAIN-C-01'],
    ['FG-PA100','PA-100 Centrifugal Pump Assembly','Finished','Pumps','ea',0,389.00,8,20,'',true,'A','MAIN-D-01'],
    ['FG-CT200','CT-200 Pump Controller','Finished','Controls','ea',0,249.00,10,25,'',true,'A','MAIN-D-01'],
    ['FG-SM10','SM-10 Pressure Sensor Module','Finished','Controls','ea',0,129.00,15,40,'',true,'A','MAIN-D-01'],
    ['FG-VB300','VB-300 Directional Valve Body','Finished','Valves','ea',0,315.00,6,15,'',true,'A','MAIN-D-01'],
    ['FG-MK50','MK-50 Pump Mount Kit','Finished','Accessories','ea',0,64.00,20,50,'',false,'B','MAIN-D-01']
  ].map((r,i)=>({id:'I'+(1000+i), sku:r[0], name:r[1], type:r[2], category:r[3], uom:r[4], cost:r[5], price:r[6], reorderPoint:r[7], reorderQty:r[8], vendorId:r[9], lotTracked:r[10], abc:r[11], defaultLoc:r[12], active:true, notes:''}));

  const bySku = s => items.find(i=>i.sku===s);

  const boms = [
    {sku:'MC-SHAFT-P100', lines:[['RM-BR360-075',0.6]], labor:0.4},
    {sku:'MC-HSG-P100', lines:[['RM-AL6061-200',0.75]], labor:1.1},
    {sku:'MC-IMP-P100', lines:[['RM-BR360-075',0.35]], labor:0.8},
    {sku:'MC-BRKT-MK50', lines:[['RM-ST-TUBE-15',1.5],['CS-PAINT-BLK',0.1]], labor:0.3},
    {sku:'MC-BODY-VB300', lines:[['RM-AL6061-200',0.9]], labor:1.6},
    {sku:'MC-SPOOL-VB300', lines:[['RM-AL6061-100',0.5]], labor:0.9},
    {sku:'FG-PA100', lines:[['MC-HSG-P100',1],['MC-SHAFT-P100',1],['MC-IMP-P100',1],['HW-BRG-6202',2],['SL-ORING-214',2],['HW-SHCS-M6-20',6],['HW-WASH-M6',6],['PK-FOAM-IN',1],['PK-BOX-LG',1]], labor:1.5},
    {sku:'FG-CT200', lines:[['EL-PCB-CT200',1],['EL-MCU-32',1],['EL-DISP-OLED',1],['EL-CONN-M12',2],['EL-WIRE-22',4],['PL-ENC-CT200',1],['HW-SHCS-1032',4],['PK-BOX-SM',1]], labor:0.9},
    {sku:'FG-SM10', lines:[['EL-PCB-SM10',1],['EL-XDCR-P100',1],['EL-CONN-M12',1],['EL-WIRE-22',2],['PK-BOX-SM',1]], labor:0.5},
    {sku:'FG-VB300', lines:[['MC-BODY-VB300',1],['MC-SPOOL-VB300',1],['SL-GSK-VB300',1],['SL-ORING-120',4],['HW-SHCS-1032',8],['HW-DOWEL-4',2],['PK-BOX-SM',1]], labor:1.2},
    {sku:'FG-MK50', lines:[['MC-BRKT-MK50',2],['HW-SHCS-M6-20',4],['HW-NUT-M6',4],['HW-WASH-M6',8],['PK-BOX-SM',1]], labor:0.25}
  ].map(b=>({itemId:bySku(b.sku).id, rev:'A', labor:b.labor, lines:b.lines.map(l=>({itemId:bySku(l[0]).id, qty:l[1]}))}));

  // roll up standard cost for made items
  const bomOf = id => boms.find(b=>b.itemId===id);
  const LABOR_RATE = 48;
  function roll(id){ const it=items.find(i=>i.id===id); const b=bomOf(id); if(!b) return it.cost;
    let c=b.labor*LABOR_RATE; b.lines.forEach(l=>c+=roll(l.itemId)*l.qty); it.cost=Math.round(c*100)/100; return it.cost; }
  items.forEach(i=>{ if(bomOf(i.id)) roll(i.id); });

  // current stock
  const stock = [];
  const lotNo = (it,n) => (it.type==='Finished'||it.type==='Component' ? 'B' : 'L') + '26' + String(ri(100,999)) + (n||'');
  items.forEach(it=>{
    let base = it.reorderPoint * (0.4 + R()*2.2);
    if (['EL-XDCR-P100','HW-BRG-6202','RM-AL6061-200','FG-VB300','PK-FOAM-IN','EL-PCB-CT200'].includes(it.sku)) base = it.reorderPoint * (0.25 + R()*0.35); // intentionally low
    let q = it.uom==='ea' ? Math.round(base) : Math.round(base*10)/10;
    if (it.lotTracked && q>4) {
      const a = it.uom==='ea' ? Math.round(q*0.65) : Math.round(q*6.5)/10;
      stock.push({itemId:it.id, loc:it.defaultLoc, lot:lotNo(it,'A'), qty:a, received:d(-ri(20,60))});
      stock.push({itemId:it.id, loc:it.defaultLoc, lot:lotNo(it,'B'), qty:Math.round((q-a)*10)/10, received:d(-ri(2,19))});
    } else stock.push({itemId:it.id, loc:it.defaultLoc, lot:'', qty:q, received:d(-ri(5,40))});
    if (it.type==='Finished' && R()>0.4) stock.push({itemId:it.id, loc:'SAT-01', lot:it.lotTracked?lotNo(it,'C'):'', qty:ri(2,8), received:d(-ri(10,40))});
  });
  // an item sitting in QC hold
  stock.push({itemId:bySku('EL-PCB-SM10').id, loc:'MAIN-QC', lot:'L26877Q', qty:30, received:d(-1)});

  // purchase orders
  let poN = 4410; const pos = [];
  function mkPO(vendorId, daysAgo, status, lines){
    const v = vendors.find(x=>x.id===vendorId);
    pos.push({id:'PO'+poN, num:'PO-'+(poN++), vendorId, status, ordered:d(-daysAgo), due:d(-daysAgo+v.lead), buyer:'Dan Whitfield', notes:'',
      lines:lines.map(l=>{const it=bySku(l[0]); return {itemId:it.id, qty:l[1], received:l[2]||0, cost:it.cost};})});
  }
  mkPO('V100',3,'Open',[['RM-AL6061-200',200],['RM-AL6061-100',150]]);
  mkPO('V120',20,'Partial',[['EL-XDCR-P100',50,20],['EL-MCU-32',150,150]]);
  mkPO('V110',2,'Open',[['HW-BRG-6202',200],['HW-SHCS-M6-20',4000]]);
  mkPO('V140',9,'Open',[['SL-ORING-214',1000],['SL-GSK-VB300',250]]);
  mkPO('V150',14,'Received',[['PK-BOX-SM',500,500],['PK-BOX-LG',250,250]]);
  mkPO('V130',16,'Open',[['PL-ENC-CT200',60]]);
  mkPO('V100',30,'Closed',[['RM-ST-TUBE-15',240,240],['CS-PAINT-BLK',75,75]]);
  mkPO('V120',1,'Draft',[['EL-PCB-CT200',60],['EL-DISP-OLED',60]]);

  // sales orders
  let soN = 7120; const sos = [];
  function mkSO(custId, daysAgo, dueIn, status, lines){
    sos.push({id:'SO'+soN, num:'SO-'+(soN++), customerId:custId, status, ordered:d(-daysAgo), due:d(dueIn), custPO:'CPO-'+ri(10000,99999), rep:'Demo User', notes:'',
      lines:lines.map(l=>{const it=bySku(l[0]); return {itemId:it.id, qty:l[1], shipped:l[2]||0, price:it.price};})});
  }
  mkSO('C200',6,4,'Open',[['FG-PA100',6],['FG-MK50',6]]);
  mkSO('C210',12,-1,'Partial',[['FG-CT200',10,4],['FG-SM10',10,10]]);
  mkSO('C220',3,10,'Open',[['FG-VB300',8]]);
  mkSO('C230',20,-8,'Shipped',[['FG-SM10',12,12]]);
  mkSO('C240',2,14,'Open',[['FG-CT200',6],['FG-SM10',12]]);
  mkSO('C250',1,21,'Open',[['FG-PA100',4],['FG-VB300',4],['FG-MK50',10]]);
  mkSO('C200',25,-12,'Shipped',[['FG-PA100',5,5]]);
  mkSO('C230',8,2,'Open',[['FG-SM10',20]]);

  // work orders
  let woN = 3050; const wos = [];
  function mkWO(sku, qty, status, createdAgo, dueIn, done, soRef){
    wos.push({id:'WO'+woN, num:'WO-'+(woN++), itemId:bySku(sku).id, qty, done:done||0, status, created:d(-createdAgo), due:d(dueIn), soRef:soRef||'', issued:status==='In progress', laborHrs: status==='In progress'? Math.round(qty*bomOf(bySku(sku).id).labor*0.4*10)/10 : 0, notes:''});
  }
  mkWO('FG-PA100',10,'Released',2,5,0,'SO-7120');
  mkWO('FG-VB300',12,'Planned',1,12,0,'SO-7122');
  mkWO('MC-HSG-P100',20,'In progress',4,2,8);
  mkWO('FG-CT200',15,'In progress',5,1,6,'SO-7121');
  mkWO('FG-SM10',30,'Released',1,6,0,'SO-7127');
  mkWO('MC-BRKT-MK50',40,'Complete',10,-3,40);
  mkWO('FG-MK50',20,'Planned',0,15,0,'SO-7125');
  mkWO('MC-BODY-VB300',12,'Planned',0,8,0);

  // 120 days of history; running balances are derived backwards from current on-hand in the app
  const txns = []; let tN = 90000;
  const onHandNow = id => stock.filter(s=>s.itemId===id).reduce((a,s)=>a+s.qty,0);
  const who = ['Maria Lopez','Tom Reyes','Keisha Grant','Dan Whitfield'];
  items.forEach(it=>{
    const weekly = it.reorderQty/ (it.abc==='A'?4:it.abc==='B'?6:9);
    const idle = ['RM-DELRIN-10','HW-DOWEL-4','EL-DISP-OLED','SL-ORING-120','RM-SS304-SHT'].includes(it.sku) ? -ri(35,70) : 1;
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

  window.ORBIT_SEED = function(){ return JSON.parse(JSON.stringify({version:3, company:'Halvorsen Machine Works', users, locations, vendors, customers, items, boms, stock, pos, sos, wos, txns, nextNums:{po:poN, so:soN, wo:woN, txn:tN, cc:200}, laborRate:LABOR_RATE, savedQueries:[], suggestions:[], counts:[]})); };
})();
