# task 2165524b — wearable device pairing + continuous voice capture

**Status:** external (OS/hardware + device permissions); the in-app seams are built.

**What's done in-repo:**
- Heart-rate / activity ingestion: `POST /api/context/physiological` →
  `wearable_service.normalize_physiological` → UserContext → context recommendations.
- Voice→mood: `POST /api/context/voice` (transcript) →
  `voice_mood_service.analyze_voice_mood` (reuses the sentiment analyzer) → UserContext.mood.
- Accept/reject is persisted: `PATCH /api/recommendations/{id}/read`.
- Maps-based "near X" recs (`google_maps_service`) + LocationTracker already shipped.

**What's deferred and why:** the *capture* side needs the user's device:
- An Apple-Watch / Google-Fit / HealthKit pairing to STREAM heart-rate — that's
  an OS/hardware boundary; the app can only receive samples a companion app/
  shortcut POSTs to `/api/context/physiological`.
- CONTINUOUS microphone capture + on-device ASR to produce the transcript — a
  device-permission/privacy boundary; the app analyzes a transcript the device's
  ASR sends to `/api/context/voice`.

**To wire when a device integration exists:** build the companion shortcut /
mobile capture that POSTs samples + transcripts to the two endpoints above; the
context-update + recommendation logic already works end-to-end.
