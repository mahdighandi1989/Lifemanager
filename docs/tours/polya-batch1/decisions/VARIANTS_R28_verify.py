"""Recomputes every arithmetic fact of VARIANTS_R28 with exact rationals, enumerates every reading of «N میلیون و M» (C84),
checks weekday offsets (Saturday-Friday weeks) and sweeps the bank for «a op b = c»."""
from fractions import Fraction as F
from itertools import product
import math, json, os, re
ok=[]
def chk(name, cond):
    assert cond, name
    ok.append(name)
def rnd(x, d):      # round half away from zero at d decimals
    q=F(10)**d; y=abs(F(x))*q; r=F(math.floor(y+F(1,2)),1)/q
    return r if x>=0 else -r
def trc(x, d):      # truncate toward zero at d decimals
    q=F(10)**d; y=abs(F(x))*q; r=F(math.floor(y),1)/q
    return r if x>=0 else -r
def c25(x, n): return F(n) in (rnd(x,0), trc(x,0))
def c9(x, s):       # her decimal s (string) accepted iff rounding or truncation of x at her digits
    d=len(s.split('.')[1]) if '.' in s else 0
    return F(s) in (rnd(x,d), trc(x,d))
def sqrt_trunc(v, d):   # floor(sqrt(v)*10^d)/10^d exactly, v a non-negative rational with integer value
    v=F(v); assert v.denominator==1
    return F(math.isqrt(int(v)*10**(2*d)), 10**d)
def sqrt_ok(v, s):  # «√v ≈ s»: s is the rounding or truncation of √v at her digits
    d=len(s.split('.')[1]) if '.' in s else 0
    t=sqrt_trunc(v,d); up=sqrt_trunc(v,d+1)
    r=t if (up-t)*10**d*10 < 5 else t+F(1,10**d)     # rounding from the (d+1)-th digit (√v is irrational here, no ties)
    return F(s) in (t, r)
M=10**6; K=10**3; B=10**9
# ---------------- C84 readings: an amount is (N, big, M, sub) — sub None = bare M (two readings), sub given = explicit
def rd(N, big, Mv=None, sub=None):
    if Mv is None: return [F(N)*big]
    if sub is not None: return [F(N)*big+F(Mv)*sub]
    return [F(N)*big+F(Mv), F(N)*big+F(Mv)*big/1000]        # u = units, k = next lower named scale
def verdict(op, terms, res):
    """op applied left to right over terms (each a list of readings); counts fitting combinations."""
    fits=0
    for combo in product(*terms, res):
        *xs, r = combo
        v=xs[0]
        for x in xs[1:]: v = {'+':v+x,'-':v-x,'*':v*x,'/':v/x}[op]
        fits += (v==r)
    return 'OK' if fits==1 else 'ASK-SCALE' if fits>=2 else 'FLAG'
S=lambda n: [F(n)]
# R1 positives
chk('c84 7.6+3.5=11.1', verdict('+',[rd(7,M,600),rd(3,M,500)],rd(11,M,100))=='OK')
chk('c84 7.6+3.5 others', F(7000600+3000500)==10001100 and 7600000+3000500==10600500 and 7000600+3500000==10500600)
chk('c84 2.4+0.6=3', verdict('+',[rd(2,M,400),S(600*K)],rd(3,M))=='OK' and 2000400+600000==2600400)
chk('c84 4.3+1.7=6', verdict('+',[rd(4,M,300),rd(1,M,700)],rd(6,M))=='OK' and 4000300+1000700==5001000 and 4300000+1000700==5300700 and 4000300+1700000==5700300)
chk('c84 15.25-4.75=10.5', verdict('-',[rd(15,M,250),rd(4,M,750)],rd(10,M,500))=='OK' and 15000250-4000750==10999500 and 15250000-4000750==11249250 and 15000250-4750000==10250250)
chk('c84 5.8+2.6=7.4 none', verdict('+',[rd(5,M,800),rd(2,M,600)],rd(7,M,400))=='FLAG' and 5800000+2600000==8400000 and 5000800+2000600==7001400 and 5800000+2000600==7800600 and 5000800+2600000==7600800)
chk('c84 4.5x10=40 none', verdict('*',[rd(4,M,500),S(10)],rd(40,M))=='FLAG' and 4500000*10==45000000 and 4000500*10==40005000)
chk('c84 2.3x3=6.9 two', verdict('*',[rd(2,M,300),S(3)],rd(6,M,900))=='ASK-SCALE' and 2300000*3==6900000 and 2000300*3==6000900)
chk('c84 12.4/4=3.1 two', verdict('/',[rd(12,M,400),S(4)],rd(3,M,100))=='ASK-SCALE' and F(12400000,4)==3100000 and F(12000400,4)==3000100)
chk('c84 4.2+1.5=5.7 two', verdict('+',[rd(4,M,200),rd(1,M,500)],rd(5,M,700))=='ASK-SCALE')
chk('c84 1.2B+0.8B=2B', verdict('+',[rd(1,B,200),S(800*M)],rd(2,B))=='OK' and 1000000200+800000000==1800000200)
chk('c84 14x250k=3.4 none', verdict('*',[S(14),S(250*K)],rd(3,M,400))=='FLAG' and 14*250000==3500000)
chk('c84 3.7+0.3=4', verdict('+',[rd(3,M,700),S(300*K)],rd(4,M))=='OK' and 3000700+300000==3300700)
chk('c84 8.5x2=17', verdict('*',[rd(8,M,500),S(2)],rd(17,M))=='OK' and 8000500*2==16001000)
chk('c84 2.25+1.8+0.95=5', verdict('+',[rd(2,M,250),rd(1,M,800),S(950*K)],rd(5,M))=='OK'
    and 2000250+1000800+950000==3951050 and 2250000+1000800+950000==4200800 and 2000250+1800000+950000==4750250)
# R1 negatives (C84)
chk('c84 5.8+2.6=8.4', verdict('+',[rd(5,M,800),rd(2,M,600)],rd(8,M,400))=='OK')
chk('c84 2.4+0.6=3.2 none', verdict('+',[rd(2,M,400),S(600*K)],rd(3,M,200))=='FLAG')
chk('c84 6.8k+2.3k=9.1k', verdict('+',[rd(6,M,800,K),rd(2,M,300,K)],rd(9,M,100,K))=='OK')
chk('c84 4.5x10=45', verdict('*',[rd(4,M,500),S(10)],rd(45,M))=='OK')
chk('c84 3.6/2=1.8', verdict('/',[rd(3,M,600),S(2)],rd(1,M,800))=='OK' and F(3000600,2)==1500300)
chk('c84 4.2+1.5=5.7k', verdict('+',[rd(4,M,200),rd(1,M,500)],rd(5,M,700,K))=='OK')
chk('c84 14x250k=3.5M', verdict('*',[S(14),S(250*K)],rd(3,M,500,K))=='OK')
# C85 remainder clauses (the sum is judged alone; the clause is its own statement)
chk('c85 6+6+6=18 of 20', 6+6+6==18 and 20-18==2)
chk('c85 7x4=28 of 30', 7+7+7+7==28 and 30-28==2)
chk('c85 4x8=32 of 35', 4*8==32 and 35-32==3)
chk('c85 5+5=10 of 14', 5+5==10 and 14-10==4)
chk('c85 9+9=18 of 19', 9+9==18 and 19-18==1)
chk('c85 8+8+8=24 of 27', 8+8+8==24 and 27-24==3)
chk('c85 6+6+6!=19', 6+6+6!=19)
chk('c85 3x7=21 of 25', 3*7==21 and 25-21==4)
chk('c85 4x4=16 of 17, 5 bags', 4*4==16 and 17-16==1 and -(-17//4)==5)
chk('c85 neg 20-15=5', 20-15==5)
chk('c85 neg false remainder', 6+6+6==18 and 20-18==2 and 20-18!=5)
chk('c85 neg 8+8=16', 8+8==16)
# sqrt / a√b
chk('sqrt50 7.07', sqrt_ok(50,'7.07'))
chk('sqrt20 not 4.72', not sqrt_ok(20,'4.72') and sqrt_trunc(20,2)==F('4.47'))
chk('3√2 4.24', sqrt_ok(18,'4.24'))
chk('5√3 8.66', sqrt_ok(75,'8.66'))
chk('sqrt49=7', math.isqrt(49)**2==49 and math.isqrt(49)==7 and 7!=8)
chk('sqrt2 not 1.42', not sqrt_ok(2,'1.42') and sqrt_trunc(2,2)==F('1.41'))
chk('2√5 not 4.97', not sqrt_ok(20,'4.97'))
# «A و N دهم»
chk('3.5x4', F('3.5')*4==14)
chk('2.7+1.8', F('2.7')+F('1.8')==F('4.5'))
chk('6.4x2', F('6.4')*2==F('12.8')!=F('13.8'))
chk('7+3', 7+3==10)
print(len(ok),'facts verified (R1)')
# ---------------- R2 «مسئلهٔ رنگ‌آمیزی»
def paint(L=5,W=4,H=3,cov=9,can=4,price=850,extra=300):
    g1=2*(F(L)+F(W))*F(H); g2=g1/F(cov); g3=g2*2; g4=g3/F(can); g5=g4*F(price); g6=g5+extra
    return g1,g2,g3,g4,g5,g6
chk('paint base', paint()==(54,6,12,3,2550,2850))
chk('paint width 5.5', paint(W=F('5.5'))==(63,7,14,F('3.5'),2975,3275) and F(2850)*63/54==3325)
chk('paint cov 10', paint(cov=10)==(54,F('5.4'),F('10.8'),F('2.7'),2295,2595) and F(2850)*9/10==2565)
chk('paint price 900', paint(price=900)[4:]==(2700,3000) and trc(F(2850)*900/850,1)==F('3017.6'))
chk('paint width+cov', paint(W=F('5.5'),cov=10)==(63,F('6.3'),F('12.6'),F('3.15'),F('2677.5'),F('2977.5')))
chk('paint can 5', paint(can=5)[3:]==(F('2.4'),2040,2340))
chk('rent', F(18*M,4)==4500000 and F(18*M,5)==3600000)
chk('cement', 5*280==1400 and 1400+800==2200 and 2200-300==1900 and 1900!=1800)
chk('trip', 4*2*600==4800 and 5*2*600==6000 and 4*3*600==7200)
chk('carpet', 4*5==20 and 20*150==3000 and 4*F('5.5')==22 and 22*150==3300 and F('5.5')*5==F('27.5') and F('27.5')*150==4125)
chk('sofa', 20*F('0.9')==18 and 20*F('0.88')==F('17.6'))
chk('ladder', 3**2+4**2==25 and math.isqrt(25)==5 and 3**2+5**2==34 and sqrt_ok(34,'5.83') and math.isqrt(34)**2!=34)
chk('book', F(48,12)==4 and F(48,16)==3)
chk('laps', 12*10==120 and 14*10==140 and 12+8==20)
print(len(ok),'facts verified (+R2)')
# ---------------- R3 weekday offsets (Saturday-Friday week)
WD=['sat','sun','mon','tue','wed','thu','fri']
def first_after(d0, target):
    n=(WD.index(target)-WD.index(d0))%7
    return n or 7
chk('wed->thu 1', first_after('wed','thu')==1)
chk('wed->sat 3', first_after('wed','sat')==3)
chk('wed->wed 7', first_after('wed','wed')==7)
chk('wed->fri 2', first_after('wed','fri')==2)
chk('mon->sun 6', first_after('mon','sun')==6)
chk('mon->thu 3', first_after('mon','thu')==3)
chk('tue->thu 2', first_after('tue','thu')==2)
chk('tue->sat 4', first_after('tue','sat')==4)
chk('edit: thu after wed (said) vs after thu (edited)', first_after('wed','thu')==1 and 1+first_after('thu','thu')==8)
chk('fri->fri 7', first_after('fri','fri')==7)
print(len(ok),'facts verified (+R3)')
# ---------------- R4 numeric settles
chk('r4 3<5 nashod', 3<5)
chk('r4 17.5>16 shod', F('17.5')>16)
chk('r4 4>2 nashod', 4>2)
chk('r4 15 vs about 8', 15>8*F(3,2))
print(len(ok),'facts verified (+R4)')
# ---------------- R5
chk('r5 25Mx12', 25*M*12==300*M and 300*M!=300*K)
chk('r5 15Mx18', 15*M*18==270*M)
chk('r5 100/8', F(100,8)==F('12.5') and c25(F(100,8),13))
chk('r5 6x7', 6*7==42!=48)
chk('r5 4Mx12', 4*M*12==48*M)
chk('r5 floor', 6*4==24 and 6*5==30)
chk('r5 brother', 6*250==1500!=1400 and 3*150==450 and 12*12==144 and 3*400==1200)
chk('r5 child', 4*9==36)
chk('r5 tank', F(240,8)==30)
chk('r5 unreported', 18*F('1.25')==F('22.5') and F('22.5')/3==F('7.5'))
chk('r5 puzzle', 9-5==4 and 9+4==13)
chk('r5 karetu', F(-35,5)==-7 and 1+F('0.3')==F('1.3'))
chk('r5 neg', 6*8==48!=46 and 8*15==120!=110 and 3*450==1350!=1300 and 8*12==96 and 5*80==400)
print(len(ok),'facts verified (+R5)')
# ---------------- R6 «مسئلهٔ تانکر»
chk('r6 tables', F(36,4)==9)
chk('r6 car', F(72000,3600)==20 and 20*10==200)
chk('r6 pool', F(48,6)==8 and F(48,8)==6)
chk('r6 tanker', 20000*5==100000 and F(100000,8000)==F('12.5') and not c25(F('12.5'),15) and not c25(F('12.5'),11) and 15*200==3000)
chk('r6 fix', F('12.5')*200==2500 and F(2500,5)==500)
chk('r6 hypo', F(100000,10000)==10)
chk('r6 c74', 20000*4==80000 and F(80000,8000)==10 and 10*200==2000)
chk('r6 child', 3*8==24 and 24-5==19)
chk('r6 eggs', 2*3==6)
print(len(ok),'facts verified (+R6)')
# ---------------- R7
chk('r7 irrigation', F(3000,1200)==F('2.5'))
chk('r7 fee', F(5,1000)*200000==1000)
chk('r7 triangle', 30**2==900 and 40**2==1600 and math.isqrt(2500)==50)
chk('r7 shelves', 3*80==240)
print(len(ok),'facts verified (+R7)')
# ---------------- sweep: every «a op b [op c] = d» written with digits in the bank
here=os.path.dirname(os.path.abspath(__file__))
bank=json.load(open(os.path.join(here,'VARIANTS_R28.json'),encoding='utf-8'))
tr=str.maketrans('۰۱۲۳۴۵۶۷۸۹٫','0123456789.')
num=r'\d+(?:\.\d+)?'
pat=re.compile(rf'(?<![\d./^²])(−|-)?({num})\s*([×+\-−÷])\s*({num})(?:\s*([×+\-−÷])\s*({num}))?\s*(?:=|≈)\s*(?:حدود\s*)?(−|-)?({num})(?![\d/^²])')
def ev(a,op,b):
    return {'×':a*b,'+':a+b,'-':a-b,'−':a-b,'÷':a/b}[op]
mism=set(); seen=0
for e in bank:
    for field in ('text','expect'):
        s=e[field].translate(tr).replace(chr(0x200c),'')
        s=re.sub(r'(?<=\d) (?=\d{3}(?!\d))','',s)
        for m in pat.finditer(s):
            before=s[:m.start()].rstrip()[-1:]; after=s[m.end():].lstrip()[:1]
            if (before and before in '×+-−÷·(^/√') or (after and after in '×+-−÷·^'): continue
            if re.search(r'(میلیون|میلیارد)\s*و\s*$', s[:m.start()]): continue   # the M part of «N میلیون و M»: judged by verdict() above, every reading enumerated
            sa,a,o1,b,o2,c,sg,d=m.groups()
            a,b,d=F(a)*(-1 if sa else 1),F(b),F(d)*(-1 if sg else 1)
            if o2:
                c=F(c)
                if o1 in '×÷' or o2 not in '×÷': v=ev(ev(a,o1,b),o2,c)
                else: v=ev(a,o1,ev(b,o2,c))
            else: v=ev(a,o1,b)
            seen+=1
            dec=len(m.group(8).split('.')[1]) if '.' in m.group(8) else 0
            if not (v==d or (dec>0 and d in (rnd(v,dec),trc(v,dec))) or ('≈' in m.group(0) and d in (rnd(v,dec),trc(v,dec)))):
                mism.add(m.group(0).strip())
norm=lambda t: re.sub(r'\s+',' ',t)
got={norm(t) for t in mism}
# values the bank deliberately writes as not exactly equal — each asserted explicitly above
DELIBERATE={'100000 ÷ 8000 = 15','100000 ÷ 8000 = 11','6 × 8 = 46','8 × 15 = 110','3 × 450 = 1300','6 × 250 = 1400'}   # FLAG lines (r6 tanker, r5 neg, r5 brother)
ASKED={'100 ÷ 8 = 13'}                                                                                                  # C25 «؟» before her fix (r5)
UNIT_SCALED=set()
print('sweep: %d expressions read, %d mismatches'%(seen,len(got)))
for t in sorted(got):
    tag='deliberate FLAG' if t in DELIBERATE else 'C25 ASK' if t in ASKED else 'scale-worded' if t in UNIT_SCALED else 'UNEXPECTED'
    print('   mismatch:',t,'('+tag+')')
unexpected=got-DELIBERATE-ASKED-UNIT_SCALED
assert not unexpected, unexpected
chk('sweep only deliberate mismatches', True)
fams={}
for e in bank:
    assert set(e)=={'rc','kind','role','text','expect','context'} and e['kind'] in ('pos','neg'), e
    fams.setdefault(e['rc'],[0,0])[e['kind']=='neg']+=1
for k,(p,n) in sorted(fams.items()): print('  ',k,'pos',p,'neg',n)
chk('seven families', len(fams)==7)
assert 'gmail' not in json.dumps(bank).lower() and '@' not in json.dumps(bank)
assert not re.search(r'1[34]\d\d/\d', json.dumps(bank,ensure_ascii=False).translate(tr)), 'fixed calendar date'
print('FINAL',len(ok),'facts verified; entries',len(bank))
