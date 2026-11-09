const {chromium}=require('playwright');
const SP=__dirname+'/';
const seed=JSON.parse(require('fs').readFileSync(SP+'pwa/recettes.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
// API GitHub simulée
const gh={offline:false,exists:false,file:null,sha:0,conflictOnce:false,puts:[],log:[]};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,OPTIONS'};
function b64(o){return Buffer.from(JSON.stringify(o)).toString('base64')}
async function handler(route){
  const req=route.request(); const u=new URL(req.url()); const auth=req.headers()['authorization']||'';
  if(gh.offline) return route.abort('internetdisconnected');
  if(req.method()==='OPTIONS') return route.fulfill({status:204,headers:CORS});
  const json=(s,o)=>route.fulfill({status:s,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  gh.log.push(req.method()+' '+u.pathname);
  if(u.pathname==='/repos/RevisionsDescartes/carnet-recettes'){
    if(auth==='Bearer bad') return json(401,{message:'Bad credentials'});
    if(auth==='Bearer ro') return json(200,{permissions:{pull:true,push:false}});
    if(auth==='Bearer good') return json(200,{permissions:{pull:true,push:true}});
    return json(200,{});
  }
  if(u.pathname==='/repos/RevisionsDescartes/carnet-recettes/contents/recettes.json'){
    if(req.method()==='GET'){ if(!gh.exists) return json(404,{message:'Not Found'}); return json(200,{sha:'s'+gh.sha,content:Buffer.from(JSON.stringify(gh.file)).toString('base64')}); }
    if(req.method()==='PUT'){
      if(auth!=='Bearer good') return json(auth==='Bearer ro'?403:401,{message:'denied'});
      const b=JSON.parse(req.postData());
      if(gh.conflictOnce){ gh.conflictOnce=false; gh.file.recipes.unshift({id:'autre-appareil',name:'Ajout d\'un autre appareil',type:'plats'}); gh.sha++; return json(409,{message:'sha does not match'}); }
      if(gh.exists && b.sha!=='s'+gh.sha) return json(409,{message:'sha does not match'});
      gh.file=JSON.parse(Buffer.from(b.content,'base64').toString('utf8')); gh.exists=true; gh.sha++; gh.puts.push(b.message);
      return json(200,{content:{sha:'s'+gh.sha}});
    }
  }
  return route.fulfill({status:404,headers:CORS,body:'{}'});
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
 await ctx.route('https://api.github.com/**',handler); await ctx.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://localhost:8765/'); await sleep(500);
 chk(await p.locator('.tiles .tile').count()===14,'accueil 14 tuiles');
 chk(/introuvable/.test(await p.locator('.hint').first().textContent()),'dépôt absent: message + recettes intégrées');
 chk(await p.locator('a.btn').count()===0,'lecture seule: pas de bouton ajouter');
 chk(await p.locator('.sub').count()===0,'accueil : plus de phrase « choisissez un type de plat »');
 // réglages
 await p.click('a[href="#reglages"]'); await sleep(100);
 await p.fill('#c-tok','bad'); await p.click('button[type=submit]'); await sleep(300);
 chk(/refusé/.test(await p.locator('.err').textContent()),'jeton refusé: message');
 await p.fill('#c-tok','ro'); await p.click('button[type=submit]'); await sleep(300);
 chk(/ne peut pas y écrire/.test(await p.locator('.err').textContent()),'jeton lecture seule: message');
 await p.fill('#c-tok','good'); await p.click('button[type=submit]'); await sleep(400);
 chk(/Connexion réussie/.test(await p.locator('.status').first().textContent()),'jeton valide: connexion réussie');
 await p.goto('http://localhost:8765/#accueil'); await sleep(300);
 chk(await p.locator('a.btn[href="#ajouter"]').count()===1,'bouton ajouter visible avec jeton');
 // ajout (fichier absent -> création)
 await p.click('a.btn[href="#ajouter"]'); await sleep(100);
 await p.fill('#f-name','Couscous du vendredi'); await p.click('label.chip:has-text("Plats")');
 await p.fill('#f-ing','500 g de semoule\n1 kg de légumes'); await p.fill('#f-steps','1. Cuire les légumes.\n2. Gonfler la semoule.'); await p.fill('#f-tips','Servir chaud');
 await p.click('button[type=submit]'); await sleep(600);
 chk(gh.exists&&gh.file.recipes.length===19&&gh.file.recipes[0].name==='Couscous du vendredi','ajout: fichier créé, 19 recettes, en tête');
 chk(gh.puts[0]==='Ajoute : Couscous du vendredi','message de commit');
 chk(gh.file.recipes[0].steps[0]==='Cuire les légumes.'&&gh.file.recipes[0].tips[0]==='Servir chaud','étapes nettoyées, astuce');
 chk(await p.evaluate(()=>location.hash).then(h=>h.startsWith('#r-')),'redirection vers la fiche');
 chk(await p.locator('h1').first().textContent()==='Couscous du vendredi','fiche affichée');
 // modification d'une recette intégrée avec reprise sur conflit
 await p.goto('http://localhost:8765/#modifier/tortilla-oeufs'); await sleep(300);
 chk((await p.inputValue('#f-ing')).split('\n').length===3,'recette intégrée préremplie');
 await p.fill('#f-ing','Tortilla\n2 œufs\nEau\nFromage râpé');
 gh.conflictOnce=true;
 await p.click('button[type=submit]'); await sleep(900);
 const tor=gh.file.recipes.find(r=>r.id==='tortilla-oeufs');
 chk(tor.ing.length===4&&tor.lvl==='user'&&tor.ingNote===''&&tor.stepsNote!=='' ,'modif: liste changée, mention de fiabilité remise à zéro, note des étapes gardée');
 chk(gh.file.recipes.some(r=>r.id==='autre-appareil'),'conflit 409: ajout de l\'autre appareil conservé après nouvelle tentative');
 chk(gh.file.recipes.length===20,'20 recettes dans le dépôt');
 // suppression
 await p.goto('http://localhost:8765/#modifier/'+gh.file.recipes.find(r=>r.name==='Couscous du vendredi').id); await sleep(300);
 await p.click('.btn.danger'); await p.click('.confirm .btn.danger'); await sleep(700);
 chk(!gh.file.recipes.some(r=>r.name==='Couscous du vendredi')&&gh.file.recipes.length===19,'suppression écrite dans le dépôt');
 chk(gh.puts[gh.puts.length-1]==='Retire : Couscous du vendredi','message de commit suppression');
 // deuxième appareil: lecture seule sans jeton
 const ctx2=await b.newContext({viewport:{width:390,height:844}}); await ctx2.route('https://api.github.com/**',handler); await ctx2.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 const p2=await ctx2.newPage(); await p2.goto('http://localhost:8765/#tajines'); await sleep(600);
 chk(!(await p2.locator('a.btn').count()),'appareil 2: sans jeton, lecture seule');
 chk((await p2.locator('.rn').allTextContents()).length===2,'appareil 2: voit les données du dépôt ('+(await p2.locator('.rn').allTextContents()).join(' | ')+')');
 await p2.goto('http://localhost:8765/#plats'); await sleep(300);
 chk((await p2.locator('.rn').allTextContents()).includes("Ajout d'un autre appareil"),'appareil 2: voit l\'ajout fait ailleurs');
 // hors ligne
 gh.offline=true; await ctx2.setOffline(true); await p2.goto('http://localhost:8765/'); await sleep(500);
 chk(await p2.locator('.tiles .tile').count()===14&&/Hors connexion/.test(await p2.locator('.hint').first().textContent()),'hors ligne: dernière version + message');
 // écriture hors ligne sur appareil 1
 await ctx.setOffline(true); await p.goto('http://localhost:8765/#ajouter/plats'); await sleep(300);
 await p.fill('#f-name','Test hors ligne'); await p.click('button[type=submit]'); await sleep(500);
 chk(/Pas de connexion/.test(await p.locator('.err').textContent()),'écriture hors ligne: message clair');
 await ctx.setOffline(false); gh.offline=false;
 // jeton retiré / invalidé
 gh.conflictOnce=false;
 await p.evaluate(()=>{const c=JSON.parse(localStorage.getItem('carnet:cfg'));c.token='bad';localStorage.setItem('carnet:cfg',JSON.stringify(c))}); await p.reload(); await sleep(300);
 await p.goto('http://localhost:8765/#ajouter/plats'); await sleep(200);
 await p.fill('#f-name','Test jeton expiré'); await p.click('button[type=submit]'); await sleep(500);
 chk(/Jeton refusé/.test(await p.locator('.err').textContent()),'jeton expiré à l\'écriture: message');
 chk(!gh.file.recipes.some(r=>r.name==='Test jeton expiré'),'rien écrit');
 // données malveillantes dans le dépôt
 gh.file.recipes.push({id:'evil-1',name:'<img src=x onerror=window.__pwned=1>',type:'zzz',url:'javascript:alert(1)',ing:['<b>x</b>']},{id:'plats',name:'collision'},{id:'../x',name:'y'},{name:'sans id'});
 gh.sha++; await ctx2.setOffline(false); await p2.goto('http://localhost:8765/#aclasser'); await sleep(700);
 chk(await p2.evaluate(()=>!window.__pwned),'pas d\'exécution de HTML injecté');
 const names=await p2.locator('.rn').allTextContents(); chk(names.some(n=>n.startsWith('<img'))&&!names.includes('collision')&&!names.includes('y'),'entrées invalides ignorées, texte affiché comme texte');
 await p2.goto('http://localhost:8765/#evil-1'); await sleep(200);
 chk(await p2.locator('a.btn[target=_blank]').count()===0,'lien javascript: supprimé');
 console.log('requêtes API:',gh.log.length,'| erreurs page:',JSON.stringify(errs));
 await b.close(); process.exit(ok&&!errs.length?0:1);
})();
