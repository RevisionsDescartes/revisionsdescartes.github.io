const {chromium}=require('playwright'); const fs=require('fs');
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
(async()=>{
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await ctx.route(/fonts\.|api\.github/,r=>r.abort());
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://localhost:8765/#accueil'); await p.waitForTimeout(500);
 const seed=JSON.parse(fs.readFileSync(__dirname+'/pwa/recettes.json','utf8')).recipes;
 for (const r of [seed[0], seed.find(x=>x.cook)||seed[1]]) {
  await p.goto('http://localhost:8765/#'+r.id); await p.waitForTimeout(300);
  const pos=await p.evaluate(()=>{const m=document.querySelector('.foot-meta'); const last=[...document.querySelector('#view').children].pop(); const h=document.querySelector('h1').getBoundingClientRect().bottom; return {isLast:last===m, below:m.getBoundingClientRect().top>h+100, txt:m.textContent}});
  chk(pos.isLast&&pos.below,'fiche '+r.id+' : infos en bas ('+pos.txt+')');
  if(r.cook) chk(await p.evaluate(()=>document.querySelectorAll('.meta').length===2&&!document.querySelector('h1').nextElementSibling.classList.contains('foot-meta')),'durée de cuisson reste en haut');
 }
 await p.screenshot({path:'pied.png',fullPage:true});
 chk(errs.length===0,'aucune erreur JS');
 await b.close(); console.log(ok?'TOUT OK':'ECHEC'); process.exit(ok?0:1);
})();
