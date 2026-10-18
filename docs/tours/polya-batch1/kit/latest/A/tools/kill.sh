#!/bin/bash
# kill.sh SID : stop my harness + its chromium for SID
P="tour1_polya/round24A/$1"
pkill -f "$P/profile"; pkill -f "harness[567].js .*$P"; sleep 3
ps aux | grep "$P" | grep -v grep | cut -c1-150
