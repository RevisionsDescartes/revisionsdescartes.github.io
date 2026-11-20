const {chromium}=require('playwright'); const fs=require('fs');
const real=JSON.parse(fs.readFileSync('/home/claude/carnet-recettes/recettes.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,OPTIONS'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const R={YouTube:0,Facebook:1,Maison:2};
(async()=>{const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block',colorScheme:process.argv[2]||'light'});
 await ctx.route(/fonts\.|ytimg/,r=>r.abort());
 await ctx.route('https://api.github.com/**',async route=>{const req=route.request();const u=new URL(req.url());
  const json=(s,o)=>route.fulfill({status:s,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:CORS});
  if(u.pathname.endsWith('/contents/recettes.json'))return json(200,{sha:'s1',content:Buffer.from(JSON.stringify(real)).toString('base64')});
  return json(200,{permissions:{pull:true,push:false}});});
 const p=await ctx.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(String(e)));
 await p.goto('http://localhost:8765/#accueil'); await sleep(1200);
 let rows=0,noBadge=0,bad=[],cnt={YouTube:0,Facebook:0,Maison:0};
 const pages=['plats','accomp','sauces','desserts','gateaux','petit-dej','salades','soupes','tajines','sandwichs','snacks','brico','aclasser','dejeuner','diner','a-completer'];
 for(const t of pages){ await p.goto('http://localhost:8765/#'+t); await sleep(200);
  for(const ul of await p.locator('ul.rows').all()){
   const labs=await ul.locator(':scope > li > a.row').evaluateAll(as=>as.map(a=>{const s=a.querySelector('.src');return s?s.title:''}));
   rows+=labs.length; labs.forEach(l=>{ if(!l) noBadge++; else cnt[l]++; });
   for(let i=1;i<labs.length;i++) if(R[labs[i]]<R[labs[i-1]]) { bad.push(t); break; }
  }}
 chk(rows>100&&noBadge===0,'toutes les lignes ont une pastille ('+rows+' lignes vues : YT '+cnt.YouTube+', FB '+cnt.Facebook+', maison '+cnt.Maison+')');
 chk(bad.length===0,'ordre YouTube → Facebook → maison dans chaque liste '+bad.join(','));
 // repas : ordre alphabétique conservé dans chaque groupe d'origine
 await p.goto('http://localhost:8765/#plats'); await sleep(200);
 const nm=await p.locator('ul.rows > li > a.row').evaluateAll(as=>as.map(a=>[a.querySelector('.src').title,a.querySelector('.rn').textContent]));
 const order=real.recipes.filter(r=>r.type==='plats').map(r=>r.name);
 let stable=true; ['YouTube','Facebook','Maison'].forEach(g=>{const seq=nm.filter(x=>x[0]===g).map(x=>order.indexOf(x[1])); for(let i=1;i<seq.length;i++) if(seq[i]<seq[i-1]) stable=false;});
 chk(stable,'ordre habituel conservé à l’intérieur de chaque groupe');
 await p.locator('.src[title=Maison]').first().scrollIntoViewIfNeeded(); await p.locator('a.row:has(.src[title=Maison])').first().evaluate(e=>window.scrollBy(0,-250)); await p.screenshot({path:__dirname+'/shot_maison_'+(process.argv[2]||'light')+'.png'});
 chk(p.errs.length===0,'aucune erreur JS '+p.errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ECHEC'); process.exit(ok?0:1);})();
