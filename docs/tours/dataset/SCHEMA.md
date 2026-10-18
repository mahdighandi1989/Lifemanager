# Tour dataset — SCHEMA v1

Design: `docs/decisions/2026-10-18-tour-dataset-for-local-model.md` (binding). Generator:
`scripts/tours/collect_dataset.py`. Test: `tests/test_tour_dataset.py`.
Every record has `"schema": 1`. A breaking change bumps this number and this file.

All files are UTF-8 JSON Lines, gzip-compressed (`mtime=0`, keys sorted), so rerunning the collector on the
same source produces byte-identical files.

## Files

| path | content |
|---|---|
| `manifest.json` | counts per round and author, verdict-linking ratio, split assignments and sizes, build commit per run, and for every shard: path, records, sha256, bytes, source runs, `preserved` |
| `system/<id>.txt.gz` | one deduplicated system prompt (`<id>` = first 24 hex chars of sha256 of the scrubbed text) |
| `blocks/<round>.jsonl.gz` | `{id, text}`: deduplicated large sections of the user prompt (see below), stored in the round where they first appear |
| `exchanges/<round>.jsonl.gz` | one record per AI call the page made (rounds without any recorded call get no shard) |
| `scenarios.jsonl.gz` | one record per scenario, with every run's result, criteria, defects and user turns |
| `banks.jsonl.gz` | variant banks `VARIANTS_R*.json` as labelled single-turn cases |

### User-prompt blocks
The page's user prompt repeats a ~50 KB system map and coach sections on every call. The prompt is cut before every
line that starts with `# `, `## ` or `### `. A piece of at least 1024 UTF-8 bytes is replaced by `{"b": "<id>"}` and its
text is stored once in `blocks/`. Smaller pieces stay inline as strings. Rebuilding the exact prompt:
`"".join(p if isinstance(p, str) else blocks[p["b"]] for p in request.user)`. This is lossless (scrubbing aside).

## Exchange record
```
id            "<run>/<scenario_dir>/<turn>"          e.g. "round22A/pA1/7", "models21/prod/s10/3"
round         "round1" … "round22", "models20", "models21"   (runA–D = round1, rerunA–D = round2)
run, group    harness run dir and runner group (A–D); null for model passes
pass          model pass name ("haiku", "sonnet", "prod") or null
scenario      scenario id (s01–s38, pA1–3, bp1–3, pC1–3, dp1–3, …); scenario_dir/variant keep the runner's dir name
turn          N of the page's N-th AI call in that scenario dir (= ai/pN.json, rN.txt, ans_N.json)
split         "train" | "eval" (from the scenario; never per turn)
source_layout "ai/pN.json+rN.txt" (full) | "fragments" (rounds whose ai/ dirs were not kept)
request       {task, system: <system id>, user: [str | {"b": id}], file_ids, complete: true, extra?}
              | {task, complete: false, excerpt}   (a runner's partial dump, pN.txt)
              | null                               (not recorded)
reply         {text (raw, scrubbed), json (parsed object or null), valid_json, author, author_basis} | null
page_outcome  what the page did with the reply, from the harness snapshot taken after the control step:
              {ctl, command[], view, shown ("verbatim-prefix"|"not-matched"), shown_text, sys[] (the page's own
               «sys:» lines: records made, refusals, rewrites), sys_basis, errors[], harness_error?, basis,
               validation? (model passes: the page's AS.quoteIn / contract check from *_val.json)} | null
user_turn     the user message sent in that control step (ctl/cK.json "say"), or null (automatic turn / not kept)
verdict[]     judge items linked to this turn (see Linking): kind criterion|turn_row|turn_note|need
defects[]     defects linked to this turn: {id, severity S1–S3, class a–d, files [file:line], upgrade («ارتقای لازم»), text, sources}
better        corrected or ideal reply when a runner or the owner wrote one; null otherwise
flags[]       request_missing, request_partial, reply_missing, harness_stop_placeholder,
              reply_reused_from_prior_round (auto.log replay), reply_modified_after_read (the reply file is newer than the
              next request: the page read an earlier version, so page_outcome refers to that version)
meta          {build_commit, language, register (the page's «ضمیرِ گفت‌وگو» line, if sent), polya_stage (reply
               coach_state.ph), polya_stage_basis}
```

### `author` — who wrote the reply (never guessed)
| value | meaning |
|---|---|
| `runner-simulated` | a tour runner (Claude) played the page's model (every `round*`/`run*`/`rerun*` dir, RUNNER*.md) |
| `real-haiku`, `real-sonnet` | a real model answered from `ai/pN.json` alone (`models<N>/haiku`, `models<N>/sonnet`; in `models<N>/prod` task `lla_coach` ⇒ sonnet, `lla_assistant` ⇒ haiku) |
| `real-other`, `human` | reserved (later real sessions use the same schema with `scenario.source = "real"`) |
| `unknown` | the source does not say who answered (e.g. another task in a prod pass) |

**Terms of use.** Claude-authored replies (`runner-simulated`, `real-*` by Claude models) are kept for evaluation and as
references, not as training targets, unless the owner confirms the terms allow his use (decision doc, «Honest limits»).

### Linking verdicts and defects to turns
A findings line, table row or defect is linked to turn N when its text names `pN` or `rN`, «turn N», «نوبت N», or
`cK` (a harness control step, mapped through `page_outcome.ctl` to the calls made during it). Group defect logs
(`defects.md`, `CATALOGUE.md`, `DEF*.json`) are linked by «<scenario> pN» mentions. Every item keeps `turns` (what the
text named), `linked_turns`/`link_basis`. Items that name no existing turn stay scenario-level in `scenarios.jsonl.gz`
(`runs[].criteria|turn_rows|turn_notes|needs|defects` hold every item, linked or not). Snapshot refs `sN` are not used:
they collide with scenario ids.

## Scenario record
```
id, source ("synthetic"), split, persona, age, age_band, family, topic, topic_fa, technique (problem type),
polya_elements [ids], difficulty, meta_source ("scenarios.json" | findings preamble + summary for runner-built ones),
definition (the full scenarios.json entry: opening, script, must/must-not, success criteria, failure signatures),
runs[]: {run, round, group, pass, scenario_dir, variant, build_commit, result PASS|PARTIAL|FAIL, result_line, summary,
         preamble, criteria[], turn_rows[], turn_notes[], needs[], defects[], upgrades[], exchanges, user_turns[{ctl, say}],
         preserved?}
```
`age` is the first «N ساله» / «(N،» in the persona; `age_band`: child ≤12, teen 13–19, young-adult 20–29,
adult 30–49, senior ≥50, unknown.
`family` (mechanism family), first rule that matches the problem type:
meta «فرا-مسئله» · impossibility «عدم امکان|بی‌جواب» · discovery «استقرا|کشف|حدس|استدلال محتمل» · proof «اثبات» ·
look-back «بازنگری|ابداع» · open-life «عملی|زندگی|باز (whole words)|پژوهشی|عاطفی|مبهم» · find «یافتنی|معما|معادله|بیشینه|درخواست پاسخ» ·
other. Runner-built ids `pA*|bp*|pC*|dp*` are `prerequisite` (RUNNER22 ADDENDUM 1–2).

## Bank record
`{id "<bank>#<index>", bank (R17, R19b, …), index, rc, kind (pos/neg/…), role, text, expect, context, extra, hash}`.

## Split
Fixed by scenario (never by turn); ~20% eval, held out permanently.
1. A scenario whose split is recorded in `manifest.json` keeps it forever.
2. New scenarios are ranked by `h = int(sha256("lla-tour-split-v1:" + id)[:8], 16) / 2^32`.
3. Coverage: for every age band, then every family (both in sorted order) that has no eval scenario yet, the new member
   with the smallest `h` goes to eval.
4. Fill: remaining new scenarios in ascending `h` go to eval until eval = round(0.20 × all scenarios).
5. The rest are train. A stratum with no new member that still lacks eval is listed in `manifest.split.uncovered`.

## Collector guarantees
- Idempotent; new rounds append. A round whose source vanished or shrank keeps its existing shard (`preserved: true`);
  scenario runs and banks not found in the source are kept from the previous files.
- Scrubbed before hashing: the owner's address ⇒ `<owner-email>`, any other address ⇒ `<email>`, phone numbers ⇒
  `<phone>`, keys/tokens ⇒ `<secret>`, session links ⇒ `<session-url>`, scratch paths ⇒ `<scratchpad>`.
- Test records only: people in the scenarios are simulated by runners.

## Known gaps of the v1 source (honest)
- Rounds 1–13 kept no `ai/` dirs (except a few): their exchanges are reply-only (`ans_N.json`, `rN.json`) or request
  excerpts (`pN.txt`), with no page outcome. Rounds 1–2 have scenario-level data only.
- `prev/`, `src/` and other nested copies inside a run (superseded attempts) are not read.
- `better` is empty: no runner wrote a corrected reply in a recognisable form so far.
