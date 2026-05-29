"""Voice → mood analysis (audit task 2165524b, Step 10).

The memo wanted continuous voice capture to infer the user's mood ("صدامو دائم
بتونه ضبط بکنه، بفهمه من توی چه شرایطی هستم"). Continuous capture + ASR is the
external/device piece (see TO-DO/); this is the in-repo analysis seam: given a
transcript (from the device's ASR), derive a mood label by reusing the
deterministic sentiment analyzer, so the context engine reacts to mood now.
"""
from __future__ import annotations


def analyze_voice_mood(transcript: str) -> dict:
    """Return ``{mood, sentiment_score}`` for a voice transcript."""
    from app.services.ai.profile_analysis import analyze_sentiment

    result = analyze_sentiment(transcript or "")
    return {
        "mood": result["dominant_emotion"],
        "sentiment_score": result["sentiment_score"],
    }
