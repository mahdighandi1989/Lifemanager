"""Recomputes every arithmetic fact of VARIANTS_R26 with exact rationals, and sweeps the bank for «a op b = c»."""
from fractions import Fraction as F
import math, json, os, re
ok=[]
def chk(name, cond):
    assert cond, name
    ok.append(name)
def rnd(x, d):      # round half away from zero at d decimals
    q=F(10)**d; y=abs(x)*q; r=F(math.floor(y+F(1,2)),1)/q
    return r if x>=0 else -r
def trc(x, d):      # truncate toward zero at d decimals
    q=F(10)**d; y=abs(x)*q; r=F(math.floor(y),1)/q
    return r if x>=0 else -r
def c9(x, written, d):   # C9: her value is the rounding or the truncation at HER digits
    return F(str(written)) in (rnd(x,d), trc(x,d))
PI=F(math.pi)
# ---------------- Q1 arithmetic reader
chk('q1 24x1.25', F(24)*F('1.25')==30 and F(24)*F('1.25')!=32)
chk('q1 13/4', F(13,4)==F('3.25')!=F('3.5'))
chk('q1 running', 140+65==205 and 205+30==235 and 235!=245 and 205!=215)
chk('q1 19x4.3', F(19)*F('4.3')==F('81.7'))
chk('q1 45-28', 45-28==17 and 17*12==204!=214)
chk('q1 kWh', 1850*6==11100 and F(11100,1000)==F('11.1') and F('12.6')!=F('11.1'))
chk('q1 odd sum', 1+3+5+7+9==25!=24 and 25!=5)
chk('q1 squares', 5**2-2**2==25-4==21)
chk('q1 2x3+7', 2*3+7==13)
chk('q1 19/20', F(1,2)+F(1,4)+F(1,5)==F(19,20)!=1 and rnd(F(19,20),0)==1)      # rounds to 1 yet is NOT 1
chk('q1 31/30', F(1,2)+F(1,3)+F(1,5)==F(31,30)!=1)
chk('q1 19/7', 2<F(19,7)<3 and rnd(F(19,7),1)==F('2.7') and not c9(F(19,7),'2.9',1))
chk('q1 pi36', c9(PI*36,'113.1',1))
chk('q1 -48/96pi', abs(F(-48)/(96*PI)-F(-1)/(2*PI))<F(1,10**12) and not c9(F(-48)/(96*PI),'-0.26',2) and rnd(F(-48)/(96*PI),3)==F('-0.159'))
chk('q1 6 of 48', F(6,48)*100==F('12.5') and F(9,60)*100==15!=18)
chk('q1 powers', F('0.9')**4==F('0.6561') and c9(F('0.9')**4,'0.66',2) and F('1.1')**3==F('1.331') and not c9(F('1.1')**3,'1.44',2))
chk('q1 0.45/0.09', F('0.45')/F('0.09')==5)
chk('q1 gauss20', sum(range(1,21))==20*21//2==210!=200)
chk('q1 league', F(14*13,2)==91 and 30*3+12*5==90+60==150)
chk('q1 268800/32', F(268800,32)==8400!=8300)
x=F('1.03')/F('1.045')-1
chk('q1 -3/209', x==F(-3,209) and c9(x*100,'-1.44',2) and not c9(x*100,'-1.64',2) and rnd(x*100,4)==F('-1.4354'))
chk('q1 7/8', F(7,8)==F('0.875') and not c9(F(7,8),'0.85',2) and rnd(F(7,8),2)==F('0.88') and trc(F(7,8),2)==F('0.87'))
chk('q1 ask', F(100,7).denominator!=1 and trc(F(100,7),0)==14 and trc(F(100,7),2)==F('14.28') and F(200,6).denominator!=1 and trc(F(200,6),0)==33 and trc(F(200,6),2)==F('33.33'))
chk('q1 100/7 decimals', c9(F(100,7),'14.29',2) and c9(F(100,7),'14.28',2) and not c9(F(100,7),'14.39',2))
chk('q1 approx frac', F(1,3)+F(1,7)==F(10,21) and c9(F(10,21),'0.48',2) and F(1,2)+F(1,3)+F(1,4)==F(13,12)!=1 and c9(F(13,12),'1.08',2))
chk('q1 true identities', F(1,2)+F(1,3)+F(1,6)==1 and F(3,4)+F(5,4)==2)
chk('q1 96/8', F(96,8)==12)
chk('q1 words', 3*80==240)
chk('q1 zar', F(12)*F('1.04')==F('12.48'))
chk('q1 induction', 3*4==12 and 4*5==20 and 12!=20)
chk('q1 minutes', F(450,60)==F('7.5')!=F('4.5'))
chk('q1 MJ', F(25)*F('3.6')==90!=80)
print(len(ok),'facts verified (Q1)')
# ---------------- Q2 correction reach
chk('q2 paint old', F(6)*F('2.8')==F('16.8') and F('16.8')/8==F('2.1') and F('2.1')*2==F('4.2'))
chk('q2 paint new', F(7)*F('2.8')==F('19.6') and F('19.6')/8==F('2.45') and F('2.45')*2==F('4.9'))
chk('q2 trip', F(420*8,100)==F('33.6') and F('33.6')*3000==100800 and F(450*8,100)==36 and 36*3000==108000)
chk('q2 class', 28//4==7 and 28%4==0 and 32//4==8 and 32%4==0)
chk('q2 roof', F(150)*F('0.2')*F('0.8')==24 and F(120)*F('0.2')*F('0.8')==F('19.2') and 25>24)
chk('q2 seq', [9-2,14-9,17-14]==[7,5,3] and [10-2,14-10,17-14]==[8,4,3])
chk('q2 pipe', rnd(PI*2,1)==F('6.3') and rnd(PI*2,2)==F('6.28') and rnd(PI*F('1.6'),2)==F('5.03'))
chk('q2 guess', F(45,30)==F('1.5') and F(36,30)==F('1.2'))
chk('q2 rounds', 4*25==100 and 4*30==120)
chk('q2 grid', 12*12==144 and 144//2==72 and 10*10==100 and 100//2==50)
chk('q2 loan', F(180)*F('0.18')==F('32.4') and F(180)*F('0.21')==F('37.8'))
chk('q2 wall', 3*5==15 and F('3.2')*5==16)
chk('q2 weight', F(6,12)==F('0.5') and F(6,15)==F('0.4'))
chk('q2 speed', F(340,85)==4 and 4*60==240)
print(len(ok),'facts verified (+Q2)')
# ---------------- Q4 prior reply reading
chk('q4 loan total', F('4.5')*24==108)
chk('q4 interest', 108-80==28 and 28!=38 and 28!=29)
chk('q4 ratio', F(38,80)==F('0.475') and F(28,80)==F('0.35') and F(28,80)!=F('0.45') and F(32,80)==F('0.4') and F('0.35')<F('0.4'))
chk('q4 fee', F(80)*F('0.02')==F('1.6') and 108+F('1.6')==F('109.6') and c9(F('109.6')/24,'4.57',2) and rnd(F('109.6')/24,3)==F('4.567'))
import random
random.seed(26)
chk('q4 odd product', all((2*a+1)*(2*b+1)==2*(2*a*b+a+b)+1 for a,b in [(random.randint(-50,50),random.randint(-50,50)) for _ in range(500)]))
chk('q4 mid', 3*45==135 and 135+20==155)
chk('q4 colleague', 4*24==96)
print(len(ok),'facts verified (+Q4)')
# ---------------- Q5 dates (weekday offsets; Saturday-Friday weeks; no calendar dates)
WD=['sat','sun','mon','tue','wed','thu','fri']
def first_after(d0, target):       # days from D0 to the first <target> strictly after D0
    n=(WD.index(target)-WD.index(d0))%7
    return n or 7
def next_week(d0, target):         # days from D0 to <target> in the week AFTER the Sat-Fri week containing D0
    return (7-WD.index(d0))+WD.index(target)
chk('q5 tue->sat', first_after('tue','sat')==4)
chk('q5 fri->fri', first_after('fri','fri')==7)
chk('q5 mon next-week fri', next_week('mon','fri')==11 and first_after('mon','fri')==4)
chk('q5 sun end of next week', next_week('sun','thu')==11 and next_week('sun','fri')==12 and first_after('sun','fri')==5)
chk('q5 wed next-week fri', next_week('wed','fri')==9 and first_after('wed','fri')==2)
chk('q5 sat->wed', first_after('sat','wed')==4)
chk('q5 tue->fri', first_after('tue','fri')==3)
chk('q5 mon->sat', first_after('mon','sat')==5)
# ---------------- Q6, Q9
chk('q6 curtain', F('2.4')*3==F('7.2')!=6)
chk('q6 pots', 18*4==72)
chk('q9 carpet', 3*4==12)
print(len(ok),'facts verified (+Q5, Q6, Q9)')
# ---------------- sweep: every «a op b [op c] = d» written with digits in the bank
here=os.path.dirname(os.path.abspath(__file__))
bank=json.load(open(os.path.join(here,'VARIANTS_R26.json'),encoding='utf-8'))
tr=str.maketrans('۰۱۲۳۴۵۶۷۸۹٫','0123456789.')
num=r'\d+(?:\.\d+)?'
pat=re.compile(rf'(?<![\d./^])({num})\s*([×+\-−÷])\s*({num})(?:\s*([×+\-−÷])\s*({num}))?\s*(?:=|≈)\s*(?:حدود\s*)?(−|-)?({num})(?![\d/^])')
def ev(a,op,b):
    return {'×':a*b,'+':a+b,'-':a-b,'−':a-b,'÷':a/b}[op]
mism=set(); seen=0
for e in bank:
    for field in ('text','expect'):
        s=e[field].translate(tr).replace(chr(0x200c),'')
        s=re.sub(r'(?<=\d) (?=\d{3}(?!\d))','',s)          # «108 000» -> 108000 (thousands written with a space)
        for m in pat.finditer(s):
            before=s[:m.start()].rstrip()[-1:]; after=s[m.end():].lstrip()[:1]
            if (before and before in '×+-−÷·(^') or (after and after in '×+-−÷·^'): continue   # a slice of a longer chain: covered by the explicit facts above
            a,o1,b,o2,c,sg,d=m.groups()
            a,b,d=F(a),F(b),F(d)*(-1 if sg else 1)
            if o2:
                c=F(c)
                if o1 in '×÷' or o2 not in '×÷': v=ev(ev(a,o1,b),o2,c)
                else: v=ev(a,o1,ev(b,o2,c))
            else: v=ev(a,o1,b)
            seen+=1
            dec=len(m.group(7).split('.')[1]) if '.' in m.group(7) else 0
            if not (v==d or (dec>0 and d in (rnd(v,dec),trc(v,dec))) or ('≈' in m.group(0) and d in (rnd(v,dec),trc(v,dec)))):
                mism.add(m.group(0).strip())
# values the bank deliberately writes as not exactly equal: called wrong, or (100 ÷ 7 = 14) the C16 ASK case; each asserted above
DELIBERATE={'24 × 1.25 = 32','17 × 12 = 214','100 ÷ 7 = 14','100 ÷ 7 = 14.39','108 − 80 = 38','28 ÷ 80 = 0.45','2.4 × 3 = 6','268800 ÷ 32 = 8300','25 × 3.6 = 80','7 ÷ 8 = 0.85'}
norm=lambda t: re.sub(r'\s+',' ',t)
got={norm(t) for t in mism}
UNIT_SCALED={'1850 × 6 ≈ 11.1'}     # watts × hours written against kilowatt-hours: 11100 Wh = 11.1 kWh, asserted in 'q1 kWh'
unexpected={t for t in got if t not in DELIBERATE and t not in UNIT_SCALED}
print('sweep: %d expressions read, %d mismatches'%(seen,len(got)))
for t in sorted(got): print('   mismatch:',t,'(deliberate: called wrong in the bank, or the C16 ASK case)' if t in DELIBERATE else '(unit-scaled, right)' if t in UNIT_SCALED else '(UNEXPECTED)')
assert not unexpected, unexpected
chk('sweep only deliberate mismatches', True)
print('FINAL',len(ok),'facts verified; entries',len(bank))
