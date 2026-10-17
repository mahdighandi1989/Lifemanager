#!/bin/bash
# kill.sh sid : kill my harness + auto loop for sid
for p in $(pgrep -f "[h]arness4.js .*round18B/$1\$"); do kill -9 $p; done
for p in $(pgrep -f "[a]uto.sh $1\$"); do kill $p; done
for p in $(pgrep -f "[g]o2.sh $1\$"); do kill $p; done
