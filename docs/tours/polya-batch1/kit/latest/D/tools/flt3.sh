#!/bin/bash
D="$(dirname "$0")"; "$D"/flt2.sh | python3 "$D"/flt3.py
