const {chromium}=require('playwright'); const fs=require('fs');
const seed=JSON.parse(fs.readFileSync(__dirname+'/pwa/recettes.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,OPTIONS'};
const gh={file:{recipes:JSON.parse(JSON.stringify(seed.recipes)),typeOrder:['desserts','plats','accomp','petit-dej','salades','soupes','tajines','sandwichs','snacks','aclasser'],dismissed:[]},sha:1};
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
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await ctx.route('https://api.github.com/**',handler); await ctx.route(/fonts\.|youtube\.com\/oembed|noembed/,r=>r.abort());
 await ctx.addInitScript(()=>{ localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:'good'})); });
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://localhost:8765/#accueil'); await sleep(900);
 const tiles=await p.locator('.tiles .tile:not(.queue) .tn').allTextContents();
 const iB=tiles.findIndex(t=>/Astuces Brico/.test(t)), iA=tiles.findIndex(t=>/À classer/.test(t));
 chk(iB>=0&&(iA<0||iB<iA),'tuile « Astuces Brico » avant « À classer » malgré un ordre enregistré sans elle : '+tiles.join(' | '));
 chk(tiles[0]==='Desserts','ordre enregistré respecté (Desserts en premier)');
 const todo0=await p.locator('.tile.queue .tc').textContent();
 // formulaire
 await p.goto('http://localhost:8765/#ajouter/brico'); await sleep(400);
 chk(await p.locator('fieldset:has(input[name=meal])').isHidden(),'repas masqués pour une astuce');
 chk(await p.locator('#f-cook').isHidden()&&await p.locator('#f-serv').isHidden(),'cuisson et personnes masquées');
 chk(/Matériel/.test(await p.locator('label[for=f-ing]').textContent())&&/Titre de l/.test(await p.locator('label[for=f-name]').textContent()),'libellés adaptés');
 chk(await p.locator('button[type=submit]').last().textContent()==='Enregistrer l’astuce','bouton « Enregistrer l’astuce »');
 await p.fill('#f-name','Détartrer une bouilloire'); await p.fill('#f-steps','Verser du vinaigre blanc.\nLaisser agir 30 minutes.\nRincer.');
 await p.locator('button[type=submit]').last().click(); await sleep(900);
 const r=gh.file.recipes[0];
 chk(r.name==='Détartrer une bouilloire'&&r.type==='brico'&&r.steps.length===3&&r.meals.length===0&&r.cook===''&&r.servings==='','astuce enregistrée sans repas ni cuisson');
 const txt=await p.locator('#view').textContent();
 chk(/Astuce/.test(txt)&&!/Aucun ingrédient/.test(txt)&&!/Ingrédients/.test(txt)&&!/Matériel/.test(txt),'fiche : section « Astuce », pas d’ingrédients vides');
 chk(/Modifier cette astuce/.test(txt),'bouton « Modifier cette astuce »');
 chk(!await p.locator('.badge').count(),'pas de mention de fiabilité des ingrédients');
 // type + compteurs
 await p.goto('http://localhost:8765/#brico'); await sleep(400);
 chk(/1 astuce/.test(await p.locator('.banner .sub').textContent()),'liste du type : « 1 astuce »');
 // pas dans Sans repas ni dans À traiter
 await p.goto('http://localhost:8765/#accueil'); await sleep(300);
 chk(await p.locator('.tile.queue .tc').textContent()===todo0,'« À traiter » inchangé : '+todo0);
 await p.click('.seg a:has-text("Repas")'); await sleep(300);
 const rep=await p.locator('#view').textContent();
 chk(!/Détartrer/.test(rep),'absente de la vue Repas');
 const sansTxt=await p.locator('.tile:has-text("Sans repas") .tc').allTextContents();
 const nSansAvant=seed.recipes.filter(x=>!(x.meals||[]).length&&x.type!=='soupes').length;
 chk(sansTxt.length===0||!/\b19\b/.test(sansTxt[0]),'« Sans repas » ne compte pas l’astuce : '+sansTxt.join(','));
 // recherche
 await p.goto('http://localhost:8765/#accueil'); await sleep(300);
 await p.click('.seg a:has-text("Types")').catch(()=>{});
 await p.fill('#q','bouilloire'); await sleep(300);
 chk(/Détartrer/.test(await p.locator('.results').textContent()),'trouvée par la recherche');
 // plat normal : formulaire inchangé
 await p.goto('http://localhost:8765/#accueil'); await p.goto('http://localhost:8765/#ajouter/plats'); await sleep(400);
 chk(await p.locator('fieldset:has(input[name=meal])').isVisible()&&await p.locator('#f-cook').isVisible(),'plat : repas et cuisson visibles');
 chk(await p.locator('button[type=submit]').last().textContent()==='Enregistrer la recette','plat : bouton inchangé');
 // changer le type en cours de saisie
 await p.click('label.chip:has-text("Astuces Brico")'); await sleep(100);
 chk(await p.locator('#f-cook').isHidden(),'bascule vers astuce en cours de saisie');
 await p.click('label.chip:has-text("Plats")'); await sleep(100);
 chk(await p.locator('#f-cook').isVisible()&&await p.locator('label[for=f-name]').textContent().then(t=>/Nom du plat/.test(t)),'retour vers plat');
 // modification de l'astuce
 await p.goto('http://localhost:8765/#modifier/'+r.id); await sleep(500);
 chk(await p.locator('#f-cook').isHidden()&&await p.locator('button[type=submit]').last().textContent()==='Enregistrer les modifications','modification : champs adaptés');
 chk(errs.length===0,'aucune erreur JS '+errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ECHEC'); process.exit(ok?0:1);
})();
