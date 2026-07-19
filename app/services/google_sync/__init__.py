"""Google personal-sync — Gmail + Calendar mirrored into the life app.

Rides the SAME app-wide Google connection the Drive integration stores
(GlobalSetting ``google_drive_refresh_token``); the connect flow now asks for
gmail.readonly + gmail.send + calendar.readonly on top of Drive. No FastAPI
imports here; every entry point is fail-open ({ok, ...}).
"""
