# task 4ae4b3ca — live email/SMS finance sources

**Status:** external (credentials/gateway), apply-path fully built in-repo.

**What's done in-repo:**
- Entry UI: BudgetPage forms to record accounts + incomes (`POST /api/finance/
  accounts`, `/incomes`).
- Parsers: `EmailParserService.parse_balance`, `SmsListenerService.parse_sms`.
- **Apply path (the headline "auto-update balance" ask):**
  `finance_ingest_service.apply_bank_message` — parse → update
  `FinancialAccount.balance` → record a `Transaction` → fire the affordable-task
  reminder. Reachable now via `POST /api/finance/ingest-message`
  (tests/test_finance_ingest_4ae4b3ca.py).
- Reminder: `notify_affordable_tasks` wired into the apply path + exposed at
  `GET /api/finance/affordable-tasks`.
- Budget-aware purchase eval: `POST /api/finance/budget/evaluate` + UI.

**What's deferred and why:** the *pull* side — a live IMAP mailbox poller and an
SMS-gateway feed — needs real credentials (mailbox host/user/pass or an SMS
provider account) that only the owner can supply. The `process_finance_updates`
Celery task is the scheduled puller; it stays a no-op until `FINANCE_IMAP_URL` /
`FINANCE_SMS_WEBHOOK` are configured, then it forwards each new message to
`apply_bank_message`.

**To wire when creds exist:** implement an IMAP fetch (e.g. `imap-tools`) and/or
point the operator's SMS gateway at `POST /api/finance/ingest-message`; set the
env vars; the apply/reminder logic already works end-to-end.
