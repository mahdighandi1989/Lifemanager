# فهرستِ سطحِ سامانه (Inventory) — Lifemanager

> این فایل را **ناظرِ خودکار** در هر بازرسیِ کامل بازتولید می‌کند — دستی ویرایشش نکن.
> هر صفحه/تب/دکمه/endpointی که بعداً اضافه شود، خودکار این‌جا ظاهر می‌شود.
> همین داده زنده در برنامه هم هست: «نظارت و سرکشی» ← «نقشهٔ صفحه‌ها و زیرصفحه‌ها».

| سنجه | تعداد |
|---|---|
| صفحه‌ها | 42 |
| زیرصفحه‌ها (تب‌ها) | 29 |
| دکمه‌ها | 168 |
| ورودی‌ها | 84 |
| فرم‌ها | 15 |
| لینک‌ها | 56 |
| فراخوانی‌های API در صفحه‌ها | 80 |
| مسیرهای API | 404 |
| سرویس‌ها | 149 |
| مدل‌ها | 64 |

## صفحه‌ها و زیرصفحه‌ها

| مسیر | برچسب | گروه | زیرصفحه‌ها | دکمه | ورودی | API |
|---|---|---|---|---|---|---|
| `/login` | ورود | public | — | 1 | 2 | 0 |
| `/register` | ثبت‌نام | public | — | 1 | 4 | 0 |
| `/welcome` | خوش‌آمد | public | — | 0 | 0 | 0 |
| `/` | میز فرمان | daily | — | 17 | 4 | 12 |
| `/tasks` | کارها | daily | — | 9 | 7 | 3 |
| `/lists` | لیست‌ها | daily | — | 2 | 1 | 0 |
| `/lists/:listId` | جزئیات لیست | daily | — | 12 | 5 | 0 |
| `/directives` | مسیر نهادینه‌سازی | daily | — | 12 | 3 | 21 |
| `/attention` | مراقبت و مرور | daily | — | 4 | 0 | 5 |
| `/sahat` | نقشهٔ خداشهر | life | — | 1 | 0 | 2 |
| `/sahat/:key` | ساحت | life | — | 3 | 2 | 2 |
| `/projects` | پروژه‌ها | life_pages | `?tab=mine` | 1 | 0 | 0 |
| `/projects/:id` | جزئیات پروژه | life_pages | — | 2 | 4 | 0 |
| `/external-projects` | پروژه‌های بیرونی | life_pages | درِ دیگرِ `/projects` | 1 | 0 | 0 |
| `/budget` | مالی | life_pages | `?tab=budget`، `?tab=reports`، `?tab=others`، `?tab=log`، `?tab=assets` (قرنطینه) | 2 | 0 | 4 |
| `/finance` | مالی | life_pages | درِ دیگرِ `/budget` | 2 | 0 | 4 |
| `/assets` | دارایی‌ها | life_pages | درِ دیگرِ `/budget` | 2 | 0 | 4 |
| `/life-file` | پروندهٔ زندگی | life_pages | — | 3 | 1 | 2 |
| `/people-profiles` | افراد | life_pages | — | 1 | 5 | 1 |
| `/people/:id/profile` | پروفایل فرد | life_pages | — | 6 | 6 | 2 |
| `/writings` | نوشته‌های من | life_pages | — | 5 | 5 | 3 |
| `/self-portrait` | خودنگاره | life_pages | — | 1 | 0 | 2 |
| `/identity-profile` | من که هستم | life_pages | — | 5 | 1 | 2 |
| `/places` | کجاها بوده‌ام | life_pages | — | 1 | 1 | 2 |
| `/brain` | رشد ذهن و هوش | life_pages | — | 1 | 6 | 3 |
| `/dev-center` | کار و توسعه | life_pages | `?tab=overview`، `?tab=live`، `?tab=errors`، `?tab=stats`، `?tab=summaries`، `?tab=settings` | 15 | 2 | 4 |
| `/assistant` | دستیار هوشمند | tools | `?tab=assistant`، `?tab=recommendations` (قرنطینه)، `?tab=personality` (قرنطینه)، `?tab=career` (قرنطینه) | 1 | 0 | 0 |
| `/recommendations` | پیشنهادات | tools | درِ دیگرِ `/assistant` | 1 | 0 | 0 |
| `/personality` | شخصیت | tools | درِ دیگرِ `/assistant` | 1 | 0 | 0 |
| `/career-planning` | ترسیم آینده | tools | درِ دیگرِ `/assistant` | 1 | 0 | 0 |
| `/import` | داده (ایمپورت و ادغام) | tools | `?tab=import`، `?tab=files`، `?tab=merge` | 1 | 0 | 0 |
| `/drive-files` | فایل‌های درایو | tools | درِ دیگرِ `/import` | 1 | 0 | 0 |
| `/merge` | ادغام | tools | درِ دیگرِ `/import` | 1 | 0 | 0 |
| `/settings` | تنظیمات | tools | `?tab=ai`، `?tab=notifications`، `?tab=drive`، `?tab=dev`، `?tab=attention`، `?tab=safety` | 1 | 0 | 0 |
| `/settings/notifications` | تنظیمات اعلان | tools | درِ دیگرِ `/settings` | 1 | 0 | 0 |
| `/settings/ai-models` | تنظیمات مدل‌ها | tools | درِ دیگرِ `/settings` | 1 | 0 | 0 |
| `/ai-settings` | تنظیمات AI | tools | — | 9 | 8 | 0 |
| `/notifications` | اعلان‌ها | tools | — | 4 | 1 | 2 |
| `/inspection` | نظارت و سرکشی | system | `?tab=board`، `?tab=pages`، `?tab=binders`، `?tab=how` | 24 | 9 | 0 |
| `/system-map` | نقشهٔ سیستم | system | — | 2 | 0 | 0 |
| `/activity-log` | لاگ فعالیت‌ها | system | — | 5 | 5 | 0 |
| `/admin/users` | مدیریت کاربران | system | — | 4 | 2 | 0 |

## مسیرهای API

| متد | مسیر |
|---|---|
| GET | `/api/activity-log` |
| POST | `/api/activity-log` |
| GET | `/api/activity-log/` |
| GET | `/api/activity-log/entity/{entity_type}/{entity_id}` |
| GET | `/api/activity-log/export.csv` |
| GET | `/api/ai/analysis_prompt` |
| PUT | `/api/ai/analysis_prompt` |
| POST | `/api/ai/analyze` |
| POST | `/api/ai/analyze-tasks` |
| POST | `/api/ai/assessments/holistic_profile` |
| GET | `/api/ai/assessments/holistic_profile/{profile_user_id}` |
| POST | `/api/ai/career_paths` |
| POST | `/api/ai/chat` |
| GET | `/api/ai/configs` |
| POST | `/api/ai/configs` |
| DELETE | `/api/ai/configs/{config_id}` |
| PATCH | `/api/ai/configs/{config_id}` |
| POST | `/api/ai/correlate_needs` |
| POST | `/api/ai/dynamic-analyze` |
| POST | `/api/ai/feedback` |
| POST | `/api/ai/generate` |
| GET | `/api/ai/global-prompt` |
| PUT | `/api/ai/global-prompt` |
| GET | `/api/ai/guidance` |
| POST | `/api/ai/guidance/generate` |
| GET | `/api/ai/hallucination-flags` |
| POST | `/api/ai/identify_interests` |
| GET | `/api/ai/metrics` |
| GET | `/api/ai/models` |
| POST | `/api/ai/models` |
| DELETE | `/api/ai/models/{model_id}` |
| PUT | `/api/ai/models/{model_id}` |
| POST | `/api/ai/models/{model_id}/test` |
| GET | `/api/ai/overview` |
| POST | `/api/ai/personality/analyze` |
| GET | `/api/ai/personality/profile` |
| GET | `/api/ai/personalized_recommendations` |
| GET | `/api/ai/providers` |
| POST | `/api/ai/providers` |
| PUT | `/api/ai/providers/{key}` |
| POST | `/api/ai/providers/{key}/sync-models` |
| DELETE | `/api/ai/providers/{provider_id}` |
| GET | `/api/ai/providers/{provider_id}` |
| PATCH | `/api/ai/providers/{provider_id}` |
| POST | `/api/ai/providers/{provider_id}/test` |
| POST | `/api/ai/query` |
| GET | `/api/ai/routes` |
| PUT | `/api/ai/routes/{task}` |
| GET | `/api/ai/self_model` |
| POST | `/api/ai/self_model/refresh` |
| POST | `/api/ai/sentiment/analyze` |
| GET | `/api/ai/sentiment/profile` |
| GET | `/api/ai/user_data_context` |
| GET | `/api/assets` |
| GET | `/api/assets/external-drives` |
| POST | `/api/assets/scan` |
|  | `/api/assets/scan-status` |
| POST | `/api/assets/sync` |
| GET | `/api/assets/task-suggestions` |
| POST | `/api/attention/create-task` |
| POST | `/api/attention/morning-brief` |
| POST | `/api/attention/run` |
| GET | `/api/attention/scan` |
| GET | `/api/attention/settings` |
| PUT | `/api/attention/settings` |
| GET | `/api/backup/export` |
| POST | `/api/backup/run` |
| GET | `/api/backup/status` |
| GET | `/api/bank-accounts` |
| POST | `/api/bank-accounts` |
| POST | `/api/bank-accounts/import-share-sheet` |
| GET | `/api/bank-accounts/share-sheets` |
| GET | `/api/brain/dashboard` |
| GET | `/api/brain/reminder` |
| PUT | `/api/brain/reminder` |
| POST | `/api/brain/upload` |
| GET | `/api/brain/uploads` |
| GET | `/api/broker-accounts` |
| POST | `/api/broker-accounts` |
| GET | `/api/clarifications` |
| POST | `/api/clarifications/ask` |
| POST | `/api/clarifications/resend` |
| POST | `/api/clarifications/{clarification_id}/answer` |
| POST | `/api/clarifications/{clarification_id}/discuss` |
| POST | `/api/clarifications/{clarification_id}/edit` |
| POST | `/api/clarifications/{clarification_id}/skip` |
| POST | `/api/clarifications/{clarification_id}/snooze` |
| POST | `/api/cleanup/auto-purge` |
| GET | `/api/cleanup/locked-boilerplate` |
| POST | `/api/cleanup/locked-boilerplate/dismiss` |
| GET | `/api/cleanup/test-junk` |
| POST | `/api/cleanup/test-junk/remove` |
| GET | `/api/command-center/today` |
| POST | `/api/context/location` |
| POST | `/api/context/physiological` |
| GET | `/api/context/recommendations` |
| POST | `/api/context/voice` |
| GET | `/api/deduplication/groups` |
| POST | `/api/deduplication/merge` |
| POST | `/api/deduplication/scan` |
| GET | `/api/dev/errors` |
| PATCH | `/api/dev/errors/{issue_id}` |
| GET | `/api/dev/integrations` |
| PUT | `/api/dev/integrations/{provider}` |
| POST | `/api/dev/integrations/{provider}/test` |
| GET | `/api/dev/logs` |
| POST | `/api/dev/logs/fetch` |
| GET | `/api/dev/logs/stats` |
| GET | `/api/dev/overview` |
| GET | `/api/dev/projects` |
| PATCH | `/api/dev/projects/{dev_project_id}` |
| POST | `/api/dev/projects/{dev_project_id}/create-task` |
| GET | `/api/dev/projects/{dev_project_id}/feed` |
| GET | `/api/dev/services` |
| PATCH | `/api/dev/services/{service_id}` |
| GET | `/api/dev/settings` |
| PUT | `/api/dev/settings` |
| GET | `/api/dev/summaries` |
| POST | `/api/dev/summaries/generate` |
| POST | `/api/dev/sync/github` |
| POST | `/api/dev/sync/render` |
| GET | `/api/directives` |
| POST | `/api/directives` |
| POST | `/api/directives/approve-all` |
| GET | `/api/directives/config` |
| PUT | `/api/directives/config` |
| GET | `/api/directives/context` |
| POST | `/api/directives/extract` |
| POST | `/api/directives/reject-all` |
| GET | `/api/directives/report` |
| GET | `/api/directives/today` |
| POST | `/api/directives/{directive_id}/approve` |
| POST | `/api/directives/{directive_id}/done` |
| POST | `/api/directives/{directive_id}/miss` |
| POST | `/api/directives/{directive_id}/reject` |
| PUT | `/api/directives/{directive_id}/schedule` |
| POST | `/api/directives/{directive_id}/schedule/auto` |
| POST | `/api/directives/{directive_id}/steps/generate` |
| POST | `/api/directives/{directive_id}/steps/toggle` |
| GET | `/api/documents/identity` |
| POST | `/api/documents/identity` |
| GET | `/api/documents/uae-license` |
| POST | `/api/documents/uae-license/extract` |
| POST | `/api/documents/vehicle-license/extract` |
| POST | `/api/drive/disconnect` |
| GET | `/api/drive/files` |
| GET | `/api/drive/folders` |
| GET | `/api/drive/status` |
| POST | `/api/drive/sync` |
| POST | `/api/drive/test` |
| POST | `/api/drive/upload` |
| POST | `/api/drive/upload-file` |
| GET | `/api/exchange-accounts` |
| POST | `/api/exchange-accounts` |
| GET | `/api/external-projects` |
| POST | `/api/external-projects` |
| GET | `/api/facets` |
| GET | `/api/files/{file_id}` |
| GET | `/api/files/{file_id}/download` |
| GET | `/api/files/{file_id}/raw` |
| GET | `/api/finance/accounts` |
| POST | `/api/finance/accounts` |
| DELETE | `/api/finance/accounts/{account_id}` |
| PUT | `/api/finance/accounts/{account_id}` |
| GET | `/api/finance/accounts/{account_id}/transactions` |
| GET | `/api/finance/affordable-tasks` |
| GET | `/api/finance/assets` |
| POST | `/api/finance/assets` |
| GET | `/api/finance/balances-by-currency` |
| POST | `/api/finance/budget/evaluate` |
| POST | `/api/finance/cleanup-auto-cards` |
| GET | `/api/finance/incomes` |
| POST | `/api/finance/incomes` |
| POST | `/api/finance/ingest-message` |
| GET | `/api/finance/insights` |
| GET | `/api/finance/owner-accounts` |
| POST | `/api/finance/owner-accounts` |
| POST | `/api/finance/rebuild-auto-cards` |
| GET | `/api/finance/reports/monthly` |
| POST | `/api/finance/scan-emails` |
| GET | `/api/finance/tombstones` |
| POST | `/api/finance/tombstones/clear` |
| GET | `/api/finance/transactions` |
| POST | `/api/finance/transactions` |
| POST | `/api/google/digest/run` |
| GET | `/api/google/emails` |
| POST | `/api/google/emails/{email_id}/create-task` |
| GET | `/api/google/events` |
| POST | `/api/google/events/{event_id}/create-task` |
| GET | `/api/google/settings` |
| PUT | `/api/google/settings` |
| GET | `/api/google/status` |
| POST | `/api/google/sync` |
| POST | `/api/google/test` |
| GET | `/api/health` |
| GET | `/api/health/db` |
| GET | `/api/identity-profile` |
| POST | `/api/identity-profile/ask-missing` |
| POST | `/api/identity-profile/refresh` |
| PUT | `/api/identity-profile/{field}` |
| POST | `/api/identity/emirates-id` |
| GET | `/api/imports/ai-models` |
| POST | `/api/imports/analyze` |
| GET | `/api/imports/jobs` |
| GET | `/api/imports/jobs/{job_id}` |
| GET | `/api/imports/targets` |
| POST | `/api/imports/{target}` |
| GET | `/api/imports/{target}/template` |
| GET | `/api/inbox` |
| POST | `/api/inbox` |
| GET | `/api/inbox/auto-ingest` |
| PUT | `/api/inbox/auto-ingest` |
| POST | `/api/inbox/backfill` |
| POST | `/api/inbox/deep-sweep` |
| POST | `/api/inbox/password` |
| POST | `/api/inbox/password-components` |
| POST | `/api/inbox/retry-unreadable` |
| GET | `/api/inbox/targets` |
| POST | `/api/inbox/{item_id}/dismiss` |
| POST | `/api/inbox/{item_id}/file` |
| POST | `/api/inbox/{item_id}/reclassify` |
| POST | `/api/inbox/{item_id}/unfile` |
| GET | `/api/inspection` |
| POST | `/api/inspection` |
| GET | `/api/inspection/binders` |
| POST | `/api/inspection/file` |
| DELETE | `/api/inspection/files/{file_id}` |
| GET | `/api/inspection/files/{file_id}` |
| GET | `/api/inspection/files/{file_id}/raw` |
| GET | `/api/inspection/files/{file_id}/text` |
| GET | `/api/inspection/inventory` |
| GET | `/api/inspection/queue` |
| GET | `/api/inspection/rounds` |
| GET | `/api/inspection/shots/{shot_id}` |
| GET | `/api/inspection/urgent` |
| POST | `/api/inspection/urgent/claim` |
| GET | `/api/inspection/whoami` |
| DELETE | `/api/inspection/{report_id}` |
| GET | `/api/inspection/{report_id}` |
| POST | `/api/inspection/{report_id}/files` |
| POST | `/api/inspection/{report_id}/notes` |
| PATCH | `/api/inspection/{report_id}/notes/{note_id}` |
| POST | `/api/inspection/{report_id}/status` |
| DELETE | `/api/inspection/{report_id}/urgent` |
| POST | `/api/inspection/{report_id}/urgent` |
| GET | `/api/interests` |
| POST | `/api/interests` |
| GET | `/api/interests/` |
| POST | `/api/interests/` |
| DELETE | `/api/interests/{interest_id}` |
| GET | `/api/lists` |
| POST | `/api/lists` |
| GET | `/api/lists/` |
| POST | `/api/lists/` |
| POST | `/api/lists/sync-from-file` |
| DELETE | `/api/lists/{list_id}` |
| GET | `/api/lists/{list_id}` |
| PATCH | `/api/lists/{list_id}` |
| PUT | `/api/lists/{list_id}` |
| GET | `/api/lists/{list_id}/items` |
| POST | `/api/lists/{list_id}/items` |
| GET | `/api/local-files` |
| POST | `/api/local-files` |
| POST | `/api/location` |
| GET | `/api/location/history` |
| POST | `/api/merge/execute` |
| POST | `/api/merge/suggestions` |
| GET | `/api/mobile/apk` |
| POST | `/api/mobile/call` |
| GET | `/api/mobile/diagnostics` |
| POST | `/api/mobile/heartbeat` |
| GET | `/api/mobile/insights` |
| POST | `/api/mobile/location` |
| POST | `/api/mobile/notification` |
| POST | `/api/mobile/screen` |
| POST | `/api/mobile/sms` |
| GET | `/api/mobile/status` |
| GET | `/api/mobile/token` |
| POST | `/api/mobile/usage` |
| GET | `/api/neteller/wallet` |
| POST | `/api/neteller/wallet` |
| GET | `/api/notifications` |
| POST | `/api/notifications/mark-all-read` |
| GET | `/api/notifications/preferences` |
| PUT | `/api/notifications/preferences` |
| GET | `/api/notifications/status` |
| POST | `/api/notifications/test` |
| GET | `/api/oversight/status` |
| GET | `/api/people-profiles` |
| POST | `/api/people-profiles` |
| GET | `/api/people-profiles/summary` |
| POST | `/api/people-profiles/{person_id}/analyze` |
| GET | `/api/people/{person_id}/profile` |
| POST | `/api/people/{person_id}/profile/analyze` |
| POST | `/api/people/{person_id}/profile/deed` |
| POST | `/api/people/{person_id}/profile/note` |
| PUT | `/api/people/{person_id}/profile/relationship` |
| GET | `/api/people/{person_id}/profile/reminders` |
| GET | `/api/people/{person_id}/profile/suggestions` |
| GET | `/api/persons` |
| POST | `/api/persons` |
| DELETE | `/api/persons/{person_id}` |
| GET | `/api/persons/{person_id}` |
| PUT | `/api/persons/{person_id}` |
| GET | `/api/persons/{person_id}/tasks` |
| GET | `/api/places` |
| GET | `/api/places/track` |
| POST | `/api/planner/generate` |
| GET | `/api/projects` |
| POST | `/api/projects` |
| GET | `/api/projects/` |
| POST | `/api/projects/` |
| DELETE | `/api/projects/{project_id}` |
| GET | `/api/projects/{project_id}` |
| PUT | `/api/projects/{project_id}` |
| GET | `/api/projects/{project_id}/tasks` |
| GET | `/api/recommendations` |
| PATCH | `/api/recommendations/{rec_id}/read` |
| GET | `/api/rta/dashboard` |
| POST | `/api/rta/dashboard` |
| POST | `/api/sahat/assign` |
| GET | `/api/sahat/district/{key}` |
| GET | `/api/sahat/map` |
| POST | `/api/sahat/refresh` |
| GET | `/api/sahat/threads` |
| POST | `/api/sahat/threads` |
| PATCH | `/api/sahat/threads/{thread_id}` |
| GET | `/api/search` |
| POST | `/api/self-improvement/daily-update` |
| GET | `/api/self-improvement/overview` |
| GET | `/api/self-improvement/profile-analytics` |
| POST | `/api/self-improvement/profile-analytics/refresh` |
| GET | `/api/settings/ai-usage` |
| GET | `/api/settings/global-analysis-prompt` |
| PUT | `/api/settings/global-analysis-prompt` |
| GET | `/api/settings/jobs-status` |
| GET | `/api/settings/owner-actions` |
| GET | `/api/subscriptions` |
| POST | `/api/subscriptions` |
| GET | `/api/system-map` |
| GET | `/api/system-map/activity` |
| GET | `/api/system-map/graph` |
| POST | `/api/system-map/layout` |
| POST | `/api/system-map/wires` |
| GET | `/api/tasks` |
| POST | `/api/tasks` |
| GET | `/api/tasks/` |
| POST | `/api/tasks/` |
| GET | `/api/tasks/search` |
| DELETE | `/api/tasks/{task_id}` |
| GET | `/api/tasks/{task_id}` |
| PUT | `/api/tasks/{task_id}` |
| GET | `/api/tasks/{task_id}/persons` |
| POST | `/api/tasks/{task_id}/persons` |
| POST | `/api/tasks/{task_id}/steps` |
| POST | `/api/tasks/{task_id}/steps/generate` |
| POST | `/api/tasks/{task_id}/steps/toggle` |
| POST | `/api/telegram/delete-webhook` |
| POST | `/api/telegram/heal-webhook` |
| POST | `/api/telegram/set-webhook` |
| GET | `/api/telegram/status` |
| POST | `/api/telegram/test` |
| POST | `/api/telegram/webhook` |
| GET | `/api/todo-items` |
| POST | `/api/todo-items` |
| GET | `/api/todo-items/` |
| POST | `/api/todo-items/` |
| DELETE | `/api/todo-items/{item_id}` |
| GET | `/api/todo-items/{item_id}` |
| PATCH | `/api/todo-items/{item_id}` |
| PUT | `/api/todo-items/{item_id}` |
| POST | `/api/todo-items/{item_id}/move` |
| POST | `/api/todo-items/{item_id}/share` |
| POST | `/api/todo-items/{item_id}/toggle-complete` |
| POST | `/api/todo-items/{item_id}/toggle-star` |
| POST | `/api/todo-items/{item_id}/unshare` |
| GET | `/api/trash` |
| DELETE | `/api/trash/todo-items/{item_id}` |
| POST | `/api/trash/todo-items/{item_id}/restore` |
| DELETE | `/api/trash/writings/{writing_id}` |
| POST | `/api/trash/writings/{writing_id}/restore` |
| POST | `/api/users/profile` |
| GET | `/api/users/{user_id}/interests` |
| POST | `/api/v1/context/analyze` |
| GET | `/api/v1/oversight/connections` |
| POST | `/api/v1/oversight/connections` |
| POST | `/api/v1/oversight/connections/{connection_id}/sync` |
| PATCH | `/api/v1/oversight/connections/{connection_id}/time-budget` |
| GET | `/api/v1/oversight/neglected` |
| GET | `/api/v1/oversight/tasks` |
| GET | `/api/v1/oversight/time-allocation` |
| POST | `/api/vehicles/extract` |
| GET | `/api/version` |
| GET | `/api/version/` |
| GET | `/api/weekly-review` |
| GET | `/api/weekly-review/latest` |
| POST | `/api/weekly-review/run` |
| GET | `/api/weekly-review/settings` |
| PUT | `/api/weekly-review/settings` |
| GET | `/api/writings` |
| POST | `/api/writings` |
| DELETE | `/api/writings/{writing_id}` |
| GET | `/api/writings/{writing_id}` |
| PUT | `/api/writings/{writing_id}` |
