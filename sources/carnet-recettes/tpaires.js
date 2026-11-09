const {chromium}=require('playwright'); const fs=require('fs');
const seed=JSON.parse(fs.readFileSync(__dirname+'/pwa/recettes.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,OPTIONS'};
const mk=(i,o)=>({...JSON.parse(JSON.stringify(seed.recipes[i])),url:'',meals:[],status:'',...o});
const gh={file:{recipes:[mk(0,{id:'poulet',name:'Poulet rôti',type:'plats'}),mk(1,{id:'puree',name:'Purée maison',type:'accomp'}),mk(2,{id:'frites',name:'Frites',type:'accomp'}),mk(3,{id:'mayo',name:'Mayonnaise',type:'sauces'}),mk(4,{id:'tarte',name:'Tarte aux pommes',type:'desserts'}),mk(5,{id:'colle',name:'Colle maison',type:'brico'}),mk(6,{id:'burger',name:'Burger',type:'plats'})],typeOrder:[],dismissed:[]},sha:1,msgs:[],fail:false};
async function handler(route){ const req=route.request(); const u=new URL(req.url());
  const json=(s,o)=>route.fulfill({status:s,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(req.method()==='OPTIONS') return route.fulfill({status:204,headers:CORS});
  if(u.pathname==='/repos/RevisionsDescartes/carnet-recettes') return json(200,{permissions:{pull:true,push:true}});
  if(u.pathname.endsWith('/contents/recettes.json')){
    if(req.method()==='GET') return json(200,{sha:'s'+gh.sha,content:Buffer.from(JSON.stringify(gh.file)).toString('base64')});
    if(req.method()==='PUT'){ if(gh.fail) return json(500,{message:'x'}); const b=JSON.parse(req.postData()); gh.msgs.push(b.message); gh.file=JSON.parse(Buffer.from(b.content,'base64').toString('utf8')); gh.sha++; return json(200,{content:{sha:'s'+gh.sha}}); } }
  return route.fulfill({status:404,headers:CORS,body:'{}'}); }
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const rec=id=>gh.file.recipes.find(r=>r.id===id);
(async()=>{
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await ctx.route('https://api.github.com/**',handler); await ctx.route(/fonts\.|i\.ytimg|noembed|youtube\.com\/oembed/,r=>r.abort());
 await ctx.addInitScript(()=>{ if(!localStorage.getItem('carnet:cfg')) localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:'good'})); });
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://localhost:8765/#poulet'); await sleep(900);
 chk(/Se marie avec/.test(await p.locator('.pairs').textContent())&&/Aucune association/.test(await p.locator('.pairs').textContent()),'section « Se marie avec » vide au départ');
 await p.click('.pairs button:has-text("Associer")'); await sleep(200);
 let names=await p.locator('.pairres .rn').allTextContents();
 chk(names.length===3&&['Purée maison','Frites','Mayonnaise'].every(n=>names.includes(n)),'sans saisie : accompagnements et sauces proposés : '+names.join(', '));
 await p.fill('#pq','tarte'); await sleep(150); names=await p.locator('.pairres .rn').allTextContents();
 chk(names.join()==='Tarte aux pommes','la recherche couvre tout le carnet');
 await p.fill('#pq','colle'); await sleep(150); chk(await p.locator('.pairres li').count()===0,'astuces Brico exclues');
 await p.fill('#pq','poulet'); await sleep(150); chk(await p.locator('.pairres li').count()===0,'la fiche elle-même est exclue');
 await p.fill('#pq','pur'); await sleep(150); await p.click('.pairres button'); await sleep(900);
 chk(rec('poulet').pairs.join()==='puree'&&rec('puree').pairs.length===0,'lien enregistré une seule fois');
 chk(gh.msgs.slice(-1)[0]==='Associe : Poulet rôti + Purée maison','message de commit : '+gh.msgs.slice(-1)[0]);
 chk((await p.locator('.pairlist .rn').allTextContents()).join()==='Purée maison','affichée sur la fiche du plat');
 // réciprocité
 await p.click('.pairlist a'); await sleep(500);
 chk(p.url().endsWith('#puree')&&(await p.locator('.pairlist .rn').allTextContents()).join()==='Poulet rôti','réciproque : le plat apparaît sur la fiche de la purée');
 // associer depuis l'autre côté un 2e, puis déjà-associé exclu
 await p.click('.pairs button:has-text("Associer")'); await p.fill('#pq','poulet'); await sleep(150);
 chk(await p.locator('.pairres li').count()===0,'déjà associée : non reproposée');
 await p.fill('#pq','burger'); await sleep(150); await p.click('.pairres button'); await sleep(900);
 chk((await p.locator('.pairlist .rn').allTextContents()).length===2,'deux associations sur la purée');
 // modifier la fiche ne perd pas les associations
 await p.goto('http://localhost:8765/#modifier/poulet'); await sleep(500); await p.fill('#f-name','Poulet rôti au four'); await p.locator('button[type=submit]').last().click(); await sleep(900);
 chk(rec('poulet').name==='Poulet rôti au four'&&rec('poulet').pairs.join()==='puree','modifier une fiche conserve ses associations');
 // statut idem
 await p.click('.statusrow button:has-text("Favorite")'); await sleep(900);
 chk(rec('poulet').status==='favorite'&&rec('poulet').pairs.join()==='puree','changer le statut conserve les associations');
 // dissocier depuis le côté qui ne porte pas le lien
 await p.goto('http://localhost:8765/#puree'); await sleep(500);
 await p.click('.pairli:has-text("Poulet") .unpair'); await sleep(900);
 chk(rec('poulet').pairs.length===0&&rec('puree').pairs.join()==='burger','dissociation depuis l’autre fiche');
 chk(/^Dissocie : /.test(gh.msgs.slice(-1)[0]),'message : '+gh.msgs.slice(-1)[0]);
 // échec réseau
 gh.fail=true; await p.click('.pairli .unpair'); await sleep(1500);
 chk(rec('puree').pairs.join()==='burger'&&(await p.locator('.pairs .perr').textContent()).length>3&&await p.locator('.pairli .unpair').isEnabled(),'échec : message, rien de perdu');
 gh.fail=false;
 // retirer une recette associée : le lien disparaît
 await p.goto('http://localhost:8765/#burger'); await sleep(500);
 await p.click('button:has-text("Retirer cette recette")'); await p.click('.confirm button:has-text("Oui, retirer")'); await sleep(1000);
 await p.goto('http://localhost:8765/#puree'); await sleep(500);
 chk(/Aucune association/.test(await p.locator('.pairs').textContent()),'recette retirée : association disparue sans erreur');
 // astuce : pas de section ; lecture seule : section seulement si associations
 await p.goto('http://localhost:8765/#colle'); await sleep(400); chk(await p.locator('.pairs').count()===0,'astuce Brico : pas de section');
 gh.file.recipes.find(r=>r.id==='poulet').pairs=['frites','inconnu','poulet']; gh.sha++;
 const ro=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}); await ro.route('https://api.github.com/**',handler); await ro.route(/fonts\./,r=>r.abort());
 const p2=await ro.newPage(); p2.on('pageerror',e=>errs.push(String(e))); await p2.goto('http://localhost:8765/#poulet'); await sleep(900);
 chk((await p2.locator('.pairlist .rn').allTextContents()).join()==='Frites'&&await p2.locator('.pairs button').count()===0,'lecture seule : liste visible, sans boutons ; identifiants inconnus ignorés');
 await p2.goto('http://localhost:8765/#tarte'); await sleep(400); chk(await p2.locator('.pairs').count()===0,'lecture seule sans association : pas de section');
 await p.goto('http://localhost:8765/#accueil'); await p.reload(); await sleep(900); await p.goto('http://localhost:8765/#poulet'); await sleep(500);
 await p.click('.pairs button:has-text("Associer")'); await sleep(200); await p.screenshot({path:'paires.png',fullPage:true});
 chk(errs.length===0,'aucune erreur JS '+errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ECHEC'); process.exit(ok?0:1);
})();
