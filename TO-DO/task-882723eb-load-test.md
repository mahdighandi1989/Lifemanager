# task_882723eb07de — locust load test (Step 10)

**Status:** external/CI-only.

**What's done in-repo:** async engine + tuned pool (`pool_size`/`max_overflow`
sized for ≥100 concurrent, `pool_timeout=30`, `pool_recycle=3600`,
`pool_pre_ping=True` — `app/database.py`); pool-exhaustion → 503 via the global
`_db_pool_timeout_handler` (`app/main.py`); `tests/test_database.py::test_concurrent_connections`,
`test_db_pool_503.py`, `test_database_timeout.py`, `test_database_schema.py` all pass.

**What's deferred and why:** the prompt's Step-10 validation command
`locust -f tests/locustfile.py` is a load-generation tool meant to run against a
live server in CI/staging, not in the unit-test sandbox (no running server, no
locust dependency, would be flaky/meaningless here). The concurrency behaviour
it would exercise is already covered deterministically by
`test_concurrent_connections` (100 parallel sessions each running a query).

**To do when a staging server exists:** add `locust` to a dev/CI extra, write
`tests/locustfile.py` hitting the read endpoints, and run it against staging to
confirm the pool holds under sustained load.
