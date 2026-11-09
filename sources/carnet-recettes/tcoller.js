const {chromium}=require('playwright'); const fs=require('fs');
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'GET,PUT,OPTIONS'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block',acceptDownloads:true});
 await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'http://localhost:8765'});
 await ctx.route(/fonts\.|api\.github/,r=>r.abort());
 await ctx.route(/youtube\.com\/oembed/,r=>r.fulfill({status:200,headers:CORS,contentType:'application/json',body:JSON.stringify({title:'Gâteau au yaourt'})}));
 await ctx.route(/noembed/,r=>r.abort());
 await ctx.addInitScript(()=>{ localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:'good'})); });
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://localhost:8765/#ajouter'); await sleep(500);
 chk(await p.locator('button.pastebtn').count()===1,'bouton Coller présent (nouvelle recette)');
 // 1) presse-papiers avec lien entouré de texte
 await p.evaluate(()=>navigator.clipboard.writeText('Regarde cette vidéo : https://youtu.be/AbC123?si=xyz !'));
 await p.click('button.pastebtn'); await sleep(900);
 chk(await p.inputValue('#f-url')==='https://youtu.be/AbC123?si=xyz','lien extrait du texte copié : '+await p.inputValue('#f-url'));
 chk(await p.inputValue('#f-name')==='Gâteau au yaourt','titre de la vidéo proposé');
 chk(await p.locator('input[name=status][value=essayer]').isChecked(),'statut « À essayer » coché');
 chk(!(await p.locator('.pastebtn ~ .perr').first().textContent()),'pas de message d’erreur');
 // 2) presse-papiers sans lien
 await p.goto('http://localhost:8765/#accueil'); await sleep(200); await p.goto('http://localhost:8765/#ajouter'); await sleep(400);
 await p.evaluate(()=>navigator.clipboard.writeText('juste du texte'));
 await p.click('button.pastebtn'); await sleep(300);
 chk(/Aucun lien trouvé/.test(await p.locator('#view').textContent())&&await p.inputValue('#f-url')==='','message si aucun lien');
 // 3) lecture refusée
 await p.evaluate(()=>{ Object.defineProperty(navigator,'clipboard',{value:{readText:()=>Promise.reject(new Error('denied'))},configurable:true}); });
 await p.click('button.pastebtn'); await sleep(300);
 chk(/Impossible de lire/.test(await p.locator('#view').textContent()),'message si lecture refusée');
 // 4) pas de bouton en modification ni en classement
 const id=await p.evaluate(()=>{const a=[...document.querySelectorAll('a')];return null});
 await p.goto('http://localhost:8765/#modifier/pancakes-ecrit'); await sleep(400);
 chk(await p.locator('button.pastebtn').count()===0,'pas de bouton en modification');
 // 5) sauvegarde
 await p.goto('http://localhost:8765/#reglages'); await sleep(400);
 chk(/Dernière sauvegarde sur cet appareil : aucune/.test(await p.locator('#view').textContent()),'avant : aucune sauvegarde');
 const [dl]=await Promise.all([p.waitForEvent('download'),p.click('button:has-text("Télécharger une sauvegarde")')]);
 const path=await dl.path(); const j=JSON.parse(fs.readFileSync(path,'utf8'));
 chk(/^carnet-recettes-20\d\d-\d\d-\d\d\.json$/.test(dl.suggestedFilename()),'nom du fichier '+dl.suggestedFilename());
 chk(Array.isArray(j.recipes)&&j.recipes.length===18&&Array.isArray(j.typeOrder)&&Array.isArray(j.dismissed),'fichier : 18 recettes + ordre + liens écartés');
 await sleep(200);
 chk(/Sauvegarde téléchargée \(18 recettes\)/.test(await p.locator('#view').textContent()),'message de confirmation');
 await p.goto('http://localhost:8765/#accueil'); await p.goto('http://localhost:8765/#reglages'); await sleep(300);
 chk(!/sauvegarde sur cet appareil : aucune/.test(await p.locator('#view').textContent()),'date de dernière sauvegarde mémorisée');
 await p.screenshot({path:'reglages.png',fullPage:true});
 chk(errs.length===0,'aucune erreur JS '+errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ECHEC'); process.exit(ok?0:1);
})();
