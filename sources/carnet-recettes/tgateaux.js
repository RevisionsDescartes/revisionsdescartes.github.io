const {chromium}=require('playwright'); const fs=require('fs');
const seed=JSON.parse(fs.readFileSync(__dirname+'/pwa/recettes.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,OPTIONS'};
const mk=(i,o)=>({...JSON.parse(JSON.stringify(seed.recipes[i])),...o});
const gh={file:{recipes:[mk(0,{id:'g-un',name:'Gâteau au yaourt',type:'desserts',url:'',meals:[]}),mk(1,{id:'p-un',name:'Poulet',type:'plats',url:'',meals:[]})],
  typeOrder:['plats','accomp','sandwichs','tajines','salades','soupes','petit-dej','snacks','desserts','brico','aclasser'],dismissed:[]},sha:1};
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
 await ctx.route('https://api.github.com/**',handler); await ctx.route(/fonts\.|i\.ytimg|noembed|youtube\.com\/oembed/,r=>r.abort());
 await ctx.addInitScript(()=>{ localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:'good'})); });
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://localhost:8765/#accueil'); await sleep(900);
 const tiles=await p.locator('.tiles .tile:not(.queue) .tn').allTextContents();
 const iD=tiles.indexOf('Desserts'), iG=tiles.indexOf('Gâteaux'), iB=tiles.findIndex(t=>/Astuces/.test(t)); chk(tiles.indexOf('Sauces')===tiles.findIndex(t=>/Accompagne/.test(t))+1,'Sauces juste après Accompagnements');
 chk(iG===iD+1&&iB===iG+1,'ordre enregistré respecté : « Gâteaux » juste après Desserts : '+tiles.join(' | '));
 chk(tiles[0]==='Plats','reste de l’ordre inchangé');
 chk(/Aucune/.test(await p.locator('.tile:has-text("Gâteaux") .tc').textContent()),'tuile vide : « Aucune pour l’instant »');
 chk(await p.locator('.tile:has-text("Gâteaux") svg').count()>=1,'icône présente');
 // ajout dans le type
 await p.goto('http://localhost:8765/#gateaux'); await sleep(400);
 chk(/Aucune recette pour l/.test(await p.locator('.banner .sub').textContent()),'liste vide du type');
 await p.goto('http://localhost:8765/#ajouter/gateaux'); await sleep(400);
 chk(await p.locator('input[name=type][value=gateaux]').isChecked(),'type Gâteaux prérempli');
 await p.fill('#f-name','Fondant au chocolat'); await p.locator('button[type=submit]').last().click(); await sleep(900);
 chk(gh.file.recipes[0].type==='gateaux','recette enregistrée dans Gâteaux');
 // reclasser un dessert existant en gâteau via la modification
 await p.goto('http://localhost:8765/#modifier/g-un'); await sleep(500);
 await p.click('label.chip:has(input[value=gateaux])'); await p.locator('button[type=submit]').last().click(); await sleep(900);
 chk(gh.file.recipes.find(r=>r.id==='g-un').type==='gateaux','un dessert peut être reclassé en Gâteaux');
 await p.goto('http://localhost:8765/#gateaux'); await sleep(400);
 chk(/2 recettes/.test(await p.locator('.banner .sub').textContent()),'liste du type : 2 recettes');
 await p.goto('http://localhost:8765/#accueil'); await sleep(300);
 chk(/Aucune/.test(await p.locator('.tile:has-text("Desserts") .tc').textContent()),'Desserts vide après déplacement');
 // sans ordre enregistré : ordre par défaut
 gh.file.typeOrder=[]; gh.sha++; await p.reload(); await sleep(900);
 const t2=await p.locator('.tiles .tile:not(.queue) .tn').allTextContents();
 chk(t2.indexOf('Gâteaux')===t2.indexOf('Desserts')+1,'ordre par défaut : après Desserts');
 await p.screenshot({path:'gateaux_home.png',fullPage:true});
 chk(errs.length===0,'aucune erreur JS '+errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ECHEC'); process.exit(ok?0:1);
})();
