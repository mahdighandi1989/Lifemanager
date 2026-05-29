"""Integration tests for core services (audit task b7894694).

The raw task was explicit and repeated: the integration tests "**must be created
in tests/integration/**" (with this package + test_ai_service_integration.py /
test_auth_service.py). They exercise the real service ↔ database boundary using
the shared ``db_session`` / ``api_client`` fixtures from tests/conftest.py
(parent conftest fixtures are visible to this sub-package).
"""
