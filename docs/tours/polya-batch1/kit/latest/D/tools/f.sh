#!/bin/bash
# f.sh DIR 'JS expr'  -> eval JS (after setf helpers) then print fields
D=$1; JS=$2
python3 - "$D" "$JS" <<'PY'
import json,sys,subprocess
D,JS=sys.argv[1],sys.argv[2]
fields=json.load(open('/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21D/tools/fields.json'))['eval']
setf=open('/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21D/tools/setf.js').read()
c={"eval0":setf+"\n;"+JS if JS else setf,"eval":fields}
subprocess.run(['python3','/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21D/tools/go.py',D,json.dumps(c)])
PY
