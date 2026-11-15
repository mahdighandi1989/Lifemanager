# Tour 1 (Pólya), round 27: fixer «loop» handoff (2026-11-15)

Scope: R7 (C54, C20 restated, C80, C81, C36; sheet close on take-back; after-closure «امروز» line). Base: BASE27 (4273c7f1).
**Only source file touched: `apps/learning-architecture/src/app/a44_route.js`.** AS.SYS untouched.

## Functions changed (a44)
- New: `askShown`, `shownNamed`, `askLast` (shown ❓ pending), `frameWords` + `PRE.sysFrameWords`, `setAlso`, `otherNamed`, `closedChat`, regexes `BACK_REF`, `REOPEN_T`.
- Edited: `tiePick` (raw distinct name parts, «هیچ‌کدام» only in an answer clause, quoted name counts as one word, returns `byName` = choice by name or ordinal), `PRE.sysTiePick` (+`byName`), `score` (+`sw`, `d` = need words of the description without the name), `rank` (set dominance), `foldW` (comparative «ـتر/ـترین» onto an attested stem), `NOFIT` (+ «اون یه چیزِ دیگه‌ست»), `askFit` (frame-only reason), `sysSheet` (named frame-only candidate ⇒ ask; `setAlso` on arrival), `sysLocal` (`setAlso`), `arrive` (names co-weighed candidates in the 📜 «سنجش» line of the arrival, not in the chat), `sysLines` (shown-❓ reading; «بازش کن» reopen; `otherNamed` guard), `PRE.sysFit` (shown ❓ with a name; `otherNamed` guard), `sysScope`, `PRE.block` (late piece of the session's closed problem), `AS.fileGap` wrapper (`closedChat`), the «پیش‌نیاز» prompt filter (label = the real owner of the turn question).

## Contracts for the other fixers
- **story:** a «تکهٔ پس از بستن» said in the chat of the closed problem («همون … که بستیم / حلش کردیم», «یه تیکهٔ تازه», plus a title word) is now filed late under the closed problem. a27 still creates a NEW chat problem (pk «c:n») from that same sentence, and its 🧭 destination is her meta sentence (C27-6) — that is `A.STORY.dest` / the chat-problem split, yours. The reopen («بازش کن») writes `live.stateHist` + `live.reopened` exactly like a38's reopen.
- **a27 owners (prior/story/dates/classify):** B27·D18 — `chatok` «pass» is credited from the model's `ph` move (`ORD[ph] > ORD[ph0]`, a27_tour.js ~2680) even when her message is a question about the page; not changed here.
- **classify:** new page lines: «✓ «…» برای گامِ … کنار رفت — ابزارِ رسیده همان «…» است…», «↩ مسئلهٔ «…» به گفتهٔ خودت دوباره باز شد…» (the co-weighed note lives in 📜 only) — register via `shE(e)` where it addresses her.
- **coordinator / RUNNER28:** the B and D harnesses still lack `HOST.status` (U59/D26-21 cannot be seen); `sysSweep` is throttled 2 minutes of page time — three harness restarts in 37 s left a routine note unread (B27·D16's silence).
- Shared export shape: `PRE.sysTiePick` gained `byName`; `PRE.sysRank` unchanged in shape.
- Docs numbers used: WORKLOG 143, PROGRESS 140, HANDBOOK §12 row 84.
