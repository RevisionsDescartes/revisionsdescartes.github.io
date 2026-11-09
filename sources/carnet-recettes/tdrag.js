const {chromium}=require('playwright');
const SP=__dirname+'/';
const seed=JSON.parse(require('fs').readFileSync(SP+'pwa/recettes.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const gh={file:{recipes:seed.recipes},sha:1,puts:[],offline:false,fail:false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,OPTIONS'};
async function handler(route){
  const req=route.request(); const u=new URL(req.url());
  const json=(s,o)=>route.fulfill({status:s,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(gh.offline) return route.abort('internetdisconnected');
  if(req.method()==='OPTIONS') return route.fulfill({status:204,headers:CORS});
  if(u.pathname.endsWith('/contents/recettes.json')){
    if(req.method()==='GET') return json(200,{sha:'s'+gh.sha,content:Buffer.from(JSON.stringify(gh.file)).toString('base64')});
    if(gh.fail) return json(403,{message:'denied'});
    const b=JSON.parse(req.postData()); if(b.sha!=='s'+gh.sha) return json(409,{message:'sha'});
    gh.file=JSON.parse(Buffer.from(b.content,'base64').toString()); gh.sha++; gh.puts.push(b.message); return json(200,{content:{sha:'s'+gh.sha}});
  }
  return json(200,{permissions:{push:true}});
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const names=async p=>(await p.locator('.tiles .tile .tn').allTextContents()).map(x=>x.replace(/­/g,''));
async function touchDrag(cdp,from,to,hold=450){
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:from.x,y:from.y}]});
  await sleep(hold);
  const n=8; for(let i=1;i<=n;i++){ await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from.x+(to.x-from.x)*i/n,y:from.y+(to.y-from.y)*i/n}]}); await sleep(30); }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
}
const center=async(p,sel)=>{const r=await p.locator(sel).first().boundingBox();return {x:r.x+r.width/2,y:r.y+r.height/2}};
(async()=>{
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});
 await ctx.addInitScript(()=>{localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:'good'}))});
 await ctx.route('https://api.github.com/**',handler); await ctx.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://localhost:8765/'); await sleep(600);
 const base=await names(p); console.log(base.join(' | '));
 chk(base[0]==='Plats'&&base[1]==='Accompagnements','ordre initial: Plats, Accompagnements');
 await p.click('text=Réorganiser les types'); await sleep(150);
 chk(await p.locator('.tile[data-type]').count()===13&&await p.locator('.tile.queue').count()===0,'mode réorganiser: 13 tuiles déplaçables');
 chk(await p.locator('a.tile').count()===0,'tuiles non cliquables (pas de navigation)');
 const cdp=await ctx.newCDPSession(p);
 // 1. tactile: Soupes (index 4) -> position de Plats (index 0)
 const from=await center(p,'.tile[data-type="soupes"]'), to=await center(p,'.tile[data-type="plats"]');
 await touchDrag(cdp,from,{x:to.x-30,y:to.y-20}); await sleep(1200);
 let n=await names(p); console.log(n.join(' | '));
 chk(n[0]==='Soupes'&&n[1]==='Plats'&&n[2]==='Accompagnements','tactile: Soupes passe en tête');
 chk(gh.file.typeOrder&&gh.file.typeOrder[0]==='soupes'&&gh.file.typeOrder.length===13,'ordre enregistré dans le dépôt (typeOrder)');
 chk(gh.puts[gh.puts.length-1]==='Réorganise les types','message de commit');
 chk(/Ordre enregistré/.test(await p.locator('.status').first().textContent()),'confirmation affichée');
 // 2. appui court = pas de déplacement
 const before=(await names(p)).join();
 await touchDrag(cdp,await center(p,'.tile[data-type="salades"]'),{x:100,y:700},80); await sleep(400);
 chk((await names(p)).join()===before,'glissement sans appui long: rien ne bouge');
 // 3. clavier
 await p.focus('.tile[data-type="desserts"]'); await p.keyboard.press('ArrowLeft'); await p.keyboard.press('ArrowLeft'); await sleep(1300);
 n=await names(p); chk(n.indexOf('Desserts')===n.length-3||n.indexOf('Desserts')<n.length-1,'clavier: Desserts remonte'); 
 chk(gh.file.typeOrder.indexOf('desserts')===n.indexOf('Desserts'),'clavier: ordre enregistré identique à l\'écran');
 // 4. terminé + navigation normale
 await p.click('text=Terminé'); await sleep(150);
 chk(await p.locator('a.tile').count()===14,'après Terminé: tuiles de nouveau cliquables');
 // 5. autre appareil: voit le nouvel ordre
 const ctx2=await b.newContext({viewport:{width:390,height:844}}); await ctx2.route('https://api.github.com/**',handler); await ctx2.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 const p2=await ctx2.newPage(); await p2.goto('http://localhost:8765/'); await sleep(700);
 n=await names(p2); chk(n[0]==='Soupes','appareil 2 (sans jeton): voit l\'ordre du dépôt');
 chk(await p2.locator('text=Réorganiser les types').count()===0,'appareil 2: pas de bouton réorganiser');
 // 6. formulaire: même ordre
 await p.goto('http://localhost:8765/#ajouter'); await sleep(300);
 const chips=(await p.locator('.chip .cb span:not(.ic-box)').allTextContents()).map(x=>x.replace(/­/g,''));
 chk(chips[0]==='Soupes','formulaire: types dans le même ordre');
 // 7. échec d'écriture: retour à l'ordre précédent + message
 await p.goto('http://localhost:8765/'); await sleep(500); await p.click('text=Réorganiser les types'); await sleep(150);
 gh.fail=true; const f2=await center(p,'.tile[data-type="tajines"]'), t2=await center(p,'.tile[data-type="soupes"]');
 const o0=(await names(p)).join();
 await touchDrag(cdp,f2,{x:t2.x-30,y:t2.y-20}); await sleep(1500);
 chk(/ne peut pas écrire/.test(await p.locator('.err').first().textContent()),'échec: message d\'erreur');
 chk((await names(p)).join()===o0,'échec: ordre précédent restauré');
 gh.fail=false;
 // 8. souris
 const ctx3=await b.newContext({viewport:{width:390,height:1400}}); await ctx3.addInitScript(()=>{localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:'good'}))});
 await ctx3.route('https://api.github.com/**',handler); await ctx3.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 const p3=await ctx3.newPage(); await p3.goto('http://localhost:8765/'); await sleep(600); await p3.click('text=Réorganiser les types'); await sleep(150);
 const m0=await names(p3); const a=await center(p3,'.tile[data-type="snacks"]'), c=await center(p3,'.tile[data-type="plats"]');
 await p3.mouse.move(a.x,a.y); await p3.mouse.down(); await p3.mouse.move(a.x-20,a.y-20,{steps:3}); await p3.mouse.move(c.x,c.y,{steps:8}); await p3.mouse.up(); await sleep(1200);
 n=await names(p3); chk(n.indexOf('Snacks & apéro')<m0.indexOf('Snacks & apéro'),'souris: Snacks remonte');
 chk(gh.file.typeOrder.indexOf('snacks')===n.indexOf('Snacks & apéro'),'souris: ordre enregistré');
 // recettes intactes
 chk(gh.file.recipes.length===18,'les 18 recettes sont conservées dans le fichier');
 await p3.screenshot({path:SP+'n10-reorder.png',fullPage:false});
 console.log('erreurs page:',JSON.stringify(errs));
 await b.close(); process.exit(ok&&!errs.length?0:1);
})();
