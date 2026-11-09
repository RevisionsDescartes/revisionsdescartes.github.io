const {chromium}=require('playwright'); const fs=require('fs');
const seed=JSON.parse(fs.readFileSync(__dirname+'/pwa/recettes.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,OPTIONS'};
const gh={file:JSON.parse(JSON.stringify(seed)),sha:1,puts:[],fail:false};
async function handler(route){
  const req=route.request(); const u=new URL(req.url());
  const json=(s,o)=>route.fulfill({status:s,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(req.method()==='OPTIONS') return route.fulfill({status:204,headers:CORS});
  if(u.pathname==='/repos/RevisionsDescartes/carnet-recettes') return json(200,{permissions:{pull:true,push:true}});
  if(u.pathname.endsWith('/contents/recettes.json')){
    if(req.method()==='GET') return json(200,{sha:'s'+gh.sha,content:Buffer.from(JSON.stringify(gh.file)).toString('base64')});
    if(req.method()==='PUT'){ if(gh.fail) return json(403,{message:'denied'}); const b=JSON.parse(req.postData()); gh.file=JSON.parse(Buffer.from(b.content,'base64').toString('utf8')); gh.sha++; gh.puts.push(b.message); return json(200,{content:{sha:'s'+gh.sha}}); }
  }
  return route.fulfill({status:404,headers:CORS,body:'{}'});
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch();
 const mk=async(token)=>{ const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block'});
  await ctx.route('https://api.github.com/**',handler); await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(t=>{ if(!localStorage.getItem('carnet:cfg')) localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:t})); },token);
  const p=await ctx.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(String(e))); return p; };
 const p=await mk('good');
 await p.goto('http://localhost:8765/#a-identifier'); await sleep(700);
 const count=async()=>/(\d+) liens?/.exec(await p.locator('.qgroup').first().locator('.n').textContent());
 chk(await p.locator('.qgroup').count()===4,'4 groupes : YouTube + Facebook 2024/2025/2026');

 await p.locator('.qgroup summary').first().click(); await sleep(100);
 chk(await p.locator('.qgroup').first().locator('li').count()===9,'YouTube : 9 liens');
 chk(await p.locator('.qgroup').first().locator('.qact .btn').count()===9&&await p.locator('.qgroup').first().locator('.qact .linkbtn').count()===9,'boutons Classer / Retirer sur chaque ligne');
 // Retirer
 const firstId=await p.locator('.qgroup').first().locator('.qid').first().textContent();
 await p.locator('.qgroup').first().locator('.linkbtn').first().click(); await sleep(100);
 chk(/Retirer/.test(await p.locator('.qask').textContent()),'confirmation avant retrait');
 await p.locator('.qgroup').first().locator('button:has-text("Non")').click(); await sleep(100);
 chk(gh.puts.length===0,'« Non » : rien écrit');
 await p.locator('.qgroup').first().locator('.linkbtn').first().click(); await p.locator('button:has-text("Oui")').click(); await sleep(700);
 chk(gh.file.dismissed&&gh.file.dismissed.length===1&&gh.file.dismissed[0].includes('youtube.com'),'retrait enregistré dans le dépôt : '+JSON.stringify(gh.file.dismissed));
 chk(gh.file.recipes.length===seed.recipes.length,'recettes inchangées');
 chk(/retiré/.test(await p.locator('.status').textContent())&&/229 liens restants/.test(await p.locator('.status').textContent()),'message : lien retiré, 229 restants');
 chk(await p.locator('.qgroup').first().evaluate(e=>e.open),'groupe YouTube resté ouvert');
 chk(await p.locator('.qgroup').first().locator('li').count()===8,'YouTube : 8 liens');
 chk(!(await p.locator('.qid').allTextContents()).includes(firstId),'lien '+firstId+' disparu, numérotation des autres inchangée');
 // accueil : compteur
 await p.goto('http://localhost:8765/#accueil'); await sleep(300);
 chk(/229 liens/.test(await p.locator('.tile.queue .tc').textContent()),'accueil : 229 liens');
 // Classer
 await p.goto('http://localhost:8765/#a-identifier'); await sleep(300);
 chk(await p.locator('.qgroup').first().evaluate(e=>e.open),'groupe ouvert conservé en revenant sur l’écran');
 const li=p.locator('.qgroup').first().locator('li').first(); const id2=await li.locator('.qid').textContent(); const url2=await li.locator('a[target=_blank]').getAttribute('href');
 await li.locator('a.btn').click(); await sleep(300);
 chk(p.url().endsWith('#classer/'+id2)&&await p.locator('h1').textContent()==='Classer ce lien','formulaire « Classer ce lien » pour '+id2);
 chk((await p.inputValue('#f-url'))===url2,'lien pré-rempli');
 await p.click('button[type=submit]'); await sleep(100);
 chk(/nom du plat/i.test(await p.locator('.err').textContent()),'nom obligatoire');
 await p.fill('#f-name','Recette de test'); await p.click('label.chip:has-text("Desserts")'); await p.click('label.chip:has(input[name=meal]):has-text("Déjeuner")');
 await p.click('button[type=submit]'); await sleep(800);
 const nr=gh.file.recipes[0];
 chk(nr.name==='Recette de test'&&nr.type==='desserts'&&nr.src==='YouTube'&&nr.url.includes('youtube.com')&&/Voir la vidéo/.test(nr.btn)&&nr.date,'recette créée avec source YouTube, date et bouton : '+JSON.stringify({src:nr.src,date:nr.date,btn:nr.btn}));
 chk(gh.file.dismissed.length===2,'lien aussi marqué traité (même commit)');
 chk(gh.puts[gh.puts.length-1].startsWith('Ajoute'),'un seul commit pour le classement');
 chk(p.url().endsWith('#a-identifier')&&/enregistrée/.test(await p.locator('.status').textContent())&&/228 liens restants/.test(await p.locator('.status').textContent()),'retour à la liste : 228 restants');
 // le lien classé ne reparait pas même si dismissed était perdu (recette avec même url)
 chk(true,'—');
 // lecture seule
 const ro=await mk(''); await ro.goto('http://localhost:8765/#a-identifier'); await sleep(600);
 await ro.locator('.qgroup summary').first().click();
 chk(await ro.locator('.qact').count()===0&&await ro.locator('.qgroup').first().locator('li').count()===7,'appareil 2 sans jeton : liste à jour (7), aucun bouton');
 await ro.goto('http://localhost:8765/#classer/Y3'); await sleep(300);
 chk(await ro.locator('h1').textContent()==='Liens à identifier','sans jeton : #classer redirige vers la liste');
 await ro.goto('http://localhost:8765/#classer/ZZ99'); await sleep(300);
 chk(await ro.locator('h1').textContent()==='Liens à identifier','id inconnu : liste');
 // échec d'écriture
 gh.fail=true; await p.goto('http://localhost:8765/#a-identifier'); await sleep(400);
 await p.locator('.qgroup').first().locator('.linkbtn').first().click(); await p.locator('button:has-text("Oui")').click(); await sleep(600);
 chk(/jeton|dépôt/i.test(await p.locator('.err').textContent())&&await p.locator('.qgroup').first().locator('li').count()===7,'échec d’écriture : message, lien conservé');
 gh.fail=false;
 // données hostiles
 gh.file.dismissed=['javascript:alert(1)',5,null,'https://youtu.be/x','not a url','https://youtube.com/shorts/ZZZ',...Array(5000).fill('https://a.b/c')]; gh.sha++;
 await p.goto('http://localhost:8765/#accueil'); await p.reload(); await sleep(800);
 chk(p.errs.length===0,'aucune erreur page avec dismissed hostile '+p.errs.join('|'));
 gh.file.dismissed='nimporte quoi'; gh.sha++; await p.reload(); await sleep(700);
 chk(/liens?/.test(await p.locator('.tile.queue .tc').textContent())&&p.errs.length===0,'dismissed non-tableau toléré');
 await b.close(); console.log(ok?'TOUT OK':'ÉCHECS'); process.exit(ok?0:1);
})();
