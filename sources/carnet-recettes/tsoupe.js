const {chromium}=require('playwright'); const fs=require('fs');
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,OPTIONS'};
const gh={file:{recipes:[
  {id:'soupe-ancienne',name:'Harira',type:'soupes'},
  {id:'soupe-dej',name:'Velouté',type:'soupes',meals:['dejeuner']},
  {id:'salade-x',name:'Salade X',type:'salades',meals:['dejeuner']}]},sha:1,puts:[]};
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
(async()=>{
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block'});
 await ctx.route('https://api.github.com/**',handler);
 await ctx.addInitScript(()=>{localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:'good'}))});
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://localhost:8765/#repas'); await sleep(700);
 const tile=id=>p.locator('.tile[href="#repas/'+id+'"] .tc').textContent();
 chk(/2 recettes/.test(await tile('diner')),'Dîner : 2 soupes (dont une sans label)');
 chk(/2 recettes/.test(await tile('dejeuner')),'Déjeuner : velouté étiqueté + salade');
 await p.goto('http://localhost:8765/#repas/diner'); await sleep(300);
 chk((await p.locator('.rn').allTextContents()).sort().join('|')==='Harira|Velouté','Dîner liste Harira + Velouté');
 await p.goto('http://localhost:8765/#repas/dejeuner'); await sleep(300);
 chk((await p.locator('.rn').allTextContents()).sort().join('|')==='Salade X|Velouté','Déjeuner : Velouté (étiqueté) + Salade X');
 chk(await p.locator('.tile.wide').count()===0 || true,'—');
 await p.goto('http://localhost:8765/#repas'); await sleep(300);
 chk(await p.locator('.tile.wide').count()===0,'aucune recette Sans repas (la soupe sans label est au dîner)');
 await p.goto('http://localhost:8765/#soupe-ancienne'); await sleep(300);
 chk(/Dîner/.test(await p.locator('.meta').textContent()),'fiche : tag Dîner affiché');
 // formulaire : nouvelle soupe
 await p.goto('http://localhost:8765/#ajouter'); await sleep(300);
 const diner=p.locator('input[name=meal][value=diner]');
 chk(!await diner.isChecked()&&!await diner.isDisabled(),'avant : Dîner libre, décoché');
 await p.click('label.chip:has-text("Soupes")'); await sleep(100);
 chk(await diner.isChecked()&&await diner.isDisabled(),'type Soupes : Dîner coché et verrouillé');
 chk(/toujours au dîner/.test(await p.locator('fieldset:has(input[name=meal]) .help').textContent()),'aide contextuelle');
 await p.click('label.chip:has-text("Salades")'); await sleep(100);
 chk(!await diner.isChecked()&&!await diner.isDisabled(),'retour à Salades : Dîner libre et décoché');
 await p.click('label.chip:has(input[name=meal]):has-text("Dîner")'); await p.click('label.chip:has-text("Soupes")'); await p.click('label.chip:has-text("Plats")'); await sleep(100);
 chk(await diner.isChecked()&&!await diner.isDisabled(),'choix explicite Dîner conservé après un aller-retour par Soupes');
 await p.click('label.chip:has(input[name=meal]):has-text("Dîner")'); await p.click('label.chip:has-text("Soupes")');
 await p.fill('#f-name','Soupe de lentilles'); await p.fill('#f-ing','lentilles'); await p.click('button[type=submit]'); await sleep(600);
 const rec=gh.file.recipes[0];
 chk(rec.name==='Soupe de lentilles'&&Array.isArray(rec.meals)&&rec.meals.length===0,'stocké sans label (la règle suffit) : '+JSON.stringify(rec.meals));
 chk(/Dîner/.test(await p.locator('.meta').textContent()),'la fiche affiche Dîner');
 // édition d'une soupe étiquetée Déjeuner
 await p.goto('http://localhost:8765/#modifier/soupe-dej'); await sleep(300);
 chk(await diner.isChecked()&&await diner.isDisabled()&&await p.locator('input[name=meal][value=dejeuner]').isChecked(),'édition soupe : Déjeuner coché, Dîner verrouillé');
 chk(errs.length===0,'aucune erreur page '+errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ÉCHECS'); process.exit(ok?0:1);
})();
