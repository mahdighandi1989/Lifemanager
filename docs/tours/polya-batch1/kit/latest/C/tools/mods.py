import json,subprocess,os
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27C'
DUMP="(()=>{const o=[];APP.liveAll().forEach(r=>{try{const d=APP.dossier(r.p.id);const c=APP.liveClosure(r.p.id)||{};o.push('## '+r.p.title+' ['+(c.state||'')+'/'+APP.livePhase(r.p.id)+']\\n'+(d.events||[]).map(e=>'  '+e.k+' · '+String(e.title||'').slice(0,60)+' · '+String(e.text||e.body||e.sum||e.v||'').replace(/\\s+/g,' ').slice(0,110)).join('\\n'))}catch(e){o.push('ERR '+e.message)}});return o.join('\\n')})()"
def ins(sid,after,items):
    p=subprocess.run(['python3',R+'/tools/ins.py',sid,str(after)],input=json.dumps(items,ensure_ascii=False).encode(),capture_output=True); print(sid,p.stdout.decode().strip(),p.stderr.decode()[-300:])
def setsay(sid,n,text,files=None):
    f=f'{R}/src/{sid}/ctl/c{n}.json'; j=json.load(open(f)); assert 'say' in j; j['say']=text
    if files is not None: j['files']=files
    open(f,'w').write(json.dumps(j,ensure_ascii=False))
D={'eval':DUMP}
# s29: fresh sketch + coincidental 40 (T9); bank 50 after the 44 correction
setsay('s29',16,'طرحمو کشیدم و پیوست کردم: مسیر A و B رو عمود کشیدم و C موازی A. فکر کنم مرکز وسطِ بینِ A و C و روی نیمسازِ A و B است. حوض هم باید ۴۰ متر از درِ ورودی فاصله داشته باشه که آبش به ساختمون نزنه.',[{'path':R+'/sketch.png','type':'image/png'}])
ins('s29',109,[D,{'say':'یه سؤال: وقتی صفحه پرسید «این‌جا هم عوض شود؟»، عددهای داخلِ متنِ پیشنهادی رو هم از نو حساب کرد؟ و اون «۴۰ متر از درِ ورودی» که برای حوض گفتم که ربطی به لبه نداره، دست‌نخورده موند؟'},{'sys':3},D])
# oC1: T7 small-step correction 5=>4
ins('oC1',33,[{'say':'یه اصلاحِ کوچیک: اون هفته کتاب ۴ ساعت شد، نه ۵.'},{'sys':3},D])
# pwC1: T4 third report + T3 shapes (correct and wrong) + T11 correction with question
ins('pwC1',49,[{'say':'یه گزارشِ سوم از کارِ خودم: گامِ ۷ — افتِ فشارِ لوله رو از جدولِ سازنده درآوردم، حدودِ ۱۲ متره؛ پس ارتفاعِ کلِ پمپاژ ۴۰ + ۱۲ = ۵۲ متر. گامِ ۸ — پر شدنِ مخزن: ۲۵۰ ÷ ۱۵٫۶ ≈ ۱۶ ساعت.'},{'sys':3},
 {'say':'چند تا حسابِ دیگه برای اتاقکِ پمپ: کفش ۳ متر در ۴ متر = ۱۲ مترمربع؛ دورش ۲ × (۳ + ۴) = ۱۴ متر؛ پر کردنِ مخزنِ آزمایشیِ ۲۹۴۳۰۰ لیتری با ۴۸ لیتر در ثانیه: ۲۹۴۳۰۰ ÷ ۴۸ = ۶۱۳۱ ثانیه، حدودِ ۱۰۲ دقیقه.'},
 {'say':'اتاقکِ دوم برای تابلوبرق: ۳ متر در ۵ متر = ۱۸ مترمربع، دورش ۲ × (۳ + ۵) = ۱۸ متر.'},
 {'say':'یه اصلاح: قیمتِ هر پنل ۵ میلیون بود نه ۴٫۵ — حالا سهمِ هر برادر چقدر میشه؟'},{'sys':3},D])
# pwC2: bank 49, T8 two open predictions, outcomes
ins('pwC2',46,[{'say':'نوشتم «جمعهٔ بعد» و یه بار هم فقط گفتم «باشه» — هر دوش ثبت شد؟ کجا می‌بینمش؟'},
 {'say':'قبل از حسابِ مهره‌ها دو تا پیش‌بینی می‌کنم: احتمالِ دو قرمز حدودِ ۳۰٪ درمیاد، ۶۰ درصد مطمئنم. و اگه تاس رو ۶۰ بار بندازم حدودِ ۱۰ بار جمع ۷ میاد، ۷۰ درصد مطمئنم.'},{'sys':3},
 {'say':'مهره‌ها رو حساب کردم: ۳/۵ × ۲/۴ = ۶/۲۰ = ۳/۱۰، یعنی ۳۰٪. درست درومد.'},{'sys':3},
 {'say':'تاس رو ۶۰ بار انداختم، ۱۱ بار جمع ۷ اومد.'},{'sys':3},D,{'shot':'x_today_fc'},{'eval':"(()=>{APP.go('today');return new Promise(r=>setTimeout(()=>r(document.querySelector('#main').innerText.slice(0,2500)),1200))})()"}])
# s25: T10 division three ways + arithmetic battery
ins('s25',125,[{'say':'سه تا حسابِ دیگه برای نوه‌م: ۲۶ ÷ ۴ = ۶٫۵، ۱۰۰ تقسیم بر ۷ = ۱۴، و ۱۳/۱۲ = ۱.'},
 {'say':'و اینا: ۱ + ۲ + … + ۲۰ = ۲۱۰، ۲۰ درصدِ ۳۰۰ = ۶۰، مساحتِ دایره با شعاعِ ۲ میشه π × ۲² ≈ ۱۲٫۵۷. اینا رو هم نوه‌م نوشته: ۱ + ۲ + … + ۱۰ = ۵۰ و ۲۰ درصدِ ۳۰۰ = ۶۶.'},{'sys':3}])
# aC3: scale words (C15/C23), festive dates
ins('aC3',35,[{'say':'حساب کردم: ۶ میلیون × ۱۰ = ۶۰ میلیون، داروی سه ماه ۲ میلیون × ۳ = ۶ میلیون، و ۲۰ درصدِ ۳۰۰ هزار = ۶۰ هزار. یه جا هم اشتباهی نوشتم ۲ میلیون × ۳ = ۶ هزار.'},
 {'say':'سرِ برج دوباره ۶ میلیون می‌ذارم کنار. عید هم می‌رم پیش دخترم، پس تا آخرِ سال باید کلِ پول جمع باشه.'},{'sys':3},{'shot':'x_today_fest'},{'eval':"(()=>{APP.go('today');return new Promise(r=>setTimeout(()=>r(document.querySelector('#main').innerText.slice(0,2500)),1200))})()"}])
# aC1: bare first name
ins('aC1',36,[{'say':'یه معمای دیگه: داداشم علی میگه اگه من ۶ تا تیله‌ م رو بهش بدم، تیله‌هامون برابر میشه. ثبتش کن ببینم درسته یا نه.'},{'eval':"(()=>APP.liveAll().map(r=>r.p.title).join(' | ')+' || '+document.querySelector('#main').innerText.slice(0,600))()"},{'shot':'x_title_name'}])
# s28: bank 48
ins('s28',20,[{'say':'یه سؤال: تو صورتِ این معما «سه‌شنبه» هست. صفحه اینو یه قرار برای من حساب نمی‌کنه؟'},{'sys':3},{'shot':'x_today_tue'},{'eval':"(()=>{APP.go('today');return new Promise(r=>setTimeout(()=>r(document.querySelector('#main').innerText.slice(0,2000)),1200))})()"}])
