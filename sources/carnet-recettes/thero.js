const {chromium}=require('playwright'); const fs=require('fs');
const real=JSON.parse(fs.readFileSync('/home/claude/carnet-recettes/recettes.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,accept','access-control-allow-methods':'GET,PUT,OPTIONS'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block',colorScheme:process.argv[2]||'light'});
 await ctx.route(/fonts\.|ytimg/,r=>r.abort());
 await ctx.route('https://api.github.com/**',async route=>{const req=route.request();const u=new URL(req.url());
  if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:CORS});
  return route.fulfill({status:200,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(u.pathname.endsWith('/contents/recettes.json')?{sha:'s1',content:Buffer.from(JSON.stringify(real)).toString('base64')}:{permissions:{pull:true,push:false}})});});
 const p=await ctx.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(String(e)));
 await p.goto('http://localhost:8765/#accueil'); await sleep(1200);
 let n=0,same=0,bad=[];
 for(const t of ['plats','desserts','gateaux','snacks','sandwichs','accomp','soupes','brico']){
  await p.goto('http://localhost:8765/#'+t); await sleep(150);
  const rows=await p.locator('ul.rows > li > a.row').evaluateAll(as=>as.map(a=>[a.getAttribute('href'),(a.querySelector('.th')||{getAttribute:()=>null}).getAttribute('data-vg'),!!a.querySelector('.th.ph')]));
  for(const [href,vg,ph] of rows.slice(0,6)){ await p.goto('http://localhost:8765/'+href); await sleep(150);
   const hv=await p.locator('.hero').getAttribute('data-vg'); const hph=await p.locator('.hero .ic-box').count();
   n++; if((vg&&hv===vg)||(!vg&&hph&&!hv)) same++; else bad.push(href+' '+vg+' / '+hv);
  }}
 chk(same===n,'fiche = même image que la liste ('+same+'/'+n+') '+bad.slice(0,4).join(' | '));
 await p.goto('http://localhost:8765/#plats'); await sleep(150);
 const h1=await p.locator('ul.rows > li > a.row:has(.th.vg)').first().getAttribute('href'); await p.goto('http://localhost:8765/'+h1); await sleep(300);
 const bx=await p.locator('.hero.vg svg').boundingBox(); chk(bx&&bx.width>300&&bx.height>150&&bx.height<=225,'grande vignette : '+Math.round(bx.width)+'×'+Math.round(bx.height));
 await p.screenshot({path:__dirname+'/shot_hero_'+(process.argv[2]||'light')+'.png'});
 chk(p.errs.length===0,'aucune erreur JS '+p.errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ECHEC'); process.exit(ok?0:1);})();
