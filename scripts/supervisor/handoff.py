#!/usr/bin/env python3
"""Hand-offs between the routines — so none of them works as an island (owner 2026-10-14).

«اگر نظارت و سرکشی کاری را در قلمروِ روتینِ دیگری انجام داد، آن روتین بعداً بفهمد، بسنجد و اگر اشتباه بود اصلاح کند؛
 و اگر روتینِ اصلی زودتر انجامش داده بود، نظارت و سرکشی دوباره‌کاری نکند و خرابش نکند — بی روتینِ تازه».

The rules live in ``docs/supervisor/ownership.json`` (who owns which paths, the only tool/procedure that may change
them, the ledger). The ledger of cross-routine work is ``docs/supervisor/handoffs/<id>.json`` — one file per entry (+ the readable
``HANDOFFS.md``, regenerated on every write). Every routine prompt points here.

    handoff.py owner PATH…                     which area/owner/procedure governs these paths
    handoff.py precheck --area A [--since ISO] [--sheet N]
                                               «was it already done?» — owner ledger, git log on the area, hand-offs
    handoff.py add --by R --area A --kind did|request|owner-did --what "…" [--sheet N] [--commit SHA] [--procedure "…"]
    handoff.py inbox --routine R               what others did in R's areas (verify) and asked of R (do)
    handoff.py close ID --by R --status verified|corrected|done|rejected|superseded --note "…" [--commit SHA]
    handoff.py check                           ledger valid + stale entries (an owner that did not look in time)
    handoff.py guard --routine R [--base origin/main]
                                               refuse a push that changes another routine's area without a hand-off
Exit codes: 0 ok · 1 refused/invalid · 2 usage.
"""
from __future__ import annotations

import argparse
import fnmatch
import json
import os
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OWN = os.path.join(ROOT, "docs", "supervisor", "ownership.json")
LEDGER = os.path.join(ROOT, "docs", "supervisor", "handoffs")   # ONE FILE PER ENTRY — two routines never conflict
LEGACY = os.path.join(ROOT, "docs", "supervisor", "handoffs.json")  # the first single-file ledger (h1, h2) — migrated, kept readable
VIEW = os.path.join(ROOT, "docs", "supervisor", "HANDOFFS.md")
KINDS = {"did": "کار در قلمروِ دیگری (روتینِ مالک باید بسنجد)",
         "request": "درخواست از روتینِ مالک (او انجام می‌دهد)",
         "owner-did": "روتینِ مالک خودش انجام داده بود (برای جلوگیری از دوباره‌کاری)"}
OPEN, CLOSED = {"open"}, {"verified", "corrected", "done", "rejected", "superseded"}


def now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def load_own() -> Dict[str, Any]:
    with open(OWN, encoding="utf-8") as f:
        return json.load(f)


def load() -> Dict[str, Any]:
    """All entries, oldest first. A concurrent run of two routines (ran 2026-10-14 in a simulation: both appended to
    one JSON file ⇒ a rebase conflict and the same id twice) is why each entry is its own file with a unique id."""
    ents: List[Dict[str, Any]] = []
    if os.path.isdir(LEDGER):
        for n in sorted(os.listdir(LEDGER)):
            if n.endswith(".json"):
                with open(os.path.join(LEDGER, n), encoding="utf-8") as f:
                    ents.append(json.load(f))
    if os.path.exists(LEGACY):
        with open(LEGACY, encoding="utf-8") as f:
            have = {e["id"] for e in ents}
            ents += [e for e in json.load(f).get("entries", []) if e["id"] not in have]
    ents.sort(key=lambda e: (e.get("at", ""), e.get("id", "")))
    return {"version": 2, "entries": ents}


def owners(area: Dict[str, Any]) -> List[str]:
    o = area.get("owner")
    return list(o) if isinstance(o, list) else [o]


def match(path: str, pat: str) -> bool:
    return fnmatch.fnmatchcase(path, pat)


def is_shared(path: str, own: Optional[Dict[str, Any]] = None) -> bool:
    own = own or load_own()
    return any(match(path, p) for p in own.get("shared", []))


def area_of(path: str, own: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    """First area (in file order: specific ⇒ general) whose glob matches."""
    own = own or load_own()
    path = path.replace("\\", "/").lstrip("./")
    for a in own["areas"]:
        if any(match(path, p) for p in a["paths"]):
            return a
    return None


def render(data: Dict[str, Any]) -> str:
    own = load_own()
    names = {k: v["fa"] for k, v in own["routines"].items()}
    areas = {a["id"]: a["fa"] for a in own["areas"]}
    lines = ["# دست‌به‌دستِ کار میانِ روتین‌ها (خودکار از `handoffs/*.json` — دستی ویرایش نکن)", "",
             "هر کاری که یک روتین در قلمروِ روتینِ دیگری کرد (یا از او خواست) این‌جاست؛ روتینِ مالک در آغازِ هر دور",
             "`python3 scripts/supervisor/handoff.py inbox --routine <خودش>` را می‌زند، می‌سنجد و می‌بندد. قواعد: `ownership.json`.", ""]
    ents = data.get("entries", [])
    op = [e for e in ents if e["status"] == "open"]
    lines += [f"**باز: {len(op)}** · کل: {len(ents)}", "",
              "| # | زمان | از | قلمرو | نوع | برگه | چه | وضع | بستنِ |", "|---|---|---|---|---|---|---|---|---|"]
    for e in reversed(ents):
        cl = e.get("closed") or {}
        lines.append("| {id} | {at} | {by} | {ar} | {k} | {sh} | {w} | {st} | {cb} |".format(
            id=e["id"], at=e["at"][:16].replace("T", " "), by=names.get(e["by"], e["by"]), ar=areas.get(e["area"], e["area"]),
            k=e["kind"], sh=("#" + str(e["sheet"])) if e.get("sheet") else "—", w=e["what"].replace("|", "/").replace("\n", " ")[:300],
            st=e["status"], cb=(names.get(cl.get("by"), cl.get("by", "")) + ": " + cl.get("note", "").replace("|", "/")[:200]) if cl else ""))
    return "\n".join(lines) + "\n"


def save_entry(e: Dict[str, Any]) -> None:
    os.makedirs(LEDGER, exist_ok=True)
    with open(os.path.join(LEDGER, e["id"] + ".json"), "w", encoding="utf-8") as f:
        json.dump(e, f, ensure_ascii=False, indent=1)
        f.write("\n")
    write_view()


def write_view() -> None:
    with open(VIEW, "w", encoding="utf-8") as f:
        f.write(render(load()))


def migrate() -> int:
    """handoffs.json (v1) ⇒ one file per entry; the old file is removed only after every entry exists as a file."""
    if not os.path.exists(LEGACY):
        return 0
    with open(LEGACY, encoding="utf-8") as f:
        old = json.load(f).get("entries", [])
    for e in old:
        if not os.path.exists(os.path.join(LEDGER, e["id"] + ".json")):
            os.makedirs(LEDGER, exist_ok=True)
            with open(os.path.join(LEDGER, e["id"] + ".json"), "w", encoding="utf-8") as f:
                json.dump(e, f, ensure_ascii=False, indent=1)
                f.write("\n")
    os.remove(LEGACY)
    write_view()
    return len(old)


def new_id(by: str) -> str:
    import secrets

    return "h" + datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S%f") + "-" + by + "-" + secrets.token_hex(2)


def git(*args: str) -> str:
    try:
        return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True, timeout=60).stdout
    except Exception:  # noqa: BLE001
        return ""


# --------------------------------------------------------------------------- commands
def cmd_owner(a) -> int:
    own = load_own()
    for p in a.paths:
        if is_shared(p, own):
            print(f"{p}\tمشترک (دفترهای افزودنی/خروجیِ ساخت) — بی دست‌به‌دست")
            continue
        ar = area_of(p, own)
        if not ar:
            print(f"{p}\t(هیچ قلمرویی — ownership.json را کامل کن)")
            continue
        print(f"{p}\tقلمرو={ar['id']} ({ar['fa']})\tمالک={','.join(owners(ar))}\tابزار={ar['tool']}\tدستور={ar['procedure']}"
              + (f"\tقاعده={ar['rule']}" if ar.get("rule") else ""))
    return 0


def cmd_precheck(a) -> int:
    own = load_own()
    ar = next((x for x in own["areas"] if x["id"] == a.area), None)
    if not ar:
        print("قلمروِ ناشناخته: " + a.area); return 2
    since = a.since or (datetime.now(timezone.utc) - timedelta(days=14)).strftime("%Y-%m-%d")
    if len(since) == 10:
        # git reads a bare «2026-10-14» as «that day at the CURRENT time of day» (found in a simulation: the owner's work from
        # the same morning was missed) — and a sheet filed today may answer work done yesterday: start the day BEFORE, at 00:00
        since = (datetime.strptime(since, "%Y-%m-%d") - timedelta(days=1)).strftime("%Y-%m-%d") + " 00:00:00"
    print(f"== قلمرو {ar['id']} — مالک: {','.join(owners(ar))} — دستور: {ar['procedure']}")
    pats = [p.rstrip("*") or "." for p in ar["paths"]]
    log = git("log", f"--since={since}", "--format=%h %ad [%(trailers:key=Routine,valueonly,separator=%x2C)] %s", "--date=iso", "--", *pats)
    print(f"== کامیت‌ها روی این قلمرو از {since}:")
    print(log.strip() or "(هیچ)")
    data = load()
    rel = [e for e in data["entries"] if e["area"] == ar["id"] and (not a.sheet or e.get("sheet") == a.sheet or e["status"] == "open")]
    print("== دست‌به‌دست‌های مرتبط:")
    for e in rel:
        print(f"  {e['id']} [{e['status']}] {e['kind']} از {e['by']}" + (f" برگهٔ #{e['sheet']}" if e.get('sheet') else "") + f": {e['what'][:160]}")
    if not rel:
        print("  (هیچ)")
    print("== حالا: اگر کامیت/دفترِ بالا همان کار را کرده ⇒ دوباره‌کاری نکن؛ جوابِ برگه را با ارجاع به همان کامیت/دور بنویس و "
          "`add --kind owner-did` بزن. وگرنه دستورِ مالک را کامل بخوان و طبقِ همان عمل کن (یا `--kind request`).")
    return 0


def cmd_add(a) -> int:
    own = load_own()
    if a.by not in own["routines"] and a.by != "session":
        print("روتینِ ناشناخته: " + a.by); return 2
    ar = next((x for x in own["areas"] if x["id"] == a.area), None)
    if not ar:
        print("قلمروِ ناشناخته: " + a.area); return 2
    if a.kind not in KINDS:
        print("نوعِ ناشناخته: " + a.kind); return 2
    e = {"id": new_id(a.by), "at": now(), "by": a.by, "area": ar["id"], "owner": owners(ar), "kind": a.kind, "sheet": a.sheet,
         "what": a.what.strip(), "procedure": a.procedure or ar["procedure"], "commit": a.commit or "",
         "status": "open"}
    if a.kind == "owner-did":
        e["status"] = "done"
        e["closed"] = {"by": a.by, "at": now(), "note": "روتینِ مالک خودش انجام داده بود — بی کارِ اضافه", "commit": a.commit or ""}
    save_entry(e)
    print(f"{e['id']} ثبت شد ({KINDS[a.kind]})")
    return 0


def cmd_inbox(a) -> int:
    own = load_own()
    mine = {x["id"] for x in own["areas"] if a.routine in owners(x) or x.get("executor") == a.routine}
    data = load()
    todo = [e for e in data["entries"] if e["status"] == "open" and e["area"] in mine and e["by"] != a.routine]
    if not todo:
        print("صندوق خالی است — کاری از دیگران در قلمروِ تو نیست."); return 0
    for e in todo:
        verb = "بسنج (با دستورِ خودت) و بستش: verified یا corrected" if e["kind"] == "did" else "انجامش بده (اولویت) و بستش: done"
        print(f"{e['id']} [{e['kind']}] از {e['by']} در {e['area']}" + (f" برگهٔ #{e['sheet']}" if e.get("sheet") else "")
              + f" — {e['what']}\n    کامیت: {e.get('commit') or '—'} · ⇒ {verb}")
    return 0


def cmd_close(a) -> int:
    data = load()
    e = next((x for x in data["entries"] if x["id"] == a.id), None)
    if not e:
        print("شناسهٔ ناشناخته"); return 2
    if a.status not in CLOSED:
        print("وضعِ ناشناخته"); return 2
    if e["status"] != "open":
        print(f"{e['id']} پیش‌تر بسته شده ({e['status']})"); return 1
    own = load_own()
    ar = next((x for x in own["areas"] if x["id"] == e["area"]), {})
    if a.by not in owners(ar) and a.by != ar.get("executor") and a.by != "general":
        print("فقط روتینِ مالکِ این قلمرو (یا ناظرِ عمومی برای کهنه‌ها) می‌بندد"); return 1
    e["status"] = a.status
    e["closed"] = {"by": a.by, "at": now(), "note": a.note.strip(), "commit": a.commit or ""}
    save_entry(e)
    print(f"{e['id']} ⇒ {a.status}")
    return 0


def stale(data: Dict[str, Any], own: Dict[str, Any], at: Optional[datetime] = None) -> List[Dict[str, Any]]:
    at = at or datetime.now(timezone.utc)
    out = []
    for e in data["entries"]:
        if e["status"] != "open":
            continue
        hrs = max([own["routines"].get(o, {}).get("every_hours", 0) for o in e.get("owner", [])] or [0]) or 24
        t = datetime.strptime(e["at"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
        if at - t > timedelta(hours=2 * hrs + 6):
            out.append(e)
    return out


def validate(data: Dict[str, Any], own: Dict[str, Any]) -> List[str]:
    errs = []
    areas = {x["id"] for x in own["areas"]}
    ids = set()
    for e in data.get("entries", []):
        for k in ("id", "at", "by", "area", "kind", "what", "status"):
            if not e.get(k):
                errs.append(f"{e.get('id', '?')}: «{k}» خالی است")
        if e.get("id") in ids:
            errs.append(f"شناسهٔ تکراری {e['id']}")
        ids.add(e.get("id"))
        if e.get("area") not in areas:
            errs.append(f"{e.get('id')}: قلمروِ ناشناخته {e.get('area')}")
        if e.get("kind") not in KINDS:
            errs.append(f"{e.get('id')}: نوعِ ناشناخته {e.get('kind')}")
        if e.get("status") not in OPEN | CLOSED:
            errs.append(f"{e.get('id')}: وضعِ ناشناخته {e.get('status')}")
        if e.get("status") in CLOSED and not (e.get("closed") or {}).get("note"):
            errs.append(f"{e.get('id')}: بسته ولی بی یادداشت")
    return errs


def cmd_check(a) -> int:
    own, data = load_own(), load()
    errs = validate(data, own)
    for x in errs:
        print("❌ " + x)
    st = stale(data, own)
    for e in st:
        print(f"⏰ کهنه: {e['id']} ({e['kind']} در {e['area']} از {e['by']}، {e['at']}) — مالک ({','.join(e['owner'])}) هنوز نبسته")
    if not errs and not st:
        print("دست‌به‌دست‌ها سالم؛ هیچ موردِ کهنه‌ای نیست.")
    if not os.path.exists(VIEW) or open(VIEW, encoding="utf-8").read() != render(data):
        print("❌ HANDOFFS.md با handoffs.json هم‌خوان نیست — `handoff.py check --fix`")
        if a.fix:
            write_view(); print("بازسازی شد.")
        else:
            errs.append("view")
    return 1 if errs else 0


def changed_paths(base: str) -> List[str]:
    out = set()
    for args in (("diff", "--name-only", f"{base}...HEAD"), ("diff", "--name-only", "--cached"), ("diff", "--name-only"),
                 ("ls-files", "--others", "--exclude-standard")):
        out.update(x for x in git(*args).splitlines() if x.strip())
    return sorted(out)


def guard(routine: str, paths: List[str], new_entries: List[Dict[str, Any]], own: Optional[Dict[str, Any]] = None) -> List[str]:
    """Paths in an area the routine does not own, with no hand-off by this routine for that area in this push."""
    own = own or load_own()
    covered = {e["area"] for e in new_entries if e.get("by") == routine}
    bad = []
    for p in paths:
        if is_shared(p, own):
            continue
        ar = area_of(p, own)
        if not ar:
            continue
        if routine in owners(ar) or ar.get("executor") == routine:
            continue
        if "owner" in owners(ar) and ar.get("executor") != routine:
            bad.append(f"{p}: «{ar['fa']}» فقط با تصمیمِ مالک و به دستِ «{ar.get('executor')}» عوض می‌شود — پیشنهاد بده، دست نزن")
            continue
        if ar["id"] not in covered:
            bad.append(f"{p}: قلمروِ «{ar['fa']}» مالِ {','.join(owners(ar))} است — دستورِ {ar['procedure']} را اجرا کن و "
                       f"`handoff.py add --by {routine} --area {ar['id']} --kind did …` بزن")
    return bad


def cmd_guard(a) -> int:
    if not a.routine:
        print("(SUPERVISOR_ROUTINE تعریف نشده — نشستِ انسانی/دستی؛ نگهبانِ دست‌به‌دست اجرا نشد)"); return 0
    listing = git("ls-tree", "--name-only", f"{a.base}", "docs/supervisor/handoffs/")
    old_ids = {os.path.basename(x)[:-5] for x in listing.splitlines() if x.endswith(".json")}
    base_ledger = git("show", f"{a.base}:docs/supervisor/handoffs.json")
    try:
        old_ids |= {e["id"] for e in json.loads(base_ledger)["entries"]} if base_ledger.strip() else set()
    except Exception:  # noqa: BLE001
        pass
    new = [e for e in load()["entries"] if e["id"] not in old_ids]
    bad = guard(a.routine, changed_paths(a.base), new)
    if bad:
        print("❌ این پوش به قلمروِ روتینِ دیگری دست زده و دست‌به‌دستش ثبت نشده:")
        for b in bad:
            print("   - " + b)
        return 1
    print("نگهبانِ دست‌به‌دست: سالم")
    return 0


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="دست‌به‌دستِ کار میانِ روتین‌ها")
    sp = ap.add_subparsers(dest="cmd", required=True)
    p = sp.add_parser("owner"); p.add_argument("paths", nargs="+"); p.set_defaults(f=cmd_owner)
    p = sp.add_parser("precheck"); p.add_argument("--area", required=True); p.add_argument("--since"); p.add_argument("--sheet", type=int); p.set_defaults(f=cmd_precheck)
    p = sp.add_parser("add"); p.add_argument("--by", required=True); p.add_argument("--area", required=True); p.add_argument("--kind", required=True)
    p.add_argument("--what", required=True); p.add_argument("--sheet", type=int); p.add_argument("--commit"); p.add_argument("--procedure"); p.set_defaults(f=cmd_add)
    p = sp.add_parser("inbox"); p.add_argument("--routine", required=True); p.set_defaults(f=cmd_inbox)
    p = sp.add_parser("close"); p.add_argument("id"); p.add_argument("--by", required=True); p.add_argument("--status", required=True)
    p.add_argument("--note", required=True); p.add_argument("--commit"); p.set_defaults(f=cmd_close)
    p = sp.add_parser("check"); p.add_argument("--fix", action="store_true"); p.set_defaults(f=cmd_check)
    p = sp.add_parser("migrate"); p.set_defaults(f=lambda a: print(f"{migrate()} مورد منتقل شد") or 0)
    p = sp.add_parser("guard"); p.add_argument("--routine", default=os.environ.get("SUPERVISOR_ROUTINE", "")); p.add_argument("--base", default="origin/main"); p.set_defaults(f=cmd_guard)
    a = ap.parse_args(argv)
    return a.f(a)


if __name__ == "__main__":
    sys.exit(main())
