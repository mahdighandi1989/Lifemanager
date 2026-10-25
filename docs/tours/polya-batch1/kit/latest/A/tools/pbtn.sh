#!/bin/bash
# pbtn.sh SID STEPNO ok|no : click the prior verdict button of step N (by its line text)
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A
bash $R/tools/e.sh $1 "(()=>{const b=[...document.querySelectorAll('.lp-prior-$3')].find(x=>{let p=x.parentElement;while(p&&!/گامِ/.test(p.textContent))p=p.parentElement;return p&&p.textContent.trim().startsWith('گامِ '+'$2'.replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d])+' ')});if(!b)return 'NOBTN';b.click();return 'clicked '+TT()})()"
