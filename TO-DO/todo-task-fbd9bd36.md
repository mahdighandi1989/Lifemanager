# TO-DO — task fbd9bd36 — (ACهای کانونیک: ادغام/Consolidation تسک‌ها)

نکتهٔ مهم (mismatch ایدهٔ-داخل-پیوست): ACهای کانونیک این تسک دربارهٔ یک فیچر
**ادغام/consolidation تسک‌های مشابه** هستند، در حالی که deliverable واقعیِ
سشن قبلی «فهرست معماری ماشین‌خوان» (`docs/ARCHITECTURE_INVENTORY.json` + تست
`tests/test_architecture_inventory_json.py`) بود.

این سشن: regression در `test_inventory_lists_all_frontend_pages` (که با افزودن
`AISettings.jsx` در تسک 1a08ded2 ایجاد شده بود) با ثبت `AISettings` در inventory
رفع شد — تست‌های inventory اکنون ۵/۵ سبزند.

فیچر merge/consolidation (ACهای ۱–۷) پیاده نشده و یک کار بزرگ است:

## اولویت‌بندی‌شده
1. **[MEDIUM] سرویس شباهت (AC1).** `app/services/similarity_service.py` با
   `find_similar_entities` مبتنی بر TF-IDF روی title+description (نیازمند
   افزودن وابستگی مثل scikit-learn یا پیاده‌سازی TF-IDF سبک).
2. **[MEDIUM] سرویس ادغام + endpointها (AC2/3/4).** `consolidation_service.merge_tasks`
   (+ `is_active=False` روی قدیمی‌ها)، و `POST /api/merge/suggestions` و
   `POST /api/merge/execute`.
3. **[LOW] فیلدهای مدل (AC6).** `Task.merged_into_id` و `merge_history` (+ migration).
4. **[LOW] فرانت‌اند (AC5/AC7).** `MergeSuggestionPanel` + `MergeManagementPage`.
