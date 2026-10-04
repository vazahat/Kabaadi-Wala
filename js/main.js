/* Kabaadi Wala — Frontend logic */
(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const db=()=>window.KWDB.all();
  const settings=()=>window.KWDB.settings();
  const digits=n=>String(n||'').replace(/\D/g,'');
  const waNumber=()=>digits(settings().whatsapp||'');
  const waLink=(msg)=>{const n=waNumber(); const t=encodeURIComponent(msg||'Hello Kabaadi Wala, I would like to sell scrap.'); return n?`https://wa.me/${n}?text=${t}`:'#contact';};

  // Nav
  const ham=$('#hamburger'), mm=$('#mobileMenu');
  ham&&ham.addEventListener('click',()=>mm.classList.toggle('open'));
  mm&&mm.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mm.classList.remove('open')));

  // Reveal on scroll
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12});
  $$('.reveal').forEach(el=>io.observe(el));

  // Hero text + stats from settings
  function applySettings(){
    const s=settings();
    if(s.heroTitle)$('#heroTitle').innerHTML=s.heroTitle.replace('Into Value.','<em>Into Value.</em>');
    if(s.heroSub)$('#heroSub').textContent=s.heroSub;
    $$('.count').forEach(el=>{el.textContent=s[el.dataset.key]||el.textContent;});
    const f=$('#statYearsFloat'); if(f&&s.statYears)f.textContent=s.statYears;
    if(s.mapEmbed)$('#gmap').src=s.mapEmbed;
    const phone=s.phone||'', em=s.email||'';
    $('#cPhone').textContent=phone||'— set in admin —';
    $('#cWa').textContent=s.whatsapp||'— set in admin —';
    $('#cEmail').textContent=em||'— set in admin —';
    if(s.hours)$('#cHours').textContent=s.hours;
    if(s.address)$('#cAddr').textContent=s.address;
    const tel=digits(phone);
    $('#callNowBtn').href=tel?`tel:+${tel}`:'#sell';
    $('#mCall').href=tel?`tel:+${tel}`:'#contact';
    const wl=waLink();
    $('#floatWa').href=wl; $('#waUsBtn').onclick=()=>{location.href=wl;};
    $('#sellWaBtn').onclick=()=>{location.href=wl;};
    $('#mWa').href=wl;
    $('#sellCallBtn').href=tel?`tel:+${tel}`:'#contact';
    /* logo / brand name / SEO / socials from settings */
    const logo=$('#brandLogo'), mark=$('#brandMark');
    if(s.logoUrl){logo.src=s.logoUrl;logo.style.display='block';if(mark)mark.style.display='none';}
    else{logo.style.display='none';if(mark)mark.style.display='grid';}
    if(s.businessName)$('#brandName').textContent=s.businessName;
    if(s.seoTitle)document.title=s.seoTitle;
    if(s.seoDescription){let md=document.querySelector('meta[name="description"]');if(md)md.setAttribute('content',s.seoDescription);}
    const socials=[['socialFacebook','f','Facebook'],['socialInstagram','◎','Instagram'],['socialX','𝕏','X'],['socialYoutube','▶','YouTube']].filter(([k])=>s[k]);
    const sr=$('#socialRow');
    if(sr){ if(socials.length){sr.style.display='flex';sr.innerHTML=socials.map(([k,ch,label])=>`<a href="${esc(s[k])}" target="_blank" rel="noopener" aria-label="${label}" title="${label}">${ch}</a>`).join('');} else sr.style.display='none'; }
  }

  // Category dropdowns
  function fillCats(){
    const cats=window.KWDB.cats;
    const q=$('#qqMat'); q.innerHTML=cats.map(c=>`<option>${c}</option>`).join('');
    const p=$('#pickupCat'); p.innerHTML='<option value="">Select category…</option>'+cats.map(c=>`<option>${c}</option>`).join('');
  }

  // Materials grid
  function renderMaterials(){
    const list=window.KWDB.materials();
    $('#materialGrid').innerHTML=list.map(m=>`
      <article class="mat-card reveal in">
        <div class="ph"><img src="${esc(m.img)}" alt="${esc(m.name)} scrap" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=800&auto=format&fit=crop'"><span>${esc(m.cat)}</span></div>
        <div class="bd"><h3>${esc(m.name)}</h3><p>${esc(m.desc)}</p>
        <div class="tags">${(m.tags||[]).map(t=>`<span>${esc(t)}</span>`).join('')}</div>
        <button class="link-more" data-sell="${esc(m.name)}">Sell This Scrap →</button></div>
      </article>`).join('');
    $$('[data-sell]').forEach(b=>b.addEventListener('click',()=>{
      const sel=$('#pickupCat'); if(sel)sel.value=window.KWDB.cats.find(c=>b.dataset.sell.toLowerCase().includes(c.toLowerCase()))||'Mixed Scrap';
      document.getElementById('sell').scrollIntoView({behavior:'smooth'});
    }));
  }

  // Areas
  function renderAreas(){
    $('#areaPills').innerHTML=window.KWDB.areas().map(a=>`<span>${esc(a)}</span>`).join('');
  }

  // Testimonials carousel
  let ti=0,timer=null;
  function renderTestis(){
    const list=window.KWDB.testimonials(); if(!list.length)return;
    $('#testiBox').innerHTML=list.map((t,i)=>`
      <div class="testi ${i===0?'active':''}"><div class="stars">${'★'.repeat(t.stars)}${'☆'.repeat(5-t.stars)}</div>
      <p class="q">“${esc(t.text)}”</p>
      <div class="who"><div class="ava">${esc((t.name||'K')[0])}</div><div><b>${esc(t.name)}</b><br><small style="color:var(--muted)">${esc(t.role)} · placeholder</small></div></div></div>`).join('');
    $('#testiDots').innerHTML=list.map((_,i)=>`<button aria-label="Review ${i+1}" class="${i===0?'on':''}"></button>`).join('');
    const dots=$$('#testiDots button');
    const show=i=>{ti=(i+list.length)%list.length;$$('#testiBox .testi').forEach((el,k)=>el.classList.toggle('active',k===ti));dots.forEach((d,k)=>d.classList.toggle('on',k===ti));};
    dots.forEach((d,i)=>d.onclick=()=>{show(i);restart();});
    function restart(){clearInterval(timer);timer=setInterval(()=>show(ti+1),6000);}
    restart();
  }

  // FAQ
  function renderFaqs(){
    $('#faqBox').innerHTML=window.KWDB.faqs().map(f=>`
      <div class="faq-item"><button type="button">${esc(f.q)}<span class="plus">+</span></button><div class="ans"><p>${esc(f.a)}</p></div></div>`).join('');
    $$('.faq-item button').forEach(b=>b.addEventListener('click',()=>{
      const it=b.parentElement, was=it.classList.contains('open');
      $$('.faq-item').forEach(x=>x.classList.remove('open'));
      if(!was)it.classList.add('open');
    }));
  }

  // Animated counters (numeric prefix)
  function animateCounts(){
    const cio=new IntersectionObserver(es=>es.forEach(e=>{
      if(!e.isIntersecting)return; cio.unobserve(e.target);
      const el=e.target, m=String(el.textContent).match(/(\d+)/); if(!m)return;
      const target=+m[1], suf=el.textContent.replace(m[0],''); let cur=0;
      const step=Math.max(1,Math.round(target/40));
      const t=setInterval(()=>{cur+=step;if(cur>=target){cur=target;clearInterval(t);}el.textContent=cur+suf;},40);
    }),{threshold:.4});
    $$('.count').forEach(el=>cio.observe(el));
  }

  // Photo previews (+ keep File objects for API upload when online)
  const photoInput=$('#photoInput'), photoPrev=$('#photoPrev');
  let photoNames=[], photoFiles=[];
  photoInput&&photoInput.addEventListener('change',()=>{
    photoFiles=[...photoInput.files].slice(0,6);
    photoNames=photoFiles.map(f=>f.name);
    photoPrev.innerHTML='';
    photoFiles.forEach(f=>{
      const r=new FileReader(); r.onload=e=>{const im=document.createElement('img');im.src=e.target.result;im.style.cssText='width:64px;height:64px;object-fit:cover;border-radius:10px;border:1px solid #e3ddd0';photoPrev.appendChild(im);}; r.readAsDataURL(f);
    });
  });
  const validPhone=v=>digits(v).length>=10&&digits(v).length<=13;
  const api=()=>window.KWAPI; // optional live-API bridge (js/api.js)

  // Pickup form
  $('#pickupForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const d=Object.fromEntries(fd.entries());
    if(!d.name.trim())return alert('Please enter your full name.');
    if(!validPhone(d.phone))return alert('Please enter a valid 10-digit mobile number.');
    if(!d.address.trim()||!d.area.trim()||!d.category||!d.quantity.trim())return alert('Please complete address, area, category and quantity.');
    let photos=photoNames;
    if(api()&&photoFiles.length){ try{ photos=await api().uploadPhotos(photoFiles); }catch(err){ /* offline: keep filenames */ } }
    const rec=window.KWDB.addPickup({name:d.name.trim(),phone:digits(d.phone),address:d.address.trim(),area:d.area.trim(),category:d.category,quantity:d.quantity.trim(),date:d.date||'',time:d.time||'',notes:(d.notes||'').trim(),photos});
    $('#pickupRef').textContent='#'+rec.id.toUpperCase();
    e.target.style.display='none'; $('#pickupOk').classList.add('show');
    $('#pickupOk').scrollIntoView({behavior:'smooth',block:'center'});
    photoNames=[]; photoFiles=[]; if(photoPrev)photoPrev.innerHTML='';
  });

  // Quick quote (with optional photos — uploaded when the API is reachable)
  $('#quickQuoteForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const mat=$('#qqMat').value, qty=$('#qqQty').value, loc=$('#qqLoc').value.trim();
    if(!qty||+qty<=0)return alert('Please enter an approximate quantity.');
    if(!loc)return alert('Please enter your location / area.');
    let photos=[];
    const qf=$('#qqPhotos');
    if(qf&&qf.files.length&&api()){ try{ photos=await api().uploadPhotos([...qf.files].slice(0,6)); }catch(err){ photos=[...qf.files].map(f=>f.name); } }
    else if(qf&&qf.files.length){ photos=[...qf.files].map(f=>f.name); }
    window.KWDB.addQuote({material:mat,quantity:qty+' kg',location:loc,phone:'',notes:'Quick quote from hero',photos});
    $('#qqOk').style.display='block';
    e.target.querySelectorAll('input').forEach(i=>i.value='');
    setTimeout(()=>$('#qqOk').style.display='none',6000);
  });

  // B2B
  $('#b2bForm').addEventListener('submit',e=>{
    e.preventDefault();
    const fd=new FormData(e.target), d=Object.fromEntries(fd.entries());
    if(!d.name.trim()||!validPhone(d.phone)||!(d.notes||'').trim())return alert('Please add company/contact, valid mobile and scrap details.');
    window.KWDB.addB2B({name:d.name.trim(),phone:digits(d.phone),type:d.type,notes:d.notes.trim()});
    $('#b2bOk').style.display='block'; e.target.querySelectorAll('input,textarea').forEach(i=>i.value='');
    setTimeout(()=>$('#b2bOk').style.display='none',6000);
  });

  // Boot (+ re-render hook consumed by the live API bridge in js/api.js)
  window.KW_RENDER=function(){fillCats();applySettings();renderMaterials();renderAreas();renderTestis();renderFaqs();};
  window.KW_RENDER(); animateCounts();
  window.addEventListener('kw:refresh',()=>window.KW_RENDER());
  window.addEventListener('storage',()=>window.KW_RENDER());
})();
