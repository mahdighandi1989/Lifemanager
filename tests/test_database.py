import pytest
from unittest.mock import patch, MagicMock

from app.database import engine


class TestDatabaseEchoSetting:
    """تست‌های مربوط به تنظیم echo در database engine"""

    def test_echo_disabled_in_production(self):
        """تأیید اینکه echo=False در حالت production (DEBUG=False)"""
        with patch('app.database.settings') as mock_settings:
            mock_settings.DATABASE_URL = "postgresql+asyncpg://test:test@localhost/test"
            mock_settings.DEBUG = False

            # Re-import to trigger engine creation with mocked settings
            import importlib
            import app.database
            importlib.reload(app.database)

            assert app.database.engine.echo is False, "echo باید در production False باشد"

    def test_echo_enabled_in_debug(self):
        """تأیید اینکه echo=True در حالت debug (DEBUG=True)"""
        with patch('app.database.settings') as mock_settings:
            mock_settings.DATABASE_URL = "postgresql+asyncpg://test:test@localhost/test"
            mock_settings.DEBUG = True

            import importlib
            import app.database
            importlib.reload(app.database)

            assert app.database.engine.echo is True, "echo باید در حالت DEBUG True باشد"

    def test_echo_not_hardcoded(self):
        """تأیید اینکه echo از settings خوانده می‌شود نه hardcode"""
        import ast
        import inspect
        from app import database

        source = inspect.getsource(database)
        tree = ast.parse(source)

        # Check for hardcoded echo=True
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                for keyword in node.keywords:
                    if keyword.arg == "echo" and isinstance(keyword.value, ast.Constant):
                        if keyword.value.value is True:
                            pytest.fail("echo=True hardcoded یافت شد - باید از settings.DEBUG استفاده شود")
                        if keyword.value.value is False:
                            pytest.fail("echo=False hardcoded یافت شد - باید از settings.DEBUG استفاده شود")
