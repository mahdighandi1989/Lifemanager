"""Tour dataset collector (scripts/tours/collect_dataset.py): schema, split stability, scrubbing, dedup.

Runs the collector on a tiny synthetic tour tree (no network, stdlib only).
"""
import glob
import gzip
import json
import os
import shutil
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts", "tours"))
import collect_dataset as cd  # noqa: E402

OWNER = "mohamad.mahdi1988@gmail.com"
SYS = "تو «دستیار» ِ صفحه هستی. " * 40
MAP = "# نقشهٔ سامانه\n" + ("- home — امروز — کارهای موعدِ امروز\n" * 60)

PERSONAS = [
    ("s01", "سارا، ۳۴ ساله، کارمند بانک", "مسئلهٔ عملی (یافتنی، بد-تعریف)"),
    ("s02", "رضا، ۲۸ ساله، راننده وانت", "مسئلهٔ یافتنی (فضایی)"),
    ("s03", "نگار، ۱۷ ساله، دانش‌آموز", "مسئلهٔ اثباتی"),
    ("s04", "بردیا، ۱۲ ساله، شطرنج‌باز", "مسئلهٔ یافتنی کاملاً بیان‌شده"),
    ("s05", "آقای کریمی، ۶۱ ساله", "کشف با استقرا → مسئلهٔ اثباتی"),
    ("s06", "نیما، ۲۷ ساله", "فرا-مسئله: «روشی که همیشه کار کند»"),
    ("s07", "سارینا، ۱۶ ساله", "بازنگری عمیق و ابداع مسئله"),
]


def _w(path, data, t=None):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(data if isinstance(data, str) else json.dumps(data, ensure_ascii=False))
    if t is not None:
        os.utime(path, (t, t))


def _req(task, turn_text):
    return {"sys": SYS, "user": MAP + "# امروز\n۲۵ مهر\n\n# نوبتِ تازه\n" + turn_text, "task": task, "fileIds": []}


def build_tree(src):
    _w(os.path.join(src, "scenarios.json"), {"meta": {}, "scenarios": [
        {"id": i, "persona": p, "problem_type": t, "domain_en": "test", "opening": "سلام", "script": [],
         "polya_elements": [{"id": "A013"}], "success_criteria": ["c"]} for i, p, t in PERSONAS]})
    base = 1_700_000_000
    d = os.path.join(src, "round14A", "s01")
    _w(os.path.join(d, "ctl", "c1.json"), {"say": "خونه بخرم یا نه؟ ایمیلم " + OWNER}, base)
    _w(os.path.join(d, "ai", "p1.json"), _req("lla_coach", "خونه بخرم یا نه؟"), base + 1)
    _w(os.path.join(d, "ai", "r1.txt"), json.dumps({"reply": "مجهولت دقیقاً چیست؟", "actions": [
        {"do": "coach_state", "ph": "u"}]}, ensure_ascii=False), base + 2)
    _w(os.path.join(d, "out", "s1.json"), {"state": {"view": "lprob", "msgs": [
        "user: خونه بخرم یا نه؟", "ai: مجهولت دقیقاً چیست؟", "sys: 🔭 مسئله ثبت شد"]}, "log": []}, base + 3)
    _w(os.path.join(d, "ctl", "c2.json"), {"say": "امنیتِ بچه"}, base + 10)
    _w(os.path.join(d, "ai", "p2.json"), _req("lla_coach", "امنیتِ بچه"), base + 11)
    _w(os.path.join(d, "ai", "r2.txt"), json.dumps({"reply": "داده‌ها کدام‌اند؟"}, ensure_ascii=False), base + 12)
    _w(os.path.join(d, "out", "s2.json"), {"state": {"view": "lprob", "msgs": [
        "user: امنیتِ بچه", "ai: داده‌ها کدام‌اند؟"]}, "log": []}, base + 13)
    _w(os.path.join(d, "findings.md"), "\n".join([
        "## خلاصه برای مالک", "سارا تصمیم گرفت. گزارش به " + OWNER, "",
        "RESULT: PARTIAL", "## معیارها",
        "- [FAIL] پرسشِ مجهول پیش از داده — p2 داده پرسید",
        "- [PASS] ثبتِ مسئلهٔ زنده — کلی",
        "## نقص‌ها",
        "- A14-1 (S2, b) the page asked twice at p1 — a38_live.js:120 «ارتقای لازم»: یک پرسش",
        "## مسیرِ مدل",
        "| نوبت | پیام | task | درست؟ |", "|---|---|---|---|", "| p1 | خونه | lla_coach | ✓ |", "| p2 | بچه | lla_coach | ✗ |",
    ]))
    m = os.path.join(src, "models20", "haiku", "s02")
    _w(os.path.join(m, "ai", "p1.json"), _req("lla_assistant", "لوله جا می‌شه؟"), base + 20)
    _w(os.path.join(m, "ai", "r1.txt"), "not json at all", base + 21)
    _w(os.path.join(m, "findings.md"), "## نوبت‌ها\nr1 پاسخ بی‌ربط ✗\nRESULT: FAIL (S2)\n")
    _w(os.path.join(src, "models20", "haiku_val.json"), [{"sid": "s02", "i": 1, "badPh": False}])
    p = os.path.join(src, "round22A", "pA1")
    _w(os.path.join(p, "findings.md"), "# pA1 — دورِ ۲۲\n\n## خلاصه برای مالک\nنازنین (۱۶، پایهٔ دهم) باید ثابت می‌کرد.\n\nRESULT: FAIL\n")
    _w(os.path.join(p, "ai", "p1.json"), _req("lla_coach", "ثابت کنید"), base + 30)
    _w(os.path.join(p, "ai", "r1.txt"), json.dumps({"reply": "فرض چیست؟"}, ensure_ascii=False), base + 31)
    _w(os.path.join(src, "VARIANTS_R17.json"), [
        {"rc": "RC1", "kind": "pos", "role": "user", "text": "به " + OWNER + " بفرست", "expect": "x"},
        {"rc": "RC2", "kind": "neg", "role": "user", "text": "شماره‌ام 09121234567", "expect": "y"}])


def read_gz_lines(path):
    with gzip.open(path, "rt", encoding="utf-8") as g:
        return [json.loads(x) for x in g if x.strip()]


def snapshot(out):
    res = {}
    for f in sorted(glob.glob(os.path.join(out, "**", "*"), recursive=True)):
        if os.path.isfile(f):
            res[os.path.relpath(f, out)] = open(f, "rb").read()
    return res


class TourDatasetTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.src = os.path.join(self.tmp, "tour")
        self.out = os.path.join(self.tmp, "dataset")
        build_tree(self.src)
        self.assertEqual(cd.main(["--src", self.src, "--out", self.out, "--quiet"]), 0)
        self.man = json.load(open(os.path.join(self.out, "manifest.json"), encoding="utf-8"))
        self.ex = {}
        for f in glob.glob(os.path.join(self.out, "exchanges", "*.jsonl.gz")):
            for r in read_gz_lines(f):
                self.ex[r["id"]] = r

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_schema_and_authors(self):
        self.assertEqual(self.man["schema_version"], 1)
        self.assertEqual(set(self.ex), {"round14A/s01/1", "round14A/s01/2", "models20/haiku/s02/1", "round22A/pA1/1"})
        need = {"schema", "id", "round", "run", "scenario", "turn", "split", "request", "reply", "page_outcome",
                "verdict", "defects", "better", "flags", "meta"}
        for r in self.ex.values():
            self.assertTrue(need <= set(r), r["id"])
            self.assertEqual(r["schema"], 1)
        self.assertEqual(self.ex["round14A/s01/1"]["reply"]["author"], "runner-simulated")
        self.assertEqual(self.ex["models20/haiku/s02/1"]["reply"]["author"], "real-haiku")
        self.assertFalse(self.ex["models20/haiku/s02/1"]["reply"]["valid_json"])
        self.assertEqual(self.ex["models20/haiku/s02/1"]["page_outcome"]["validation"], {"badPh": False})
        po = self.ex["round14A/s01/1"]["page_outcome"]
        self.assertEqual(po["ctl"], 1)
        self.assertEqual(po["sys"], ["🔭 مسئله ثبت شد"])
        self.assertEqual(self.ex["round14A/s01/1"]["meta"]["polya_stage"], "u")
        self.assertEqual(self.man["counts"]["per_round"]["round14"]["by_author"], {"runner-simulated": 2})
        for f in ("SCHEMA.md",):
            if os.path.exists(os.path.join(cd.DEFAULT_OUT, f)):
                self.assertTrue(os.path.exists(os.path.join(self.out, f)))

    def test_turn_linking(self):
        v2 = self.ex["round14A/s01/2"]["verdict"]
        self.assertTrue(any(v["kind"] == "criterion" and v["status"] == "FAIL" for v in v2))
        self.assertTrue(any(v["kind"] == "turn_row" and v["mark"] == "bad" for v in v2))
        d1 = self.ex["round14A/s01/1"]["defects"]
        self.assertEqual([(d["id"], d["severity"], d["class"]) for d in d1], [("A14-1", "S2", "b")])
        self.assertEqual(d1[0]["files"], ["a38_live.js:120"])
        self.assertTrue(any(v["kind"] == "turn_note" for v in self.ex["models20/haiku/s02/1"]["verdict"]))
        scen = {s["id"]: s for s in read_gz_lines(os.path.join(self.out, "scenarios.jsonl.gz"))}
        run = scen["s01"]["runs"][0]
        self.assertEqual(run["result"], "PARTIAL")
        general = [c for c in run["criteria"] if c["status"] == "PASS"][0]
        self.assertEqual(general["linked_turns"], [])          # scenario-level
        self.assertEqual(scen["pA1"]["age"], 16)
        self.assertEqual(scen["pA1"]["family"], "prerequisite")
        self.assertEqual(scen["s05"]["family"], "discovery")
        self.assertEqual(scen["s07"]["family"], "look-back")

    def test_scrubbing(self):
        blob = b"".join(snapshot(self.out).values())
        text = "".join(gzip.decompress(v).decode("utf-8") if k.endswith(".gz") else v.decode("utf-8")
                       for k, v in snapshot(self.out).items())
        self.assertNotIn(OWNER.encode(), blob)
        self.assertNotIn(OWNER, text)
        self.assertIn("<owner-email>", text)
        self.assertNotIn("09121234567", text)
        self.assertIn("<phone>", text)

    def test_dedup_and_reconstruction(self):
        self.assertEqual(len(os.listdir(os.path.join(self.out, "system"))), 1)
        blocks = {}
        for f in glob.glob(os.path.join(self.out, "blocks", "*.jsonl.gz")):
            for b in read_gz_lines(f):
                blocks[b["id"]] = b["text"]
        refs = [p["b"] for r in self.ex.values() for p in r["request"]["user"] if isinstance(p, dict)]
        self.assertGreater(len(refs), len(blocks))               # the repeated map is stored once
        r = self.ex["round14A/s01/2"]
        user = "".join(p if isinstance(p, str) else blocks[p["b"]] for p in r["request"]["user"])
        self.assertEqual(user, _req("lla_coach", "امنیتِ بچه")["user"])
        sys_txt = gzip.decompress(open(glob.glob(os.path.join(self.out, "system", "*"))[0], "rb").read()).decode()
        self.assertEqual(sys_txt, SYS)

    def test_split_stable_and_stratified(self):
        a1 = self.man["split"]["assignments"]
        evals = [s for s, v in a1.items() if v["split"] == "eval"]
        for dim in ("age_band", "family"):
            vals = {v[dim] for v in a1.values()}
            self.assertEqual(vals, {a1[s][dim] for s in evals}, dim)
        before = snapshot(self.out)
        cd.main(["--src", self.src, "--out", self.out, "--quiet"])
        self.assertEqual(before, snapshot(self.out))              # idempotent, byte-identical
        sj = os.path.join(self.src, "scenarios.json")
        d = json.load(open(sj, encoding="utf-8"))
        d["scenarios"].append({"id": "s08", "persona": "مریم، ۲۹ ساله", "problem_type": "مسئلهٔ پژوهشی باز"})
        _w(sj, d)
        cd.main(["--src", self.src, "--out", self.out, "--quiet"])
        a2 = json.load(open(os.path.join(self.out, "manifest.json"), encoding="utf-8"))["split"]["assignments"]
        for s, v in a1.items():
            self.assertEqual(a2[s]["split"], v["split"], s)
        self.assertIn("s08", a2)
        self.assertEqual(cd.split_hash("s01"), cd.split_hash("s01"))

    def test_preserves_shard_when_source_shrinks(self):
        shutil.rmtree(os.path.join(self.src, "round22A"))
        cd.main(["--src", self.src, "--out", self.out, "--quiet"])
        man = json.load(open(os.path.join(self.out, "manifest.json"), encoding="utf-8"))
        sh = {s["path"]: s for s in man["shards"]}
        self.assertTrue(sh["exchanges/round22.jsonl.gz"]["preserved"])
        self.assertEqual(len(read_gz_lines(os.path.join(self.out, "exchanges", "round22.jsonl.gz"))), 1)
        self.assertIn("pA1", man["split"]["assignments"])


if __name__ == "__main__":
    unittest.main()
