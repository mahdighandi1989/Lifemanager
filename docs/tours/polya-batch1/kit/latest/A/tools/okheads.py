import sys,ast
l=sys.stdin.read().strip()[len('NEWHEADS: '):]
h=ast.literal_eval(l)
OK=('# نتیجهٔ صفحه از نوبتِ پیش','# برنامه‌های بازِ خودش (شناسه‌ها)','# برنامه‌های بازِ خودش')
sys.exit(0 if all(x.startswith(OK) for x in h) else 1)
