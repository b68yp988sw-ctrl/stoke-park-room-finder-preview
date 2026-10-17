// Stoke Park Room Finder – offline service worker. Cache name is versioned by build hash.
const CACHE='spf-07f3237a12';
const ASSETS=['./','index.html','estate-patrols.jpg','estate-golf.jpg','estate-zones.jpg','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('spf-')&&k!=CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data=='status'){caches.open(CACHE).then(c=>Promise.all(ASSETS.map(u=>c.match(u)))).then(r=>{e.source&&e.source.postMessage({type:'status',cached:r.every(Boolean),version:CACHE})})}});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!='GET'||new URL(req.url).origin!=location.origin)return;
  const nav=req.mode=='navigate';
  e.respondWith(caches.open(CACHE).then(async c=>{
    const key=nav?'./':req;
    const hit=await c.match(key,{ignoreSearch:true});
    const net=fetch(req).then(r=>{if(r&&r.ok)c.put(key,r.clone());return r}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}            // cache-first, update in background
    const r=await net;if(r)return r;
    return (nav&&await c.match('index.html'))||new Response('Offline and not saved yet',{status:503,headers:{'Content-Type':'text/plain'}});
  }));
});
