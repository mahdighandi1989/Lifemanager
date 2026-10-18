# Pack a storyboard's images into a few JS data files so the artifact needs only a handful of files.
import sys,re,base64,os,json
d=sys.argv[1]; src=os.path.join(d,'index.html'); dst=os.path.join(d,'packed.html')
h=open(src,encoding='utf-8').read()
names=sorted(set(re.findall(r'src="(img/[^"]+)"',h)))
packs=[];cur={};size=0
for n in names:
    b='data:image/jpeg;base64,'+base64.b64encode(open(os.path.join(d,n),'rb').read()).decode()
    if size+len(b)>14.5e6 and cur: packs.append(cur);cur={};size=0
    cur[n]=b;size+=len(b)
if cur: packs.append(cur)
for f in os.listdir(d):
    if re.match(r'pack\d+\.js$',f): os.remove(os.path.join(d,f))
for i,p in enumerate(packs):
    open(os.path.join(d,'pack%d.js'%i),'w').write('window.SBIMG=Object.assign(window.SBIMG||{},'+json.dumps(p)+');')
h=re.sub(r'src="(img/[^"]+)"',r'data-sb="\1"',h)
loader='<script>(function(){var n=%d,k=0;function done(){var M=window.SBIMG||{};document.querySelectorAll("img[data-sb]").forEach(function(i){var u=M[i.getAttribute("data-sb")];if(u)i.src=u;});}for(var i=0;i<n;i++){var s=document.createElement("script");s.src="pack"+i+".js";s.onload=s.onerror=function(){if(++k===n)done();};document.head.appendChild(s);}})();</script>'%len(packs)
h=h.replace('</body>',loader+'</body>',1) if '</body>' in h else h+loader
open(dst,'w',encoding='utf-8').write(h)
print(d,len(names),'imgs',len(packs),'packs',[round(os.path.getsize(os.path.join(d,'pack%d.js'%i))/1e6,1) for i in range(len(packs))])
