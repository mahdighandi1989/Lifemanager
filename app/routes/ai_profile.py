"""/ai profiling routes (audit task 14e65214, Steps 2/3/5/6/7/8).

Split out of app/routes/ai.py to keep that module focused. Mounted with the
same dual `/ai` + `/api/ai` prefixes in app/main.py, so the SPA's `/api/ai/...`
calls and the bare `/ai/...` calls both resolve. Scoped by get_optional_user_id
(login-bypass single-tenant design) so the frontend works without a bearer.
"""
from typing import List

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import FEATURE_AI_ENABLED
from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.schemas.ai_schema import (
    CareerPathRequest,
    CareerPathResponse,
    HolisticAssessmentCreate,
    HolisticAssessmentResponse,
    IdentifyInterestsResponse,
    PersonalityAnalyzeRequest,
    PersonalityProfileResponse,
    PersonalizedRecommendation,
    SentimentAnalysisRequestSchema,
    UserSentimentProfileSchema,
)

router = APIRouter(prefix="/ai", tags=["ai", "profiling"])


# ── Interests (Step 2) ──────────────────────────────────────────────


@router.post("/identify_interests", status_code=status.HTTP_202_ACCEPTED,
             response_model=IdentifyInterestsResponse)
@handle_errors
async def identify_user_interests(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> IdentifyInterestsResponse:
    from app.services.ai.interest_identification_service import (
        InterestIdentificationService,
    )

    result = await InterestIdentificationService(db).identify_and_verify_interests(user_id)
    return IdentifyInterestsResponse(
        message="Interest identification completed.",
        identified=result["identified"],
        verified=result["verified"],
    )


# ── Personalized recommendations (Step 3) ──────────────────────────


@router.get("/personalized_recommendations", response_model=List[PersonalizedRecommendation])
@handle_errors
async def personalized_recommendations(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> List[PersonalizedRecommendation]:
    from app.services.ai.recommendation_service import RecommendationService

    recs = await RecommendationService(db).generate_personalized_recommendations(user_id)
    return [PersonalizedRecommendation(**r) for r in recs]


# ── Sentiment / mood (Step 5) ───────────────────────────────────────


@router.post("/sentiment/analyze", response_model=UserSentimentProfileSchema)
@handle_errors
async def analyze_sentiment(
    payload: SentimentAnalysisRequestSchema = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> UserSentimentProfileSchema:
    from app.services.ai.sentiment_personality_service import (
        SentimentPersonalityService,
    )

    uid = payload.user_id if payload.user_id is not None else user_id
    profile = await SentimentPersonalityService(db).analyze_and_save_sentiment(
        uid, text=payload.text, audio_url=payload.audio_url,
        behavior_type=payload.behavior_type,
    )
    return UserSentimentProfileSchema(**profile)


@router.get("/sentiment/profile", response_model=UserSentimentProfileSchema)
@handle_errors
async def sentiment_profile(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> UserSentimentProfileSchema:
    from app.services.ai.sentiment_personality_service import (
        SentimentPersonalityService,
    )

    profile = await SentimentPersonalityService(db).get_latest_sentiment_profile(user_id)
    return UserSentimentProfileSchema(**profile)


# ── Personality (Step 6) ────────────────────────────────────────────


@router.post("/personality/analyze", status_code=status.HTTP_202_ACCEPTED,
             response_model=PersonalityProfileResponse)
@handle_errors
async def analyze_personality(
    payload: PersonalityAnalyzeRequest = Body(default=PersonalityAnalyzeRequest()),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> PersonalityProfileResponse:
    from app.services.ai.personality_service import PersonalityService

    uid = payload.user_id if payload.user_id is not None else user_id
    profile = await PersonalityService(db).analyze_user_personality(uid)
    return PersonalityProfileResponse(**profile)


@router.get("/personality/profile", response_model=PersonalityProfileResponse)
@handle_errors
async def personality_profile(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> PersonalityProfileResponse:
    from app.services.ai.personality_service import PersonalityService

    profile = await PersonalityService(db).get_personality_profile(user_id)
    return PersonalityProfileResponse(**profile)


# ── Holistic profile (Step 7) ───────────────────────────────────────


@router.post("/assessments/holistic_profile", response_model=HolisticAssessmentResponse,
             status_code=status.HTTP_201_CREATED)
@handle_errors
async def create_holistic_assessment(
    assessment_data: HolisticAssessmentCreate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> HolisticAssessmentResponse:
    from app.services.ai.holistic_profile_service import HolisticProfileService

    created = await HolisticProfileService(db).create_or_update_assessment(assessment_data)
    return created


@router.get("/assessments/holistic_profile/{profile_user_id}",
            response_model=HolisticAssessmentResponse)
@handle_errors
async def get_holistic_assessment(
    profile_user_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> HolisticAssessmentResponse:
    from app.services.ai.holistic_profile_service import HolisticProfileService

    profile = await HolisticProfileService(db).get_holistic_profile(profile_user_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="Holistic profile not found")
    return profile


# ── Career paths (Step 8) ───────────────────────────────────────────


@router.post("/career_paths", response_model=CareerPathResponse, tags=["ai", "planner"])
@handle_errors
async def get_career_paths(
    request_data: CareerPathRequest = Body(default=CareerPathRequest()),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> CareerPathResponse:
    """Draw personalized, non-clichéd career/life paths. Gated on
    FEATURE_AI_ENABLED (403 when off, AC45). The engine is deterministic and
    offline, so a missing/invalid OPENAI_API_KEY degrades gracefully to the
    heuristic projection rather than erroring (AC46)."""
    if not FEATURE_AI_ENABLED:
        raise HTTPException(status_code=403, detail="AI features are not enabled")

    from app.services.ai.career_path_service import CareerPathService

    uid = request_data.user_id if request_data.user_id is not None else user_id
    result = await CareerPathService(db).generate_career_paths(uid, request_data)
    return CareerPathResponse(**result)
