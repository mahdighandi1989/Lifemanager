"""Locust load test (audit task 882723eb07de, Step 10).

A load-generation harness meant to run against a LIVE server (staging) — not in
the unit-test sandbox. It is intentionally NOT named ``test_*`` so pytest does
not collect it, and it lazy-needs ``locust`` (a dev/CI extra, see
``requirements-dev.txt``) which is not part of the runtime image.

The deterministic concurrency contract (≥100 parallel DB sessions, pool sizing,
pool-exhaustion → 503) is already covered by
``tests/test_database.py::test_concurrent_connections`` + ``test_db_pool_503.py``.
This file is the sustained-load complement.

Run against a running server:

    pip install -r requirements-dev.txt
    locust -f tests/locustfile.py --host https://your-staging-host
    # or headless:
    locust -f tests/locustfile.py --host https://your-staging-host \\
           --headless -u 100 -r 10 -t 2m
"""
from locust import HttpUser, between, task


class ReadHeavyUser(HttpUser):
    """Simulates a user browsing the read-mostly surfaces under sustained load.

    Targets DB-free health probes and read endpoints that degrade gracefully
    without auth (the optional-user routes return data or an empty list), so the
    run exercises the connection pool, not the auth wall.
    """

    wait_time = between(1, 3)

    @task(5)
    def health(self):
        self.client.get("/api/health", name="health")

    @task(3)
    def oversight_status(self):
        self.client.get("/api/oversight/status", name="oversight-status")

    @task(4)
    def tasks(self):
        self.client.get("/api/tasks", name="tasks")

    @task(2)
    def projects(self):
        self.client.get("/api/projects", name="projects")

    @task(2)
    def ai_overview(self):
        self.client.get("/api/ai/overview", name="ai-overview")

    @task(1)
    def import_targets(self):
        self.client.get("/api/imports/targets", name="import-targets")

    @task(1)
    def db_health(self):
        # Exercises an actual DB round-trip so the pool is under real pressure.
        self.client.get("/api/health/db", name="health-db")
