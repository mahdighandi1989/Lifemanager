# Model-tier tour, round 21 (roadmap §11) — runs alongside round 21

Same 8 scenarios as round 20 (s03 s10 s18 s19 s25 s29 s31 s38), same user turns (models20/<tier>/<sid>/ctl), new build (R20 fixes:
page compensations MT1 and routing MT2). Two passes, Two-agent protocol of RUNNER20_MODELS.md (the driver never writes replies):
- Pass «prod» (what production will do): each ai/pN.json carries the task. Two RESPONDERS run at the same time: one on model "sonnet"
  answers only requests whose task is «lla_coach»; one on model "haiku" answers only «lla_assistant». Write to models21/prod/<sid>/.
- Pass «haiku» (floor): one haiku responder answers every request, whatever its task. Write to models21/haiku/<sid>/.
Measure exactly as RUNNER20_MODELS.md, plus: per class of round-20 failure (models20/SUMMARY.md) — fixed by the page / still there / new;
how many rewrite requests the post-check sent and whether the rewrite fixed the reply; the routing table (turn / kind / task / correct?).
Write models21/<pass>/<sid>/findings.md and models21/SUMMARY.md comparing models20 haiku, models20 sonnet, models21 haiku, models21 prod.
Count only evidence. The driver writes models21/<pass>/DONE_ALL when a pass is done; responders stop then.
