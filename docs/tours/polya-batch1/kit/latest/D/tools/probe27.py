#!/usr/bin/env python3
# probe27.py — print JSON list of probe plan items (dump route/dossier/today text, then shots of route, dossier, today)
import json
dump=r"""(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));APP.ASSIST.toggle(false);const s=APP.ASSIST.cur();const ids=[...new Set([...(APP.liveAll?APP.liveAll().map(r=>r.p.id):[]),s&&s.id].filter(Boolean))];const out={ids,route:{},dossier:{}};
for(const id of ids){try{const m=APP.ROUTE.model(id);out.route[id]={dest:m.dest||'',pts:(m.pts||[]).map(p=>[p.kind||'',(p.title||'').slice(0,120),(p.detail||p.d||'').toString().slice(0,200)])}}catch(e){out.route[id]='ERR '+e.message}
try{APP.go('dossier',id);await w(1300);out.dossier[id]=document.getElementById('main').innerText.replace(/\n(?=[۰-۹0-9×=+−÷/.٫])/g,' ').replace(/([۰-۹0-9×=+−÷/.٫])\n/g,'$1 ').slice(0,30000)}catch(e){out.dossier[id]='ERR '+e.message}}
APP.go('today');await w(1300);out.today=document.getElementById('main').innerText.slice(0,3000);window.__pids=ids;return JSON.stringify(out)})()"""
items=[{'new':{'eval':dump},'tag':'pdump'},
 {'new':{'eval':"(async()=>{APP.ASSIST.toggle(false);APP.go('route',window.__pids[0]);await new Promise(r=>setTimeout(r,1500));return 'route'})()"},'tag':'proute'},
 {'new':{'eval':"(async()=>{APP.go('dossier',window.__pids[0]);await new Promise(r=>setTimeout(r,1500));return 'dossier'})()"},'tag':'pdos'},
 {'new':{'eval':"(async()=>{APP.go('today');await new Promise(r=>setTimeout(r,1500));return 'today'})()"},'tag':'ptoday'}]
print(json.dumps(items,ensure_ascii=False))
