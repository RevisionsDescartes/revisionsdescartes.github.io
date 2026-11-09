const {chromium}=require('playwright'); const fs=require('fs');
const seed=JSON.parse(fs.readFileSync(__dirname+'/pwa/recettes.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,OPTIONS'};
const gh={file:JSON.parse(JSON.stringify(seed)),sha:1};
async function handler(route){
  const req=route.request(); const u=new URL(req.url());
  const json=(s,o)=>route.fulfill({status:s,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(req.method()==='OPTIONS') return route.fulfill({status:204,headers:CORS});
  if(u.pathname.endsWith('/contents/recettes.json')&&req.method()==='GET') return json(200,{sha:'s'+gh.sha,content:Buffer.from(JSON.stringify(gh.file)).toString('base64')});
  return route.fulfill({status:404,headers:CORS,body:'{}'});
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch();
 const mk=async(token)=>{const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block'});
  await ctx.route('https://api.github.com/**',handler); await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(t=>{ if(!localStorage.getItem('carnet:cfg')) localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:t})); },token);
  const p=await ctx.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(String(e))); p.go=async h=>{await p.goto('http://localhost:8765/'+h); await sleep(500);}; return p;};
 const bottomGap=async p=>p.evaluate(()=>{const r=document.querySelector('.bar').getBoundingClientRect(); return {visible:!document.querySelector('.bar').hidden, gap:Math.round(innerHeight-r.bottom)};});
 const p=await mk('good');
 await p.go('#accueil');
 let g=await bottomGap(p);
 chk(g.visible&&g.gap===0,'accueil : barre collée au bas de l’écran');
 chk(await p.locator('.bar #q').count()===1&&await p.locator('.bar a.btn[href="#ajouter"]').count()===1,'accueil : recherche et bouton Ajouter dans la barre');
 chk(await p.locator('#view a.btn[href="#ajouter"]').count()===0&&await p.locator('#view #q').count()===0,'accueil : plus de bouton ni de champ dans la page');
 const sameRow=await p.evaluate(()=>{const a=document.querySelector('.bar #q').getBoundingClientRect(),b=document.querySelector('.bar a.btn').getBoundingClientRect();return Math.abs((a.top+a.bottom)/2-(b.top+b.bottom)/2)<4&&a.right<=b.left;});
 chk(sameRow,'recherche et bouton côte à côte');
 await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight)); await sleep(100);
 g=await bottomGap(p); chk(g.gap===0,'après défilement : toujours en bas');
 const lastVisible=await p.evaluate(()=>{const bar=document.querySelector('.bar').getBoundingClientRect(); const f=document.querySelector('.foot').getBoundingClientRect(); return f.bottom<=bar.top+1;});
 chk(lastVisible,'bas de page (Réglages) non masqué par la barre');
 // recherche depuis la barre
 await p.fill('#q','tenders'); await sleep(150);
 chk(await p.locator('.results .row').count()>=1&&await p.locator('.bar').isVisible(),'recherche depuis la barre : résultats affichés, barre toujours là');
 // rafraîchissement pendant la saisie : le focus reste
 await p.focus('#q'); gh.file.recipes.push({id:'nouvelle-x',name:'Nouvelle X tenders',type:'plats'}); gh.sha++;
 await p.evaluate(()=>window.dispatchEvent(new Event('online'))); await sleep(700);
 chk(await p.evaluate(()=>document.activeElement&&document.activeElement.id==='q'),'rafraîchissement des données : focus conservé dans la recherche');
 chk(await p.locator('.results .row').count()>=2,'résultats mis à jour avec la nouvelle recette');
 await p.keyboard.press('Enter'); await sleep(100);
 chk(await p.evaluate(()=>document.activeElement.id!=='q'),'Entrée : ferme le clavier');
 // listes
 await p.go('#tajines'); g=await bottomGap(p);
 chk(g.gap===0&&/Ajouter à Tajines/.test(await p.locator('.bar a.btn').textContent())&&await p.locator('.bar #q').count()===0,'type : barre avec « + Ajouter à Tajines »');
 chk(await p.locator('#view a.btn').count()===0,'type : plus de bouton dans la page');
 await p.go('#repas/dejeuner'); chk(/Ajouter à Déjeuner/.test(await p.locator('.bar a.btn').textContent()),'repas Déjeuner : bouton en barre');
 await p.go('#repas/sans'); chk(/Ajouter une recette/.test(await p.locator('.bar a.btn').textContent()),'Sans repas : bouton Ajouter une recette en barre');
 await p.go('#aclasser'); chk(await p.locator('.bar a.btn').count()===1,'À classer : bouton en barre');
 // pas de barre ailleurs
 for(const h of ['#tenders','#ajouter','#a-traiter','#a-identifier','#a-completer','#reglages']){ await p.go(h); chk(await p.locator('.bar').isHidden(),'pas de barre sur '+h); }
 // clic réel sur le bouton de la barre
 await p.go('#accueil'); await p.locator('.bar a.btn').click(); await sleep(300);
 chk(p.url().endsWith('#ajouter'),'bouton Ajouter de la barre : ouvre le formulaire');
 // réorganisation
 await p.go('#accueil'); await p.locator('button.linkbtn').click(); await sleep(200);
 chk(await p.locator('.bar').isHidden(),'mode réorganisation : barre masquée');
 await p.locator('button.btn:has-text("Terminé")').click(); await sleep(200);
 chk(await p.locator('.bar').isVisible(),'après « Terminé » : barre revenue');
 // lecture seule
 const ro=await mk(''); await ro.go('#accueil');
 chk(await ro.locator('.bar #q').count()===1&&await ro.locator('.bar a.btn').count()===0,'lecture seule : recherche seule dans la barre');
 await ro.go('#tajines'); chk(await ro.locator('.bar').isHidden(),'lecture seule : pas de barre sur un type');
 // téléphone étroit (320 px)
 const nar=await b.newContext({viewport:{width:320,height:640},serviceWorkers:'block'}); await nar.route('https://api.github.com/**',handler); await nar.route(/fonts\./,r=>r.abort());
 await nar.addInitScript(()=>{localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:'x'}))});
 const np=await nar.newPage(); await np.goto('http://localhost:8765/#accueil'); await sleep(500);
 chk(await np.evaluate(()=>{const r=document.querySelector('.bar-in').getBoundingClientRect(); const i=document.querySelector('.bar #q').getBoundingClientRect(); return document.documentElement.scrollWidth<=innerWidth && i.width>=120 && r.right<=innerWidth;}),'320 px : pas de débordement, champ de recherche ≥ 120 px');
 chk(p.errs.length===0,'aucune erreur page '+p.errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ÉCHECS'); process.exit(ok?0:1);
})();
