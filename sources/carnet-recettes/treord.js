const {chromium}=require('playwright'); const fs=require('fs');
const real=JSON.parse(fs.readFileSync('/home/claude/carnet-recettes/recettes.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,OPTIONS'};
const gh={file:JSON.parse(JSON.stringify(real)),sha:1,puts:0};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block'});
 await ctx.route(/fonts\.|ytimg/,r=>r.abort());
 await ctx.route('https://api.github.com/**',async route=>{const req=route.request();const u=new URL(req.url());
  const json=(s,o)=>route.fulfill({status:s,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:CORS});
  if(u.pathname.endsWith('/contents/recettes.json')){
   if(req.method()==='GET')return json(200,{sha:'s'+gh.sha,content:Buffer.from(JSON.stringify(gh.file)).toString('base64')});
   const bd=JSON.parse(req.postData());gh.file=JSON.parse(Buffer.from(bd.content,'base64').toString('utf8'));gh.sha++;gh.puts++;return json(200,{content:{sha:'s'+gh.sha}});}
  return json(200,{permissions:{pull:true,push:true}});});
 await ctx.addInitScript(()=>{localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:'good'}));});
 const p=await ctx.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(String(e)));
 await p.goto('http://localhost:8765/#accueil'); await sleep(1200);
 await p.goto('http://localhost:8765/#plats'); await sleep(400);
 const names0=await p.locator('ul.rows > li > a.row .rn').allTextContents();
 chk(await p.locator('button:has-text("Réorganiser")').count()===1,'bouton « Réorganiser »');
 chk(await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Réorganiser/.test(x.textContent));const ul=document.querySelector('ul.rows');return !!(ul.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING);}),'bouton placé sous la liste');
 await p.locator('button:has-text("Réorganiser")').click(); await sleep(200);
 const n0=await p.locator('.rows.reord .rn').allTextContents();
 chk(JSON.stringify(n0)===JSON.stringify(names0),'mode réorganiser : même ordre de départ ('+n0.length+' fiches)');
 chk(await p.locator('.rows.reord a').count()===0&&await p.locator('.rows.reord .rhandle').count()===n0.length&&await p.locator('.rbtn').count()===0,'une poignée ≡ par fiche, plus de flèches');
 chk(await p.locator('.rsave').count()===2,'« Enregistrer l’ordre » en haut et en bas');
 async function drag(from,to){ const h=p.locator('.rows.reord li').nth(from).locator('.rhandle'); await h.scrollIntoViewIfNeeded(); const hb=await h.boundingBox();
  await p.mouse.move(hb.x+hb.width/2,hb.y+hb.height/2); await p.mouse.down();
  const tb=await p.locator('.rows.reord li').nth(to).boundingBox(); const ty=to<from?tb.y+tb.height*0.3:tb.y+tb.height*0.7;
  await p.mouse.move(hb.x+hb.width/2,ty,{steps:8}); await sleep(50); await p.mouse.up(); await sleep(80); }
 console.log('n0',n0.slice(0,5).map(x=>x.slice(0,18)).join(' / ')); await drag(2,0);
 let n1=await p.locator('.rows.reord .rn').allTextContents();
 chk(n1[0]===n0[2]&&n1[1]===n0[0]&&n1[2]===n0[1],'glisser la 3e en haut : '+n1.slice(0,3).join(' | '));
 await drag(0,3);
 n1=await p.locator('.rows.reord .rn').allTextContents();
 chk(n1[3]===n0[2]&&n1[0]===n0[0],'glisser vers le bas : '+n1.slice(0,4).join(' | '));
 // clavier
 await p.locator('.rows.reord li').nth(3).locator('.rhandle').focus(); await p.keyboard.press('ArrowUp'); await sleep(50);
 n1=await p.locator('.rows.reord .rn').allTextContents();
 chk(n1[2]===n0[2],'clavier : flèche haut');
 const exp=n1.slice();
 chk(gh.puts===0,'rien enregistré avant « Enregistrer l’ordre »');
 await p.locator('.rsave').last().click(); await sleep(900);
 chk(gh.puts===1,'un seul enregistrement');
 const n2=await p.locator('ul.rows > li > a.row .rn').allTextContents();
 chk(JSON.stringify(n2)===JSON.stringify(exp),'liste normale dans le nouvel ordre');
 const pl=gh.file.recipes.filter(r=>r.type==='plats'); chk(pl.every(r=>typeof r.pos==='number'),'rangs enregistrés pour toutes les fiches du type');
 chk(gh.file.recipes.filter(r=>r.type!=='plats').every(r=>r.pos===undefined),'autres types intacts');
 // annuler
 await p.locator('button:has-text("Réorganiser")').click(); await sleep(150);
 await drag(5,1); await p.locator('.rcancel').first().click(); await sleep(200);
 chk(JSON.stringify(await p.locator('ul.rows > li > a.row .rn').allTextContents())===JSON.stringify(exp)&&gh.puts===1,'« Annuler » ne change rien');
 // modifier une fiche : rang conservé ; changer de type : rang perdu
 const id0=pl.find(r=>r.name===exp[1]).id;
 await p.goto('http://localhost:8765/#modifier/'+id0); await sleep(300); await p.fill('#f-cook','12 min'); await p.locator('button[type=submit]').last().click(); await sleep(900);
 chk(gh.file.recipes.find(r=>r.id===id0).pos===1,'modification de la fiche : rang conservé');
 // nouvelle recette : en tête
 await p.goto('http://localhost:8765/#ajouter/plats'); await sleep(300); await p.fill('#f-name','Nouveau plat test'); await p.locator('button[type=submit]').last().click(); await sleep(900);
 await p.goto('http://localhost:8765/#plats'); await sleep(300);
 chk((await p.locator('ul.rows > li > a.row .rn').first().textContent())==='Nouveau plat test','nouvelle recette en tête de liste');
 // repas : ordre respecté dans le groupe Plats
 // autres écrans : quitter le mode
 await p.locator('button:has-text("Réorganiser")').click(); await sleep(100); await p.goto('http://localhost:8765/#accueil'); await sleep(150); await p.goto('http://localhost:8765/#plats'); await sleep(200);
 chk(await p.locator('.rows.reord').count()===0,'revenir sur la liste quitte le mode');
 await p.locator('button:has-text("Réorganiser")').click(); await sleep(150); await p.screenshot({path:__dirname+'/shot_reord.png'});
 chk(p.errs.length===0,'aucune erreur JS '+p.errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ECHEC'); process.exit(ok?0:1);})();
