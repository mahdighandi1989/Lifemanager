import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.ai_service import AIService


@pytest.fixture
def ai_service():
    return AIService()


class TestAIService:
    """Tests for AIService."""

    def test_service_initialization(self, ai_service):
        """Test that AIService can be initialized."""
        assert ai_service is not None
        assert hasattr(ai_service, 'generate_response')
        assert hasattr(ai_service, 'analyze_text')
        assert hasattr(ai_service, 'get_suggestions')

    @pytest.mark.asyncio
    async def test_generate_response_success(self, ai_service):
        """Test successful AI response generation."""
        with patch.object(ai_service, '_call_ai_api', new_callable=AsyncMock) as mock_api:
            mock_api.return_value = {"response": "This is an AI response", "confidence": 0.95}
            result = await ai_service.generate_response("Hello, how are you?")
            assert result is not None
            assert "response" in result
            assert result["confidence"] > 0.9

    @pytest.mark.asyncio
    async def test_generate_response_empty_input(self, ai_service):
        """Test AI response with empty input."""
        with pytest.raises(ValueError, match="Input text cannot be empty"):
            await ai_service.generate_response("")

    @pytest.mark.asyncio
    async def test_analyze_text_sentiment(self, ai_service):
        """Test text sentiment analysis."""
        with patch.object(ai_service, '_call_ai_api', new_callable=AsyncMock) as mock_api:
            mock_api.return_value = {
                "sentiment": "positive",
                "score": 0.85,
                "keywords": ["happy", "great", "excellent"]
            }
            result = await ai_service.analyze_text("I am very happy today!")
            assert result["sentiment"] == "positive"
            assert result["score"] > 0.8
            assert len(result["keywords"]) > 0

    @pytest.mark.asyncio
    async def test_analyze_text_negative_sentiment(self, ai_service):
        """Test negative sentiment analysis."""
        with patch.object(ai_service, '_call_ai_api', new_callable=AsyncMock) as mock_api:
            mock_api.return_value = {
                "sentiment": "negative",
                "score": 0.2,
                "keywords": ["sad", "angry"]
            }
            result = await ai_service.analyze_text("I am feeling very sad today")
            assert result["sentiment"] == "negative"
            assert result["score"] < 0.5

    @pytest.mark.asyncio
    async def test_get_suggestions(self, ai_service):
        """Test getting AI suggestions."""
        with patch.object(ai_service, '_call_ai_api', new_callable=AsyncMock) as mock_api:
            mock_api.return_value = {
                "suggestions": [
                    {"title": "Take a walk", "priority": "high"},
                    {"title": "Read a book", "priority": "medium"}
                ]
            }
            result = await ai_service.get_suggestions(user_context={"mood": "stressed"})
            assert len(result["suggestions"]) == 2
            assert result["suggestions"][0]["priority"] == "high"

    @pytest.mark.asyncio
    async def test_get_suggestions_no_context(self, ai_service):
        """Test getting suggestions without context."""
        with patch.object(ai_service, '_call_ai_api', new_callable=AsyncMock) as mock_api:
            mock_api.return_value = {"suggestions": []}
            result = await ai_service.get_suggestions(user_context={})
            assert len(result["suggestions"]) == 0

    @pytest.mark.asyncio
    async def test_api_failure_handling(self, ai_service):
        """Test handling of API failures."""
        with patch.object(ai_service, '_call_ai_api', new_callable=AsyncMock) as mock_api:
            mock_api.side_effect = Exception("API connection failed")
            with pytest.raises(Exception, match="AI service unavailable"):
                await ai_service.generate_response("Test")

    def test_rate_limiting(self, ai_service):
        """Test rate limiting functionality."""
        with patch.object(ai_service, '_check_rate_limit') as mock_rate:
            mock_rate.return_value = False
            with pytest.raises(Exception, match="Rate limit exceeded"):
                ai_service._check_rate_limit()
