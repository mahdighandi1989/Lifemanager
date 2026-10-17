import json,re,sys
f=sys.argv[1]; d=json.load(open(f)); e=str(d.get('eval',''))
for m in re.finditer(r'(pb_l_[a-z0-9]+) => ',e):
  st=m.end(); dec=json.JSONDecoder()
  try: arr,_=dec.raw_decode(e[st:])
  except Exception as ex: print('parse fail',ex); continue
  print('##',m.group(1))
  for o in arr: print('  -',o['t'][:260])
