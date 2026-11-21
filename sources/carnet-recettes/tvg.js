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
 const seen={}; let ytNoVg=0;
 for(const t of ['plats','accomp','sauces','desserts','gateaux','petit-dej','salades','soupes','tajines','sandwichs','snacks','brico','aclasser']){
  await p.goto('http://localhost:8765/#'+t); await sleep(150);
  const rs=await p.locator('ul.rows > li > a.row').evaluateAll(as=>as.map(a=>{const th=a.querySelector('.th');return [a.querySelector('.rn').textContent,a.querySelector('.src').title,th?(th.getAttribute('data-vg')||(th.querySelector('img')?'IMG':'icone')):'aucune',location.hash]}));
  rs.forEach(x=>seen[x[0]+'|'+x[3]]=x);
 }
 const rows=Object.values(seen), nonYT=rows.filter(x=>x[1]!=='YouTube');
 const by={}; nonYT.forEach(x=>{(by[x[2]]=by[x[2]]||[]).push(x[0].slice(0,42)+' ('+x[3].slice(1)+')')});
 Object.keys(by).sort().forEach(k=>console.log('['+k+'] '+by[k].length+' : '+by[k].join(' ; ')));
 chk(rows.filter(x=>x[1]==='YouTube').every(x=>x[2]==='IMG'||x[2]!=='aucune'),'YouTube : case miniature présente');
 chk(nonYT.filter(x=>x[2]!=='icone'&&x[2]!=='aucune').length>nonYT.length*0.6,'majorité des recettes Facebook/maison avec vignette ('+nonYT.filter(x=>x[2]!=='icone'&&x[2]!=='aucune').length+'/'+nonYT.length+')');
 await p.goto('http://localhost:8765/#'+(process.argv[3]||'desserts')); await sleep(300); await p.screenshot({path:__dirname+'/shot_vg_'+(process.argv[2]||'light')+'.png'});
 chk(p.errs.length===0,'aucune erreur JS '+p.errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ECHEC'); process.exit(ok?0:1);})();
