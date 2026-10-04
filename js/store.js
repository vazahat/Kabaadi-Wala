/* Kabaadi Wala — Client-side Database Layer (swap with REST API in production)
   Collections: materials, pickups, quotes, customers, b2b, testimonials, faqs, areas, settings
   All data persists in localStorage under key kw_db_v1. Admin edits write here; frontend reads here.
*/
(function(){
  const KEY='kw_db_v1';
  const CATS=['Iron','Steel','Copper','Aluminium','Brass','E-Waste','Paper','Cardboard','Plastic','Machinery','Mixed Scrap','Other'];
  const defaults={
    materials:[
      {id:'m1',cat:'Ferrous Metals',name:'Iron Scrap',desc:'Structural iron, rods, sheets, cast iron and heavy melting scrap collected with accurate weighing.',img:'https://images.pexels.com/photos/27312813/pexels-photo-27312813.jpeg?auto=compress&cs=tinysrgb&w=800',tags:['Iron','Steel','HMS'],active:true},
      {id:'m2',cat:'Non-Ferrous Metals',name:'Copper',desc:'Copper wire, coils, pipes and clean copper scrap at competitive material-grade rates.',img:'https://images.pexels.com/photos/5279317/pexels-photo-5279317.jpeg?auto=compress&cs=tinysrgb&w=800',tags:['Wire','Coils','Pipes'],active:true},
      {id:'m3',cat:'Non-Ferrous Metals',name:'Aluminium',desc:'Aluminium utensils, sheets, extrusions, cans and industrial offcuts.',img:'https://images.pexels.com/photos/27312904/pexels-photo-27312904.jpeg?auto=compress&cs=tinysrgb&w=800',tags:['Sheets','Cans','Extrusion'],active:true},
      {id:'m4',cat:'Non-Ferrous Metals',name:'Brass & Stainless Steel',desc:'Brass fittings, SS utensils, sheets and industrial alloy scrap sorted by grade.',img:'https://images.pexels.com/photos/14593018/pexels-photo-14593018.jpeg?auto=compress&cs=tinysrgb&w=800',tags:['Brass','SS 304','Zinc'],active:true},
      {id:'m5',cat:'Household Scrap',name:'Household Scrap',desc:'Old appliances, coolers, furniture metal, utensils and general home metal items.',img:'https://images.pexels.com/photos/32831269/pexels-photo-32831269.jpeg?auto=compress&cs=tinysrgb&w=800',tags:['Appliances','Utensils','Furniture'],active:true},
      {id:'m6',cat:'Electronic Scrap',name:'E-Waste',desc:'Computers, laptops, servers, cables, circuit boards and electronic components.',img:'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=800&auto=format&fit=crop',tags:['Laptops','Servers','Boards'],active:true},
      {id:'m7',cat:'Paper & Cardboard',name:'Paper & Cardboard',desc:'Newspaper, office paper, books, cardboard and packaging waste in any volume.',img:'https://images.unsplash.com/photo-1524578271613-d550eacf6090?q=80&w=800&auto=format&fit=crop',tags:['Newspaper','Books','Cartons'],active:true},
      {id:'m8',cat:'Plastic',name:'Plastic Scrap',desc:'Industrial plastic, packaging plastic, drums and sorted polymer scrap.',img:'https://images.pexels.com/photos/27312905/pexels-photo-27312905.jpeg?auto=compress&cs=tinysrgb&w=800',tags:['HDPE','PET','Packaging'],active:true},
      {id:'m9',cat:'Industrial Scrap',name:'Industrial & Machinery',desc:'Machinery scrap, factory waste, metal components and manufacturing scrap.',img:'https://images.pexels.com/photos/12587565/pexels-photo-12587565.jpeg?auto=compress&cs=tinysrgb&w=800',tags:['Machinery','Factory','Bulk'],active:true}
    ],
    pickups:[],quotes:[],customers:[],b2b:[],
    testimonials:[
      {id:'t1',name:'Ramesh Agarwal',role:'Residential Customer · Bikaner',text:'Very professional team. They arrived on time, weighed everything transparently in front of us and paid immediately. Felt nothing like dealing with a local kabadi.',stars:5,active:true},
      {id:'t2',name:'Sunita Sharma',role:'Business Owner · Retail Store',text:'We clear packaging and old fixtures every month. Scheduling is easy on WhatsApp and their rates for cardboard and metal have been consistently fair.',stars:5,active:true},
      {id:'t3',name:'Vikram Choudhary',role:'Factory Manager · Industrial Client',text:'They handled nearly 2 tonnes of machinery and offcut scrap from our unit. Proper weighing slips, bulk quotation and same-day lifting. Genuinely organised.',stars:5,active:true},
      {id:'t4',name:'Mohd. Salim',role:'Workshop Owner · Bikaner',text:'Old engines, panels, wiring — everything lifted in one visit. Respectful staff and no bargaining drama. Best scrap service I have used in Bikaner.',stars:4,active:true}
    ],
    faqs:[
      {id:'f1',q:'What types of scrap do you buy?',a:'We buy ferrous metals (iron, steel), non-ferrous metals (copper, aluminium, brass, stainless steel), e-waste, paper, cardboard, plastic, household scrap, machinery and bulk industrial scrap.',active:true},
      {id:'f2',q:'Do you provide doorstep pickup?',a:'Yes. Request a pickup through the form, call or WhatsApp, and our team will visit your home or business at your preferred date and time.',active:true},
      {id:'f3',q:'Do you collect industrial scrap?',a:'Yes. We handle bulk factory waste, machinery, manufacturing offcuts and construction scrap with scheduled pickup, weighing slips and bulk quotations.',active:true},
      {id:'f4',q:'Do you buy electronic waste?',a:'Yes — computers, laptops, servers, cables, circuit boards and components. E-waste is collected separately for responsible downstream recycling.',active:true},
      {id:'f5',q:'How is scrap weighed?',a:'Transparently, in front of you, on calibrated digital scales. For bulk loads we share weight slips and photographs on request.',active:true},
      {id:'f6',q:'How is the scrap price determined?',a:'Price depends on material type, grade, quality, quantity and prevailing recycling market rates. Share photos and quantity and we will send the best available quote. We never publish fake live prices.',active:true},
      {id:'f7',q:'Do you handle bulk quantities?',a:'Absolutely. Bulk deals get dedicated handling, on-site evaluation, labour for loading and priority lifting.',active:true},
      {id:'f8',q:'Do you provide business pickup services?',a:'Yes — scheduled, recurring and on-call pickup for factories, workshops, offices, shops, warehouses, hotels, schools and hospitals, with basic documentation.',active:true},
      {id:'f9',q:'Which areas of Bikaner do you serve?',a:'We serve homes, shops, offices, workshops, warehouses and factories across Bikaner and surrounding areas. Share your locality and we will confirm coverage instantly.',active:true},
      {id:'f10',q:'How can I request a pickup?',a:'Fill the Sell Your Scrap form, tap Sell Scrap to open WhatsApp, or call us. Our team confirms your slot and quote before visiting.',active:true}
    ],
    areas:['Bikaner City Centre','Gangashahar','Nokha Road','JNV Colony','Murlidhar Vyas Colony','Sharma Colony','Bichhwal Industrial Area','Rani Bazar','Kote Gate','Sujangarh Road','Napasar Road','Surrounding Villages'],
    settings:{businessName:'Kabaadi Wala',tagline:'Turning Scrap Into Value.',phone:'',whatsapp:'',email:'',address:'Bikaner, Rajasthan, India',hours:'Mon–Sat · 9:00 AM – 7:00 PM',heroTitle:'Turning Scrap Into Value.',heroSub:'Professional scrap collection and material recycling services in Bikaner, Rajasthan.',statYears:'10+',statCustomers:'1000+',statBusiness:'100+',statTonnes:'1000+',mapEmbed:'https://www.google.com/maps?q=Bikaner,Rajasthan,India&output=embed',logoUrl:'',socialFacebook:'',socialInstagram:'',socialX:'',socialYoutube:'',seoTitle:'Kabaadi Wala Bikaner — Scrap Buyer, Kabadi & Recycling Services | Turning Scrap Into Value',seoDescription:'Kabaadi Wala — professional scrap buyer in Bikaner, Rajasthan. We buy iron, steel, copper, aluminium, brass, e-waste, paper, plastic & industrial scrap with doorstep pickup, transparent weighing and fair pricing.'},
    cats:CATS, adminUser:'admin'
  };
  function load(){ try{const r=localStorage.getItem(KEY); if(r) return JSON.parse(r);}catch(e){} return JSON.parse(JSON.stringify(defaults)); }
  function save(db){ localStorage.setItem(KEY,JSON.stringify(db)); }
  let db=load();
  /* migrate: fill any settings keys added in newer versions */
  (function(){ const d=defaults.settings; let dirty=false;
    ['materials','pickups','quotes','customers','b2b','testimonials','faqs','areas','cats'].forEach(k=>{ if(!Array.isArray(db[k])){db[k]=[];dirty=true;} });
    Object.keys(d).forEach(k=>{ if(db.settings[k]===undefined){db.settings[k]=d[k];dirty=true;} });
    if(dirty) persist();
  })();
  /* one-time: replace early placeholder photos with verified premium images.
     Only touches exact known-bad URLs, so admin-customised images are never overwritten. */
  (function(){ if(localStorage.getItem('kw_imgmig_v2'))return;
    const PX=id=>`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;
    const bad={'1518709268805-4e9042af9f23':PX('5279317'),'1535813547-99c456a41d4a':PX('27312904'),'1565043589221-1a6fd9ae45c7':PX('14593018'),'1556911220-bff31c812dba':PX('32831269'),'1611284446314-60a58ac0deb9':PX('27312905'),'1565043666747-69f6646db940':PX('12587565')};
    let touched=false;
    (db.materials||[]).forEach(m=>{ if(!m.img)return;
      Object.keys(bad).forEach(old=>{ if(m.img.includes(old)){m.img=bad[old];touched=true;} });
    });
    if(touched)persist();
    try{localStorage.setItem('kw_imgmig_v2','1');}catch(e){}
  })();
  function persist(){ save(db); }
  if(!localStorage.getItem(KEY)) save(db);
  const uid=p=> (p||'x')+Math.random().toString(36).slice(2,8);
  window.KWDB={
    cats:CATS,
    all(){return db;},
    get(k){return db[k];},
    settings(){return db.settings;},
    saveSettings(s){db.settings={...db.settings,...s};persist();},
    materials(){return db.materials.filter(m=>m.active);},
    materialsAll(){return db.materials;},
    upsertMaterial(m){ if(m.id){const i=db.materials.findIndex(x=>x.id===m.id); if(i>-1)db.materials[i]={...db.materials[i],...m};} else {m.id=uid('m');m.active=true;db.materials.push(m);} persist(); },
    delMaterial(id){db.materials=db.materials.filter(x=>x.id!==id);persist();},
    addPickup(p){p.id=uid('P');p.status='New';p.createdAt=new Date().toISOString();db.pickups.unshift(p);
      const c=db.customers.find(c=>c.phone===p.phone); if(c){c.requests=(c.requests||0)+1;c.lastAt=p.createdAt;} else db.customers.unshift({id:uid('C'),name:p.name,phone:p.phone,address:p.address,requests:1,lastAt:p.createdAt});
      persist(); return p;},
    pickups(){return db.pickups;},
    setPickupStatus(id,st){const p=db.pickups.find(x=>x.id===id); if(p){p.status=st;persist();}},
    delPickup(id){db.pickups=db.pickups.filter(x=>x.id===id?false:true);persist();},
    addQuote(q){q.id=uid('Q');q.status='New';q.createdAt=new Date().toISOString();db.quotes.unshift(q);persist();return q;},
    quotes(){return db.quotes;},
    setQuote(id,patch){const q=db.quotes.find(x=>x.id===id); if(q){Object.assign(q,patch);persist();}},
    delQuote(id){db.quotes=db.quotes.filter(x=>x.id!==id);persist();},
    addB2B(b){b.id=uid('B');b.createdAt=new Date().toISOString();db.b2b.unshift(b);persist();return b;},
    testimonials(){return db.testimonials.filter(t=>t.active);},
    testimonialsAll(){return db.testimonials;},
    upsertTesti(t){if(t.id){const i=db.testimonials.findIndex(x=>x.id===t.id);if(i>-1)db.testimonials[i]={...db.testimonials[i],...t};}else{t.id=uid('t');t.active=true;db.testimonials.push(t);}persist();},
    delTesti(id){db.testimonials=db.testimonials.filter(x=>x.id!==id);persist();},
    faqs(){return db.faqs.filter(f=>f.active);},
    faqsAll(){return db.faqs;},
    upsertFaq(f){if(f.id){const i=db.faqs.findIndex(x=>x.id===f.id);if(i>-1)db.faqs[i]={...db.faqs[i],...f};}else{f.id=uid('f');f.active=true;db.faqs.push(f);}persist();},
    delFaq(id){db.faqs=db.faqs.filter(x=>x.id!==id);persist();},
    areas(){return db.areas;},
    setAreas(a){db.areas=a;persist();},
    reset(){db=JSON.parse(JSON.stringify(defaults));persist();},
    export(){return JSON.stringify(db,null,2);}
  };
})();
