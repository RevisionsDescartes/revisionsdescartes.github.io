const {chromium}=require('playwright'); const fs=require('fs');
const seed=JSON.parse(fs.readFileSync(__dirname+'/pwa/recettes.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,OPTIONS'};
const gh={file:JSON.parse(JSON.stringify(seed)),sha:1,puts:[]};
async function handler(route){
  const req=route.request(); const u=new URL(req.url()); const auth=req.headers()['authorization']||'';
  const json=(s,o)=>route.fulfill({status:s,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(req.method()==='OPTIONS') return route.fulfill({status:204,headers:CORS});
  if(u.pathname==='/repos/RevisionsDescartes/carnet-recettes') return json(200,{permissions:{pull:true,push:true}});
  if(u.pathname.endsWith('/contents/recettes.json')){
    if(req.method()==='GET') return json(200,{sha:'s'+gh.sha,content:Buffer.from(JSON.stringify(gh.file)).toString('base64')});
    if(req.method()==='PUT'){ const b=JSON.parse(req.postData()); gh.file=JSON.parse(Buffer.from(b.content,'base64').toString('utf8')); gh.sha++; gh.puts.push(b.message); return json(200,{content:{sha:'s'+gh.sha}}); }
  }
  return route.fulfill({status:404,headers:CORS,body:'{}'});
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
 await ctx.route('https://api.github.com/**',handler); await ctx.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 await ctx.addInitScript(()=>{ try{ if(!localStorage.getItem('carnet:cfg')) localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:'good'})); }catch(e){} });
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://localhost:8765/#accueil'); await sleep(600);
 chk(await p.locator('.seg a[aria-current]').textContent()==='Types de plat','vue par défaut : types');
 chk(await p.locator('button.linkbtn').count()===1,'vue types : bouton réorganiser présent');
 await p.click('.seg a:has-text("Repas")'); await sleep(200);
 chk(p.url().endsWith('#repas')&&await p.locator('.tile[href="#repas/dejeuner"]').count()===1&&await p.locator('.tile[href="#repas/diner"]').count()===1,'vue repas : tuiles Déjeuner et Dîner');
 chk(/Sans repas/.test(await p.locator('.tile.wide').textContent())&&/18 recettes/.test(await p.locator('.tile.wide').textContent()),'tuile Sans repas : 18 recettes');
 chk(await p.locator('button.linkbtn').count()===0,'vue repas : pas de bouton réorganiser');
 chk(await p.locator('.tile[href="#repas/dejeuner"]').evaluate(e=>e.classList.contains('zero')),'Déjeuner vide : style discret');
 await p.goto('http://localhost:8765/'); await sleep(400);
 chk(await p.locator('.seg a[aria-current]').textContent()==='Repas','dernière vue mémorisée (ouverture sans #)');
 // ajout pré-rempli depuis Déjeuner
 await p.goto('http://localhost:8765/#repas/dejeuner'); await sleep(300);
 await p.click('a.btn:has-text("Ajouter à Déjeuner")'); await sleep(200);
 chk(await p.locator('input[name=meal][value=dejeuner]').isChecked()&&!await p.locator('input[name=meal][value=diner]').isChecked(),'formulaire : Déjeuner pré-coché');
 await p.fill('#f-name','Poulet rôti'); await p.click('label.chip:has-text("Plats")');
 await p.click('label.chip:has(input[name=meal]):has-text("Dîner")');
 await p.fill('#f-ing','1 poulet'); await p.click('button[type=submit]'); await sleep(600);
 const rec=gh.file.recipes[0];
 chk(rec.name==='Poulet rôti'&&JSON.stringify(rec.meals)==='["dejeuner","diner"]','enregistré avec les deux repas : '+JSON.stringify(rec.meals));
 chk(/Déjeuner/.test(await p.locator('.meta').textContent())&&/Dîner/.test(await p.locator('.meta').textContent()),'fiche : labels repas affichés');
 await p.goto('http://localhost:8765/#repas/diner'); await sleep(300);
 chk(await p.locator('.grp').count()===1&&/Plats/.test(await p.locator('.grp-head').textContent())&&await p.locator('.row').count()===1,'liste Dîner : groupe Plats, 1 ligne');
 await p.click('.row'); await sleep(200);
 chk(/Dîner/.test(await p.locator('a.back').textContent()),'fiche ouverte depuis Dîner : retour vers Dîner');
 await p.click('a.back'); await sleep(200);
 chk(p.url().endsWith('#repas/diner'),'retour à la liste Dîner');
 await p.goto('http://localhost:8765/#repas'); await sleep(300);
 chk(/18 recettes/.test(await p.locator('.tile.wide').textContent()),'Sans repas toujours 18 (la nouvelle a des repas)');
 // modification d'une recette existante : lui donner Déjeuner
 await p.goto('http://localhost:8765/#plats'); await sleep(300);
 chk(await p.locator('.row').count()===4,'type Plats : 4 lignes');
 const h=await p.locator('.row').first().evaluate(e=>e.getBoundingClientRect().height);
 chk(h>=44&&h<=50,'ligne condensée : hauteur '+Math.round(h)+' px');
 chk(await p.locator('.row .mchip').count()===2,'puces Déj./Dîn. sur la recette étiquetée');
 await p.locator('.row').nth(1).click(); await sleep(200);
 await p.click('a:has-text("Modifier")'); await sleep(200);
 await p.click('label.chip:has(input[name=meal]):has-text("Déjeuner")'); await p.click('button[type=submit]'); await sleep(600);
 console.log(gh.puts, gh.file.recipes.slice(0,4).map(r=>r.name+':'+JSON.stringify(r.meals)), p.url());
 const edited=gh.file.recipes.find(r=>r.meals&&r.meals.length===1);
 chk(!!edited&&edited.meals[0]==='dejeuner','recette existante : Déjeuner enregistré ('+(edited&&edited.name)+')');
 await p.goto('http://localhost:8765/#repas'); await sleep(300);
 chk(/17 recettes/.test(await p.locator('.tile.wide').textContent()),'Sans repas passe à 17');
 // décocher tout => liste vide
 await p.goto('http://localhost:8765/#modifier/'+edited.id); await sleep(300);
 await p.click('label.chip:has(input[name=meal]):has-text("Déjeuner")'); await p.click('button[type=submit]'); await sleep(600);
 chk(JSON.stringify(gh.file.recipes.find(r=>r.id===edited.id).meals)==='[]','décocher : meals vide');
 // données hostiles
 gh.file.recipes.push({id:'hostile',name:'Hostile',type:'plats',meals:['dejeuner','<img src=x>','dejeuner',5,'diner']}); gh.sha++;
 gh.file.recipes.push({id:'sans-champ',name:'Ancien format',type:'plats'}); gh.sha++;
 await p.goto('http://localhost:8765/#accueil'); await p.reload(); await sleep(800);
 await p.goto('http://localhost:8765/#hostile'); await sleep(300);
 chk((await p.locator('.meta .tag').allTextContents()).filter(t=>/Déjeuner|Dîner/.test(t)).join(',')==='Déjeuner,Dîner'&&!await p.locator('img').count(),'repas invalides/doublons ignorés');
 await p.goto('http://localhost:8765/#sans-champ'); await sleep(300);
 chk(await p.locator('h1').textContent()==='Ancien format','ancien format sans meals accepté');
 // route repas inconnue
 await p.goto('http://localhost:8765/#repas/nimportequoi'); await sleep(300);
 chk(await p.locator('h1').textContent()==='Carnet de recettes','repas inconnu : retour accueil');
 // clavier : le sélecteur est focusable, la liste est une vraie liste
 chk(await p.locator('ul.rows').count()===0,'accueil sans liste');
 await p.goto('http://localhost:8765/#plats'); await sleep(300);
 chk(await p.locator('ul.rows li a.row').count()>=3,'liste = ul/li/a (navigable au clavier)');
 chk(errs.length===0,'aucune erreur page '+errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ÉCHECS'); process.exit(ok?0:1);
})();
