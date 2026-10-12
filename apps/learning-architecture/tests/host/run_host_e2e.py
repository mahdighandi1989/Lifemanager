"""Browser tests of the page INSIDE Lifemanager (host mode) — the standalone tests in tests/*.js
can't see the host: login, the database, the save queue, history, the Drive mirror, attachments.

    python apps/learning-architecture/tests/host/run_host_e2e.py

Starts the real app on a free port with a throw-away SQLite database, registers a user, builds
nothing (run `python apps/learning-architecture/build.py` and `cd frontend && npm run build` first),
runs every tests/host/*.js with BASE and TOK, and exits non-zero unless each prints NO ERRORS.
Needs Playwright (npm i --no-save playwright@1.56 in apps/learning-architecture) and Chromium at /opt/pw-browsers.
"""
import json
import os
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
APPDIR = os.path.dirname(os.path.dirname(HERE))
REPO = os.path.dirname(os.path.dirname(APPDIR))

LAUNCH = r"""
import os, sys
sys.path.insert(0, os.environ['REPO']); os.chdir(os.environ['REPO'])
import sqlalchemy.ext.asyncio as sea
_orig = sea.create_async_engine
def _patched(url, **kw):
    if str(url).startswith('sqlite'):
        for k in ('pool_size', 'max_overflow', 'pool_timeout', 'pool_recycle', 'pool_pre_ping'): kw.pop(k, None)
    return _orig(url, **kw)
sea.create_async_engine = _patched
import uvicorn
uvicorn.run('main:app', port=int(os.environ['PORT']), log_level='warning')
"""


def free_port():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close(); return p


def post(url, body):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"content-type": "application/json"})
    return json.loads(urllib.request.urlopen(req, timeout=20).read())


def main():
    tmp = tempfile.mkdtemp(prefix="lla_host_")
    port = free_port()
    env = dict(os.environ, REPO=REPO, PORT=str(port), DATABASE_URL="sqlite+aiosqlite:///%s/e2e.db" % tmp)
    srv = subprocess.Popen([sys.executable, "-c", LAUNCH], env=env, stdout=open(os.path.join(tmp, "server.log"), "w"), stderr=subprocess.STDOUT)
    base = "http://127.0.0.1:%d" % port
    try:
        for _ in range(90):
            try:
                urllib.request.urlopen(base + "/apps/learning-architecture", timeout=2); break
            except Exception:
                time.sleep(1)
        tok = post(base + "/auth/register", {"email": "host-e2e@example.com", "password": "Passw0rd!xyz", "username": "hoste2e"})["access_token"]
        bad = []
        for name in sorted(f for f in os.listdir(HERE) if f.endswith(".js")):
            r = subprocess.run(["node", os.path.join(HERE, name)], cwd=APPDIR, env=dict(os.environ, BASE=base, TOK=tok),
                               capture_output=True, text=True, timeout=600)
            out = (r.stdout + r.stderr).strip()
            print("==", name, "\n" + out[-1500:])
            if r.returncode != 0 or not out.endswith("NO ERRORS"):
                bad.append(name)
        print("FAILED: " + ", ".join(bad) if bad else "host e2e: all NO ERRORS")
        return 1 if bad else 0
    finally:
        srv.terminate()


if __name__ == "__main__":
    sys.exit(main())
