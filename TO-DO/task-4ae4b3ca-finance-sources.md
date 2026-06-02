---
task_id: 4ae4b3ca-1a0e-4057-8e62-99365abb1576
task_title: "Budget & Finance — live email/SMS finance sources"
execution_priority: 3000
created_at: "2026-05-26T20:23:14.627307+00:00"
updated_at: "2026-06-02T00:00:00+00:00"
status: pending
---

# task 4ae4b3ca — live email/SMS finance sources

**Status:** external (credentials/gateway), apply-path fully built in-repo.

**Why this TO-DO exists:** every code path of the Budget & Finance feature is
implemented and tested in-repo (see commits for task 4ae4b3ca). The *only*
remaining piece is the live *pull* of bank/exchange messages, which needs a real
mailbox or SMS-gateway account that only the repo owner can supply — a
user-credential dependency, not implementable by an agent.

**Manual action required (priority: high):**
1. Provision an IMAP mailbox (host/user/pass) and/or an SMS-gateway account.
2. Set env vars `FINANCE_IMAP_URL` / `FINANCE_SMS_WEBHOOK` (see `.env.example`).
3. Point the SMS gateway webhook at `POST /api/finance/ingest-message`.

**Expected outcome once done:** the `process_finance_updates` Celery task
(scheduled every 30 min) stops being a no-op and forwards each new message to
`finance_ingest_service.apply_bank_message`, which already updates balances,
records a Transaction, and fires the affordable-task reminder end-to-end.

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
