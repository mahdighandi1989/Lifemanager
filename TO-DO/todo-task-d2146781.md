# TO-DO — task d2146781 — پروژه‌های خارجی (External Projects)

این سشن: AC1 (مدل `ExternalProject`) ✓ از قبل، AC2/AC3 (endpointهای
`/api/external-projects` register/list) ✓ از قبل، **AC4** (`ExternalProjectService.sync_project_data`)
✓ این سشن اضافه شد، **AC5** (`OversightService.analyze_time_allocation`) ✓ این سشن اضافه شد. (۴ تست)

باقی‌مانده:

## اولویت‌بندی‌شده
1. **[MEDIUM] صفحهٔ `/external-projects` در فرانت‌اند (AC6).** افزودن
   `frontend/src/pages/ExternalProjects.jsx` که لیست پروژه‌های خارجی را از
   `GET /api/external-projects` نمایش دهد + route در `App.jsx` + لینک در
   `Sidebar.jsx` (مشابه AISettings.jsx).

## یادداشت
- مدل فعلی فیلدهای `provider/external_id/api_key/workspace_id` دارد (نه دقیقاً
  `api_key_encrypted/project_type/sync_interval_minutes` که AC1 نام برده) —
  معادل و tested. `analyze_time_allocation` فعلاً توزیع per-provider را
  برمی‌گرداند (پروکسی allocation تا وقتی ستون time-tracking اضافه شود).
