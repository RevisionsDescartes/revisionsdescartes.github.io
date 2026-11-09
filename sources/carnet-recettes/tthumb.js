const {chromium}=require('playwright'); const fs=require('fs');
const seed=JSON.parse(fs.readFileSync(__dirname+'/pwa/recettes.json','utf8'));
let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m); if(!c) ok=false};
const CORS={'access-control-allow-origin':'*'};
const urls=['https://youtu.be/AAAAAAAAAAA?si=x','https://www.youtube.com/watch?v=BBBBBBBBBBB&t=3','https://youtube.com/shorts/CCCCCCCCCCC','https://m.youtube.com/watch?v=DDDDDDDDDDD','https://www.facebook.com/reel/123','https://youtube.com.evil.com/watch?v=EEEEEEEEEEE','https://youtu.be/BROKEN00000','https://www.youtube.com/watch?v=court','']
const recipes=urls.map((u,i)=>({...JSON.parse(JSON.stringify(seed.recipes[i])),id:'t'+i,name:'Test '+i,type:'desserts',url:u,status:'',meals:[]}));
const file={recipes,typeOrder:[],dismissed:[]};
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==','base64');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 const reqs=[];
 await ctx.route('https://api.github.com/**',r=>{const q=r.request(),u=new URL(q.url());
   if(u.pathname.endsWith('/contents/recettes.json')&&q.method()==='GET') return r.fulfill({status:200,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify({sha:'s1',content:Buffer.from(JSON.stringify(file)).toString('base64')})});
   if(u.pathname==='/repos/RevisionsDescartes/carnet-recettes') return r.fulfill({status:200,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify({permissions:{pull:true,push:true}})});
   return r.fulfill({status:404,headers:CORS,body:'{}'}); });
 await ctx.route(/fonts\.|noembed|youtube\.com\/oembed/,r=>r.abort());
 await ctx.route(/i\.ytimg\.com/,r=>{reqs.push(r.request().url()); if(/BROKEN00000/.test(r.request().url())) return r.fulfill({status:404,body:''}); r.fulfill({status:200,contentType:'image/png',body:PNG,headers:CORS});});
 await ctx.addInitScript(()=>{ localStorage.setItem('carnet:cfg',JSON.stringify({repo:'RevisionsDescartes/carnet-recettes',token:'good'})); });
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://localhost:8765/#desserts'); await sleep(1200);
 const srcs=await p.locator('.row .th img').evaluateAll(a=>a.map(i=>i.getAttribute('src')));
 const want=['AAAAAAAAAAA','BBBBBBBBBBB','CCCCCCCCCCC','DDDDDDDDDDD'];
 chk(want.every(id=>srcs.some(s=>s==='https://i.ytimg.com/vi/'+id+'/mqdefault.jpg')),'miniatures pour youtu.be, watch?v=, shorts, m.youtube : '+srcs.length);
 chk(!reqs.some(u=>/EEEEEEEEEEE|court/.test(u)),'aucune requête pour un faux domaine ou un identifiant invalide');
 const nRows=await p.locator('.row').count(), nTh=await p.locator('.row .th').count();
 chk(nRows>=8&&nTh===nRows,'chaque ligne a sa vignette ou son pictogramme ('+nTh+'/'+nRows+')');
 chk(await p.locator('.row .th.ph').count()>=5,'lignes sans miniature : pictogramme du type (dont lien cassé 404)');
 const h=await p.evaluate(()=>[...document.querySelectorAll('.row')].map(r=>r.getBoundingClientRect().height));
 chk(Math.max(...h)<=62,'lignes toujours condensées (hauteur max '+Math.round(Math.max(...h))+' px)');
 // fiche
 await p.goto('http://localhost:8765/#t0'); await sleep(600);
 chk(await p.locator('.hero.hasphoto a.herolink img.heroimg').count()===1,'fiche : grande miniature');
 chk(await p.locator('a.herolink').getAttribute('href')==='https://youtu.be/AAAAAAAAAAA?si=x'&&await p.locator('a.herolink').getAttribute('target')==='_blank','miniature cliquable vers la vidéo');
 await p.goto('http://localhost:8765/#t4'); await sleep(500);
 chk(await p.locator('.hero.hasphoto').count()===0&&await p.locator('.hero .ic-box').count()===1,'fiche Facebook : pictogramme');
 await p.goto('http://localhost:8765/#t6'); await sleep(900);
 chk(await p.locator('.hero.hasphoto').count()===0&&await p.locator('.hero .ic-box').count()===1,'fiche : miniature 404 → pictogramme');
 // version
 await p.goto('http://localhost:8765/#reglages'); await sleep(400);
 const v=await p.locator('.buildno').textContent();
 chk(/^Version \d+ · \d{1,2} \S+ 20\d\d$/.test(v),'numéro de version : '+v);
 await p.goto('http://localhost:8765/#desserts'); await sleep(300);
 await p.screenshot({path:'thumb_list.png'});
 chk(errs.length===0,'aucune erreur JS '+errs.join('|'));
 await b.close(); console.log(ok?'TOUT OK':'ECHEC'); process.exit(ok?0:1);
})();
