#!/usr/bin/env python3
"""Tour dataset collector (schema v1).

Binding design: docs/decisions/2026-10-18-tour-dataset-for-local-model.md.
Reads the scenario-tour scratch tree (every runner used its own layout) and writes a durable,
versioned, scrubbed dataset under docs/tours/dataset/:

    SCHEMA.md                     format, label meanings, split rule (version 1)
    manifest.json                 counts, shard hashes, split assignments, provenance
    system/<hash>.txt.gz          deduplicated system prompts
    blocks/<round>.jsonl.gz       deduplicated large sections of the user prompt (see SCHEMA.md)
    exchanges/<round>.jsonl.gz    one record per AI call (request, reply, author, page outcome, verdicts, defects)
    scenarios.jsonl.gz            one record per scenario (persona, script, criteria) + every run's result/defects
    banks.jsonl.gz                variant banks (VARIANTS_R*.json) as labelled single-turn cases

Idempotent: running twice on the same source writes byte-identical files (gzip mtime 0, sorted keys, no
timestamps). Monotonic: a round whose source is gone or shrank keeps the shard already written; a scenario's
split, once recorded in manifest.json, never changes.

Usage: python scripts/tours/collect_dataset.py [--src TOUR_DIR] [--out DATASET_DIR] [--quiet]
Standard library only.
"""
import argparse
import glob
import gzip
import hashlib
import io
import json
import os
import re
import sys

SCHEMA_VERSION = 1
GENERATOR = "scripts/tours/collect_dataset.py"
DEFAULT_SRC = "/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya"
DEFAULT_OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
                           "docs", "tours", "dataset")
BLOCK_MIN = 1024          # user-prompt sections at least this many UTF-8 bytes are stored once, by hash
HASH_LEN = 24             # hex chars kept from sha256 for blob ids
SPLIT_SALT = "lla-tour-split-v1:"
EVAL_FRACTION = 0.20

# --------------------------------------------------------------------------------------------- text hygiene

def fix_text(s):
    """Lone UTF-16 surrogates (seen in page prompts) cannot be written as UTF-8: merge pairs, replace orphans."""
    if not isinstance(s, str):
        return s
    try:
        s.encode("utf-8")
        return s
    except UnicodeEncodeError:
        return s.encode("utf-16", "surrogatepass").decode("utf-16", "replace")


_SCRUB = [
    (re.compile(r"mohamad\.mahdi1988@gmail\.com", re.I), "<owner-email>"),
    (re.compile(r"mohamad[._ -]?mahdi[0-9]*", re.I), "<owner-name>"),
    (re.compile(r"https?://claude\.ai/code/session_[A-Za-z0-9]+"), "<session-url>"),
    (re.compile(r"\bsession_[A-Za-z0-9]{16,}"), "<session-id>"),
    (re.compile(r"/tmp/claude-0/[^\s\"'<>]*?/scratchpad"), "<scratchpad>"),
    (re.compile(r"\bsk-[A-Za-z0-9_-]{16,}"), "<secret>"),
    (re.compile(r"\bAIza[0-9A-Za-z_-]{30,}"), "<secret>"),
    (re.compile(r"\bgh[pousr]_[A-Za-z0-9]{20,}"), "<secret>"),
    (re.compile(r"(?i)\bbearer\s+[A-Za-z0-9._-]{20,}"), "Bearer <secret>"),
    (re.compile(r"(?<![\w.+-])[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+"), "<email>"),
    (re.compile(r"(?<![0-9])(?:\+98|0098|0)9[0-9]{9}(?![0-9])"), "<phone>"),
    (re.compile(r"(?<![۰-۹])(?:\+۹۸|۰)۹[۰-۹]{9}(?![۰-۹])"), "<phone>"),
]


def scrub(s):
    if not isinstance(s, str):
        return s
    s = fix_text(s)
    for rx, rep in _SCRUB:
        s = rx.sub(rep, s)
    return s


def scrub_obj(o):
    if isinstance(o, str):
        return scrub(o)
    if isinstance(o, list):
        return [scrub_obj(x) for x in o]
    if isinstance(o, dict):
        return {scrub(k): scrub_obj(v) for k, v in o.items()}
    return o


def sha(s):
    return hashlib.sha256(s.encode("utf-8") if isinstance(s, str) else s).hexdigest()


def blob_id(s):
    return sha(s)[:HASH_LEN]


def read_text(path):
    try:
        with open(path, "rb") as f:
            return fix_text(f.read().decode("utf-8", "replace"))
    except OSError:
        return None


def read_json(path):
    t = read_text(path)
    if t is None:
        return None
    try:
        return json.loads(t)
    except ValueError:
        return None


def mtime(path):
    try:
        return os.stat(path).st_mtime
    except OSError:
        return None


def dumps(o):
    return json.dumps(o, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def gz_bytes(text):
    buf = io.BytesIO()
    with gzip.GzipFile(filename="", mode="wb", fileobj=buf, mtime=0, compresslevel=9) as g:
        g.write(text.encode("utf-8"))
    return buf.getvalue()


def gz_read(path):
    try:
        with gzip.open(path, "rb") as g:
            return g.read().decode("utf-8")
    except OSError:
        return None


def write_if_changed(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if os.path.exists(path):
        with open(path, "rb") as f:
            if f.read() == data:
                return False
    with open(path, "wb") as f:
        f.write(data)
    return True


def num(s):
    """Persian/Arabic-Indic digits to int."""
    tr = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")
    try:
        return int(s.translate(tr))
    except ValueError:
        return None


def nat_key(s):
    return [int(t) if t.isdigit() else t for t in re.split(r"(\d+)", s)]

# --------------------------------------------------------------------------------------------- discovery

SCEN_RE = re.compile(r"^(s\d{2}|pA\d+|bp\d+|pC\d+|dp\d+)(.*)$")


def classify_run(rel):
    """rel = path of a run dir relative to the tour root ⇒ (round label, order, group, pass) or None."""
    m = re.match(r"^run([A-Z])$", rel)
    if m:
        return ("round1", 1.0, m.group(1), None)
    m = re.match(r"^rerun([A-Z])$", rel)
    if m:
        return ("round2", 2.0, m.group(1), None)
    m = re.match(r"^round(\d+)([A-Z])$", rel)
    if m:
        return ("round%d" % int(m.group(1)), float(m.group(1)), m.group(2), None)
    m = re.match(r"^models(\d+)/([A-Za-z0-9_-]+)$", rel)
    if m:
        return ("models%d" % int(m.group(1)), int(m.group(1)) + 0.5, None, m.group(2))
    return None


def discover_runs(src):
    runs = []
    for name in sorted(os.listdir(src)):
        p = os.path.join(src, name)
        if not os.path.isdir(p):
            continue
        if re.match(r"^models\d+$", name):
            for sub in sorted(os.listdir(p)):
                if os.path.isdir(os.path.join(p, sub)):
                    c = classify_run(name + "/" + sub)
                    if c:
                        runs.append((name + "/" + sub, c))
        else:
            c = classify_run(name)
            if c:
                runs.append((name, c))
    runs.sort(key=lambda r: (r[1][1], r[0]))
    return runs


def has_evidence(d, strict):
    ai = os.path.join(d, "ai")
    if os.path.isdir(ai) and any(re.match(r"^p\d+\.json$", f) for f in os.listdir(ai)):
        return True
    if os.path.exists(os.path.join(d, "findings.md")):
        return True
    if strict:
        return False
    for f in os.listdir(d):
        if re.match(r"^(ans_\d+\.json|r\d+\.json|p\d+\.txt|RESULT.*)$", f) or f == "ctl":
            return True
    return False


def scenario_dirs(run_path):
    out = []
    for name in sorted(os.listdir(run_path), key=nat_key):
        d = os.path.join(run_path, name)
        m = SCEN_RE.match(name)
        if not m or not os.path.isdir(d):
            continue
        variant = m.group(2)
        if has_evidence(d, strict=bool(variant)):
            out.append((name, m.group(1), variant))
    # main dir first, then its variants
    out.sort(key=lambda x: (nat_key(x[1]), x[2] != "", x[0]))
    return out

# --------------------------------------------------------------------------------------------- authorship

def author_for(run_info, task):
    """Never guessed: round runners role-played the page's model (RUNNER*.md); models<N>/<pass> are real-model passes
    (RUNNER<N>_MODELS.md / SUMMARY.md: «a real model wrote every reply from ai/pN.json alone»; prod = coach⇒sonnet, rest⇒haiku)."""
    label, _, _, pas = run_info
    if pas is None:
        return "runner-simulated", "round runner played the page's model (RUNNER*.md)"
    p = pas.lower()
    if p == "haiku":
        return "real-haiku", "models pass «haiku»: one real tier answered every request"
    if p == "sonnet":
        return "real-sonnet", "models pass «sonnet»: one real tier answered every request"
    if p == "prod":
        if task == "lla_coach":
            return "real-sonnet", "models pass «prod»: task lla_coach is answered by the sonnet responder"
        if task == "lla_assistant":
            return "real-haiku", "models pass «prod»: task lla_assistant is answered by the haiku responder"
        return "unknown", "models pass «prod»: responder for task %r not documented" % task
    return "unknown", "pass %r has no documented responder" % pas

# --------------------------------------------------------------------------------------------- findings parsing

TURN_RX = [
    ("pr", re.compile(r"(?<![A-Za-z0-9_])[pr](\d{1,3})(?![0-9A-Za-z_])")),
    ("turn", re.compile(r"(?i)\bturns?\s*#?(\d{1,3})\b")),
    ("turn", re.compile(r"نوبتِ?\s*([0-9۰-۹]{1,3})(?![0-9۰-۹])")),
]
CTL_RX = re.compile(r"(?<![A-Za-z0-9_])c(\d{1,4})(?![0-9A-Za-z_])")
SEV_RX = re.compile(r"(?<![A-Za-z0-9])S([123])(?![0-9])")
CLASS_RX = re.compile(r"(?i)class\s*\(?([a-d])\)?|\(S[123],\s*([a-d])\)|\]\s*\(([a-d])\)|S[123]\s*\(([a-d])\)")
FILELINE_RX = re.compile(r"[\w./-]+\.(?:js|py|md|html|css|json):\d+(?:[-–]\d+)?")
SCEN_MENTION_RX = re.compile(r"(?<![A-Za-z0-9_])(s\d{2}|pA\d+|bp\d+|pC\d+|dp\d+)(?![0-9A-Za-z_])")
CRIT_RX = re.compile(r"^\s*(?:[-*]|\d+[.)])?\s*\**\[\s*(PASS|FAIL|PARTIAL)\s*\]\**\s*(.*)$")
RESULT_RX = re.compile(r"RESULT\s*[:：]\s*\**\s*(PASS|FAIL|PARTIAL)\b[^\n]*")
DEFECT_ID_RX = re.compile(r"^\s*[-*]\s*(?:\*\*)?\[?((?:[A-D]\d{2}[-·][A-Za-z0-9]+)|(?:[A-D]\d{2}·D\d+)|(?:[A-Z]{1,3}\d{1,3}(?:[-·][A-Za-z0-9]+)?))\]?(?:\*\*)?\s*[—–:(-]")
MARK_OK = set("✓✔")
MARK_BAD = set("✗✘×❌")


def turn_refs(text, ctl_to_turns=None):
    """⇒ (sorted turns, basis set). pN/rN = the N-th AI call of that scenario dir; «turn N»/«نوبت N» likewise;
    cN = a harness control step, mapped through the page-outcome table to the calls it produced."""
    turns, basis = set(), set()
    for b, rx in TURN_RX:
        for m in rx.finditer(text):
            n = num(m.group(1))
            if n:
                turns.add(n)
                basis.add(b)
    if ctl_to_turns:
        for m in CTL_RX.finditer(text):
            k = int(m.group(1))
            if k in ctl_to_turns:
                turns.update(ctl_to_turns[k])
                basis.add("ctl")
    return sorted(turns), sorted(basis)


def parse_defect_line(line):
    sev = SEV_RX.search(line)
    if not sev:
        return None
    m = DEFECT_ID_RX.match(line)
    did = m.group(1) if m else None
    if did and re.fullmatch(r"S[123]", did):
        did = None
    cm = CLASS_RX.search(line)
    cls = next((g for g in (cm.groups() if cm else ()) if g), None)
    up = None
    um = re.search(r"«?ارتقای لازم»?\s*[:：—-]?\s*(.+)$", line)
    if um:
        up = um.group(1).strip()
    return {"id": did, "severity": "S" + sev.group(1), "class": cls, "files": sorted(set(FILELINE_RX.findall(line))),
            "upgrade": up, "text": line.strip().lstrip("-* ").strip()}


def parse_findings(text):
    """Generic parse of a runner's findings.md (layouts differ per runner and round)."""
    res = {"result": None, "result_line": None, "summary": None, "preamble": None, "criteria": [], "turn_rows": [],
           "turn_notes": [], "defects": [], "needs": [], "upgrades": []}
    if not text:
        return res
    lines = text.split("\n")
    rm = list(RESULT_RX.finditer(text))
    if rm:
        res["result"] = rm[-1].group(1)
        res["result_line"] = rm[-1].group(0).strip()[:300]
    heading = ""
    summ = []
    pre = []
    for ln in lines:
        if ln.startswith("## "):
            break
        if ln.strip():
            pre.append(ln.strip().lstrip("#").strip())
    res["preamble"] = " ".join(pre)[:1500] or None
    for ln in lines:
        s = ln.strip()
        if s.startswith("#"):
            heading = s.lstrip("#").strip()
            continue
        if not res["summary"] and re.search(r"خلاصه|summary", heading, re.I) and s:
            summ.append(s)
        elif summ and not res["summary"]:
            res["summary"] = " ".join(summ)[:1500]
        cm = CRIT_RX.match(ln)
        if cm:
            res["criteria"].append({"status": cm.group(1), "text": cm.group(2).strip()})
            continue
        if s.startswith("|"):
            cells = [c.strip() for c in s.strip("|").split("|")]
            if cells and re.fullmatch(r"[pr]?\d{1,3}", cells[0]):
                mark = None
                for c in reversed(cells[1:]):
                    if any(ch in MARK_OK for ch in c):
                        mark = "ok"
                        break
                    if any(ch in MARK_BAD for ch in c):
                        mark = "bad"
                        break
                    if re.search(r"\b(PASS|FAIL|PARTIAL)\b", c):
                        mark = re.search(r"\b(PASS|FAIL|PARTIAL)\b", c).group(1).lower()
                        break
                res["turn_rows"].append({"turn": num(re.sub(r"\D", "", cells[0])), "cells": cells, "mark": mark,
                                         "table": heading[:120]})
            continue
        if re.match(r"^\s*[-*]", ln):
            d = parse_defect_line(ln)
            if d and (re.search(r"defect|نقص|ایراد|عیب|S[123]", heading, re.I) or d["id"] or re.match(r"^\s*[-*]\s*\[S[123]\]", ln)):
                res["defects"].append(d)
                continue
            if re.search(r"ارتقای لازم", heading):
                res["upgrades"].append(s.lstrip("-* ").strip())
                continue
            elif re.search(r"نیاز|need", heading, re.I):
                res["needs"].append({"heading": heading[:120], "text": s.lstrip("-* ").strip()})
                continue
        if s and re.search(r"نوبت|turn|مسیر", heading, re.I) and not s.startswith("```"):
            for seg in re.split(r"\s+·\s+", s.lstrip("-* ").strip()):
                mark = "ok" if any(ch in MARK_OK for ch in seg) else ("bad" if any(ch in MARK_BAD for ch in seg) else None)
                res["turn_notes"].append({"heading": heading[:120], "text": seg, "mark": mark})
    if summ and not res["summary"]:
        res["summary"] = " ".join(summ)[:1500]
    return res


def parse_group_defects(run_path):
    """Group-level defect logs (defects.md, CATALOGUE.md, DEF*.json) ⇒ list of defects with the scenarios/turns they name."""
    out = []
    for name in sorted(os.listdir(run_path)):
        p = os.path.join(run_path, name)
        if not os.path.isfile(p):
            continue
        items = []
        if re.match(r"^(defects|CATALOGUE|DEFECTS)\.md$", name, re.I):
            txt = read_text(p) or ""
            for ln in txt.split("\n"):
                if re.match(r"^\s*[-*]", ln):
                    d = parse_defect_line(ln)
                    if d:
                        items.append(d)
        elif re.match(r"^DEF.*\.json$", name):
            j = read_json(p)
            vals = list(j.values()) if isinstance(j, dict) else (j if isinstance(j, list) else [])
            for v in vals:
                if isinstance(v, str):
                    d = parse_defect_line("- " + v)
                    if d:
                        items.append(d)
        for d in items:
            d["source"] = name
            out.append(d)
    return out


def scenario_turns_in(text):
    """{scenario: set(turns)} from text like «s02 p5→p6; s01 p6→p7, bp2 p1»."""
    res = {}
    ms = list(SCEN_MENTION_RX.finditer(text))
    for i, m in enumerate(ms):
        seg = text[m.end(): ms[i + 1].start() if i + 1 < len(ms) else len(text)]
        seg = re.split(r"[.;؛\n]", seg, 1)[0][:80]
        ts, _ = turn_refs(seg)
        res.setdefault(m.group(1), set()).update(ts)
    return res

# --------------------------------------------------------------------------------------------- exchanges

def split_user(user, blocks, new_blocks, round_label):
    parts = re.split(r"(?m)^(?=#{1,3} )", user)
    out = []
    for p in parts:
        if not p:
            continue
        if len(p.encode("utf-8")) >= BLOCK_MIN:
            b = blob_id(p)
            if b not in blocks:
                blocks[b] = (round_label, p)
                new_blocks.append(b)
            out.append({"b": b})
        else:
            if out and isinstance(out[-1], str):
                out[-1] += p
            else:
                out.append(p)
    return out


def parse_reply(text):
    if text is None:
        return None
    t = text.strip()
    t2 = re.sub(r"^```(?:json)?\s*|\s*```$", "", t)
    for cand in (t, t2):
        try:
            j = json.loads(cand)
            if isinstance(j, dict):
                return j
        except ValueError:
            pass
    return None


def coach_stage(j):
    if not isinstance(j, dict):
        return None
    for a in j.get("actions") or []:
        if isinstance(a, dict) and a.get("do") == "coach_state" and a.get("ph"):
            return a.get("ph")
    return None


def ctl_table(sd):
    """ctl/cK.json + out/sK.json ⇒ {K: {cmd, ctl_t, out_t, out_path}}."""
    tab = {}
    for sub, rx, key in (("ctl", r"^c(\d+)\.json$", "ctl"), ("out", r"^s(\d+)\.json$", "out")):
        d = os.path.join(sd, sub)
        if not os.path.isdir(d):
            continue
        for f in os.listdir(d):
            m = re.match(rx, f)
            if m:
                k = int(m.group(1))
                tab.setdefault(k, {})[key + "_t"] = mtime(os.path.join(d, f))
                tab[k][key + "_path"] = os.path.join(d, f)
    return tab


def assign_ctl(p_t, tab):
    best = None
    for k, v in tab.items():
        ot, ct = v.get("out_t"), v.get("ctl_t")
        if ot is None or ot < p_t - 0.5:
            continue
        if ct is not None and ct > p_t + 2:
            continue
        if best is None or ot < tab[best]["out_t"]:
            best = k
    return best


def page_outcome(k, tab, reply_json, cache):
    v = tab.get(k) or {}
    po = {"ctl": k, "basis": "mtime: ctl ≤ request ≤ out snapshot"}
    cmd = cache.get(("ctl", k))
    if cmd is None and v.get("ctl_path"):
        cmd = read_json(v["ctl_path"]) or {}
        cache[("ctl", k)] = cmd
    cmd = cmd or {}
    po["command"] = sorted(x for x in cmd.keys() if x in ("say", "eval", "eval0", "click", "fill", "files", "snap", "exit"))
    out = read_json(v["out_path"]) if v.get("out_path") else None
    if not isinstance(out, dict):
        po["snapshot"] = None
        return po, cmd.get("say") if isinstance(cmd.get("say"), str) else None
    st = out.get("state") or {}
    msgs = [m for m in (st.get("msgs") or []) if isinstance(m, str)]
    rtext = (reply_json or {}).get("reply") if isinstance(reply_json, dict) else None
    key = re.sub(r"\s+", " ", rtext or "")[:40]
    idx = None
    if key:
        for i in range(len(msgs) - 1, -1, -1):
            if msgs[i].startswith("ai:") and key in re.sub(r"\s+", " ", msgs[i]):
                idx = i
                break
    if idx is not None:
        tail = []
        for m in msgs[idx + 1:]:
            if m.startswith("sys:"):
                tail.append(m[4:].strip())
            else:
                break
        po["shown"] = "verbatim-prefix"
        po["shown_text"] = msgs[idx][3:].strip()
        po["sys"] = tail
        po["sys_basis"] = "sys lines right after this reply's bubble"
    else:
        last_u = max([i for i, m in enumerate(msgs) if m.startswith("user:")] or [-1])
        after = msgs[last_u + 1:]
        po["shown"] = "not-matched"
        po["shown_text"] = next((m[3:].strip() for m in reversed(after) if m.startswith("ai:")), None)
        po["sys"] = [m[4:].strip() for m in after if m.startswith("sys:")]
        po["sys_basis"] = "sys lines after the last user message (reply bubble not found: rewritten, auto turn or window)"
    po["view"] = st.get("view")
    po["errors"] = [x for x in (out.get("log") or []) if isinstance(x, str)][:20]
    if out.get("error"):
        po["harness_error"] = str(out.get("error"))[:600]
    return po, cmd.get("say") if isinstance(cmd.get("say"), str) else None


def load_val(run_path):
    """models passes: the page's own verbatim checks per (sid, i) from *_val.json."""
    vals = {}
    cands = glob.glob(os.path.join(run_path, "*_val.json"))
    par = os.path.dirname(run_path)
    cands += glob.glob(os.path.join(par, os.path.basename(run_path) + "_val.json"))
    for f in sorted(set(cands)):
        j = read_json(f)
        if isinstance(j, list):
            for e in j:
                if isinstance(e, dict) and "sid" in e and "i" in e:
                    vals[(e["sid"], int(e["i"]))] = {k: v for k, v in e.items() if k not in ("sid", "i")}
    return vals


def auto_answered(run_path, sdir, sd):
    s = set()
    for f in (os.path.join(sd, "auto.log"), os.path.join(run_path, "auto_%s.log" % sdir)):
        t = read_text(f)
        if t:
            s.update(int(m) for m in re.findall(r"auto-answered p(\d+)", t))
    return s


def collect_scenario_dir(run_rel, run_info, run_path, sdir, sid, variant, blocks, new_blocks, sysstore, vals, stats):
    sd = os.path.join(run_path, sdir)
    label, _, group, pas = run_info
    tab = ctl_table(sd)
    cache = {}
    autos = auto_answered(run_path, sdir, sd)
    calls = {}
    ai = os.path.join(sd, "ai")
    if os.path.isdir(ai):
        for f in os.listdir(ai):
            m = re.match(r"^([pr])(\d+)\.(json|txt)$", f)
            if m and ((m.group(1) == "p" and m.group(3) == "json") or (m.group(1) == "r" and m.group(3) == "txt")):
                calls.setdefault(int(m.group(2)), {})[m.group(1)] = os.path.join(ai, f)
        layout = "ai/pN.json+rN.txt"
    else:
        layout = "fragments"
        for f in os.listdir(sd):
            m = re.match(r"^(?:ans_(\d+)\.json|r(\d+)\.json)$", f)
            if m:
                calls.setdefault(int(m.group(1) or m.group(2)), {}).setdefault("r", os.path.join(sd, f))
            m = re.match(r"^p(\d+)\.txt$", f)
            if m:
                calls.setdefault(int(m.group(1)), {})["px"] = os.path.join(sd, f)
    recs = []
    ctl_to_turns = {}
    for n in sorted(calls):
        c = calls[n]
        rec = {"schema": SCHEMA_VERSION, "id": "%s/%s/%d" % (run_rel, sdir, n), "round": label, "run": run_rel,
               "group": group, "pass": pas, "scenario": sid, "scenario_dir": sdir, "variant": variant or None,
               "turn": n, "source_layout": layout, "flags": [], "better": None, "verdict": [], "defects": []}
        req = read_json(c["p"]) if c.get("p") else None
        task = None
        if isinstance(req, dict):
            task = req.get("task")
            sys_t = scrub(req.get("sys") or "")
            sh = blob_id(sys_t)
            sysstore.setdefault(sh, sys_t)
            user = scrub(req.get("user") or "")
            rec["request"] = {"task": task, "system": sh, "user": split_user(user, blocks, new_blocks, label),
                              "file_ids": scrub_obj(req.get("fileIds") or []), "complete": True}
            extra = {k: v for k, v in req.items() if k not in ("sys", "user", "task", "fileIds")}
            if extra:
                rec["request"]["extra"] = scrub_obj(extra)
            rm = re.search(r"(?m)^# ضمیرِ گفت‌وگو[^\n]*\n([^\n#]{1,300})", user)
            reg = rm.group(1).strip() if rm else None
        elif c.get("px"):
            px = scrub(read_text(c["px"]) or "")
            hm = re.search(r"task=(\w+)", px)
            task = hm.group(1) if hm else None
            rec["request"] = {"task": task, "system": None, "user": None, "complete": False, "excerpt": px[:20000]}
            reg = None
            rec["flags"].append("request_partial")
        else:
            rec["request"] = None
            reg = None
            rec["flags"].append("request_missing")
        rtext = read_text(c["r"]) if c.get("r") else None
        if rtext is not None:
            rtext = scrub(rtext)
            rj = parse_reply(rtext)
            rtext_out = rtext
            author, basis = author_for(run_info, task)
            rec["reply"] = {"text": rtext_out, "json": rj, "author": author, "author_basis": basis,
                            "valid_json": rj is not None}
            if "(stopped)" in rtext[:60]:
                rec["flags"].append("harness_stop_placeholder")
        else:
            rec["reply"] = None
            rj = None
            rec["flags"].append("reply_missing")
        if n in autos:
            rec["flags"].append("reply_reused_from_prior_round")
        # a reply edited after the page had already read it (next request exists and is older than the reply file)
        if c.get("r") and n + 1 in calls and calls[n + 1].get("p"):
            rt, nt = mtime(c["r"]), mtime(calls[n + 1]["p"])
            if rt and nt and rt > nt + 1:
                rec["flags"].append("reply_modified_after_read")
        po, say = None, None
        if c.get("p") and tab:
            k = assign_ctl(mtime(c["p"]), tab)
            if k is not None:
                po, say = page_outcome(k, tab, rj, cache)
                ctl_to_turns.setdefault(k, []).append(n)
        if (sid, n) in vals:
            po = po or {}
            po["validation"] = scrub_obj(vals[(sid, n)])
            po["validation_basis"] = "page's own AS.quoteIn / contract check (*_val.json)"
        rec["page_outcome"] = scrub_obj(po) if po else None
        rec["user_turn"] = scrub(say) if say else None
        lang_src = (say or "") + ((rj or {}).get("reply") or "" if isinstance(rj, dict) else "")
        rec["meta"] = {"language": "fa" if re.search(r"[؀-ۿ]", lang_src) else ("en" if lang_src.strip() else None),
                       "register": scrub(reg) if reg else None,
                       "polya_stage": coach_stage(rj), "polya_stage_basis": "reply coach_state.ph" if coach_stage(rj) else None}
        recs.append(rec)
        stats["calls"] += 1
    return recs, ctl_to_turns, tab


def user_turns_from_ctl(sd):
    d = os.path.join(sd, "ctl")
    if not os.path.isdir(d):
        d = os.path.join(sd, "src")
    out = []
    if not os.path.isdir(d):
        return out
    for f in sorted(os.listdir(d), key=nat_key):
        m = re.match(r"^c(\d+)\.json$", f)
        if not m:
            continue
        j = read_json(os.path.join(d, f))
        if isinstance(j, dict) and isinstance(j.get("say"), str) and j["say"].strip():
            out.append({"ctl": int(m.group(1)), "say": scrub(j["say"])})
    return out

# --------------------------------------------------------------------------------------------- scenario meta

AGE_RX = [re.compile(r"([0-9۰-۹]{1,3})\s*‌?\s*ساله"), re.compile(r"\(\s*([0-9۰-۹]{1,2})\s*[،,)]"),
          re.compile(r"(?i)\b(\d{1,2})[- ]year[- ]old\b")]


def age_of(text):
    for rx in AGE_RX:
        m = rx.search(text or "")
        if m:
            a = num(m.group(1))
            if a and 4 <= a <= 100:
                return a
    return None


def age_band(a):
    if a is None:
        return "unknown"
    if a <= 12:
        return "child"
    if a <= 19:
        return "teen"
    if a <= 29:
        return "young-adult"
    if a <= 49:
        return "adult"
    return "senior"


_FA = "\u0600-\u06FF\u200c"
FAMILY_RULES = [  # (family, regexes on problem_type) — first match wins; order is part of the schema (SCHEMA.md)
    ("meta", (r"فرا-مسئله",)),
    ("impossibility", (r"عدم امکان", r"بی‌جواب")),
    ("discovery", (r"استقرا", r"کشف", r"حدس", r"استدلال محتمل")),
    ("proof", (r"اثبات",)),
    ("look-back", (r"بازنگری", r"ابداع")),
    ("open-life", (r"(?<![%s])عملی(?![%s])" % (_FA, _FA), r"زندگی", r"(?<![%s])باز(?![%s])" % (_FA, _FA), r"پژوهشی",
                   r"عاطفی", r"مبهم")),
    ("find", (r"یافتنی", r"معما", r"معادله", r"بیشینه", r"درخواست پاسخ")),
]


def family_of(sid, problem_type):
    if re.match(r"^(pA|bp|pC|dp)\d+$", sid):
        return "prerequisite"   # RUNNER22 ADDENDUM 1–2: the round-22 runner-built missing-prerequisite scenarios
    pt = problem_type or ""
    for fam, rxs in FAMILY_RULES:
        if any(re.search(rx, pt) for rx in rxs):
            return fam
    return "other"

# --------------------------------------------------------------------------------------------- split

def split_hash(sid):
    return int(hashlib.sha256((SPLIT_SALT + sid).encode()).hexdigest()[:8], 16) / 2.0 ** 32


def assign_split(scen, previous):
    """scen: {sid: {age_band, family}}; previous: {sid: {split, reason}} from manifest (sticky).
    Rule (SCHEMA.md §Split): (1) a recorded assignment never changes; (2) new scenarios are ranked by
    h = sha256(SALT+sid)[:8]/2^32; (3) coverage: for every age band, then every family (sorted), that has no eval
    scenario yet, the new member with the smallest h goes to eval; (4) fill: new scenarios in ascending h go to eval
    until eval = round(EVAL_FRACTION × all scenarios); (5) the rest are train."""
    assign, reason = {}, {}
    for sid, v in previous.items():
        sp = v.get("split") if isinstance(v, dict) else v
        if sid in scen and sp in ("train", "eval"):
            assign[sid] = sp
            reason[sid] = (v.get("reason") if isinstance(v, dict) else None) or "recorded"
    new = sorted((s for s in scen if s not in assign), key=lambda s: (split_hash(s), s))
    uncovered = []
    for dim in ("age_band", "family"):
        for val in sorted(set(v[dim] for v in scen.values())):
            members = [s for s in scen if scen[s][dim] == val]
            if any(assign.get(s) == "eval" for s in members):
                continue
            movable = [s for s in new if scen[s][dim] == val and s not in assign]
            if not movable:
                uncovered.append("%s=%s" % (dim, val))
                continue
            assign[movable[0]] = "eval"
            reason[movable[0]] = "coverage %s=%s" % (dim, val)
    target = int(round(EVAL_FRACTION * len(scen)))
    for s in new:
        if s in assign:
            continue
        if sum(1 for v in assign.values() if v == "eval") < target:
            assign[s] = "eval"
            reason[s] = "fill to %d%% by hash" % int(EVAL_FRACTION * 100)
        else:
            assign[s] = "train"
            reason[s] = "train"
    return assign, reason, uncovered

# --------------------------------------------------------------------------------------------- misc sources

def build_commit(src, run_rel):
    cands = []
    base = run_rel.split("/")[0]
    cands += sorted(glob.glob(os.path.join(src, "reports", base + "*.md")))
    run_path = os.path.join(src, run_rel)
    for n in ("CATALOGUE.md", "defects.md", "SUMMARY.md", "NOTES.txt", "PARTS.md"):
        cands.append(os.path.join(run_path, n))
    if "/" in run_rel:
        cands.append(os.path.join(src, base, "SUMMARY.md"))
    rx = re.compile(r"(?:\bpage|\bmain|\bcommit|\bBuild:?|\bbuild|\bat|\bHEAD)\s+(?:at\s+)?`?([0-9a-f]{7,12})\b")
    for f in cands:
        t = read_text(f) if os.path.exists(f) else None
        if t:
            m = rx.search(t[:6000])
            if m:
                return m.group(1), os.path.relpath(f, src)
    return None, None


def collect_banks(src):
    out = []
    for f in sorted(glob.glob(os.path.join(src, "VARIANTS_R*.json")), key=nat_key):
        bank = os.path.basename(f)[len("VARIANTS_"):-len(".json")]
        j = read_json(f)
        if not isinstance(j, list):
            continue
        for i, e in enumerate(j):
            if not isinstance(e, dict):
                continue
            e = scrub_obj(e)
            rec = {"schema": SCHEMA_VERSION, "id": "%s#%d" % (bank, i + 1), "bank": bank, "index": i + 1,
                   "rc": e.get("rc"), "kind": e.get("kind"), "role": e.get("role"), "text": e.get("text"),
                   "expect": e.get("expect"), "context": e.get("context"),
                   "extra": {k: v for k, v in e.items() if k not in ("rc", "kind", "role", "text", "expect", "context")} or None}
            rec["hash"] = blob_id(dumps([rec["role"], rec["text"], rec["expect"], rec["context"]]))
            out.append(rec)
    return out

# --------------------------------------------------------------------------------------------- main

def load_existing(out):
    man = None
    mp = os.path.join(out, "manifest.json")
    if os.path.exists(mp):
        try:
            man = json.load(open(mp, encoding="utf-8"))
        except ValueError:
            man = None
    blocks = {}
    order = {}
    for f in sorted(glob.glob(os.path.join(out, "blocks", "*.jsonl.gz")), key=nat_key):
        rl = os.path.basename(f)[:-len(".jsonl.gz")]
        t = gz_read(f) or ""
        lst = []
        for ln in t.split("\n"):
            if ln.strip():
                o = json.loads(ln)
                blocks[o["id"]] = (rl, o["text"])
                lst.append(o["id"])
        order[rl] = lst
    return man, blocks, order


def jsonl_gz(records):
    return gz_bytes("".join(dumps(r) + "\n" for r in records))


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--src", default=DEFAULT_SRC)
    ap.add_argument("--out", default=DEFAULT_OUT)
    ap.add_argument("--quiet", action="store_true")
    a = ap.parse_args(argv)
    src, out = os.path.abspath(a.src), os.path.abspath(a.out)
    log = (lambda *x: None) if a.quiet else (lambda *x: print(*x, file=sys.stderr))
    if not os.path.isdir(src):
        print("source not found: %s" % src, file=sys.stderr)
        return 2
    man_old, blocks, block_order = load_existing(out)
    prev_split = {k: {"split": v.get("split"), "reason": v.get("reason")} for k, v in ((man_old or {}).get("split", {}).get("assignments", {}) or {}).items()}
    prev_shards = {s["path"]: s for s in (man_old or {}).get("shards", [])}

    scen_doc = read_json(os.path.join(src, "scenarios.json")) or {}
    scen_list = scen_doc.get("scenarios", scen_doc if isinstance(scen_doc, list) else [])
    scen_static = {s["id"]: scrub_obj(s) for s in scen_list if isinstance(s, dict) and s.get("id")}

    runs = discover_runs(src)
    sysstore = {}
    new_blocks = []
    by_round = {}
    round_sources = {}
    scen_runs = {}
    link = {"items": 0, "with_turn_ref": 0, "linked": 0, "scenario_level": 0}
    link_by_kind = {}
    stats = {"calls": 0}
    commits = {}
    for run_rel, info in runs:
        label = info[0]
        run_path = os.path.join(src, run_rel)
        vals = load_val(run_path)
        gdef = parse_group_defects(run_path)
        commit, commit_src = build_commit(src, run_rel)
        commits[run_rel] = {"commit": commit, "source": commit_src}
        seen = {}
        for sdir, sid, variant in scenario_dirs(run_path):
            recs, ctl_to_turns, tab = collect_scenario_dir(run_rel, info, run_path, sdir, sid, variant, blocks,
                                                           new_blocks, sysstore, vals, stats)
            kept = []
            for r in recs:
                r["meta"]["build_commit"] = commit
                key = sha(dumps([r["scenario"], r["turn"], r["request"], (r["reply"] or {}).get("text")]))
                if key in seen:
                    seen[key].setdefault("also_in", []).append(r["scenario_dir"])
                    continue
                seen[key] = r
                kept.append(r)
            by_turn = {r["turn"]: r for r in kept}
            ftxt = read_text(os.path.join(run_path, sdir, "findings.md"))
            fnd = parse_findings(scrub(ftxt) if ftxt else None)
            rtxt = None
            for rf in sorted(glob.glob(os.path.join(run_path, sdir, "RESULT*"))):
                rtxt = scrub(read_text(rf) or "").strip()[:500]
            if rtxt and not fnd["result"]:
                m = re.search(r"\b(PASS|FAIL|PARTIAL)\b", rtxt)
                fnd["result"] = m.group(1) if m else None
                fnd["result_line"] = rtxt
            items = []
            for c in fnd["criteria"]:
                items.append(("criterion", {"kind": "criterion", "status": c["status"], "text": c["text"], "source": "findings.md"}, c["text"]))
            for t in fnd["turn_rows"]:
                items.append(("turn_row", {"kind": "turn_row", "mark": t["mark"], "cells": t["cells"], "table": t["table"],
                                           "source": "findings.md", "_turns": [t["turn"]] if t["turn"] else []}, None))
            for tn in fnd["turn_notes"]:
                items.append(("turn_note", {"kind": "turn_note", "mark": tn["mark"], "text": tn["text"], "heading": tn["heading"],
                                            "source": "findings.md"}, tn["text"]))
            for nd in fnd["needs"]:
                items.append(("need", {"kind": "need", "text": nd["text"], "heading": nd["heading"], "source": "findings.md"}, nd["text"]))
            dlist = []
            for d in fnd["defects"]:
                d = dict(d, source="findings.md")
                dlist.append((d, d["text"], None))
            for d in gdef:
                sm = scenario_turns_in(d["text"])
                if sid in sm:
                    dlist.append((dict(d), None, sorted(sm[sid])))
            # merge defects with the same id (scenario findings + group catalogue)
            merged = {}
            for d, txt, pre in dlist:
                k = d["id"] or blob_id(d["text"])
                if txt is not None:
                    ts, basis = turn_refs(txt, ctl_to_turns)
                else:
                    ts, basis = pre or [], ["scenario-mention"] if pre else []
                if k in merged:
                    m0 = merged[k]
                    m0["_turns"] = sorted(set(m0["_turns"]) | set(ts))
                    m0["link_basis"] = sorted(set(m0["link_basis"]) | set(basis))
                    m0["sources"] = sorted(set(m0["sources"]) | {d["source"]})
                    if not m0.get("upgrade") and d.get("upgrade"):
                        m0["upgrade"] = d["upgrade"]
                else:
                    dd = {k2: v for k2, v in d.items() if k2 != "source"}
                    dd.update({"kind": "defect", "_turns": ts, "link_basis": basis, "sources": [d["source"]]})
                    merged[k] = dd
            for k in sorted(merged):
                items.append(("defect", merged[k], None))
            run_items = []
            for kind, it, txt in items:
                if "_turns" in it:
                    ts = it.pop("_turns")
                    basis = it.pop("link_basis", None) or (["table"] if kind == "turn_row" else [])
                else:
                    ts, basis = turn_refs(txt or "", ctl_to_turns)
                linked = [t for t in ts if t in by_turn]
                link["items"] += 1
                lk = link_by_kind.setdefault(kind, {"items": 0, "with_turn_ref": 0, "linked": 0})
                lk["items"] += 1
                if ts:
                    link["with_turn_ref"] += 1
                    lk["with_turn_ref"] += 1
                if linked:
                    link["linked"] += 1
                    lk["linked"] += 1
                else:
                    link["scenario_level"] += 1
                it2 = dict(it, turns=ts, link_basis=basis, linked_turns=linked)
                run_items.append(it2)
                for t in linked:
                    tgt = by_turn[t]["defects" if kind == "defect" else "verdict"]
                    tgt.append({k2: v for k2, v in it2.items() if k2 not in ("linked_turns",)})
            run_rec = {"run": run_rel, "round": label, "group": info[2], "pass": info[3], "scenario_dir": sdir,
                       "variant": variant or None, "build_commit": commit, "result": fnd["result"],
                       "result_line": fnd["result_line"], "summary": fnd["summary"], "preamble": fnd["preamble"],
                       "criteria": [i for i in run_items if i["kind"] == "criterion"],
                       "turn_rows": [i for i in run_items if i["kind"] == "turn_row"],
                       "turn_notes": [i for i in run_items if i["kind"] == "turn_note"],
                       "needs": [i for i in run_items if i["kind"] == "need"],
                       "defects": [i for i in run_items if i["kind"] == "defect"],
                       "upgrades": fnd["upgrades"], "exchanges": len(kept),
                       "user_turns": user_turns_from_ctl(os.path.join(run_path, sdir))}
            scen_runs.setdefault(sid, []).append(run_rec)
            by_round.setdefault(label, []).extend(kept)
            round_sources.setdefault(label, set()).add(run_rel)
        log("  %-16s %s" % (run_rel, sum(1 for r in by_round.get(label, []) if r["run"] == run_rel)))

    # ---------------- scenarios
    old_scen = {}
    sp = os.path.join(out, "scenarios.jsonl.gz")
    if os.path.exists(sp):
        for ln in (gz_read(sp) or "").split("\n"):
            if ln.strip():
                o = json.loads(ln)
                old_scen[o["id"]] = o
    all_sids = sorted(set(scen_static) | set(scen_runs) | set(old_scen), key=nat_key)
    scen_meta = {}
    scen_records = []
    for sid in all_sids:
        st = scen_static.get(sid)
        runs_new = sorted(scen_runs.get(sid, []), key=lambda r: (r["round"], r["run"], r["scenario_dir"]))
        have = {(r["run"], r["scenario_dir"]) for r in runs_new}
        preserved = [r for r in (old_scen.get(sid) or {}).get("runs", []) if (r["run"], r["scenario_dir"]) not in have]
        runs_all = sorted(runs_new + [dict(r, preserved=True) for r in preserved],
                          key=lambda r: (nat_key(r["round"]), r["run"], r["scenario_dir"]))
        if st:
            persona = st.get("persona")
            ptype = st.get("problem_type")
            meta_src = "scenarios.json"
        else:
            o = old_scen.get(sid) or {}
            summ = next((" ".join(x for x in (r.get("preamble"), r.get("summary")) if x)
                         for r in runs_all if r.get("preamble") or r.get("summary")), None)
            persona = summ or o.get("persona")
            ptype = None
            meta_src = "findings preamble + summary (first run)"
        age = age_of(persona)
        fam = family_of(sid, ptype)
        scen_meta[sid] = {"age_band": age_band(age), "family": fam}
        rec = {"schema": SCHEMA_VERSION, "id": sid, "meta_source": meta_src, "persona": persona, "age": age,
               "age_band": age_band(age), "family": fam,
               "topic": (st or {}).get("domain_en") or (st or {}).get("domain_group"),
               "topic_fa": (st or {}).get("domain_fa"), "technique": ptype,
               "polya_elements": [e.get("id") for e in (st or {}).get("polya_elements", []) if isinstance(e, dict)],
               "difficulty": (st or {}).get("difficulty"), "source": "synthetic",
               "definition": st, "runs": runs_all}
        scen_records.append(rec)
    assign, reason, uncovered = assign_split(scen_meta, prev_split)
    for rec in scen_records:
        rec["split"] = assign[rec["id"]]

    # ---------------- exchanges: add split, write shards (monotonic)
    shards = []
    written = []
    rounds_sorted = sorted(set(by_round) | {p.split("/")[1][:-len(".jsonl.gz")] for p in prev_shards if p.startswith("exchanges/")},
                           key=lambda r: (float(re.sub(r"\D", "", r) or 0) + (0.5 if r.startswith("models") else 0), r))
    counts = {}
    for rl in rounds_sorted:
        path = "exchanges/%s.jsonl.gz" % rl
        full = os.path.join(out, path)
        recs = sorted(by_round.get(rl, []), key=lambda r: (r["run"], nat_key(r["scenario_dir"]), r["turn"]))
        for r in recs:
            r["split"] = assign.get(r["scenario"], "train")
        old = prev_shards.get(path)
        if not recs and not old:
            continue
        if old and len(recs) < old.get("records", 0) and os.path.exists(full):
            log("  keep %s: source now has %d < %d records (preserved)" % (path, len(recs), old["records"]))
            data = open(full, "rb").read()
            shard = dict(old, preserved=True)
            recs_counted = [json.loads(l) for l in (gz_read(full) or "").split("\n") if l.strip()]
        else:
            data = jsonl_gz(recs)
            if write_if_changed(full, data):
                written.append(path)
            shard = {"path": path, "records": len(recs), "sources": sorted(round_sources.get(rl, [])), "preserved": False}
            recs_counted = recs
        shard["sha256"] = hashlib.sha256(data).hexdigest()
        shard["bytes"] = len(data)
        shards.append(shard)
        c = {}
        for r in recs_counted:
            au = (r.get("reply") or {}).get("author") or "no-reply"
            c[au] = c.get(au, 0) + 1
        counts[rl] = {"exchanges": len(recs_counted), "by_author": dict(sorted(c.items())),
                      "with_full_request": sum(1 for r in recs_counted if (r.get("request") or {}).get("complete")),
                      "with_page_outcome": sum(1 for r in recs_counted if r.get("page_outcome")),
                      "with_turn_verdict": sum(1 for r in recs_counted if r.get("verdict") or r.get("defects"))}

    # ---------------- system prompts + blocks
    sys_files = []
    for h, t in sorted(sysstore.items()):
        p = "system/%s.txt.gz" % h
        if write_if_changed(os.path.join(out, p), gz_bytes(t)):
            written.append(p)
        sys_files.append(p)
    for p in glob.glob(os.path.join(out, "system", "*.txt.gz")):
        rel = "system/" + os.path.basename(p)
        if rel not in sys_files:
            sys_files.append(rel)   # kept: may be referenced by a preserved shard
    for b in new_blocks:
        rl = blocks[b][0]
        lst = block_order.setdefault(rl, [])
        if b not in lst:
            lst.append(b)
    block_files = []
    for rl in sorted(block_order, key=nat_key):
        p = "blocks/%s.jsonl.gz" % rl
        data = jsonl_gz([{"id": b, "text": blocks[b][1]} for b in block_order[rl]])
        if write_if_changed(os.path.join(out, p), data):
            written.append(p)
        block_files.append({"path": p, "records": len(block_order[rl]), "sha256": hashlib.sha256(data).hexdigest(),
                            "bytes": len(data)})

    # ---------------- scenarios + banks
    data = jsonl_gz(scen_records)
    if write_if_changed(sp, data):
        written.append("scenarios.jsonl.gz")
    scen_shard = {"path": "scenarios.jsonl.gz", "records": len(scen_records), "sha256": hashlib.sha256(data).hexdigest(),
                  "bytes": len(data)}
    banks = collect_banks(src)
    bp = os.path.join(out, "banks.jsonl.gz")
    have_banks = {b["bank"] for b in banks}
    if os.path.exists(bp):
        for ln in (gz_read(bp) or "").split("\n"):
            if ln.strip():
                o = json.loads(ln)
                if o["bank"] not in have_banks:
                    banks.append(dict(o, preserved=True))
    banks.sort(key=lambda b: (nat_key(b["bank"]), b["index"]))
    data = jsonl_gz(banks)
    if write_if_changed(bp, data):
        written.append("banks.jsonl.gz")
    bank_shard = {"path": "banks.jsonl.gz", "records": len(banks), "sha256": hashlib.sha256(data).hexdigest(),
                  "bytes": len(data), "banks": sorted({b["bank"] for b in banks}, key=nat_key)}

    # ---------------- split summary
    sizes = {"train": 0, "eval": 0}
    per = {"age_band": {}, "family": {}}
    for sid, m in scen_meta.items():
        sp_ = assign[sid]
        sizes[sp_] += 1
        for dim in per:
            d = per[dim].setdefault(m[dim], {"train": 0, "eval": 0})
            d[sp_] += 1
    ex_split = {"train": 0, "eval": 0}
    for r in (x for rl in by_round for x in by_round[rl]):
        ex_split[r["split"]] = ex_split.get(r["split"], 0) + 1

    total_bytes = sum(s["bytes"] for s in shards) + sum(b["bytes"] for b in block_files) + scen_shard["bytes"] + bank_shard["bytes"]
    total_bytes += sum(os.path.getsize(os.path.join(out, p)) for p in sys_files if os.path.exists(os.path.join(out, p)))
    manifest = {
        "schema_version": SCHEMA_VERSION,
        "generator": GENERATOR,
        "source_root": scrub(src),
        "counts": {"exchanges_total": sum(c["exchanges"] for c in counts.values()), "per_round": counts,
                   "scenarios": len(scen_records), "bank_cases": len(banks), "system_prompts": len(sys_files),
                   "blocks": sum(b["records"] for b in block_files)},
        "verdict_linking": dict(link, by_kind=link_by_kind,
                                ratio_linked=round(link["linked"] / link["items"], 4) if link["items"] else None),
        "split": {"rule": "see SCHEMA.md §Split", "salt": SPLIT_SALT, "eval_fraction": EVAL_FRACTION,
                  "sizes": sizes, "exchanges": ex_split, "per_stratum": per, "uncovered": uncovered,
                  "assignments": {sid: {"split": assign[sid], "age_band": scen_meta[sid]["age_band"],
                                        "family": scen_meta[sid]["family"], "hash": round(split_hash(sid), 6),
                                        "reason": reason[sid]} for sid in sorted(scen_meta, key=nat_key)}},
        "build_commits": commits,
        "shards": shards,
        "blocks": block_files,
        "scenarios": scen_shard,
        "banks": bank_shard,
        "system": sorted(sys_files),
        "total_bytes": total_bytes,
    }
    write_if_changed(os.path.join(out, "manifest.json"), (json.dumps(manifest, ensure_ascii=False, indent=1, sort_keys=True) + "\n").encode("utf-8"))
    schema_src = os.path.join(DEFAULT_OUT, "SCHEMA.md")   # hand-written, versioned; copied into other output dirs
    if os.path.abspath(out) != os.path.abspath(DEFAULT_OUT) and os.path.exists(schema_src):
        write_if_changed(os.path.join(out, "SCHEMA.md"), open(schema_src, "rb").read())
    summary = {"exchanges": manifest["counts"]["exchanges_total"], "scenarios": len(scen_records), "banks": len(banks),
               "bytes": total_bytes, "written": len(written), "split": sizes, "linked_ratio": manifest["verdict_linking"]["ratio_linked"]}
    if not a.quiet:
        print(json.dumps(summary, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
