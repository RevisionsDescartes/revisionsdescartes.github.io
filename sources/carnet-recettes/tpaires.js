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
 const names=()=>p.locator('.pairres .rn').allTextContents();
 const tick=async n=>{ await p.locator('.pairchk',{hasText:n}).locator('input').click(); };
 await p.goto('http://localhost:8765/#poulet'); await sleep(900);
 chk(/Aucune association/.test(await p.locator('.pairs').textContent()),'section vide au départ');
 await p.click('.pairs button:has-text("Associer")'); await sleep(200);
 let n=await names();
 chk(n.length===3&&['Purée maison','Frites','Mayonnaise'].every(x=>n.includes(x)),'depuis un plat : accompagnements et sauces listés : '+n.join(', '));
 chk((await p.locator('.pairh').allTextContents()).join()==='Accompagnements,Sauces','regroupés par type');
 chk(await p.locator('.pairbar .btn').first().isDisabled(),'Enregistrer inactif sans changement');
 chk(await p.evaluate(()=>document.activeElement.id!=='pq'),'le clavier ne s’ouvre pas tout seul');
 await tick('Purée maison'); await tick('Frites'); await tick('Mayonnaise');
 chk(await p.locator('.pairbar .btn').first().textContent()==='Enregistrer (3 changements)','compteur : 3 changements');
 // recherche : tout le carnet, les coches sont conservées
 await p.fill('#pq','tarte'); await sleep(150); chk((await names()).join()==='Tarte aux pommes','recherche dans tout le carnet');
 await tick('Tarte aux pommes');
 await p.fill('#pq','colle'); await sleep(150); chk((await names()).length===0,'astuces Brico exclues');
 await p.fill('#pq','poulet'); await sleep(150); chk((await names()).length===0,'la fiche elle-même est exclue');
 await p.fill('#pq',''); await sleep(150);
 chk(await p.locator('.pairchk input:checked').count()===3,'coches conservées après une recherche');
 await tick('Mayonnaise');
 chk(await p.locator('.pairbar .btn').first().textContent()==='Enregistrer (3 changements)','décocher avant d’enregistrer annule le changement');
 const puts0=gh.msgs.length;
 await p.locator('.pairbar .btn').first().click(); await sleep(1000);
 chk(gh.msgs.length===puts0+1,'un seul enregistrement pour 3 associations');
 chk(rec('poulet').pairs.slice().sort().join()==='frites,puree,tarte'&&rec('puree').pairs.length===0,'liens enregistrés une seule fois, côté plat');
 chk(gh.msgs.slice(-1)[0]==='Associations de « Poulet rôti » : +3','message : '+gh.msgs.slice(-1)[0]);
 chk((await p.locator('.pairlist .rn').allTextContents()).length===3&&await p.locator('.pairpick').count()===0,'fiche mise à jour, liste refermée');
 // sens inverse : depuis l'accompagnement, les plats
 await p.goto('http://localhost:8765/#puree'); await sleep(500);
 chk((await p.locator('.pairlist .rn').allTextContents()).join()==='Poulet rôti','réciproque sur la fiche de la purée');
 await p.click('.pairs button:has-text("Modifier les associations")'); await sleep(200);
 n=await names(); chk(n.join()==='Burger,Poulet rôti','depuis un accompagnement : les plats listés : '+n.join(', '));
 chk(await p.locator('.pairchk',{hasText:'Poulet rôti'}).locator('input').isChecked(),'association existante déjà cochée');
 await tick('Burger'); await tick('Poulet rôti');
 chk(await p.locator('.pairbar .btn').first().textContent()==='Enregistrer (2 changements)','ajout + retrait = 2 changements');
 await p.locator('.pairbar .btn').first().click(); await sleep(1000);
 chk(rec('puree').pairs.join()==='burger'&&!rec('poulet').pairs.includes('puree'),'ajout et retrait en un enregistrement (lien porté par l’autre fiche compris)');
 chk(gh.msgs.slice(-1)[0]==='Associations de « Purée maison » : +1 −1','message : '+gh.msgs.slice(-1)[0]);
 // association hors types habituels : reste visible pour être décochée
 await p.goto('http://localhost:8765/#poulet'); await sleep(500); await p.click('.pairs button:has-text("Modifier les associations")'); await sleep(200);
 chk((await p.locator('.pairh').allTextContents()).includes('Autres associations')&&(await names()).includes('Tarte aux pommes'),'« Autres associations » : le dessert associé reste décochable');
 // annuler ne change rien
 await tick('Mayonnaise'); await p.click('.pairbar button:has-text("Annuler")'); await sleep(300);
 chk(gh.msgs.length===puts0+2&&await p.locator('.pairpick').count()===0,'Annuler : rien n’est enregistré');
 // modifier la fiche / le statut conservent les associations
 await p.goto('http://localhost:8765/#modifier/poulet'); await sleep(500); await p.fill('#f-name','Poulet rôti au four'); await p.locator('button[type=submit]').last().click(); await sleep(900);
 chk(rec('poulet').name==='Poulet rôti au four'&&rec('poulet').pairs.length===2,'modifier une fiche conserve ses associations');
 await p.click('.statusrow button:has-text("Favorite")'); await sleep(900);
 chk(rec('poulet').status==='favorite'&&rec('poulet').pairs.length===2,'changer le statut conserve les associations');
 // la croix reste disponible
 await p.click('.pairli:has-text("Tarte") .unpair'); await sleep(900);
 chk(!rec('poulet').pairs.includes('tarte'),'retrait rapide par la croix');
 // échec réseau
 gh.fail=true; await p.click('.pairs button:has-text("Modifier les associations")'); await sleep(200); await tick('Mayonnaise'); await p.locator('.pairbar .btn').first().click(); await sleep(1500);
 chk(!rec('poulet').pairs.includes('mayo')&&(await p.locator('.pairs .perr').textContent()).length>3&&await p.locator('.pairbar .btn').first().isEnabled()&&await p.locator('.pairchk',{hasText:'Mayonnaise'}).locator('input').isChecked(),'échec : message, coches conservées, on peut réessayer');
 gh.fail=false; await p.locator('.pairbar .btn').first().click(); await sleep(1000);
 chk(rec('poulet').pairs.includes('mayo'),'nouvel essai réussi');
 // une fiche retirée entre-temps est ignorée
 await p.click('.pairs button:has-text("Modifier les associations")'); await sleep(200); await tick('Purée maison');
 gh.file.recipes=gh.file.recipes.filter(r=>r.id!=='puree'); gh.sha++;
 await p.locator('.pairbar .btn').first().click(); await sleep(1000);
 chk(!rec('poulet').pairs.includes('puree')&&(await p.locator('.pairs .perr').textContent())==='','recette retirée entre-temps : ignorée sans erreur');
 // astuce : pas de section ; lecture seule
 await p.goto('http://localhost:8765/#colle'); await sleep(400); chk(await p.locator('.pairs').count()===0,'astuce Brico : pas de section');
 gh.file.recipes.find(r=>r.id==='poulet').pairs=['frites','inconnu','poulet']; gh.sha++;
 const ro=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}); await ro.route('https://api.github.com/**',handler); await ro.route(/fonts\./,r=>r.abort());
 const p2=await ro.newPage(); p2.on('pageerror',e=>errs.push(String(e))); await p2.goto('http://localhost:8765/#poulet'); await sleep(900);
 chk((await p2.locator('.pairlist .rn').allTextContents()).join()==='Frites'&&await p2.locator('.pairs button').count()===0,'lecture seule : liste visible, sans boutons ; identifiants inconnus ignorés');
 await p.goto('http://localhost:8765/#accueil'); await p.reload(); await sleep(900); await p.goto('http://localhost:8765/#poulet'); await sleep(500);
 await p.click('.pairs button:has-text("Modifier les associations")'); await sleep(300); await tick('Mayonnaise'); await p.screenshot({path:'paires2.png',fullPage:true});
 chk(errs.length===0,'aucune erreur JS '+errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ECHEC'); process.exit(ok?0:1);
})();
