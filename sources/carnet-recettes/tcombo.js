const {chromium}=require('playwright'); const fs=require('fs');
const seed=JSON.parse(fs.readFileSync(__dirname+'/pwa/recettes.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,OPTIONS'};
const mk=(i,o)=>({...JSON.parse(JSON.stringify(seed.recipes[i])),url:'',meals:[],status:'',...o});
const gh={file:{recipes:[
 mk(0,{id:'poulet',name:'Poulet rôti',type:'plats',meals:['dejeuner'],pairs:['riz','mayo']}),
 mk(1,{id:'kefta',name:'Tajine de kefta',type:'tajines',meals:['dejeuner','diner']}),
 mk(2,{id:'riz',name:'Riz pilaf',type:'accomp',meals:[]}),
 mk(3,{id:'frites',name:'Frites',type:'accomp',meals:['dejeuner']}),
 mk(4,{id:'mayo',name:'Mayonnaise',type:'sauces',meals:['dejeuner']}),
 mk(5,{id:'taboule',name:'Taboulé',type:'salades',meals:['dejeuner']}),
 mk(6,{id:'flan',name:'Flan',type:'desserts',meals:['dejeuner']}),
 mk(7,{id:'soupe',name:'Harira',type:'soupes',meals:[]}),
 mk(8,{id:'colle',name:'Colle maison',type:'brico'})],typeOrder:[],dismissed:[]},sha:1,msgs:[],fail:false};
async function handler(route){ const req=route.request(); const u=new URL(req.url());
  const json=(s,o)=>route.fulfill({status:s,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(req.method()==='OPTIONS') return route.fulfill({status:204,headers:CORS});
  if(u.pathname==='/repos/RevisionsDescartes/carnet-recettes') return json(200,{permissions:{pull:true,push:true}});
  if(u.pathname.endsWith('/contents/recettes.json')){
    if(req.method()==='GET') return json(200,{sha:'s'+gh.sha,content:Buffer.from(JSON.stringify(gh.file)).toString('base64')});
    if(req.method()==='PUT'){ if(gh.fail) return json(500,{message:'x'}); const b=JSON.parse(req.postData()); gh.msgs.push(b.message); gh.file=JSON.parse(Buffer.from(b.content,'base64').toString('utf8')); gh.sha++; return json(200,{content:{sha:'s'+gh.sha}}); } }
  return route.fulfill({status:404,headers:CORS,body:'{}'}); }
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const rec=id=>gh.file.recipes.find(r=>r.id===id);
(async()=>{
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await ctx.route('https://api.github.com/**',handler); await ctx.route(/fonts\.|i\.ytimg|noembed|youtube\.com\/oembed/,r=>r.abort());
 await ctx.addInitScript(()=>{ if(!localStorage.getItem('carnet:cfg')) localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:'good'})); });
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://localhost:8765/#repas/dejeuner'); await sleep(1000);
 const li=n=>p.locator('.rows > li',{has:p.locator('.rn',{hasText:n})});
 const chips=async n=>li(n).locator('.cchip').allTextContents();
 chk((await chips('Poulet rôti')).sort().join()==='Mayonnaise,Riz pilaf','plat : ses accompagnements en pastilles (dont le riz, sans repas coché)');
 chk(/avec/.test(await li('Poulet rôti').locator('.combo').textContent()),'mention « avec »');
 chk(await li('Tajine de kefta').locator('.cadd').textContent()==='+ accompagnement','plat sans association : « + accompagnement »');
 chk(await li('Poulet rôti').locator('.cadd').textContent()==='+','plat avec associations : « + »');
 const heads=await p.locator('.grp-head h2').allTextContents();
 chk(heads.join()==='Plats,Tajines,Desserts,Accompagnements,Salades','plats d’abord, accompagnements seuls ensuite : '+heads.join());
 chk(!heads.includes('Sauces'),'la mayonnaise associée au poulet n’est pas répétée en bas');
 chk(await p.locator('.sidesnote').count()===1,'intertitre « Sans plat associé dans ce repas »');
 chk(await li('Frites').locator('.combo').count()===0&&await li('Flan').locator('.cadd').count()===0,'pas de « + » sur un accompagnement seul ni sur un dessert');
 // pastille → fiche de l'accompagnement
 await li('Poulet rôti').locator('.cchip',{hasText:'Riz'}).click(); await sleep(400);
 chk(p.url().endsWith('#riz'),'pastille : ouvre la fiche de l’accompagnement');
 await p.goBack(); await sleep(500);
 // associer depuis la liste
 await li('Tajine de kefta').locator('.cadd').click(); await sleep(300);
 chk(await p.locator('.pairpick').count()===1&&p.url().endsWith('#repas/dejeuner'),'« + » ouvre la liste à cocher sans quitter l’onglet Repas');
 await p.locator('.pairchk',{hasText:'Frites'}).locator('input').click(); await p.locator('.pairchk',{hasText:'Taboulé'}).locator('input').click();
 await p.locator('.pairbar .btn').first().click(); await sleep(1100);
 chk(rec('kefta').pairs.slice().sort().join()==='frites,taboule'&&gh.msgs.length===1,'deux associations, un seul enregistrement');
 chk((await chips('Tajine de kefta')).sort().join()==='Frites,Taboulé'&&await p.locator('.pairpick').count()===0,'pastilles affichées aussitôt, liste refermée');
 const h2=await p.locator('.grp-head h2').allTextContents();
 chk(h2.join()==='Plats,Tajines,Desserts'&&await p.locator('.sidesnote').count()===0,'frites et taboulé, désormais associés, quittent le groupe du bas : '+h2.join());
 // dîner : hérite
 await p.goto('http://localhost:8765/#repas/diner'); await sleep(500);
 chk((await chips('Tajine de kefta')).length===2,'dîner : le tajine garde ses accompagnements (non cochés dîner)');
 // annuler
 await li('Tajine de kefta').locator('.cadd').click(); await sleep(200); await p.click('.pairbar button:has-text("Annuler")'); await sleep(200);
 chk(await p.locator('.pairpick').count()===0&&await li('Tajine de kefta').locator('.cadd').isVisible(),'Annuler referme et rend le « + »');
 // échec réseau
 gh.fail=true; await p.goto('http://localhost:8765/#repas/dejeuner'); await sleep(500);
 await li('Poulet rôti').locator('.cadd').click(); await sleep(200); await p.locator('.pairchk',{hasText:'Frites'}).locator('input').click(); await p.locator('.pairbar .btn').first().click(); await sleep(1500);
 chk((await li('Poulet rôti').locator('.perr').textContent()).length>3&&await p.locator('.pairpick').count()===1,'échec : message sous le plat, coches conservées');
 gh.fail=false; await p.locator('.pairbar .btn').first().click(); await sleep(1100);
 chk(rec('poulet').pairs.includes('frites'),'nouvel essai réussi');
 // filtre de statut : sans plat correspondant, pas d'écran vide trompeur
 await p.screenshot({path:'combo.png',fullPage:true});
 // Sans repas : inchangé (pas de combos)
 await p.goto('http://localhost:8765/#repas/sans'); await sleep(500);
 chk(await p.locator('.combo').count()===0&&(await p.locator('.rn').allTextContents()).includes('Riz pilaf'),'« Sans repas » inchangé');
 // lecture seule : pastilles sans « + »
 const ro=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}); await ro.route('https://api.github.com/**',handler); await ro.route(/fonts\./,r=>r.abort());
 const p2=await ro.newPage(); p2.on('pageerror',e=>errs.push(String(e))); await p2.goto('http://localhost:8765/#repas/dejeuner'); await sleep(1000);
 chk(await p2.locator('.cchip').count()>=4&&await p2.locator('.cadd').count()===0,'lecture seule : pastilles visibles, pas de « + »');
 chk(errs.length===0,'aucune erreur JS '+errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ECHEC'); process.exit(ok?0:1);
})();
