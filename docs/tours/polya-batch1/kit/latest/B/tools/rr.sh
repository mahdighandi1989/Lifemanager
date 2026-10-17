#!/bin/bash
# rr.sh sid from to : replay range, stop on pending
for k in $(seq $2 $3); do echo "##### c$k"; out=$(ELIM=${ELIM:-1500} tools/rp.sh $1 $k); echo "$out" | head -c ${HL:-2500}; echo; if echo "$out" | grep -q "=== PENDING"; then echo STOP-PENDING; break; fi; done
