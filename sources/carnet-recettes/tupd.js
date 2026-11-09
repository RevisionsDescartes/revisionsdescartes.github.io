const {chromium}=require('playwright'); const fs=require('fs');
const ver=p=>p.evaluate(()=>(document.querySelector('meta[name=ver]')||{}).content);
(async()=>{
 const b=await chromium.launch(); const ctx=await b.newContext({serviceWorkers:'allow'});
 await ctx.route(/fonts\./,r=>r.abort()); await ctx.route('https://api.github.com/**',r=>r.abort());
 const p=await ctx.newPage();
 await p.goto('http://localhost:8766/'); await p.evaluate(()=>navigator.serviceWorker.ready); await p.waitForTimeout(500);
 await p.reload(); console.log('avant mise à jour :',await ver(p));
 let s=fs.readFileSync('upd/index.html','utf8').replace('name="ver" content="1"','name="ver" content="2"'); fs.writeFileSync('upd/index.html',s);
 await p.reload(); await p.waitForTimeout(300);
 console.log('après mise à jour, 1 seul rechargement :',await ver(p),'(attendu 2)');
 await b.close();
})();
