# Audit: `verify_failed` notification & explicit event types

Task `task_92fa5ea15e2b` (consolidated from 4 sub-tasks). This note records where
each acceptance criterion is satisfied in the codebase. No further code change was
required — the implementation already covers every AC and all tests pass.

merged-from: 405fd17d-8937-44d2-8cfc-dc8edf352ada, 46bd8717-9ebc-4311-a4c9-8786b5db50e6, 3308eb75-2433-4199-bede-c6c7f7be65d2, 8ca2af99-2dbe-4f81-bd7f-70a2f98fff57

## Sub-task 1 — `verify_failed` notification
- `notify_event("verify_failed", ...)` call: `app/services/auth_service.py:139`,
  `app/routes/webhook.py:66`.
- `silent=False` + `priority="high"`: `app/services/auth_service.py:139`.
- Persian, meaningful message template: `VERIFY_FAILED_MESSAGE_FA` /
  `VERIFY_FAILED_TITLE_FA` in `app/services/notification_service.py`.
- Synthetic-trigger → Telegram test:
  `tests/notifications/test_verify_failed_notification.py::test_telegram_notification_on_verify_failed`.

## Sub-task 2 — complete audit notification caption
- `notify_event` signature extended with `title`, `action_link`, `action_text`:
  `app/services/notification_service.py:498-548` (action link/text appended to the
  message caption when supplied).

## Sub-task 3 — explicit `event_type` (test caller)
- `notify_event(event="task_done", ...)`: `tests/test_notification_service.py:214`.
- Registered: `register_event("task_done")` in `app/services/notification_service.py:645`.
- Toggleable in the notification-settings UI: `task_done` entry in
  `frontend/src/pages/Notifications.jsx` (`/settings/notifications`).

## Sub-task 4 — explicit `event_type` (auth_service caller)
- `notify_event(event="login_succeeded", ...)`: `app/services/auth_service.py:151`.
- Registered: `register_event("login_succeeded", ...)` in
  `app/services/notification_service.py:646`.
- Toggleable in the notification-settings UI: `login_succeeded` entry in
  `frontend/src/pages/Notifications.jsx`.

## Verification
- Backend: `pytest tests/notifications/test_verify_failed_notification.py
  tests/test_notification_service.py tests/test_auth_service.py` → 55 passed.
- Frontend: `vitest run src/pages/__tests__/Notifications.settings.test.jsx` → 4 passed.
