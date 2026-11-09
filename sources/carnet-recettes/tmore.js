const {chromium}=require('playwright'); const fs=require('fs');
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const recs=[]; 
['Ananas','Boeuf','Couscous','Dinde','Escalope'].forEach((n,i)=>recs.push({id:'p'+i,name:n,type:'plats',meals:['dejeuner']}));
['Salade A','Salade B'].forEach((n,i)=>recs.push({id:'s'+i,name:n,type:'salades',meals:['dejeuner']}));
['Z1','Z2','Z3','Z4'].forEach((n,i)=>recs.push({id:'z'+i,name:n,type:'tajines',meals:[]}));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block'});
 await ctx.addInitScript(d=>{localStorage.setItem('carnet:data',JSON.stringify({recipes:d}))},recs);
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
 await p.route('https://api.github.com/**',r=>r.abort());
 await p.goto('http://localhost:8765/#repas/dejeuner'); await sleep(500);
 const vis=()=>p.locator('.grp').first().locator('.row:visible').allTextContents();
 chk((await vis()).length===3,'Plats : 3 lignes visibles sur 5');
 chk(await p.locator('.grp').nth(1).locator('.row:visible').count()===2&&await p.locator('.grp').nth(1).locator('.more').count()===0,'Salades (2) : tout visible, pas de bouton');
 const btn=p.locator('.grp').first().locator('.more');
 chk((await btn.textContent())==='···'&&/2 autres recettes/.test(await btn.getAttribute('aria-label')),'bouton ··· avec libellé accessible');
 await p.screenshot({path:'more_closed.png'});
 await btn.click(); await sleep(100);
 chk((await vis()).length===5&&await btn.getAttribute('aria-expanded')==='true','clic : 5 lignes, aria-expanded=true');
 await p.screenshot({path:'more_open.png'});
 // l'état déplié survit à un re-rendu (retour depuis une fiche)
 await p.locator('.row:visible').nth(4).click(); await sleep(200); await p.click('a.back'); await sleep(300);
 chk((await vis()).length===5,'déplié conservé après aller-retour fiche');
 await p.locator('.grp').first().locator('.more').click(); await sleep(100);
 chk((await vis()).length===3,'re-clic : replié');
 // Sans repas : pas de limite
 await p.goto('http://localhost:8765/#repas/sans'); await sleep(300);
 chk(await p.locator('.more').count()===0&&await p.locator('.row:visible').count()===4,'Sans repas : 4 lignes, aucune coupure');
 // vue type : pas de limite
 await p.goto('http://localhost:8765/#plats'); await sleep(300);
 chk(await p.locator('.more').count()===0&&await p.locator('.row').count()===5,'vue Types : liste complète');
 chk(errs.length===0,'aucune erreur page');
 await b.close(); console.log(ok?'TOUT OK':'ÉCHECS'); process.exit(ok?0:1);
})();
