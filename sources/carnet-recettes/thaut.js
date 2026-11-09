const {chromium}=require('playwright'); const fs=require('fs');
const seed=JSON.parse(fs.readFileSync(__dirname+'/pwa/recettes.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,OPTIONS'};
const gh={file:JSON.parse(JSON.stringify(seed)),sha:1,fail:false,puts:0};
async function handler(route){
  const req=route.request(); const u=new URL(req.url());
  const json=(s,o)=>route.fulfill({status:s,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(req.method()==='OPTIONS') return route.fulfill({status:204,headers:CORS});
  if(u.pathname==='/repos/RevisionsDescartes/carnet-recettes') return json(200,{permissions:{pull:true,push:true}});
  if(u.pathname.endsWith('/contents/recettes.json')){
    if(req.method()==='GET') return json(200,{sha:'s'+gh.sha,content:Buffer.from(JSON.stringify(gh.file)).toString('base64')});
    if(req.method()==='PUT'){ if(gh.fail) return json(500,{message:'boom'}); const b=JSON.parse(req.postData()); gh.file=JSON.parse(Buffer.from(b.content,'base64').toString('utf8')); gh.sha++; gh.puts++; return json(200,{content:{sha:'s'+gh.sha}}); }
  }
  return route.fulfill({status:404,headers:CORS,body:'{}'});
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await ctx.route('https://api.github.com/**',handler); await ctx.route(/fonts\.|youtube\.com\/oembed|noembed/,r=>r.abort());
 await ctx.addInitScript(()=>{ localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:'good'})); });
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://localhost:8765/#ajouter/plats'); await sleep(500);
 chk(await p.locator('button[type=submit]').count()===2,'deux boutons d’enregistrement');
 const pos=await p.evaluate(()=>{const bs=[...document.querySelectorAll('button[type=submit]')].map(b=>b.getBoundingClientRect().top+scrollY); return bs;});
 chk(pos[0]<400&&pos[1]>1200,'un en haut ('+Math.round(pos[0])+') et un en bas ('+Math.round(pos[1])+')');
 chk((await p.locator('button[type=submit]').allTextContents()).every(t=>t==='Enregistrer la recette'),'même libellé');
 // validation depuis le haut : nom manquant, un type choisi sans lien
 await p.locator('button[type=submit]').first().click(); await sleep(300);
 chk(/Indiquez le nom du plat/.test(await p.locator('.perr').first().textContent()),'erreur visible en haut aussi : '+await p.locator('.perr').first().textContent());
 // enregistrer depuis le bouton du haut
 await p.fill('#f-name','Poulet citron'); await p.locator('button[type=submit]').first().click(); await sleep(900);
 chk(gh.file.recipes[0].name==='Poulet citron'&&gh.file.recipes[0].type==='plats','enregistrement via le bouton du haut');
 // enregistrer depuis le bas
 await p.goto('http://localhost:8765/#accueil'); await p.goto('http://localhost:8765/#ajouter/plats'); await sleep(500);
 await p.fill('#f-name','Gratin'); await p.locator('button[type=submit]').last().click(); await sleep(900);
 chk(gh.file.recipes[0].name==='Gratin','enregistrement via le bouton du bas');
 // un seul envoi même après double clic
 const n0=gh.puts;
 await p.goto('http://localhost:8765/#accueil'); await p.goto('http://localhost:8765/#ajouter/plats'); await sleep(500);
 await p.fill('#f-name','Double'); await p.locator('button[type=submit]').first().dblclick(); await sleep(900);
 chk(gh.puts-n0===1,'un seul enregistrement malgré le double clic ('+(gh.puts-n0)+')');
 // échec d'écriture : boutons réactivés, message visible
 gh.fail=true; await p.goto('http://localhost:8765/#accueil'); await p.goto('http://localhost:8765/#ajouter/plats'); await sleep(500);
 await p.fill('#f-name','Echec'); await p.locator('button[type=submit]').first().click(); await sleep(1500);
 chk(await p.locator('button[type=submit]').first().isEnabled()&&await p.locator('button[type=submit]').last().isEnabled(),'boutons réactivés après échec');
 chk((await p.locator('.perr').first().textContent()).length>3,'message d’échec relayé en haut');
 // modification
 gh.fail=false; await p.goto('http://localhost:8765/#modifier/'+gh.file.recipes[0].id); await sleep(500);
 chk(await p.locator('button[type=submit]').count()===2&&(await p.locator('button[type=submit]').allTextContents()).every(t=>t==='Enregistrer les modifications'),'modification : deux boutons « Enregistrer les modifications »');
 // astuce : libellé suit les deux boutons
 await p.goto('http://localhost:8765/#accueil'); await p.goto('http://localhost:8765/#ajouter/brico'); await sleep(500);
 chk((await p.locator('button[type=submit]').allTextContents()).every(t=>t==='Enregistrer l’astuce'),'astuce : les deux boutons changent de libellé');
 chk(errs.length===0,'aucune erreur JS '+errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ECHEC'); process.exit(ok?0:1);
})();
