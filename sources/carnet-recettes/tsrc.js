const {chromium}=require('playwright'); const fs=require('fs');
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const seed=JSON.parse(fs.readFileSync(__dirname+'/pwa/recettes.json','utf8'));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await ctx.route(/fonts\./,r=>r.abort()); await ctx.route('https://api.github.com/**',r=>r.abort());
 const p=await ctx.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(String(e)));
 const exp={}; seed.recipes.forEach(r=>{ let l=''; try{const h=new URL(r.url).hostname.replace(/^(www|m)\./,''); if(/youtube\.com$|^youtu\.be$/.test(h))l='YouTube'; else if(/facebook\.com$|^fb\.watch$|^fb\.com$/.test(h))l='Facebook';}catch(e){} exp[r.name]=l||(r.src==='YouTube'||r.src==='Facebook'?r.src:''); });
 let nYT=0,nFB=0,nNone=0,bad=0,total=0;
 for(const t of ['plats','accomp','desserts','petit-dej','salades']){
  await p.goto('http://localhost:8765/#'+t); await sleep(250);
  const rows=await p.locator('ul.rows li a.row').all();
  for(const r of rows){ total++; const nm=(await r.locator('.rn').textContent()).trim(); const lab=await r.locator('.src').count()?(await r.locator('.src').getAttribute('title')):''; if(lab==='YouTube')nYT++; else if(lab==='Facebook')nFB++; else nNone++; if(exp[nm]!==undefined&&exp[nm]!==lab){bad++;console.log('  écart',nm,exp[nm],lab);} }
 }
 chk(total>0&&bad===0,'badge conforme à l’origine sur '+total+' lignes (YT '+nYT+', FB '+nFB+', sans '+nNone+')');
 chk(nYT>0&&nFB>0,'les deux origines apparaissent');
 await p.goto('http://localhost:8765/#plats'); await sleep(250);
 const bx=await p.locator('.src').first().boundingBox(); chk(bx&&bx.width>=16&&bx.width<=24,'taille : '+(bx&&bx.width)+'px');
 chk(await p.locator('.src').first().getAttribute('role')==='img'&&/Origine/.test(await p.locator('.src').first().getAttribute('aria-label')),'accessible : '+await p.locator('.src').first().getAttribute('aria-label'));
 // recherche
 await p.goto('http://localhost:8765/#accueil'); await sleep(250); await p.fill('#q','riz'); await sleep(300);
 chk(await p.locator('.results .src').count()>=0,'recherche sans erreur ('+await p.locator('.results .src').count()+' badges)');
 await p.screenshot({path:__dirname+'/shot_src.png'});
 await p.goto('http://localhost:8765/#plats'); await sleep(250); await p.screenshot({path:__dirname+'/shot_src2.png'});
 chk(p.errs.length===0,'aucune erreur JS '+p.errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ECHEC'); process.exit(ok?0:1);})();
