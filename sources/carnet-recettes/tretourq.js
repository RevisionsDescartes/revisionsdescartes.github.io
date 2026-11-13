const {chromium}=require('playwright'); const fs=require('fs');
const seed=JSON.parse(fs.readFileSync(__dirname+'/pwa/recettes.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,OPTIONS'};
const gh={file:JSON.parse(JSON.stringify(seed)),sha:1};
async function handler(route){const req=route.request();const u=new URL(req.url());
 const json=(s,o)=>route.fulfill({status:s,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
 if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:CORS});
 if(u.pathname==='/repos/RevisionsDescartes/carnet-recettes')return json(200,{permissions:{pull:true,push:true}});
 if(u.pathname.endsWith('/contents/recettes.json')){
  if(req.method()==='GET')return json(200,{sha:'s'+gh.sha,content:Buffer.from(JSON.stringify(gh.file)).toString('base64')});
  if(req.method()==='PUT'){const b=JSON.parse(req.postData());gh.file=JSON.parse(Buffer.from(b.content,'base64').toString('utf8'));gh.sha++;return json(200,{content:{sha:'s'+gh.sha}});}}
 return route.fulfill({status:404,headers:CORS,body:'{}'});}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await ctx.route('https://api.github.com/**',handler);await ctx.route(/fonts\./,r=>r.abort());
 await ctx.addInitScript(()=>{ if(!localStorage.getItem('carnet:cfg')) localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:'good'}));});
 const p=await ctx.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(String(e)));
 await p.goto('http://localhost:8765/#a-identifier');await sleep(700);
 const grp=p.locator('.qgroup',{hasText:'Facebook 2025'});
 await grp.locator('summary').click();await sleep(100);
 const n0=await grp.locator('li').count();
 const li=grp.locator('li').nth(40); await li.scrollIntoViewIfNeeded(); await sleep(100);
 const id=await li.locator('.qid').textContent(); const nextId=await grp.locator('li').nth(41).locator('.qid').textContent();
 const y0=await p.evaluate(()=>scrollY); chk(y0>1500,'position de départ lointaine : '+y0);
 const urlRaw=await li.locator('a[target=_blank]').getAttribute('href');
 await li.locator('a.btn').click();await sleep(300);
 chk(await p.evaluate(()=>scrollY)===0,'formulaire ouvert en haut');
 await p.fill('#f-name','Test FB');await p.click('label.chip:has-text("Desserts")');
 await p.locator('button[type=submit]').last().click();await sleep(900);
 const y1=await p.evaluate(()=>scrollY);
 chk(p.url().endsWith('#a-identifier'),'retour sur la page de classement');
 chk(Math.abs(y1-y0)<=2,'même position qu’avant : '+y0+' → '+y1);
 chk(!(await p.locator('.qid').allTextContents()).includes(id),'lien '+id+' supprimé de la liste');
 chk(gh.file.dismissed.length===1&&gh.file.recipes[0].url===urlRaw,'lien retiré enregistré dans le dépôt');
 chk(await p.locator('.qgroup',{hasText:'Facebook 2025'}).evaluate(e=>e.open)&&await p.locator('.qgroup',{hasText:'Facebook 2025'}).locator('li').count()===n0-1,'groupe resté ouvert, '+(n0-1)+' liens');
 chk(await p.locator('.toast').count()===1&&/enregistrée/.test(await p.locator('.toast').textContent()),'confirmation flottante visible : '+await p.locator('.toast').textContent());
 // le lien suivant est maintenant juste là où se trouvait le précédent
 const box=await grp.locator('li').nth(40).boundingBox();
 chk((await grp.locator('li').nth(40).locator('.qid').textContent())===nextId&&box.y>0&&box.y<844,'le lien suivant '+nextId+' est à l’écran');
 await sleep(4800); chk(await p.locator('.toast').count()===0,'la confirmation disparaît seule');
 // retour sans enregistrer
 const y2=await p.evaluate(()=>scrollY);
 await grp.locator('li').nth(40).locator('a.btn').click(); await sleep(300);
 await p.locator('a.back').click(); await sleep(400);
 chk(Math.abs(await p.evaluate(()=>scrollY)-y2)<=2,'« retour » sans enregistrer : même position');
 // retirer : position conservée + toast
 await grp.locator('li').nth(40).locator('.linkbtn').click(); await p.locator('button:has-text("Oui")').click(); await sleep(800);
 chk(Math.abs(await p.evaluate(()=>scrollY)-y2)<=2&&await p.locator('.toast').count()===1,'« Retirer » : position conservée + confirmation');
 // application redémarrée pendant la visite du lien (sessionStorage conservé)
 const li2=grp.locator('li').nth(40); const id3=await li2.locator('.qid').textContent(); const y3=await p.evaluate(()=>scrollY);
 await li2.locator('a.btn').click(); await sleep(300);
 await p.reload(); await sleep(800);
 await p.fill('#f-name','Test FB 2');await p.click('label.chip:has-text("Gâteaux")');
 await p.locator('button[type=submit]').last().click();await sleep(900);
 chk(Math.abs(await p.evaluate(()=>scrollY)-y3)<=2&&await p.locator('.qgroup',{hasText:'Facebook 2025'}).evaluate(e=>e.open),'après redémarrage de l’appli : groupe ouvert et même position ('+y3+')');
 // classement d'un lien en haut de liste, retour direct à l'accueil : pas de restauration parasite
 await p.goto('http://localhost:8765/#accueil'); await sleep(300); await p.goto('http://localhost:8765/#a-identifier'); await sleep(300);
 chk(await p.evaluate(()=>scrollY)===0,'ouverture normale de la liste : en haut');
 chk(p.errs.length===0,'aucune erreur JS '+p.errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ECHEC'); process.exit(ok?0:1);})();
