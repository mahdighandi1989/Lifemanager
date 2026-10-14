#!/usr/bin/env python3
"""«🗺 قلمروِ سامانه‌ها» — نقشه و دفترِ پیشرفتِ هر سامانهٔ این صفحه (یادگیری، ذهن، حلِ مسئله، تصمیم، ارتباط، خودشناسی).

مالک (۲۰۲۶-۱۰-۱۴): «در هر قسمت قلمروهای جدید و منطقی بر اساسِ بدیهیاتِ قطعی بسازد، نه فقط برای معرفت‌شناسی — همه چیز».
همان الگوی قلمروِ معرفت‌شناسی (backtest/territory.json + tools/epi_backtest.js territory):

  territory/maps/<سامانه>.json   نقشهٔ ثابت از منابعِ معتبر: گروه‌ها ⇐ حوزه‌ها، هر حوزه با پرسش‌ها، منابع، ابزارهای صفحه،
                                 و «گزاره‌ها» ی محوری که هر کدام بر پایهٔ اصول رده‌بندی شده (theorem | empirical | outside).
  territory/ledger.json          گامِ هر حوزه + تاریخچه (چه کسی، کِی، با چه شاهدی).

گام‌ها (هر کدام شرطِ لازمِ بعدی):
  0 نقشه‌شده · 1 دست‌کم ۲ منبعِ معتبرِ ثبت‌شده · 2 دست‌کم ۳ گزارهٔ محوری · 3 هر گزاره بر پایهٔ اصول رده‌بندی شده (قضیه با اصل/تعریف،
  تجربی با شاهد، بیرون با دلیل) · 4 ابزارِ **کامل** در صفحه: ابزار هست و کمبودِ ثبت‌شده‌ای (gap_fa) نمانده — بستنِ کمبود کارِ روتین است،
  سپس gap_fa خالی و advance · 5 تثبیت در کار —
  **فقط از دادهٔ خودِ کاربر و در صفحه** حساب می‌شود (≥ ۳ کاربستِ با نتیجهٔ ثبت‌شده)؛ هیچ‌کس دستی ۵ نمی‌نویسد.

دستورها:
  python3 tools/sys_territory.py check            دفتر را با شواهدِ نقشه می‌سنجد (گامِ ثبت‌شده هرگز بیش از شاهد نیست؛ تاریخچه پیوسته)
  python3 tools/sys_territory.py init --by …      حوزه‌های تازه را با گامِ «سزاوارِ» شواهد به دفتر می‌افزاید (موجودها دست نمی‌خورند)
  python3 tools/sys_territory.py advance AREA --what "…" --by …   یک گام جلو، فقط اگر شاهدش در نقشه هست
  python3 tools/sys_territory.py status           خلاصهٔ گام‌ها و کم‌گام‌ترین حوزه‌ها (برای دورِ روتین)
"""
from __future__ import annotations

import argparse
import datetime
import glob
import json
import os
import re
import sys

B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = os.path.join(B, "territory")
LEDGER = os.path.join(T, "ledger.json")
STAGES = ["نقشه‌شده", "منابع ثبت شد", "گزاره‌ها فهرست شد", "رده‌بندی بر پایهٔ اصول", "ابزارِ کامل در صفحه", "تثبیت در کار"]
KINDS = ("theorem", "empirical", "outside")
AXIOMS = ("A0", "A1", "A2", "A3", "A4")
TOOL_RE = re.compile(r"^(tech|proto|kfam|move|station|view):[A-Za-z0-9_.-]+$")


def load_maps():
    out = []
    for p in sorted(glob.glob(os.path.join(T, "maps", "*.json"))):
        with open(p, encoding="utf-8") as f:
            out.append(json.load(f))
    return out


def load_ledger():
    if not os.path.exists(LEDGER):
        return {"version": 1, "areas": {}}
    with open(LEDGER, encoding="utf-8") as f:
        return json.load(f)


def save_ledger(L):
    with open(LEDGER, "w", encoding="utf-8") as f:
        json.dump(L, f, ensure_ascii=False, indent=1, sort_keys=True)
        f.write("\n")


def areas(maps):
    for m in maps:
        tags = {s["tag"] for s in m.get("sources", [])}
        for g in m.get("groups", []):
            for a in g.get("areas", []):
                yield m, g, a, tags


def justified(a, tags):
    """بیشترین گامی که شواهدِ خودِ نقشه نشان می‌دهد (۰ تا ۴)."""
    src = [t for t in a.get("src", []) if t in tags]
    if len(set(src)) < 2:
        return 0
    cl = a.get("claims", [])
    if len(cl) < 3:
        return 1
    def ok(c):
        if c.get("kind") not in KINDS or not (c.get("basis_fa") or "").strip():
            return False
        if c["kind"] == "theorem":   # قضیه فقط با اصلِ نام‌برده یا تعریف
            b = c["basis_fa"]
            return any(x in b for x in AXIOMS) or "تعریف" in b
        return True
    if not all(ok(c) for c in cl):
        return 2
    if not a.get("tools") or (a.get("gap_fa") or "").strip():
        return 3   # ابزار نیست یا هنوز کمبودِ ثبت‌شده دارد (gap_fa) ⇒ «ابزارِ کامل» نیست
    return 4


def problems(maps, L):
    errs, ids = [], {}
    for m, g, a, tags in areas(maps):
        aid = a.get("id", "")
        if not re.match(r"^[a-z]{2}_[a-z0-9_]+$", aid):
            errs.append(f"{m['id']}: bad area id {aid!r}")
        if aid in ids:
            errs.append(f"duplicate area id {aid} ({ids[aid]} / {m['id']})")
        ids[aid] = m["id"]
        for t in a.get("src", []):
            if t not in tags:
                errs.append(f"{aid}: source tag {t!r} not in {m['id']} sources")
        for t in a.get("tools", []):
            if not TOOL_RE.match(t):
                errs.append(f"{aid}: bad tool ref {t!r}")
        for c in a.get("claims", []):
            if c.get("kind") not in KINDS:
                errs.append(f"{aid}: claim kind {c.get('kind')!r}")
        rec = L["areas"].get(aid)
        if rec is None:
            errs.append(f"{aid}: not in ledger (run init)")
            continue
        j = justified(a, tags)
        if rec["stage"] > j:
            errs.append(f"{aid}: ledger stage {rec['stage']} > evidence {j}")
        if rec["stage"] > 4:
            errs.append(f"{aid}: stage 5 is computed from user data, never written")
        hist = rec.get("history", [])
        if not hist or hist[-1]["stage"] != rec["stage"]:
            errs.append(f"{aid}: history does not end at the current stage")
        prev = -1
        for h in hist:
            if h["stage"] < prev or not h.get("by") or not h.get("what"):
                errs.append(f"{aid}: history step invalid {h}")
            prev = h["stage"]
    for aid in L["areas"]:
        if aid not in ids:
            errs.append(f"{aid}: in ledger but not in any map (quarantine, don't delete: keep the map entry)")
    for m in maps:
        for k in ("id", "fa", "axioms", "sources", "groups", "bridge_fa"):
            if k not in m:
                errs.append(f"map {m.get('id')}: missing {k}")
        for ax in m.get("axioms", []):
            if ax not in AXIOMS:
                errs.append(f"map {m['id']}: unknown axiom {ax}")
    return errs


def today():
    return datetime.date.today().isoformat()


def cmd_init(args):
    maps, L = load_maps(), load_ledger()
    n = 0
    for m, g, a, tags in areas(maps):
        if a["id"] in L["areas"]:
            continue
        j = justified(a, tags)
        hist = [{"stage": 0, "at": today(), "by": args.by, "what": "در نقشه آمد"}]
        if j:
            hist.append({"stage": j, "at": today(), "by": args.by,
                         "what": "شواهدِ نقشه: " + "، ".join(STAGES[1:j + 1]) + (" — ابزارها: " + "، ".join(a.get("tools", [])) if j >= 4 else "")})
        L["areas"][a["id"]] = {"system": m["id"], "stage": j, "history": hist}
        n += 1
    save_ledger(L)
    print(f"init: {n} areas added")


def cmd_advance(args):
    maps, L = load_maps(), load_ledger()
    hit = [(m, a, tags) for m, g, a, tags in areas(maps) if a["id"] == args.area]
    if not hit:
        sys.exit(f"no area {args.area}")
    m, a, tags = hit[0]
    rec = L["areas"].setdefault(a["id"], {"system": m["id"], "stage": 0, "history": [{"stage": 0, "at": today(), "by": args.by, "what": "در نقشه آمد"}]})
    to = rec["stage"] + 1
    if to > 4:
        sys.exit("گامِ ۵ فقط از دادهٔ کاربر در صفحه حساب می‌شود")
    if justified(a, tags) < to:
        sys.exit(f"شاهدِ گامِ {to} ({STAGES[to]}) در نقشه نیست — اول نقشه را با منبع/گزاره/رده/ابزار کامل کن")
    rec["stage"] = to
    rec["history"].append({"stage": to, "at": today(), "by": args.by, "what": args.what})
    save_ledger(L)
    print(f"{a['id']} ⇒ {to} ({STAGES[to]})")


def cmd_status(args):
    maps, L = load_maps(), load_ledger()
    for m in maps:
        st = [L["areas"].get(a["id"], {}).get("stage", 0) for g in m["groups"] for a in g["areas"]]
        print(f"{m['id']} {m['fa']}: {len(st)} حوزه، امتیاز {sum(st)}/{4 * len(st)}، گام‌ها " + " ".join(f"{i}:{st.count(i)}" for i in range(5)))
    low = sorted(((L["areas"].get(a["id"], {}).get("stage", 0), a["id"], a["fa"]) for m, g, a, t in areas(maps)))[:12]
    print("کم‌گام‌ترین‌ها: " + "، ".join(f"{x[1]}({x[0]})" for x in low))


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("check")
    p = sub.add_parser("init"); p.add_argument("--by", required=True)
    p = sub.add_parser("advance"); p.add_argument("area"); p.add_argument("--what", required=True); p.add_argument("--by", required=True)
    sub.add_parser("status")
    args = ap.parse_args()
    if args.cmd == "check":
        e = problems(load_maps(), load_ledger())
        print("\n".join(e) if e else "قلمروِ سامانه‌ها سالم است.")
        sys.exit(1 if e else 0)
    {"init": cmd_init, "advance": cmd_advance, "status": cmd_status}[args.cmd](args)


if __name__ == "__main__":
    main()
