import sys
from PIL import Image
im=Image.open(sys.argv[1]); w,h=im.size
# find region: crop from 1750 to 3450 roughly scaled
a=int(sys.argv[2]) if len(sys.argv)>2 else 1750; b=int(sys.argv[3]) if len(sys.argv)>3 else 3500
im.crop((40,a,1100,b)).save(sys.argv[4] if len(sys.argv)>4 else '/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21A/_m.png')
print(w,h)
