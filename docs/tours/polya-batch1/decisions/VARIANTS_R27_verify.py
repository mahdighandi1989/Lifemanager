"""Recomputes every arithmetic fact of VARIANTS_R27 with exact rationals, checks weekday offsets, and sweeps the bank for «a op b = c»."""
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
def c25(x, n):      # C25/C44: her integer n is the rounding or truncation of x
    return F(n) in (rnd(x,0), trc(x,0))
def ap(a1, a2, last):   # C42: arithmetic progression fixed by first two terms and last -> (terms, sum) or None
    d=a2-a1
    if d==0 or (last-a1)%d: return None
    n=(last-a1)//d+1
    return n, n*(a1+last)//2 if (n*(a1+last))%2==0 else F(n*(a1+last),2)
# ---------------- R1 arithmetic reader
# C40 word operator «A و B میشه C»
def c40(a,b,c):
    if a+b==c: return 'OK'
    if a*b==c: return 'ASKx'
    return 'FLAG'
chk('r1 6x6', 6*6==36)
chk('r1 5,7->35', c40(5,7,35)=='ASKx' and 5+7==12)
chk('r1 8,9->72', c40(8,9,72)=='ASKx' and 8+9==17)
chk('r1 12,3->36', c40(12,3,36)=='ASKx' and 12+3==15)
chk('r1 9,6->54', c40(9,6,54)=='ASKx' and 9+6==15)
chk('r1 6,4->10', c40(6,4,10)=='OK')
chk('r1 7,5->30', c40(7,5,30)=='FLAG' and 7*5==35)
chk('r1 5x5 then 4,6->10', 5*5==25 and c40(4,6,10)=='OK')
chk('r1 2,2->4', c40(2,2,4)=='OK' and 2*2==4)
chk('r1 8,3->11', c40(8,3,11)=='OK')
# C41 products
chk('r1 4m x 6m', 4*6==24)
chk('r1 5m x 7m', 5*7==35!=30)
chk('r1 2.5 x 3', F('2.5')*3==F('7.5'))
chk('r1 60 x 40', 60*40==2400)
chk('r1 3.5 x 4', F('3.5')*4==14!=12)
chk('r1 2m x 50cm', F(2)*F(50,100)==1 and 2*50==100)
chk('r1 5 pieces of 4', 5*4==20)
chk('r1 3 pieces of 6', 3*6==18!=20)
chk('r1 8 pieces of 2.5', 8*F('2.5')==20)
chk('r1 4 ta 7 ta', 4*7==28)
chk('r1 6 ta 8 ta', 6*8==48!=42)
chk('r1 se ta 120', 3*120==360)
chk('r1 chahar ta 45', 4*45==180!=190)
chk('r1 panj ta 2.4', 5*F('2.4')==12)
chk('r1 8 dar sad of 250', F(8,100)*250==20 and 8*100==800)
# C42 ellipsis
chk('r1 1..30', ap(1,2,30)==(30,465))
chk('r1 1..12', ap(1,2,12)==(12,78) and 78!=70)
chk('r1 2..20', ap(2,4,20)==(10,110))
chk('r1 1,3..25', ap(1,3,25)==(13,169) and 13**2==169)
chk('r1 5..50', ap(5,10,50)==(10,275) and 275!=250)
chk('r1 3,7..43', ap(3,7,43)==(11,253) and 253!=230)
chk('r1 1,4..20 not AP', ap(1,4,20) is None)
chk('r1 geometric', sum(2**k for k in range(7))==127 and 4-2!=2-1)
chk('r1 squares', sum(k*k for k in range(1,11))==385)
chk('r1 n(n+1)/2', 30*31//2==465)
# running sums, compound amounts
chk('r1 running', 75+45==120 and 120+18==138 and 138!=148)
chk('r1 2.4M/8', F(2400000,8)==300000)
chk('r1 4 x 2.25M', 4*2250000==9000000!=8250000)
# C45 display / scales
x=F(1500)*F('9.81')*22
chk('r1 pump', x==323730 and x/1000==F('323.73') and c25(x/1000,324))
chk('r1 2M x 3', 2000000*3==6000000 and 2000000*3!=6000)
chk('r1 450x1200', 450*1200==540000!=500000)
chk('r1 (850-420)x26', (850-420)*26==11180 and 11180*1000==11180000)
# C44 percentages
chk('r1 7/30', F(7,30)*100==F(70,3) and c25(F(70,3),23) and not c25(F(70,3),25) and rnd(F(70,3),2)==F('23.33'))
chk('r1 9/22', c25(F(900,22),41) and trc(F(900,22),3)==F('40.909'))
chk('r1 5/8', F(5,8)*100==F('62.5') and c25(F('62.5'),62) and c25(F('62.5'),63))
chk('r1 3/8', F(3,8)*100==F('37.5'))
# C25 / C43
chk('r1 90/7', c25(F(90,7),13) and not c25(F(90,7),18) and trc(F(90,7),2)==F('12.85'))
chk('r1 50/3 80/6', c25(F(50,3),17) and c25(F(80,6),13) and trc(F(50,3),2)==F('16.66') and trc(F(80,6),2)==F('13.33'))
chk('r1 100/6', c25(F(100,6),17) and trc(F(100,6),2)==F('16.66'))
chk('r1 15/14 11/10 ident', F(15,14)!=1 and F(11,10)!=1)
chk('r1 17/16', F(17,16)==F('1.0625') and c25(F(17,16),1) and F(17,16)!=1)
chk('r1 13/12', F(1,2)+F(1,3)+F(1,4)==F(13,12)!=1)
print(len(ok),'facts verified (R1)')
# ---------------- R2 correction engine (base «مسئلهٔ کاشی», «مسئلهٔ دوچرخه»)
chk('r2 tiles old', F('2.4')*F('1.5')==F('3.6') and F('3.6')/F('1.2')==3 and 3*450==1350 and F('3.6')*F('1.2')==F('4.32'))
chk('r2 tiles 2.8', F('2.8')*F('1.5')==F('4.2') and F('4.2')/F('1.2')==F('3.5') and F('3.5')*450==1575 and F('4.2')*F('1.2')==F('5.04'))
chk('r2 tiles 25pc', F('3.6')*F('1.25')==F('4.5'))
chk('r2 tiles 500', 3*500==1500)
chk('r2 tiles width 1.8', F('2.4')*F('1.8')==F('4.32') and F('4.32')/F('1.2')==F('3.6') and F('3.6')*450==1620 and F('4.32')*F('1.2')==F('5.184'))
chk('r2 parcels', 12*F('0.4')==F('4.8') and 12*F('0.35')==F('4.2'))
chk('r2 people', F(4,5)==F('0.8') and F(4,4)==1)
chk('r2 bill', F(2800000,8)==350000 and F(2800000,7)==400000)
chk('r2 rent', F('2.5')/5==F('0.5') and F(3,5)==F('0.6'))
chk('r2 laps 12', 12*15==180 and 180+45==225 and F(225,60)==F('3.75') and 40+12==52)
chk('r2 laps 10', 10*15==150 and 150+45==195 and F(195,60)==F('3.25') and F(225*10,12)==F('187.5') and F('3.75')*10/12==F('3.125'))
d2=9**2+10**2
chk('r2 sqrt', 9**2+12**2==225 and 15**2==225 and d2==181 and abs(F(math.sqrt(181))-F('13.4536'))<F(1,10**4) and rnd(F(math.sqrt(181)),2)==F('13.45'))
chk('r2 tank', 20*F('0.8')==16 and 20*F('0.75')==15)
chk('r2 cups', F(50,8)==F('6.25') and rnd(F(50,6),1)==F('8.3'))
chk('r2 fabric', 6*140==840 and 6*120==720)
chk('r2 trip', 16*85==1360 and F(1360,4)==340 and 18*85==1530 and F(1530,4)==F('382.5'))
chk('r2 cake', F(25,4)==F('6.25') and F(30,4)==F('7.5'))
print(len(ok),'facts verified (+R2)')
# ---------------- R4 prior work
chk('r4 tiles', 12*18==216)
chk('r4 fence', 2*(40+25)==130)
chk('r4 rect', F(22,4)==F('5.5') and 3*F('5.5')==F('16.5') and F('5.5')+F('16.5')==22)
chk('r4 speeds', F(60+90,2)==75 and F(2*60*90,60+90)==72)
chk('r4 server', 300*60==18000)
chk('r4 shelves', F(48,6)==8)
chk('r4 sweets', F(24,3)==8)
chk('r4 laps', 150*12==1800 and F(1800,60)==30 and F(1800,60)!=18 and 18+18==36 and 140*12==1680)
chk('r4 x+2x', F(36,3)==12)
chk('r4 teacher', 2*36==72)
print(len(ok),'facts verified (+R4)')
# ---------------- R5, R6
chk('r5 outcomes', 14>12 and 280<300)
chk('r6 marbles', 3*4==12 and 3*5==15 and F(45,6)==F('7.5') and F(20,100)*250==50 and 50!=60)
chk('r6 shelves', 4*6==24 and F(24,5)==F('4.8') and c25(F(24,5),4))
print(len(ok),'facts verified (+R5, R6)')
# ---------------- R3 dates (weekday offsets; Saturday-Friday weeks; no calendar dates)
WD=['sat','sun','mon','tue','wed','thu','fri']
def first_after(d0, target):
    n=(WD.index(target)-WD.index(d0))%7
    return n or 7
chk('r3 tue->thu', first_after('tue','thu')==2)
chk('r3 tue->fri', first_after('tue','fri')==3)
chk('r3 tue->sat', first_after('tue','sat')==4)
chk('r3 mon->fri, next', first_after('mon','fri')==4 and first_after('mon','fri')+7==11)
chk('r3 sat->thu,fri', first_after('sat','thu')==5 and first_after('sat','fri')==6)
chk('r3 fri->fri', first_after('fri','fri')==7)
chk('r3 wed->fri, next', first_after('wed','fri')==2 and first_after('wed','fri')+7==9)
chk('r3 20th from 5th', 20-5==15)
print(len(ok),'facts verified (+R3)')
# ---------------- sweep: every «a op b [op c] = d» written with digits in the bank
here=os.path.dirname(os.path.abspath(__file__))
bank=json.load(open(os.path.join(here,'VARIANTS_R27.json'),encoding='utf-8'))
tr=str.maketrans('۰۱۲۳۴۵۶۷۸۹٫','0123456789.')
num=r'\d+(?:\.\d+)?'
pat=re.compile(rf'(?<![\d./^²])({num})\s*([×+\-−÷])\s*({num})(?:\s*([×+\-−÷])\s*({num}))?\s*(?:=|≈)\s*(?:حدود\s*)?(−|-)?({num})(?![\d/^²])')
def ev(a,op,b):
    return {'×':a*b,'+':a+b,'-':a-b,'−':a-b,'÷':a/b}[op]
mism=set(); seen=0
for e in bank:
    for field in ('text','expect'):
        s=e[field].translate(tr).replace(chr(0x200c),'')
        s=re.sub(r'(?<=\d) (?=\d{3}(?!\d))','',s)
        for m in pat.finditer(s):
            before=s[:m.start()].rstrip()[-1:]; after=s[m.end():].lstrip()[:1]
            if (before and before in '×+-−÷·(^') or (after and after in '×+-−÷·^'): continue
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
norm=lambda t: re.sub(r'\s+',' ',t)
got={norm(t) for t in mism}
# values the bank deliberately writes as not exactly equal — each asserted explicitly above
DELIBERATE={'90 ÷ 7 = 18','20 × 0.75 = 16'}                       # called wrong (FLAG) / the forbidden text-replacement equation (R2)
ASKED={'90 ÷ 7 = 13','50 ÷ 3 = 17','80 ÷ 6 = 13','100 ÷ 6 = 17','17 ÷ 16 = 1','24 ÷ 5 = 4'}   # C25/C26 ASK: rounding or truncation, asserted in r1/r6
UNIT_SCALED={'1500 × 9.81 × 22 = 324','450 × 1200 = 500'}         # results written in «هزار»: 323.73 thousand (ASK), 540 thousand vs 500 (FLAG)
print('sweep: %d expressions read, %d mismatches'%(seen,len(got)))
for t in sorted(got):
    tag='deliberate FLAG' if t in DELIBERATE else 'C25 ASK' if t in ASKED else 'unit-scaled' if t in UNIT_SCALED else 'UNEXPECTED'
    print('   mismatch:',t,'('+tag+')')
unexpected=got-DELIBERATE-ASKED-UNIT_SCALED
assert not unexpected, unexpected
chk('sweep only deliberate mismatches', True)
fams={}
for e in bank:
    assert set(e)=={'rc','kind','role','text','expect','context'} and e['kind'] in ('pos','neg'), e
    fams.setdefault(e['rc'],[0,0])[e['kind']=='neg']+=1
for k,(p,n) in sorted(fams.items()): print('  ',k,'pos',p,'neg',n)
chk('eight families', len(fams)==8)
assert 'gmail' not in json.dumps(bank).lower() and '@' not in json.dumps(bank)
print('FINAL',len(ok),'facts verified; entries',len(bank))
