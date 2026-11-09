const {chromium}=require('playwright'); const fs=require('fs');
const seed=JSON.parse(fs.readFileSync(__dirname+'/pwa/recettes.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,OPTIONS'};
const gh={file:JSON.parse(JSON.stringify(seed)),sha:1,puts:[]};
async function handler(route){
  const req=route.request(); const u=new URL(req.url());
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
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block'});
 await ctx.route('https://api.github.com/**',handler); await ctx.route(/fonts\./,r=>r.abort());
 await ctx.addInitScript(()=>{ if(!localStorage.getItem('carnet:cfg')) localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:'good'})); });
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://localhost:8765/#accueil'); await sleep(600);
 chk(await p.locator('.sub').count()===0&&!/choisissez/.test(await p.locator('#view').textContent()),'accueil : phrase retirée');
 await p.click('.seg a:has-text("Repas")'); await sleep(200);
 chk(await p.locator('.sub').count()===0,'vue Repas : phrase retirée aussi');
 await p.goto('http://localhost:8765/#accueil'); await sleep(200);
 await p.locator('button.linkbtn').click(); await sleep(200);
 chk(/Maintenez une tuile/.test(await p.locator('.sub').textContent()),'mode réorganisation : consigne conservée');
 await p.locator('button.btn:has-text("Terminé")').click(); await sleep(200);
 // formulaire : lien en premier
 await p.goto('http://localhost:8765/#ajouter'); await sleep(300);
 chk(await p.evaluate(()=>{const ids=[...document.querySelectorAll('form input[type=url],form input[type=text]')].map(e=>e.id); return ids[0]==='f-url';}),'le champ lien est le premier champ');
 // 1) lien YouTube seul
 await p.fill('#f-url','https://youtu.be/AbC123'); await p.click('button[type=submit]'); await sleep(800);
 let r=gh.file.recipes[0];
 chk(/^Recette YouTube du \d{1,2} \S+ 20\d\d$/.test(r.name)&&r.type==='aclasser'&&r.url==='https://youtu.be/AbC123'&&r.btn==='Voir la vidéo ↗'&&r.src==='Ajoutée'&&r.lvl==='user','lien YouTube seul : '+JSON.stringify({n:r.name,t:r.type,b:r.btn}));
 chk(/Recette YouTube/.test(await p.locator('h1').textContent())&&/Aucun ingrédient renseigné/.test(await p.locator('#view').textContent()),'fiche affichée avec le bouton vers la vidéo');
 chk(await p.locator('a.btn[target=_blank]').textContent()==='Voir la vidéo ↗','bouton « Voir la vidéo »');
 // 2) texte partagé autour d'un lien Facebook
 await p.goto('http://localhost:8765/#ajouter'); await sleep(200);
 await p.fill('#f-url','Regarde cette recette trop bonne https://www.facebook.com/reel/123456 à tester !'); await p.locator('#f-url').blur(); await sleep(100);
 chk(await p.inputValue('#f-url')==='https://www.facebook.com/reel/123456','texte partagé : lien extrait à la sortie du champ');
 await p.click('button[type=submit]'); await sleep(800); r=gh.file.recipes[0];
 chk(/^Recette Facebook du /.test(r.name)&&r.btn==='Voir le reel ↗'&&r.url==='https://www.facebook.com/reel/123456','lien Facebook : nom et bouton adaptés');
 // 3) autre site, sans https
 await p.goto('http://localhost:8765/#ajouter'); await sleep(200);
 await p.fill('#f-url','www.marmiton.org/recettes/x'); await p.click('button[type=submit]'); await sleep(800); r=gh.file.recipes[0];
 chk(/^Recette sur marmiton\.org du /.test(r.name)&&r.url==='https://www.marmiton.org/recettes/x'&&r.btn==='Ouvrir le lien ↗','autre site sans https : https ajouté, nom « sur marmiton.org »');
 // 4) lien + nom, sans type
 await p.goto('http://localhost:8765/#ajouter'); await sleep(200);
 await p.fill('#f-url','https://youtu.be/ZZZ'); await p.fill('#f-name','Couscous royal'); await p.click('button[type=submit]'); await sleep(800); r=gh.file.recipes[0];
 chk(r.name==='Couscous royal'&&r.type==='aclasser','nom saisi conservé, type par défaut À classer');
 // 5) lien + type choisi : le type est respecté
 await p.goto('http://localhost:8765/#ajouter/desserts'); await sleep(200);
 await p.fill('#f-url','https://youtu.be/DES'); await p.click('button[type=submit]'); await sleep(800); r=gh.file.recipes[0];
 chk(r.type==='desserts'&&/^Recette YouTube/.test(r.name),'type pré-sélectionné respecté');
 // 6) erreurs
 const n0=gh.file.recipes.length;
 await p.goto('http://localhost:8765/#ajouter'); await sleep(200);
 await p.click('button[type=submit]'); await sleep(100);
 chk(/collez un lien/.test(await p.locator('.err').textContent()),'ni lien ni nom : message');
 await p.fill('#f-name','Sans type'); await p.click('button[type=submit]'); await sleep(100);
 chk(/type de plat/.test(await p.locator('.err').textContent()),'nom sans type ni lien : message');
 await p.fill('#f-name',''); await p.fill('#f-url','javascript:alert(1)'); await p.click('button[type=submit]'); await sleep(100);
 chk(/lien n’est pas valide/.test(await p.locator('.err').textContent()),'lien javascript: refusé');
 chk(gh.file.recipes.length===n0,'rien écrit en cas d’erreur');
 // 7) édition : nom toujours obligatoire
 await p.goto('http://localhost:8765/#modifier/'+gh.file.recipes[0].id); await sleep(300);
 await p.fill('#f-name',''); await p.click('button[type=submit]'); await sleep(100);
 chk(/Indiquez le nom du plat\./.test(await p.locator('.err').textContent()),'édition : nom obligatoire');
 // 8) À classer visible à l'accueil
 await p.goto('http://localhost:8765/#accueil'); await sleep(300);
 chk(/\d+ recettes/.test(await p.locator('.tile[href="#aclasser"] .tc').textContent()),'tuile À classer : '+await p.locator('.tile[href="#aclasser"] .tc').textContent());
 chk(errs.length===0,'aucune erreur page '+errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ÉCHECS'); process.exit(ok?0:1);
})();
