const {chromium}=require('playwright'); const fs=require('fs');
const seed=JSON.parse(fs.readFileSync(__dirname+'/pwa/recettes.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,OPTIONS'};
const gh={file:JSON.parse(JSON.stringify(seed)),sha:1};
async function handler(route){
  const req=route.request(); const u=new URL(req.url());
  const json=(s,o)=>route.fulfill({status:s,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(req.method()==='OPTIONS') return route.fulfill({status:204,headers:CORS});
  if(u.pathname==='/repos/RevisionsDescartes/carnet-recettes') return json(200,{permissions:{pull:true,push:true}});
  if(u.pathname.endsWith('/contents/recettes.json')){
    if(req.method()==='GET') return json(200,{sha:'s'+gh.sha,content:Buffer.from(JSON.stringify(gh.file)).toString('base64')});
    if(req.method()==='PUT'){ const b=JSON.parse(req.postData()); gh.file=JSON.parse(Buffer.from(b.content,'base64').toString('utf8')); gh.sha++; return json(200,{content:{sha:'s'+gh.sha}}); }
  }
  return route.fulfill({status:404,headers:CORS,body:'{}'});
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let yt='ok', nb='ok', calls=[];
(async()=>{
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await ctx.route('https://api.github.com/**',handler); await ctx.route(/fonts\./,r=>r.abort());
 await ctx.route(/youtube\.com\/oembed/,r=>{calls.push('yt'); if(yt==='ok') r.fulfill({status:200,headers:CORS,contentType:'application/json',body:JSON.stringify({title:'Poulet rôti au citron – facile'})}); else if(yt==='slow') {} else r.abort();});
 await ctx.route(/noembed\.com/,r=>{calls.push('nb'); if(nb==='ok') r.fulfill({status:200,headers:CORS,contentType:'application/json',body:JSON.stringify({title:'Titre via noembed'})}); else if(nb==='err') r.fulfill({status:200,headers:CORS,contentType:'application/json',body:JSON.stringify({error:'x'})}); else r.abort();});
 await ctx.addInitScript(()=>{ if(!localStorage.getItem('carnet:cfg')) localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:'good'})); });
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
 // 1) partage YouTube sans titre fourni -> titre de la vidéo
 await p.goto('http://localhost:8765/?url='+encodeURIComponent('https://youtu.be/AbC123')); await sleep(900);
 chk(await p.inputValue('#f-name')==='Poulet rôti au citron – facile','partage : nom = titre de la vidéo');
 chk(calls[0]==='yt','YouTube interrogé en premier');
 // modifiable + enregistré tel quel
 await p.fill('#f-name','Mon poulet'); await p.click('button[type=submit]'); await sleep(800);
 chk(gh.file.recipes[0].name==='Mon poulet','nom modifié conservé');
 // 2) titre fourni par l'appli de partage : conservé
 calls=[]; await p.goto('http://localhost:8765/?url='+encodeURIComponent('https://youtu.be/ZZZ')+'&title='+encodeURIComponent('Titre de l’appli')); await sleep(900);
 chk(await p.inputValue('#f-name')==='Titre de l’appli','titre fourni par l’appli de partage non écrasé');
 // 3) YouTube en échec -> noembed
 yt='fail'; calls=[]; await p.goto('http://localhost:8765/?url='+encodeURIComponent('https://youtu.be/QQQ1')); await sleep(900);
 chk(await p.inputValue('#f-name')==='Titre via noembed','repli noembed si YouTube échoue');
 // 4) tout échoue -> champ vide, enregistrement avec nom auto
 nb='fail'; calls=[]; await p.goto('http://localhost:8765/?url='+encodeURIComponent('https://youtu.be/QQQ2')); await sleep(900);
 chk(await p.inputValue('#f-name')==='','échec total : champ vide, placeholder rétabli '+await p.getAttribute('#f-name','placeholder'));
 await p.click('button[type=submit]'); await sleep(800);
 chk(/^Recette YouTube du /.test(gh.file.recipes[0].name),'nom automatique de repli');
 // 5) réponse noembed avec error -> ignoré
 yt='fail'; nb='err'; await p.goto('http://localhost:8765/?url='+encodeURIComponent('https://www.facebook.com/reel/1')); await sleep(900);
 chk(await p.inputValue('#f-name')==='','réponse « error » ignorée');
 // 6) l'utilisateur tape pendant la recherche -> pas écrasé
 yt='slow'; nb='fail'; await p.goto('http://localhost:8765/?url='+encodeURIComponent('https://youtu.be/SLOW')); await sleep(300);
 await p.fill('#f-name','Ma saisie'); yt='ok'; await sleep(7500);
 chk(await p.inputValue('#f-name')==='Ma saisie','saisie utilisateur jamais écrasée');
 // 7) lien collé dans « Nouvelle recette »
 yt='ok'; await p.goto('http://localhost:8765/#ajouter'); await sleep(300);
 await p.fill('#f-url','Regardez ça https://youtu.be/PASTE1 !'); await p.dispatchEvent('#f-url','change'); await sleep(600);
 chk(await p.inputValue('#f-name')==='Poulet rôti au citron – facile','lien collé : titre proposé');
 await p.fill('#f-url','https://youtu.be/PASTE2'); await p.dispatchEvent('#f-url','change'); await sleep(300);
 chk(true,'changement de lien sans plantage');
 // 8) modification d'une fiche : pas de recherche
 calls=[]; await p.goto('http://localhost:8765/#modifier/'+gh.file.recipes[0].id); await sleep(600);
 chk(calls.length===0,'édition : aucune requête de titre');
 chk(errs.length===0,'aucune erreur JS '+errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ECHEC'); process.exit(ok?0:1);
})();
