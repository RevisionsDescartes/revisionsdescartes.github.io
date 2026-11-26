const {chromium}=require('playwright'); const fs=require('fs');
const seed=JSON.parse(fs.readFileSync(__dirname+'/pwa/recettes.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,DELETE,OPTIONS'};
const file=JSON.parse(JSON.stringify(seed)); file.recipes[1].photo='https://evil.example/x.jpg';
const gh={file,sha:1,blobs:{},log:[]};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await ctx.route(/fonts\.|ytimg/,r=>r.abort());
 await ctx.route('https://raw.githubusercontent.com/**',route=>{const p=new URL(route.request().url()).pathname.replace('/RevisionsDescartes/carnet-recettes/main/','');gh.log.push('RAW '+p);
  if(gh.blobs[p]) return route.fulfill({status:200,headers:{'content-type':'image/jpeg','access-control-allow-origin':'*'},body:Buffer.from(gh.blobs[p],'base64')}); return route.fulfill({status:404,body:''});});
 await ctx.route('https://api.github.com/**',async route=>{const req=route.request();const u=new URL(req.url());
  const json=(s,o)=>route.fulfill({status:s,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:CORS});
  const m=u.pathname.match(/\/contents\/(.+)$/);
  if(m&&m[1]==='recettes.json'){
   if(req.method()==='GET')return json(200,{sha:'s'+gh.sha,content:Buffer.from(JSON.stringify(gh.file)).toString('base64')});
   const bd=JSON.parse(req.postData());gh.file=JSON.parse(Buffer.from(bd.content,'base64').toString('utf8'));gh.sha++;gh.log.push('PUT recettes.json');return json(200,{content:{sha:'s'+gh.sha}});}
  if(m&&m[1].startsWith('photos/')){const p=m[1];
   if(req.method()==='PUT'){gh.blobs[p]=JSON.parse(req.postData()).content;gh.log.push('PUT '+p);return json(201,{content:{sha:'b1'}});}
   if(req.method()==='GET')return gh.blobs[p]?json(200,{sha:'b1'}):json(404,{message:'Not Found'});
   if(req.method()==='DELETE'){delete gh.blobs[p];gh.log.push('DELETE '+p);return json(200,{});}}
  return json(200,{permissions:{pull:true,push:true}});});
 await ctx.addInitScript(()=>{localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:'good'}));});
 const p=await ctx.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(String(e)));
 await p.goto('http://localhost:8765/#accueil'); await sleep(900);
 const r0=gh.file.recipes[0], r1=gh.file.recipes[1];
 // 1. ajout depuis la fiche
 await p.goto('http://localhost:8765/#'+r0.id); await sleep(400);
 chk(await p.locator('.photorow button:has-text("Ajouter une photo")').count()===1,'bouton « Ajouter une photo » sur la fiche');
 const [fc]=await Promise.all([p.waitForEvent('filechooser'),p.locator('.photorow button:has-text("Ajouter une photo")').click()]);
 await fc.setFiles(__dirname+'/photo_test.jpg'); await sleep(1500);
 const ph1=gh.file.recipes.find(r=>r.id===r0.id).photo;
 chk(/^photos\/[a-z0-9-]+\.jpg$/.test(ph1)&&gh.blobs[ph1],'photo envoyée dans photos/ et liée à la recette : '+ph1);
 const kb=Buffer.from(gh.blobs[ph1],'base64').length/1024; chk(kb>5&&kb<150,'photo réduite : '+kb.toFixed(0)+' Ko');
 const dim=await p.evaluate(s=>new Promise(ok=>{const i=new Image();i.onload=()=>ok([i.naturalWidth,i.naturalHeight]);i.src='data:image/jpeg;base64,'+s;}),gh.blobs[ph1]);
 chk(Math.max(...dim)===720,'dimensions : '+dim.join('×'));
 chk(await p.locator('.hero.own img.heroimg').count()===1,'photo en haut de la fiche');
 chk(await p.locator('.photorow button:has-text("Changer la photo")').count()===1&&await p.locator('.photorow button:has-text("Retirer la photo")').count()===1,'boutons Changer / Retirer');
 const t0=gh.file.recipes.find(r=>r.id===r0.id); chk(t0.name===r0.name&&JSON.stringify(t0.ing)===JSON.stringify(r0.ing)&&t0.type===r0.type,'le reste de la fiche est inchangé');
 // liste
 await p.goto('http://localhost:8765/#'+r0.type); await sleep(400);
 chk(/^data:image\/jpeg/.test(await p.locator('a.row[href="#'+r0.id+'"] .th img').getAttribute('src')||''),'photo dans la liste');
 // 2. changer
 await p.goto('http://localhost:8765/#'+r0.id); await sleep(400);
 const [fc2]=await Promise.all([p.waitForEvent('filechooser'),p.locator('.photorow button:has-text("Changer la photo")').click()]);
 await fc2.setFiles(__dirname+'/photo_test.jpg'); await sleep(1600);
 const ph2=gh.file.recipes.find(r=>r.id===r0.id).photo;
 chk(ph2&&ph2!==ph1&&!gh.blobs[ph1]&&gh.blobs[ph2],'photo changée, ancienne supprimée du dépôt');
 // 3. modifier la recette sans toucher la photo
 await p.goto('http://localhost:8765/#modifier/'+r0.id); await sleep(400);
 chk(await p.locator('.fphoto-prev img').count()===1,'formulaire : aperçu de la photo actuelle');
 await p.fill('#f-cook','25 min'); await p.locator('button[type=submit]').last().click(); await sleep(900);
 chk(gh.file.recipes.find(r=>r.id===r0.id).photo===ph2&&gh.file.recipes.find(r=>r.id===r0.id).cook==='25 min','modification sans toucher la photo : photo conservée');
 // 4. retirer
 await p.locator('.photorow button:has-text("Retirer la photo")').click(); await sleep(900);
 chk(!gh.file.recipes.find(r=>r.id===r0.id).photo&&!gh.blobs[ph2]&&await p.locator('.hero.own').count()===0,'photo retirée (fiche + dépôt)');
 // 5. nouvelle recette maison avec photo
 await p.goto('http://localhost:8765/#ajouter'); await sleep(400);
 await p.fill('#f-name','Tarte maison test'); await p.click('label.chip:has-text("Desserts")');
 const [fc3]=await Promise.all([p.waitForEvent('filechooser'),p.locator('.fphoto button:has-text("Ajouter une photo")').click()]);
 await fc3.setFiles(__dirname+'/photo_test.jpg'); await sleep(800);
 chk(await p.locator('.fphoto-prev img').count()===1,'aperçu avant enregistrement');
 await p.locator('button[type=submit]').last().click(); await sleep(1500);
 const nr=gh.file.recipes.find(r=>r.name==='Tarte maison test');
 chk(nr&&/^photos\//.test(nr.photo)&&gh.blobs[nr.photo],'nouvelle recette créée avec sa photo');
 chk(await p.locator('.hero.own img').count()===1,'sa fiche montre la photo');
 // 6. fichier non image
 await p.goto('http://localhost:8765/#'+r1.id); await sleep(400);
 const [fc4]=await Promise.all([p.waitForEvent('filechooser'),p.locator('.photorow button').first().click()]);
 await fc4.setFiles(__dirname+'/pas_photo.txt'); await sleep(600);
 chk(/pas une photo lisible/.test(await p.locator('.photorow ~ .err').first().textContent()),'fichier non image : message clair');
 chk(!gh.log.some(l=>l.startsWith('PUT photos')&&l.includes(r1.id))&&(!gh.file.recipes.find(r=>r.id===r1.id).photo||gh.file.recipes.find(r=>r.id===r1.id).photo==='https://evil.example/x.jpg'),'rien envoyé pour ce fichier');
 chk(await p.locator('img[src*="evil"]').count()===0,'adresse de photo extérieure ignorée');
 // 7. autre appareil : photo chargée depuis le dépôt
 const p2=await ctx.newPage(); await p2.goto('http://localhost:8765/#'+nr.id); await sleep(1200);
 const s2=await p2.locator('.hero.own img').getAttribute('src');
 chk(s2==='https://raw.githubusercontent.com/RevisionsDescartes/carnet-recettes/main/'+nr.photo&&await p2.locator('.hero.own img').evaluate(i=>i.naturalWidth)>0,'autre appareil : photo lue depuis le dépôt');
 await p2.screenshot({path:__dirname+'/shot_photo.png'});
 chk(p.errs.length===0,'aucune erreur JS '+p.errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ECHEC'); process.exit(ok?0:1);})();
