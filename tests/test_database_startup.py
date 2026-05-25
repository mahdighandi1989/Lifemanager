import pytest
from unittest.mock import patch, AsyncMock
import logging

from app.main import app


@pytest.mark.asyncio
async def test_startup_database_failure_logs_critical():
    """
    Test that when database connection fails during startup,
    the application logs at CRITICAL level (not just WARNING).
    This verifies the fix for the threshold-outcome mismatch anti-pattern.
    """
    caplog = logging.getLogger("app.main")
    caplog.setLevel(logging.CRITICAL)
    
    with patch("app.main.engine.begin", side_effect=Exception("Connection refused")):
        with patch("app.main.logger.critical") as mock_critical:
            # Trigger startup event
            await app.router.startup()
            
            # Verify critical was called at least once
            assert mock_critical.called, "logger.critical should have been called on DB failure"
            
            # Verify the message contains the expected content
            call_args = mock_critical.call_args_list
            critical_messages = [args[0][0] for args in call_args]
            assert any("CRITICAL" in msg for msg in critical_messages), "Critical messages should contain 'CRITICAL'"
            assert any("Database connection failed" in msg for msg in critical_messages), "Should mention database failure"


@pytest.mark.asyncio
async def test_startup_database_success_logs_info():
    """
    Test that when database connection succeeds during startup,
    the application logs at INFO level.
    """
    with patch("app.main.engine.begin") as mock_begin:
        mock_conn = AsyncMock()
        mock_begin.return_value.__aenter__.return_value = mock_conn
        mock_conn.run_sync = AsyncMock()
        
        with patch("app.main.logger.info") as mock_info:
            await app.router.startup()
            
            assert mock_info.called, "logger.info should have been called on DB success"
            call_args = mock_info.call_args_list
            info_messages = [args[0][0] for args in call_args]
            assert any("Database tables created successfully" in msg for msg in info_messages)


@pytest.mark.asyncio
async def test_startup_database_failure_app_continues():
    """
    Test that the application continues running even when DB fails,
    because webhook endpoints may still be useful.
    """
    with patch("app.main.engine.begin", side_effect=Exception("Connection refused")):
        # Should not raise an exception
        await app.router.startup()
        # If we get here, the app didn't crash - which is the intended behavior
        assert True
