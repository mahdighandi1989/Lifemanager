#!/bin/bash
# keep.sh sid M — reuse round21 reply rM as override (after review)
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya
cp $R/round21D/$1/ai/r$2.txt $R/round25D/$1.ovr/r$2.txt && echo kept
