"""Shared test setup.

We disable per-IP rate limiting before any app module is imported, so the
slowapi Limiter built in app/rate_limit.py initializes with enabled=False
and tests can hit /auth/login as many times as they need without 429s.
Tests that exercise rate-limit behavior re-enable it locally with their
own Limiter (see tests/test_rate_limiting.py).
"""
import os

os.environ.setdefault("RATE_LIMIT_DISABLED", "true")
# A stable signing key keeps token-shape assertions deterministic.
os.environ.setdefault("JWT_SECRET_KEY", "test-key-not-for-prod")
