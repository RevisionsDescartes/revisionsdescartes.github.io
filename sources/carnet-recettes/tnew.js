const {chromium}=require('playwright'); const fs=require('fs');
const seed=JSON.parse(fs.readFileSync(__dirname+'/pwa/recettes.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,OPTIONS'};
const gh={file:JSON.parse(JSON.stringify(seed)),sha:1,puts:[],fail:false};
gh.file.recipes.push({id:'poulet-citron',name:'Poulet rôti au citron',type:'plats',ing:['1 poulet','2 citrons','thym'],steps:['Cuire'],lvl:'complete',status:'favorite',meals:['dejeuner']});
gh.file.recipes.push({id:'gateau-noix',name:'Gâteau aux noix',type:'desserts',ing:['noix','sucre'],lvl:'complete',status:'testee'});
async function handler(route){
  const req=route.request(); const u=new URL(req.url());
  const json=(s,o)=>route.fulfill({status:s,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(req.method()==='OPTIONS') return route.fulfill({status:204,headers:CORS});
  if(u.pathname==='/repos/RevisionsDescartes/carnet-recettes') return json(200,{permissions:{pull:true,push:true}});
  if(u.pathname.endsWith('/contents/recettes.json')){
    if(req.method()==='GET') return json(200,{sha:'s'+gh.sha,content:Buffer.from(JSON.stringify(gh.file)).toString('base64')});
    if(req.method()==='PUT'){ if(gh.fail) return json(403,{message:'x'}); const b=JSON.parse(req.postData()); gh.file=JSON.parse(Buffer.from(b.content,'base64').toString('utf8')); gh.sha++; gh.puts.push(b.message); return json(200,{content:{sha:'s'+gh.sha}}); }
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
 const go=async h=>{ await p.goto('http://localhost:8765/'+h); await sleep(500); };
 // ===== RECHERCHE
 await go('#accueil');
 chk(await p.locator('#q').count()===1,'champ de recherche présent');
 await p.fill('#q','thym'); await sleep(150);
 chk(await p.locator('.results .row').count()===1&&/Poulet rôti/.test(await p.locator('.results .rn').textContent()),'recherche par ingrédient (thym) → Poulet rôti');
 chk(await p.locator('.homebody').isHidden(),'tuiles masquées pendant la recherche');
 await p.fill('#q','POULET Rôti'); await sleep(100);
 chk(await p.locator('.results .row').count()>=1,'insensible à la casse');
 await p.fill('#q','gateau noix'); await sleep(100);
 chk(await p.locator('.results .row').count()===1,'sans accents : « gateau noix » trouve « Gâteau aux noix »');
 await p.fill('#q','favorite'); await sleep(100);
 chk(await p.locator('.results .rn').allTextContents().then(a=>a.join())==='Poulet rôti au citron','recherche par statut (favorite)');
 await p.fill('#q','dejeuner'); await sleep(100);
 chk(await p.locator('.results .rn').allTextContents().then(a=>a.includes('Poulet rôti au citron')),'recherche par repas');
 await p.fill('#q','zzzz'); await sleep(100);
 chk(/Aucun résultat/.test(await p.locator('.results').textContent()),'aucun résultat : message');
 await p.fill('#q','noix sucre'); await sleep(100);
 chk(await p.locator('.results .row').count()===1,'plusieurs mots : tous doivent correspondre');
 await p.fill('#q','<img src=x onerror=alert(1)>'); await sleep(100);
 chk(await p.locator('img').count()===0,'requête hostile sans effet');
 await p.fill('#q','gateau noix'); await sleep(100);
 await p.locator('.results .row').click(); await sleep(300);
 chk(/Gâteau/.test(await p.locator('h1').textContent())&&/Recherche/.test(await p.locator('a.back').textContent()),'fiche ouverte depuis la recherche : retour « Recherche »');
 await p.click('a.back'); await sleep(300);
 chk(await p.inputValue('#q')==='gateau noix'&&await p.locator('.results .row').count()===1,'retour : requête et résultats conservés');
 await p.fill('#q',''); await sleep(100);
 chk(await p.locator('.homebody').isVisible()&&await p.locator('.results').isHidden(),'requête effacée : tuiles de retour');
 // ===== À TRAITER
 chk(/À traiter/.test(await p.locator('.tile.queue .tn').textContent())&&/liens/.test(await p.locator('.tile.queue .tc').textContent())&&/recettes/.test(await p.locator('.tile.queue .tc').textContent()),'tuile « À traiter » : '+await p.locator('.tile.queue .tc').textContent());
 await p.click('.tile.queue'); await sleep(300);
 chk(p.url().endsWith('#a-traiter')&&await p.locator('.todo').count()===4,'écran À traiter : 4 rubriques');
 const cnts=await p.locator('.todo .cnt').allTextContents(); console.log('   compteurs',cnts.join('|'));
 chk(cnts[0]==='230','liens à identifier : 230');
 await p.locator('.todo').nth(3).click(); await sleep(300);
 chk(p.url().endsWith('#a-completer')&&/À compléter/.test(await p.locator('h1').textContent())&&await p.locator('.row').count()>=1,'À compléter : liste');
 chk(!(await p.locator('.rn').allTextContents()).includes('Poulet rôti au citron'),'recette complète exclue de À compléter');
 await p.locator('.row').first().click(); await sleep(300);
 chk(/À compléter/.test(await p.locator('a.back').textContent()),'fiche depuis À compléter : retour À compléter');
 await go('#a-identifier');
 chk(/À traiter/.test(await p.locator('a.back').textContent()),'liens à identifier : retour vers À traiter');
 // ===== STATUT
 await go('#poulet-citron');
 chk(/★ Favorite/.test(await p.locator('.meta').textContent()),'fiche : tag ★ Favorite');
 chk(await p.locator('.statusrow button.on').textContent()==='★ Favorite','boutons de statut : Favorite actif');
 await p.locator('.statusrow button:has-text("Testée")').click(); await sleep(700);
 chk(gh.file.recipes.find(r=>r.id==='poulet-citron').status==='testee'&&gh.puts[gh.puts.length-1].startsWith('Statut'),'statut changé en un clic et enregistré');
 await p.locator('.statusrow button:has-text("Testée")').click(); await sleep(700);
 chk(gh.file.recipes.find(r=>r.id==='poulet-citron').status==='','re-clic : statut retiré');
 await p.locator('.statusrow button:has-text("À essayer")').click(); await sleep(700);
 // filtre
 await go('#plats');
 chk(await p.locator('.fbar').count()===1,'barre de filtre visible (des statuts existent)');
 await p.locator('.fbar button:has-text("À essayer")').click(); await sleep(200);
 chk(await p.locator('.row').count()===1&&/1 sur \d+ recettes/.test(await p.locator('.banner .sub').textContent()),'filtre À essayer dans Plats : 1 ligne, « 1 sur N »');
 chk(await p.locator('.row .schip').count()===1,'puce de statut dans la ligne');
 await p.locator('.fbar button:has-text("Favorites")').click(); await sleep(200);
 chk(await p.locator('.emptybox').count()===1,'filtre sans résultat : message');
 await p.locator('.emptybox button').click(); await sleep(200);
 chk(await p.locator('.row').count()>=3,'« Voir toutes » : liste complète');
 await go('#repas/dejeuner');
 await p.locator('.fbar button:has-text("À essayer")').click(); await sleep(200);
 chk(await p.locator('.row').count()===1,'filtre actif aussi dans la vue repas');
 await p.locator('.fbar button:has-text("Toutes")').click();
 // formulaire : statut par défaut selon le lien
 await go('#ajouter');
 chk(await p.locator('input[name=status][value=""]').isChecked(),'formulaire : statut Aucun par défaut');
 await p.fill('#f-url','https://youtu.be/xyz'); await sleep(100);
 chk(await p.locator('input[name=status][value=essayer]').isChecked(),'lien collé : À essayer pré-coché');
 await p.locator('label.chip:has(input[name=status][value=testee])').click();
 await p.fill('#f-url',''); await sleep(100); await p.fill('#f-url','https://youtu.be/abc'); await sleep(100);
 chk(await p.locator('input[name=status][value=testee]').isChecked(),'choix manuel du statut non écrasé par le lien');
 await p.click('button[type=submit]'); await sleep(800);
 chk(gh.file.recipes[0].status==='testee','statut choisi enregistré');
 // ===== PARTAGE
 await p.goto('http://localhost:8765/?title='+encodeURIComponent('Super tajine de poulet')+'&text='+encodeURIComponent('Super tajine de poulet https://youtu.be/SHARE1')+'&url='+encodeURIComponent('https://youtu.be/SHARE1')); await sleep(600);
 chk(p.url().endsWith('/#partage')&&/Ajouter ce lien/.test(await p.locator('h1').textContent()),'partage : formulaire « Ajouter ce lien », adresse nettoyée');
 chk(await p.inputValue('#f-url')==='https://youtu.be/SHARE1'&&await p.inputValue('#f-name')==='Super tajine de poulet','partage : lien et nom pré-remplis');
 chk(await p.locator('input[name=status][value=essayer]').isChecked(),'partage : À essayer par défaut');
 await p.click('button[type=submit]'); await sleep(800);
 let r=gh.file.recipes[0];
 chk(r.name==='Super tajine de poulet'&&r.type==='aclasser'&&r.url==='https://youtu.be/SHARE1'&&r.status==='essayer','partage : recette créée dans À classer, À essayer');
 // lien seulement dans text (Facebook)
 await p.goto('http://localhost:8765/?text='+encodeURIComponent('Regardez ça : https://www.facebook.com/reel/999.')); await sleep(600);
 chk(await p.inputValue('#f-url')==='https://www.facebook.com/reel/999','partage : lien extrait de « text » (point final retiré)');
 chk(await p.inputValue('#f-name')==='Regardez ça','partage : nom déduit du texte');
 // texte trop long : pas de nom
 await p.goto('http://localhost:8765/?text='+encodeURIComponent('x'.repeat(200)+' https://a.example/r')); await sleep(600);
 chk(await p.inputValue('#f-name')==='','partage : texte trop long ignoré comme nom');
 // rechargement de #partage : formulaire vide, pas d'erreur
 await p.reload(); await sleep(500);
 chk(await p.inputValue('#f-url')==='','rechargement : formulaire vierge');
 // lien hostile
 await p.goto('http://localhost:8765/?url='+encodeURIComponent('javascript:alert(1)')+'&title='+encodeURIComponent('<script>x</script>')); await sleep(600);
 chk(await p.inputValue('#f-url')===''&&await p.locator('script:not([src])').count()>=0,'partage : javascript: non repris');
 // manifest
 const man=await (await ctx.request.get('http://localhost:8765/manifest.json')).json();
 chk(man.share_target&&man.share_target.method==='GET'&&man.share_target.params.url==='url'&&man.share_target.action==='./','manifest : share_target déclaré');
 chk(errs.length===0,'aucune erreur page '+errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ÉCHECS'); process.exit(ok?0:1);
})();
