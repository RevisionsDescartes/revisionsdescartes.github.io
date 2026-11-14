const {chromium}=require('playwright'); const fs=require('fs');
const real=JSON.parse(fs.readFileSync('/home/claude/carnet-recettes/recettes.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,OPTIONS'};
const gh={file:JSON.parse(JSON.stringify(real)),sha:1,puts:[]};
const N0=real.recipes.filter(r=>!(r.ing||[]).length&&r.type!=='brico'&&/youtu/.test(r.url||'')).length;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block',permissions:['clipboard-read','clipboard-write']});
 await ctx.route(/fonts\.|ytimg/,r=>r.abort());
 await ctx.route('https://api.github.com/**',async route=>{const req=route.request();const u=new URL(req.url());
  const json=(s,o)=>route.fulfill({status:s,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:CORS});
  if(u.pathname.endsWith('/contents/recettes.json')){
   if(req.method()==='GET')return json(200,{sha:'s'+gh.sha,content:Buffer.from(JSON.stringify(gh.file)).toString('base64')});
   const bd=JSON.parse(req.postData());gh.file=JSON.parse(Buffer.from(bd.content,'base64').toString('utf8'));gh.sha++;gh.puts.push(bd.message);return json(200,{content:{sha:'s'+gh.sha}});}
  return json(200,{permissions:{pull:true,push:true}});});
 await ctx.addInitScript(()=>{localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:'good'}));});
 const p=await ctx.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(String(e)));
 await p.goto('http://localhost:8765/#accueil'); await sleep(1200); await p.goto('http://localhost:8765/#reglages'); await sleep(500);
 const sec=p.locator('section.fill'); chk(await sec.count()===1,'section présente');
 const N1=+(/(\d+) recettes YouTube/.exec(await sec.textContent())||[])[1]; chk(N1>=10&&N1<=N0,'compte : '+N1+' recettes sans ingrédients');
 await sec.locator('button:has-text("Copier les 10 liens")').click(); await sleep(200);
 const links=await p.evaluate(()=>navigator.clipboard.readText()); const L=links.trim().split(/\s+/);
 chk(links.replace(/\n/g,'').split(' ').length===10&&L.length===10&&L.every(x=>/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/.test(x)),'10 liens propres copiés, ex. '+L[0]);
 await sec.locator('button:has-text("Copier la consigne")').click(); await sleep(200);
 const pr=await p.evaluate(()=>navigator.clipboard.readText());
 chk(/r-mwemc7xlpsf = Comment faire du pop-corn/.test(pr)&&/INTROUVABLE/.test(pr)&&(pr.match(/^r-\w+ = /gm)||[]).length===10,'consigne avec les 10 codes ('+pr.length+' caractères)');
 fs.writeFileSync(__dirname+'/consigne_lot1.txt',pr); fs.writeFileSync(__dirname+'/liens_lot1.txt',links);
 const rep=`Voici les fiches :

### r-mwemc7xlpsf
CUISSON: 10 minutes
PORTIONS: rien
FIABILITE: complète
INGREDIENTS:
- 100 g de maïs à pop-corn [1]
- **200 g de sucre** [2, 3]
- 50 g de beurre
ETAPES:
1. Faire éclater le maïs. [1]
2. Préparer le caramel.
ASTUCES:
- Remuer vite.

**### r-mwembb27ub4**
CUISSON:
PORTIONS: 2
FIABILITÉ: partielle
INGRÉDIENTS:
* Lait
* Chocolat noir
ÉTAPES:
1) Chauffer le lait.

### r-mwdpqu0t2ju
INTROUVABLE

### r-inconnu123
INGREDIENTS:
- x
`;
 await p.fill('#fill-in',rep); await sec.locator('button:has-text("Analyser")').click(); await sleep(300);
 chk(await sec.locator('.fillrows li').count()===3,'3 fiches reconnues');
 const st=await sec.locator('.fillrows .td2').allTextContents(); console.log('   ',st);
 chk(/3 ingrédients · 2 étapes · liste complète/.test(st[0])&&/2 ingrédients · 1 étape · liste partielle/.test(st[1])&&/introuvable/i.test(st[2]),'aperçus corrects');
 chk(/1 bloc ignoré/.test(await sec.textContent()),'code inconnu ignoré');
 chk(/Enregistrer 2 fiches/.test(await sec.locator('.fillprev > button').textContent()),'bouton : 2 fiches');
 await sec.locator('.fillprev > button').click(); await sleep(900);
 const r1=gh.file.recipes.find(r=>r.id==='r-mwemc7xlpsf'), r2=gh.file.recipes.find(r=>r.id==='r-mwembb27ub4'), o1=real.recipes.find(r=>r.id==='r-mwemc7xlpsf');
 chk(gh.puts.length===1&&gh.file.recipes.length===real.recipes.length,'un seul enregistrement, '+gh.file.recipes.length+' recettes');
 chk(JSON.stringify(r1.ing)===JSON.stringify(['100 g de maïs à pop-corn','200 g de sucre','50 g de beurre'])&&r1.steps.length===2&&r1.tips[0]==='Remuer vite.'&&r1.cook==='10 minutes'&&r1.servings===''&&r1.lvl==='complete','fiche 1 propre : '+JSON.stringify(r1.ing));
 chk(r1.name===o1.name&&r1.type===o1.type&&r1.url===o1.url&&r1.status===o1.status&&JSON.stringify(r1.meals)===JSON.stringify(o1.meals)&&JSON.stringify(r1.pairs)===JSON.stringify(o1.pairs)&&r1.ts===o1.ts,'nom, type, lien, statut, repas, associations inchangés');
 chk(r2.lvl==='partial'&&r2.servings==='2'&&r2.ing.length===2&&r2.steps[0]==='Chauffer le lait.','fiche 2 : '+JSON.stringify([r2.ing,r2.steps]));
 const others=gh.file.recipes.filter(r=>!['r-mwemc7xlpsf','r-mwembb27ub4'].includes(r.id)); chk(JSON.stringify(others)===JSON.stringify(real.recipes.filter(r=>!['r-mwemc7xlpsf','r-mwembb27ub4'].includes(r.id))),'les autres recettes strictement identiques');
 chk(/2 fiches enregistrées/.test(await sec.textContent())&&new RegExp((N1-2)+' recettes YouTube').test(await sec.textContent()),'message + reste '+(N1-2));
 await sec.scrollIntoViewIfNeeded(); await p.screenshot({path:__dirname+'/shot_fill.png'});
 await p.goto('http://localhost:8765/#r-mwemc7xlpsf'); await sleep(400); chk(/100 g de maïs/.test(await p.locator('#view,main').first().textContent()),'fiche affichée avec ses ingrédients');
 chk(p.errs.length===0,'aucune erreur JS '+p.errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ECHEC'); process.exit(ok?0:1);})();
