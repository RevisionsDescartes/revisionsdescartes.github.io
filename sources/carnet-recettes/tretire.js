const {chromium}=require('playwright'); const fs=require('fs');
const seed=JSON.parse(fs.readFileSync(__dirname+'/pwa/recettes.json','utf8'));
const d2=JSON.parse(fs.readFileSync(__dirname+'/data2.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,OPTIONS'};
const pend=d2.pendingYt[0].url, pendKey=new URL(pend).href;
const mk=(i,o)=>({...JSON.parse(JSON.stringify(seed.recipes[i])),...o});
const gh={file:{recipes:[mk(0,{id:'r-pend',name:'Venue d\'un lien',type:'desserts',url:pend,meals:[]}),mk(1,{id:'r-libre',name:'Recette libre',type:'plats',url:'https://youtu.be/ZZZZZZZZZZZ',meals:[]}),mk(2,{id:'r-sans',name:'Sans lien',type:'plats',url:'',meals:[]})],typeOrder:[],dismissed:[]},sha:1,fail:false,msgs:[]};
async function handler(route){
  const req=route.request(); const u=new URL(req.url());
  const json=(s,o)=>route.fulfill({status:s,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(req.method()==='OPTIONS') return route.fulfill({status:204,headers:CORS});
  if(u.pathname==='/repos/RevisionsDescartes/carnet-recettes') return json(200,{permissions:{pull:true,push:true}});
  if(u.pathname.endsWith('/contents/recettes.json')){
    if(req.method()==='GET') return json(200,{sha:'s'+gh.sha,content:Buffer.from(JSON.stringify(gh.file)).toString('base64')});
    if(req.method()==='PUT'){ if(gh.fail) return json(500,{message:'boom'}); const b=JSON.parse(req.postData()); gh.msgs.push(b.message); gh.file=JSON.parse(Buffer.from(b.content,'base64').toString('utf8')); gh.sha++; return json(200,{content:{sha:'s'+gh.sha}}); }
  }
  return route.fulfill({status:404,headers:CORS,body:'{}'});
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await ctx.route('https://api.github.com/**',handler); await ctx.route(/fonts\.|i\.ytimg|noembed|youtube\.com\/oembed/,r=>r.abort());
 await ctx.addInitScript(()=>{ if(!localStorage.getItem('carnet:cfg')) localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:'good'})); });
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://localhost:8765/#r-pend'); await sleep(900);
 chk(await p.locator('button:has-text("Retirer cette recette")').count()===1,'bouton « Retirer cette recette » sur la fiche');
 // annuler
 await p.click('button:has-text("Retirer cette recette")');
 const t=await p.locator('.confirm').textContent();
 chk(/Retirer « Venue d.un lien » du carnet \?/.test(t)&&/ne sera plus proposé dans « À traiter »/.test(t)&&/définitive/.test(t),'confirmation claire : '+t.trim().slice(0,110));
 await p.click('.confirm button:has-text("Non, garder")'); await sleep(200);
 chk(gh.file.recipes.length===3&&await p.locator('button:has-text("Retirer cette recette")').count()===1,'« Non, garder » ne retire rien');
 // échec
 gh.fail=true; await p.click('button:has-text("Retirer cette recette")'); await p.click('.confirm button:has-text("Oui, retirer")'); await sleep(1500);
 chk(gh.file.recipes.length===3&&/./.test(await p.locator('.perr').last().textContent())&&await p.locator('.confirm .btn.danger').isEnabled(),'échec réseau : message, rien retiré, bouton réactivé');
 gh.fail=false; await p.click('.confirm button:has-text("Oui, retirer")'); await sleep(1200);
 chk(!gh.file.recipes.some(r=>r.id==='r-pend')&&gh.file.recipes.length===2,'recette retirée du dépôt');
 chk(gh.file.dismissed.includes(pendKey),'son lien n’est plus proposé (dismissed)');
 chk(gh.msgs[gh.msgs.length-1]==='Retire : Venue d’un lien'||/^Retire : Venue/.test(gh.msgs[gh.msgs.length-1]),'message de commit : '+gh.msgs[gh.msgs.length-1]);
 chk(p.url().endsWith('#desserts'),'retour à la liste du type');
 // le lien ne réapparaît pas dans « À traiter »
 await p.goto('http://localhost:8765/#a-identifier'); await sleep(700);
 chk(!(await p.locator('#view').innerHTML()).includes(pend.replace(/&/g,'&amp;')),'lien absent de la liste « à identifier »');
 // recette hors liste d'attente : pas de mention, pas d'ajout à dismissed
 const nd=gh.file.dismissed.length;
 await p.goto('http://localhost:8765/#r-libre'); await sleep(600);
 await p.click('button:has-text("Retirer cette recette")');
 chk(!/À traiter/.test(await p.locator('.confirm').textContent()),'pas de mention « À traiter » pour un lien hors liste');
 await p.click('.confirm button:has-text("Oui, retirer")'); await sleep(1000);
 chk(gh.file.recipes.length===1&&gh.file.dismissed.length===nd,'retirée, liste des liens écartés inchangée');
 // recette sans lien
 await p.goto('http://localhost:8765/#r-sans'); await sleep(500);
 await p.click('button:has-text("Retirer cette recette")'); await p.click('.confirm button:has-text("Oui, retirer")'); await sleep(1000);
 chk(gh.file.recipes.length===0,'recette sans lien retirée');
 // formulaire de modification : même fonction
 gh.file.recipes=[mk(3,{id:'r-form',name:'Via formulaire',type:'snacks',url:'',meals:[]})]; gh.sha++;
 await p.goto('http://localhost:8765/#accueil'); await sleep(300); await p.reload(); await sleep(900);
 await p.goto('http://localhost:8765/#modifier/r-form'); await sleep(600);
 chk(await p.locator('button:has-text("Retirer cette recette")').count()===1,'formulaire de modification : « Retirer cette recette »');
 await p.click('button:has-text("Retirer cette recette")'); await p.click('.confirm button:has-text("Oui, retirer")'); await sleep(1000);
 chk(gh.file.recipes.length===0,'retrait depuis le formulaire');
 // lecture seule : pas de bouton
 const ro=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await ro.route('https://api.github.com/**',handler); await ro.route(/fonts\./,r=>r.abort());
 gh.file.recipes=[mk(4,{id:'r-ro',name:'Lecture',type:'plats',url:'',meals:[]})]; gh.sha++;
 const p2=await ro.newPage(); await p2.goto('http://localhost:8765/#r-ro'); await sleep(900);
 chk(await p2.locator('h1').first().textContent()==='Lecture'&&await p2.locator('button:has-text("Retirer")').count()===0,'lecture seule : pas de bouton Retirer');
 chk(errs.length===0,'aucune erreur JS '+errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ECHEC'); process.exit(ok?0:1);
})();
