const {chromium}=require('playwright'); const fs=require('fs');
const seed=JSON.parse(fs.readFileSync(__dirname+'/pwa/recettes.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,OPTIONS'};
const mk=(i,o)=>({...JSON.parse(JSON.stringify(seed.recipes[i])),...o});
const gh={file:{recipes:[mk(0,{id:'yt1',name:'Poulet YouTube',type:'plats',url:'https://youtu.be/AAAAAAAAAAA?si=abc'}),mk(1,{id:'fb1',name:'Reel Facebook',type:'plats',url:'https://www.facebook.com/share/r/1Gh1ztiL99/?mibextid=xyz'}),mk(2,{id:'sans',name:'Sans lien',type:'plats',url:''})],typeOrder:[],dismissed:['https://www.facebook.com/reel/777/']},sha:1,puts:0};
async function handler(route){ const req=route.request(); const u=new URL(req.url());
  const json=(s,o)=>route.fulfill({status:s,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(req.method()==='OPTIONS') return route.fulfill({status:204,headers:CORS});
  if(u.pathname==='/repos/RevisionsDescartes/carnet-recettes') return json(200,{permissions:{pull:true,push:true}});
  if(u.pathname.endsWith('/contents/recettes.json')){
    if(req.method()==='GET') return json(200,{sha:'s'+gh.sha,content:Buffer.from(JSON.stringify(gh.file)).toString('base64')});
    if(req.method()==='PUT'){ const b=JSON.parse(req.postData()); gh.file=JSON.parse(Buffer.from(b.content,'base64').toString('utf8')); gh.sha++; gh.puts++; return json(200,{content:{sha:'s'+gh.sha}}); } }
  return route.fulfill({status:404,headers:CORS,body:'{}'}); }
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await ctx.route('https://api.github.com/**',handler); await ctx.route(/fonts\.|i\.ytimg|noembed|youtube\.com\/oembed/,r=>r.abort());
 await ctx.addInitScript(()=>{ localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:'good'})); });
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
 const open=async()=>{ await p.goto('http://localhost:8765/#accueil'); await sleep(200); await p.goto('http://localhost:8765/#ajouter'); await sleep(500); };
 const warn=()=>p.locator('.dupwarn');
 await p.goto('http://localhost:8765/#accueil'); await sleep(900); await open();
 chk(await warn().isHidden(),'pas d’alerte au départ');
 const cases=[['https://www.youtube.com/watch?v=AAAAAAAAAAA&t=10','Poulet YouTube','même vidéo, autre écriture (watch?v=)'],['https://youtube.com/shorts/AAAAAAAAAAA','Poulet YouTube','même vidéo en Short'],['https://m.facebook.com/share/r/1Gh1ztiL99','Reel Facebook','Facebook sans paramètre de suivi ni barre finale']];
 for(const [u,name,lbl] of cases){ await p.fill('#f-url',u); await sleep(150); const t=await warn().textContent(); chk(await warn().isVisible()&&t.includes('déjà dans le carnet')&&t.includes(name),lbl); }
 chk(await warn().locator('a').getAttribute('href')==='#fb1','lien « Voir la fiche » vers la recette existante');
 await p.fill('#f-url','https://youtu.be/BBBBBBBBBBB'); await sleep(150);
 chk(await warn().isHidden(),'autre vidéo : pas d’alerte');
 await p.fill('#f-url','https://www.facebook.com/reel/777'); await sleep(150);
 chk(/déjà retiré ce lien/.test(await warn().textContent()),'lien déjà retiré : alerte dédiée');
 await p.fill('#f-url',''); await sleep(150); chk(await warn().isHidden(),'champ vidé : alerte effacée');
 // non bloquant
 await p.fill('#f-url','https://youtu.be/AAAAAAAAAAA'); await p.fill('#f-name','Doublon voulu'); await p.locator('button[type=submit]').last().click(); await sleep(900);
 chk(gh.puts===1&&gh.file.recipes[0].name==='Doublon voulu','l’alerte ne bloque pas l’enregistrement');
 // partage
 await p.goto('http://localhost:8765/?url='+encodeURIComponent('https://www.facebook.com/share/r/1Gh1ztiL99/')); await sleep(900);
 chk(await warn().isVisible()&&/Reel Facebook/.test(await warn().textContent()),'partage Android : alerte dès l’ouverture');
 // modification : pas d'alerte contre soi-même
 await p.goto('http://localhost:8765/#modifier/fb1'); await sleep(600);
 chk(await warn().isHidden(),'modification : pas d’alerte sur sa propre fiche');
 await p.fill('#f-url','https://youtu.be/AAAAAAAAAAA'); await sleep(150);
 chk(await warn().isVisible(),'modification : alerte si le lien est celui d’une autre fiche');
 chk(errs.length===0,'aucune erreur JS '+errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ECHEC'); process.exit(ok?0:1);
})();
