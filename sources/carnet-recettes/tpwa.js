const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'allow'});
 const p=await ctx.newPage(); const errs=[];
 p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|Failed to load resource/.test(m.text()))errs.push(m.text())}); p.on('pageerror',e=>errs.push(String(e)));
 await ctx.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 await p.goto('http://localhost:8765/'); await p.waitForTimeout(500);
 await p.evaluate(()=>navigator.serviceWorker.ready); await p.waitForTimeout(800);
 const cdp=await ctx.newCDPSession(p);
 const m=await cdp.send('Page.getAppManifest'); console.log('manifest errors',JSON.stringify(m.errors),'url',m.url);
 const ie=await cdp.send('Page.getInstallabilityErrors'); console.log('installability errors',JSON.stringify(ie.installabilityErrors));
 console.log('sw controlled',await p.evaluate(()=>!!navigator.serviceWorker.controller),'cache keys',await p.evaluate(async()=>{const c=await caches.open('carnet-v1');return (await c.keys()).map(r=>r.url.replace(location.origin,''))}));
 console.log('tiles',await p.locator('.tiles .tile').count(),'add button',await p.locator('a.btn').count(),'taktouka',await p.evaluate(()=>{location.hash='#tajines';return 1}));
 await p.waitForTimeout(100); console.log('tajines list',(await p.locator('.rn').allTextContents()).join(' | '));
 // hors ligne
 await p.reload(); await p.waitForTimeout(300); await p.evaluate(()=>navigator.serviceWorker.ready);
 await ctx.setOffline(true);
 const t0=Date.now(); await p.goto('http://localhost:8765/'); await p.waitForTimeout(400);
 console.log('hors ligne OK',await p.locator('h1').first().textContent(),Date.now()-t0,'ms');
 await p.goto('http://localhost:8765/#plats'); await p.waitForTimeout(200);
 console.log('hors ligne type',await p.locator('h1').first().textContent());
 await p.screenshot({path:'pwa-offline.png'});
 await ctx.setOffline(false);
 console.log('overflow',await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth));
 console.log('errors',JSON.stringify(errs));
 await b.close();
})();
